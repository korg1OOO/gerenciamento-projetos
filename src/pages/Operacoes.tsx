import { useState, useEffect } from "react";
import { useApp, Operation, OperationStatus, OperationType } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { OperationModal } from "@/components/modals/OperationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  Briefcase,
  HardDrive,
  FileText
} from "lucide-react";
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
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMN_TITLES = {
  planejamento: "Planejamento",
  execucao: "Em Execução",
  finalizado: "Finalizado",
  arquivado: "Arquivado"
};

const COLUMN_COLORS = {
  planejamento: "border-blue-500/50 bg-blue-500/5",
  execucao: "border-yellow-500/50 bg-yellow-500/5",
  finalizado: "border-green-500/50 bg-green-500/5",
  arquivado: "border-gray-500/50 bg-gray-500/5"
};

const STATUS_COLORS = {
  planejamento: "bg-blue-500/10 text-blue-500",
  execucao: "bg-yellow-500/10 text-yellow-500",
  finalizado: "bg-green-500/10 text-green-500",
  arquivado: "bg-gray-500/10 text-gray-500"
};

const TYPE_COLORS = {
  saas: "bg-purple-500/10 text-purple-500",
  produto: "bg-orange-500/10 text-orange-500",
  loja: "bg-pink-500/10 text-pink-500",
  servico: "bg-cyan-500/10 text-cyan-500",
  outro: "bg-gray-500/10 text-gray-500"
};

function DroppableArea({ 
  status, 
  className, 
  children 
}: { 
  status: OperationStatus; 
  className?: string; 
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-primary/5 border-primary/50' : ''} transition-colors`}
    >
      {children}
    </div>
  );
}

function SortableOperationCard({ operation }: { operation: Operation }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { deleteOperation } = useApp();
  const { toast } = useToast();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: operation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'saas': return 'bg-purple-500/10 text-purple-500';
      case 'produto': return 'bg-blue-500/10 text-blue-500';
      case 'loja': return 'bg-green-500/10 text-green-500';
      case 'servico': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir esta operação?")) {
      deleteOperation(operation.id);
      toast({
        title: "Sucesso",
        description: "Operação excluída com sucesso!"
      });
    }
  };

  const hasLinks = operation.links.drive || operation.links.notion || operation.links.domain || operation.links.other;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-card border-border"
        onClick={() => setModalOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {operation.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(operation.type)} variant="outline">
                {operation.type}
              </Badge>
              {currentUser?.permissions.canEditOperations && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {operation.notes && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {operation.notes}
            </p>
          )}
          
          {hasLinks && (
            <div className="flex gap-1 mt-2">
              {operation.links.drive && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(operation.links.drive, '_blank');
                  }}
                >
                  <HardDrive className="h-3 w-3" />
                </Button>
              )}
              {operation.links.notion && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(operation.links.notion, '_blank');
                  }}
                >
                  <FileText className="h-3 w-3" />
                </Button>
              )}
              {operation.links.domain && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(operation.links.domain, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Criado em {new Date(operation.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      <OperationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        operation={operation}
        mode="edit"
      />
    </>
  );
}

function DroppableColumn({ 
  status, 
  title, 
  color, 
  operations 
}: { 
  status: OperationStatus; 
  title: string; 
  color: string; 
  operations: Operation[] 
}) {
  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className={`rounded-lg border-2 border-dashed p-4 ${color}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge variant="outline" className="text-foreground">
              {operations.length}
            </Badge>
          </div>
        </div>
      </div>
      
      <SortableContext items={operations.map(op => op.id)} strategy={verticalListSortingStrategy}>
        <DroppableArea status={status} className="space-y-3 min-h-96 p-2 rounded-lg border-2 border-dashed border-border/50">
          {operations.map((operation) => (
            <SortableOperationCard key={operation.id} operation={operation} />
          ))}
          
          {operations.length === 0 && (
            <Card className="border-2 border-dashed border-muted bg-muted/20">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma operação em {title.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          )}
        </DroppableArea>
      </SortableContext>
    </div>
  );
}

export default function Operacoes() {
  const { operations, updateOperation } = useApp();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Abrir modal automaticamente se veio da URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setModalOpen(true);
    }
  }, [searchParams]);

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
    const activeOperation = operations.find(op => op.id === activeId);
    
    if (!activeOperation) {
      setActiveId(null);
      return;
    }

    // Determinar o novo status baseado na zona de drop
    let newStatus: OperationStatus | null = null;
    
    // Primeiro, verificar se foi dropado em uma operação específica
    const overOperation = operations.find(op => op.id === over.id);
    if (overOperation) {
      newStatus = overOperation.status;
    } else {
      // Se não foi em uma operação, verificar se foi em uma coluna
      // Vamos usar uma lógica simples: o over.id pode ser uma coluna
      const columnStatuses: OperationStatus[] = ['planejamento', 'execucao', 'finalizado', 'arquivado'];
      if (columnStatuses.includes(over.id as OperationStatus)) {
        newStatus = over.id as OperationStatus;
      }
    }

    // Se conseguiu determinar o novo status e é diferente do atual
    if (newStatus && newStatus !== activeOperation.status) {
      updateOperation(activeId, { status: newStatus });
      toast({
        title: "Status atualizado",
        description: `Operação movida para ${COLUMN_TITLES[newStatus]}`
      });
    }

    setActiveId(null);
  };

  // Filtrar operações baseado nas permissões do usuário
  const getFilteredOperations = () => {
    if (!currentUser) return [];
    
    if (currentUser.permissions.canAccessAllProjects) {
      return operations;
    }
    
    return operations.filter(operation => 
      currentUser.permissions.assignedOperations.includes(operation.id)
    );
  };

  // Organizar operações por coluna
  const filteredOperations = getFilteredOperations();
  const operationsByStatus = filteredOperations.reduce((acc, operation) => {
    if (!acc[operation.status]) {
      acc[operation.status] = [];
    }
    acc[operation.status].push(operation);
    return acc;
  }, {} as Record<OperationStatus, Operation[]>);

  const activeOperation = activeId ? operations.find(op => op.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operações</h1>
          <p className="text-muted-foreground">
            Gerencie suas operações com drag & drop no kanban
          </p>
        </div>
        {currentUser?.permissions.canEditOperations && (
          <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Operação
          </Button>
        )}
      </div>

      {/* Kanban Board com Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {(Object.keys(COLUMN_TITLES) as OperationStatus[]).map((status) => {
            const columnOperations = operationsByStatus[status] || [];
            return (
              <DroppableColumn
                key={status}
                status={status}
                title={COLUMN_TITLES[status]}
                color={COLUMN_COLORS[status]}
                operations={columnOperations}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeOperation ? (
            <div className="opacity-95 rotate-3">
              <SortableOperationCard operation={activeOperation} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal para nova operação */}
      <OperationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="create"
      />
    </div>
  );
}