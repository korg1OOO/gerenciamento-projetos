import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "@/context/AppContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLORS = {
  baixa: "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300",
  media: "bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300",
  alta: "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300"
};

const STATUS_COLORS = {
  completed: "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300",
  pending: "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300",
  overdue: "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300"
};

export function CalendarView({ tasks, onEdit, onDelete }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Obter tarefas do mês atual
  const monthTasks = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= start && taskDate <= end;
    });
  }, [tasks, currentMonth]);

  // Obter tarefas por dia
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.date), date));
  };

  // Determinar status da tarefa
  const getTaskStatus = (task: Task) => {
    if (task.completed) return 'completed';
    const taskDate = new Date(task.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    return taskDate < today ? 'overdue' : 'pending';
  };

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Clique em um dia
  const handleDayClick = (date: Date) => {
    const dayTasks = getTasksForDay(date);
    setSelectedDate(date);
    setSelectedDayTasks(dayTasks);
    setIsDayModalOpen(true);
  };

  // Gerar dias do mês com tarefas
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {monthTasks.length} {monthTasks.length === 1 ? 'tarefa' : 'tarefas'} este mês
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs px-3"
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendário Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {/* Header dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {/* Dias do mês */}
        {monthDays.map(day => {
          const dayTasks = getTasksForDay(day);
          const hasHighPriority = dayTasks.some(task => task.priority === 'alta' && !task.completed);
          const hasOverdue = dayTasks.some(task => getTaskStatus(task) === 'overdue');
          const isToday = isSameDay(day, new Date());

          return (
            <Card
              key={day.toISOString()}
              className={`cursor-pointer transition-all hover:shadow-subtle border-border bg-card min-h-[80px] sm:min-h-[100px] ${
                isToday ? 'ring-2 ring-primary/50 bg-primary/5' : ''
              } ${hasHighPriority ? 'border-red-500/30' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-primary' : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {(hasHighPriority || hasOverdue) && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => {
                    const status = getTaskStatus(task);
                    return (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded border ${PRIORITY_COLORS[task.priority]} truncate`}
                      >
                          <div className="flex items-center gap-1">
                            {task.completed ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            <span className="truncate">{task.title}</span>
                          </div>
                          {task.time && (
                            <div className="text-xs text-muted-foreground truncate">
                              {task.time}
                            </div>
                          )}
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayTasks.length - 2} mais
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal do Dia */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map(task => {
                const status = getTaskStatus(task);
                return (
                  <Card key={task.id} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${
                              task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}>
                              {task.title}
                            </h4>
                            <Badge className={PRIORITY_COLORS[task.priority]}>
                              {task.priority}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Badge className={STATUS_COLORS[status]}>
                              {status === 'completed' ? 'Concluída' : 
                               status === 'overdue' ? 'Atrasada' : 'Pendente'}
                            </Badge>
                            {task.time && (
                              <span className="text-xs text-muted-foreground">
                                {task.time}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onEdit(task);
                              setIsDayModalOpen(false);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onDelete(task.id);
                              setSelectedDayTasks(prev => prev.filter(t => t.id !== task.id));
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa
                </h3>
                <p className="text-muted-foreground">
                  Não há tarefas agendadas para este dia.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}