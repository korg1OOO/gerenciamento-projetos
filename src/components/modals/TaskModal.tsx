import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useProfile } from "@/context/ProfileContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/context/AppContext";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  mode: 'create' | 'edit';
}

export function TaskModal({ open, onOpenChange, task, mode }: TaskModalProps) {
  const { addTask, updateTask, operations } = useApp();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    operationId: '',
    completed: false,
    priority: 'media' as 'baixa' | 'media' | 'alta'
  });

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description,
        date: new Date(task.date).toISOString().split('T')[0],
        time: task.time || '',
        operationId: task.operationId || '',
        completed: task.completed,
        priority: task.priority
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        operationId: '',
        completed: false,
        priority: 'media'
      });
    }
  }, [task, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Título da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Criar a data corretamente sem problemas de timezone
    const taskDate = new Date(formData.date + 'T12:00:00.000Z');
    taskDate.setUTCFullYear(parseInt(formData.date.split('-')[0]));
    taskDate.setUTCMonth(parseInt(formData.date.split('-')[1]) - 1);
    taskDate.setUTCDate(parseInt(formData.date.split('-')[2]));

    const taskData = {
      title: formData.title,
      description: formData.description,
      date: formData.date, // Passar como string para correção no AppContext
      time: formData.time || undefined,
      operationId: formData.operationId || undefined,
      completed: formData.completed,
      priority: formData.priority
    };

    if (mode === 'create') {
      addTask(taskData);
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!"
      });
    } else if (task) {
      updateTask(task.id, taskData);
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!"
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título da tarefa"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da tarefa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <DateInput
                id="date"
                value={formData.date}
                onChange={(value) => setFormData({ ...formData, date: value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="Ex: 14:30-16:00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={formData.priority} onValueChange={(value: 'baixa' | 'media' | 'alta') => 
              setFormData({ ...formData, priority: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="operation">Operação (Opcional)</Label>
            <Select value={formData.operationId} onValueChange={(value) => 
              setFormData({ ...formData, operationId: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma operação</SelectItem>
                {operations.map((operation) => (
                  <SelectItem key={operation.id} value={operation.id}>
                    {operation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'edit' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={formData.completed}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, completed: checked === true })
                }
              />
              <Label htmlFor="completed">Tarefa concluída</Label>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Tarefa' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}