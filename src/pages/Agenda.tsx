import { useState, useEffect, useMemo } from "react";
import { useApp, Task } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { TaskKanban } from "@/components/tasks/TaskKanban";
import { CalendarView } from "@/components/calendar/CalendarView";
import {
  Plus,
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  List,
  LayoutDashboard,
  CalendarDays,
} from "lucide-react";
import { toZonedTime, formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { timezone } from "@/utils/timezone"; // 'America/Sao_Paulo'
import { parse as parseDateFns, isSameDay } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const PRIORITY_LABELS = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const PRIORITY_COLORS = {
  baixa: "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300",
  media: "bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300",
  alta: "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300",
};

export default function Agenda() {
  const { tasks, addTask, updateTask, deleteTask, operations } = useApp();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "calendar">("list");
  // Filtros de estado
  const [filters, setFilters] = useState({
    status: "all" as "all" | "pending" | "completed" | "overdue",
    priority: "all" as "all" | "baixa" | "media" | "alta",
    operationId: "all" as string,
  });
  // Formulário para nova tarefa
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: formatInTimeZone(toZonedTime(new Date(), timezone), timezone, "yyyy-MM-dd"), // Current date in UTC-3
    time: "",
    operationId: "none",
    priority: "media" as "baixa" | "media" | "alta",
  });
  // Abrir modal automaticamente se veio da URL
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsNewModalOpen(true);
    }
  }, [searchParams]);
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: formatInTimeZone(toZonedTime(new Date(), timezone), timezone, "yyyy-MM-dd"), // Reset to current date
      time: "",
      operationId: "none",
      priority: "media",
    });
    setEditingTask(null);
  };

  // Helper to parse YYYY-MM-DD as local date in timezone
  const parseLocalDate = (dateString: string, tz: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    const naiveLocal = new Date(year, month - 1, day);
    const utcDate = fromZonedTime(naiveLocal, tz);
    return toZonedTime(utcDate, tz);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Título da tarefa é obrigatório",
        variant: "destructive",
      });
      return;
    }
    const taskData = {
      title: formData.title,
      description: formData.description,
      date: formData.date, // Send as YYYY-MM-DD string
      time: formData.time || undefined,
      operationId: formData.operationId === "none" ? undefined : formData.operationId,
      priority: formData.priority,
      completed: false,
    };
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });
    } else {
      addTask(taskData);
      toast({
        title: "Sucesso",
        description: "Nova tarefa criada com sucesso!",
      });
    }
    setIsNewModalOpen(false);
    resetForm();
  };
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      date: formatInTimeZone(parseLocalDate(task.date, timezone), timezone, "yyyy-MM-dd"),
      time: task.time || "",
      operationId: task.operationId || "none",
      priority: task.priority,
    });
    setIsNewModalOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteTask(id);
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!",
      });
    }
  };
  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, { completed: !task.completed });
    toast({
      title: task.completed ? "Tarefa reativada" : "Tarefa concluída",
      description: task.completed
        ? "Tarefa marcada como pendente"
        : "Parabéns! Tarefa finalizada",
    });
  };
  // Filtrar tarefas baseado nos filtros ativos
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskDate = parseLocalDate(task.date, timezone);
      const today = toZonedTime(new Date(), timezone);
      // Filtro por status
      if (filters.status === "pending" && task.completed) return false;
      if (filters.status === "completed" && !task.completed) return false;
      if (filters.status === "overdue") {
        const isOverdue = taskDate < today && taskDate.toDateString() !== today.toDateString() && !task.completed;
        if (!isOverdue) return false;
      }
      // Filtro por prioridade
      if (filters.priority !== "all" && task.priority !== filters.priority) return false;
      // Filtro por operação
      if (filters.operationId !== "all" && task.operationId !== filters.operationId) return false;
      return true;
    });
  }, [tasks, filters]);
  // Agrupar tarefas filtradas por data
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    const sortedTasks = [...filteredTasks].sort(
      (a, b) => parseLocalDate(a.date, timezone).getTime() - parseLocalDate(b.date, timezone).getTime()
    );
    sortedTasks.forEach((task) => {
      const taskDate = parseLocalDate(task.date, timezone);
      const dateKey = formatInTimeZone(taskDate, timezone, "dd/MM/yyyy"); // e.g., "09/08/2025"
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    return groups;
  }, [filteredTasks]);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const highPriorityTasks = pendingTasks.filter((task) => task.priority === "alta");
  const overdueTasks = tasks.filter((task) => {
    const taskDate = parseLocalDate(task.date, timezone);
    const today = toZonedTime(new Date(), timezone);
    const isOverdue = taskDate < today && taskDate.toDateString() !== today.toDateString() && !task.completed;
    return isOverdue;
  });
  // Função para aplicar filtros através dos cards
  const handleCardFilter = (
    filterType: "pending" | "completed" | "high-priority" | "total"
  ) => {
    setFilters((prev) => ({
      ...prev,
      status:
        filterType === "pending"
          ? "pending"
          : filterType === "completed"
          ? "completed"
          : "all",
      priority: filterType === "high-priority" ? "alta" : "all",
    }));
  };
  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString, timezone);
    const today = toZonedTime(new Date(), timezone);
    const tomorrow = toZonedTime(new Date(), timezone);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = formatInTimeZone(date, timezone, "EEEE, d 'de' MMMM", {
      locale: ptBR,
    });
    if (isSameDay(date, today)) {
      return "Hoje";
    } else if (isSameDay(date, tomorrow)) {
      return "Amanhã";
    } else {
      return formattedDate;
    }
  };
  const isOverdue = (dateString: string) => {
    const naiveDate = parseDateFns(dateString, "dd/MM/yyyy", new Date(), { locale: ptBR });
    const utcDate = fromZonedTime(naiveLocal, tz);

    const taskDate = toZonedTime(utcDate, timezone);
    const today = toZonedTime(new Date(), timezone);
    return taskDate < today && taskDate.toDateString() !== today.toDateString();
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Organize suas tarefas e compromissos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Tabs
            value={viewMode}
            onValueChange={(value) =>
              setViewMode(value as "list" | "kanban" | "calendar")
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="list"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Calendário</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog
            open={isNewModalOpen}
            onOpenChange={setIsNewModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Digite o título da tarefa..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="text"
                      placeholder="Ex: 14:30-16:00"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="operation">Operação Relacionada</Label>
                  <Select
                    value={formData.operationId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, operationId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma operação..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {operations.map((operation) => (
                        <SelectItem key={operation.id} value={operation.id}>
                          {operation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descreva os detalhes da tarefa..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingTask ? "Atualizar" : "Criar"} Tarefa
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsNewModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Filtros */}
      <Card className="border-border bg-card shadow-subtle">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label
                htmlFor="status-filter"
                className="text-sm font-medium text-card-foreground"
              >
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="overdue">Atrasadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label
                htmlFor="priority-filter"
                className="text-sm font-medium text-card-foreground"
              >
                Prioridade
              </Label>
              <Select
                value={filters.priority}
                onValueChange={(value: any) =>
                  setFilters((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger id="priority-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label
                htmlFor="operation-filter"
                className="text-sm font-medium text-card-foreground"
              >
                Operação
              </Label>
              <Select
                value={filters.operationId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, operationId: value }))
                }
              >
                <SelectTrigger id="operation-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as operações</SelectItem>
                  {operations.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      {operation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({ status: "all", priority: "all", operationId: "all" })
                }
                className="whitespace-nowrap"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Cards de estatísticas clicáveis */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card
          className="border-border bg-card shadow-subtle cursor-pointer hover:shadow-card transition-shadow"
          onClick={() => handleCardFilter("pending")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-card-foreground">
              {pendingTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-border bg-card shadow-subtle cursor-pointer hover:shadow-card transition-shadow"
          onClick={() => handleCardFilter("completed")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
              Concluídas
            </CardTitle>
            <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-card-foreground">
              {completedTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-border bg-card shadow-subtle cursor-pointer hover:shadow-card transition-shadow"
          onClick={() => handleCardFilter("high-priority")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
              Alta Prioridade
            </CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-500">
              {highPriorityTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="border-border bg-card shadow-subtle cursor-pointer hover:shadow-card transition-shadow"
          onClick={() => handleCardFilter("total")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
              Total
            </CardTitle>
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-card-foreground">
              {tasks.length}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Conteúdo baseado na visualização selecionada */}
      <div className="w-full overflow-hidden">
        {viewMode === "list" ? (
          /* Lista de tarefas agrupadas por data */
          <div className="space-y-4 sm:space-y-6">
            {Object.keys(groupedTasks).length > 0 ? (
              Object.entries(groupedTasks).map(([dateString, dayTasks]) => (
                <Card key={dateString} className="border-border bg-card shadow-subtle">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg text-card-foreground flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {dateString} {/* Display as dd/MM/yyyy */}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isOverdue(dateString) && (
                          <Badge variant="destructive" className="text-xs">
                            Atrasado
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {dayTasks.length}{" "}
                          {dayTasks.length === 1 ? "tarefa" : "tarefas"}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border transition-fast shadow-subtle ${
                          task.completed
                            ? "bg-muted/50 border-muted opacity-75"
                            : "bg-card border-border hover:border-primary/50 hover:shadow-card"
                        }`}
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4
                              className={`font-medium ${
                                task.completed
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                className={`border text-xs ${PRIORITY_COLORS[task.priority]}`}
                              >
                                {PRIORITY_LABELS[task.priority]}
                              </Badge>
                              {isOverdue(dateString) && !task.completed && (
                                <Badge variant="destructive" className="text-xs">
                                  Atrasado
                                </Badge>
                              )}
                            </div>
                          </div>
                          {task.description && (
                            <p
                              className={`text-sm ${
                                task.completed
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {task.time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{task.time}</span>
                              </div>
                            )}
                            {task.operationId && (
                              <Badge variant="outline" className="text-xs">
                                {operations.find(
                                  (op) => op.id === task.operationId
                                )?.name || "Operação N/A"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border bg-card shadow-subtle">
                <CardContent className="p-6 sm:p-8 text-center">
                  <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-2">
                    Nenhuma tarefa encontrada
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    Comece criando sua primeira tarefa para organizar seu
                    trabalho.
                  </p>
                  <Button
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Tarefa
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : viewMode === "kanban" ? (
          /* Kanban View */
          <div className="w-full">
            <TaskKanban tasks={filteredTasks} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        ) : (
          /* Calendar View */
          <div className="w-full">
            <CalendarView tasks={filteredTasks} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}
      </div>
      {/* Botão floating para mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setIsNewModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}