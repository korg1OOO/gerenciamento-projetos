import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Operation, OperationStatus, OperationType } from "@/context/AppContext";

interface OperationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation?: Operation;
  mode: 'create' | 'edit';
}

export function OperationModal({ open, onOpenChange, operation, mode }: OperationModalProps) {
  const { addOperation, updateOperation } = useApp();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'saas' as OperationType,
    status: 'planejamento' as OperationStatus,
    links: {
      drive: '',
      notion: '',
      domain: '',
      other: ''
    },
    notes: ''
  });

  useEffect(() => {
    if (operation && mode === 'edit') {
      setFormData({
        name: operation.name,
        type: operation.type,
        status: operation.status,
        links: operation.links,
        notes: operation.notes
      });
    } else {
      setFormData({
        name: '',
        type: 'saas',
        status: 'planejamento',
        links: {
          drive: '',
          notion: '',
          domain: '',
          other: ''
        },
        notes: ''
      });
    }
  }, [operation, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da operação é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'create') {
      addOperation(formData);
      toast({
        title: "Sucesso",
        description: "Operação criada com sucesso!"
      });
    } else if (operation) {
      updateOperation(operation.id, formData);
      toast({
        title: "Sucesso",
        description: "Operação atualizada com sucesso!"
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Operação' : 'Editar Operação'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da operação"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: OperationType) => 
                setFormData({ ...formData, type: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="loja">Loja</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: OperationStatus) => 
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planejamento">Planejamento</SelectItem>
                <SelectItem value="execucao">Em Execução</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="drive">Link Drive</Label>
              <Input
                id="drive"
                value={formData.links.drive}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  links: { ...formData.links, drive: e.target.value }
                })}
                placeholder="https://drive.google.com/..."
              />
            </div>
            
            <div>
              <Label htmlFor="notion">Link Notion</Label>
              <Input
                id="notion"
                value={formData.links.notion}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  links: { ...formData.links, notion: e.target.value }
                })}
                placeholder="https://notion.so/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                value={formData.links.domain}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  links: { ...formData.links, domain: e.target.value }
                })}
                placeholder="https://exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="other">Outro Link</Label>
              <Input
                id="other"
                value={formData.links.other}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  links: { ...formData.links, other: e.target.value }
                })}
                placeholder="Outro link útil"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anotações sobre a operação..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Operação' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}