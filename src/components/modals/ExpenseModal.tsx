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
import { useToast } from "@/hooks/use-toast";
import type { Expense, ExpenseCategory } from "@/context/AppContext";

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  mode: 'create' | 'edit';
}

const defaultCategories = [
  { value: 'infra', label: 'Infraestrutura' },
  { value: 'equipe', label: 'Equipe' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'outro', label: 'Outro' }
];

export function ExpenseModal({ open, onOpenChange, expense, mode }: ExpenseModalProps) {
  const { addExpense, updateExpense, operations, expenseCategories } = useApp();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    category: 'infra' as ExpenseCategory,
    operationId: '',
    description: ''
  });

  useEffect(() => {
    if (expense && mode === 'edit') {
      setFormData({
        value: expense.value.toString(),
        date: new Date(expense.date).toISOString().split('T')[0],
        time: expense.time || '',
        category: expense.category,
        operationId: expense.operationId || 'none', // Default to 'none' if no operationId
        description: expense.description
      });
    } else {
      setFormData({
        value: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        category: 'infra',
        operationId: 'none', // Default to 'none'
        description: ''
      });
    }
  }, [expense, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(formData.value);
    if (!value || value <= 0) {
      toast({
        title: "Erro",
        description: "Valor deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição é obrigatória",
        variant: "destructive"
      });
      return;
    }

    const expenseDate = new Date(formData.date + 'T12:00:00.000Z');
    expenseDate.setUTCFullYear(parseInt(formData.date.split('-')[0]));
    expenseDate.setUTCMonth(parseInt(formData.date.split('-')[1]) - 1);
    expenseDate.setUTCDate(parseInt(formData.date.split('-')[2]));

    const expenseData = {
      value,
      date: formData.date, // Pass as string, handled in AppContext
      time: formData.time || undefined,
      category: formData.category,
      operationId: formData.operationId === 'none' ? undefined : formData.operationId,
      description: formData.description
    };

    if (mode === 'create') {
      addExpense(expenseData);
      toast({
        title: "Sucesso",
        description: "Gasto adicionado com sucesso!"
      });
    } else if (expense) {
      updateExpense(expense.id, expenseData);
      toast({
        title: "Sucesso",
        description: "Gasto atualizado com sucesso!"
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Gasto' : 'Editar Gasto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="date">Data *</Label>
              <DateInput
                id="date"
                value={formData.date}
                onChange={(value) => setFormData({ ...formData, date: value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="Ex: 14:30"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value: ExpenseCategory) => 
              setFormData({ ...formData, category: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Always show default categories */}
                {defaultCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
                {/* Add custom categories from backend */}
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name.toLowerCase() as ExpenseCategory}>
                    {cat.name}
                  </SelectItem>
                ))}
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
                <SelectItem value="none">Nenhuma operação</SelectItem> {/* Changed to 'none' */}
                {operations.map((operation) => (
                  <SelectItem key={operation.id} value={operation.id}>
                    {operation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do gasto..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Adicionar Gasto' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}