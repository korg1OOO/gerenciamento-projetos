import { useState } from "react";
import { useApp, Task } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckSquare,
  Clock,
  Play,
  Edit3,
  Trash2,
  CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { toZonedTime, formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { timezone } from "@/utils/timezone"; // 'America/Sao_Paulo'

type TaskStatus = "todo" | "in-progress" | "completed";

const COLUMN_TITLES = {
  todo: "A Fazer",
  "in-progress": "Em Andamento",
  completed: "Concluído",
};

const COLUMN_COLORS = {
  todo: "border-blue-500/50 bg-blue-500/5",
  "in-progress": "border-yellow-500/50 bg-yellow-500/5",
  completed: "border-green-500/50 bg-green-500/5",
};

const PRIORITY_COLORS = {
  baixa: "bg-green-500/10 text-green-500",
  media: "bg-yellow-500/10 text-yellow-500",
  alta: "bg-red-500/10 text-red-500",
};

const PRIORITY_LABELS = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

// Helper to parse YYYY-MM-DD as local date in timezone
const parseLocalDate = (dateString: string, tz: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const naiveLocal = new Date(year, month - 1, day);
  const utcDate = zonedTimeToUtc(naiveLocal, tz);
  return toZonedTime(utcDate, tz);
};

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const taskDate = parseLocalDate(task.date, timezone);
  const today = toZonedTime(new Date(), timezone);
  const isOverdue =
    taskDate < today &&
    taskDate.toDateString() !== today.toDateString() &&
    !task.completed;
  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-card border-border hover:border-primary/50"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(task);
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-card-foreground line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-1 ml-2">
            <Badge className={PRIORITY_COLORS[task.priority]} variant="outline">
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{formatInTimeZone(taskDate, timezone, "dd/MM/yyyy")}</span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Atrasado
              </Badge>
            )}
          </div>
          {task.time && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{task.time}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  status,
  title,
  color,
  tasks,
  onEdit,
  onDelete,
}: {
  status: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });
  return (
    <div className="flex-1 min-w-[300px] max-w-[400px]">
      <div className="mb-4">
        <div className={`rounded-lg border-2 border-dashed p-4 ${color}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge variant="outline" className="text-foreground">
              {tasks.length}
            </Badge>
          </div>
        </div>
      </div>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-96 p-2 rounded-lg border-2 border-dashed ${
            isOver ? "border-primary bg-primary/5" : "border-border/50"
          } transition-colors`}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {tasks.length === 0 && (
            <Card className="border-2 border-dashed border-muted bg-muted/20">
              <CardContent className="p-6 text-center">
                <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma tarefa em {title.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface TaskKanbanProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskKanban({ tasks, onEdit, onDelete }: TaskKanbanProps) {
  const { updateTask } = useApp();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  // Mapear tarefas para status do kanban
  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.completed) return "completed";
    const taskDate = parseLocalDate(task.date, timezone);
    const today = toZonedTime(new Date(), timezone);
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    if (taskDate <= today) return "in-progress";
    return "todo";
  };
  // Organizar tarefas por coluna
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = getTaskStatus(task);
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }
    const activeId = active.id as string;
    const activeTask = tasks.find((task) => task.id === activeId);

    if (!activeTask) {
      setActiveId(null);
      return;
    }
    // Determinar o novo status baseado na zona de drop
    let newStatus: TaskStatus | null = null;

    // Primeiro, verificar se foi dropado em uma tarefa específica
    const overTask = tasks.find((task) => task.id === over.id);
    if (overTask) {
      newStatus = getTaskStatus(overTask);
    } else {
      // Se não foi em uma tarefa, verificar se foi em uma coluna
      const columnStatuses: TaskStatus[] = ["todo", "in-progress", "completed"];
      if (columnStatuses.includes(over.id as TaskStatus)) {
        newStatus = over.id as TaskStatus;
      }
    }
    // Atualizar tarefa baseado no novo status
    if (newStatus && newStatus !== getTaskStatus(activeTask)) {
      const updates: Partial<Task> = {};

      if (newStatus === "completed") {
        updates.completed = true;
      } else {
        updates.completed = false;

        // Se movido para "em andamento", pode ajustar a data se necessário
        if (
          newStatus === "in-progress" &&
          parseLocalDate(activeTask.date, timezone) > toZonedTime(new Date(), timezone)
        ) {
          updates.date = formatInTimeZone(toZonedTime(new Date(), timezone), timezone, "yyyy-MM-dd");
        }
      }
      updateTask(activeId, updates);
      toast({
        title: "Status atualizado",
        description: `Tarefa movida para ${COLUMN_TITLES[newStatus]}`,
      });
    }
    setActiveId(null);
  };
  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {(Object.keys(COLUMN_TITLES) as TaskStatus[]).map((status) => {
          const columnTasks = tasksByStatus[status] || [];
          return (
            <DroppableColumn
              key={status}
              status={status}
              title={COLUMN_TITLES[status]}
              color={COLUMN_COLORS[status]}
              tasks={columnTasks}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-95 rotate-3">
            <SortableTaskCard
              task={activeTask}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}