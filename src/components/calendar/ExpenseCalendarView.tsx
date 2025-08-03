import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Expense } from "@/context/AppContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Edit3,
  Trash2
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExpenseCalendarViewProps {
  expenses: Expense[];
  operations: any[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS = {
  infra: "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300",
  equipe: "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300",
  ferramentas: "bg-purple-500/20 border-purple-500/50 text-purple-700 dark:text-purple-300",
  marketing: "bg-orange-500/20 border-orange-500/50 text-orange-700 dark:text-orange-300",
  juridico: "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300",
  outro: "bg-gray-500/20 border-gray-500/50 text-gray-700 dark:text-gray-300"
};

const CATEGORY_LABELS = {
  infra: "Infraestrutura",
  equipe: "Equipe",
  ferramentas: "Ferramentas",
  marketing: "Marketing",
  juridico: "Jurídico",
  outro: "Outro"
};

export function ExpenseCalendarView({ expenses, operations, onEdit, onDelete }: ExpenseCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<Expense[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Obter gastos do mês atual
  const monthExpenses = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses, currentMonth]);

  // Obter gastos por dia
  const getExpensesForDay = (date: Date) => {
    return expenses.filter(expense => isSameDay(new Date(expense.date), date))
      .sort((a, b) => {
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return 0;
      });
  };

  // Calcular total do dia
  const getDayTotal = (date: Date) => {
    const dayExpenses = getExpensesForDay(date);
    return dayExpenses.reduce((total, expense) => total + expense.value, 0);
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
    const dayExpenses = getExpensesForDay(date);
    setSelectedDate(date);
    setSelectedDayExpenses(dayExpenses);
    setIsDayModalOpen(true);
  };

  // Gerar dias do mês
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Calcular total do mês
  const monthTotal = monthExpenses.reduce((total, expense) => total + expense.value, 0);

  const getOperationName = (operationId?: string) => {
    if (!operationId) return "Sem operação";
    const operation = operations.find(op => op.id === operationId);
    return operation?.name || "Operação não encontrada";
  };

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <p className="text-sm text-muted-foreground">
            R$ {monthTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {monthExpenses.length} {monthExpenses.length === 1 ? 'gasto' : 'gastos'}
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
          const dayExpenses = getExpensesForDay(day);
          const dayTotal = getDayTotal(day);
          const hasHighValue = dayExpenses.some(expense => expense.value > 1000);
          const isToday = isSameDay(day, new Date());

          return (
            <Card
              key={day.toISOString()}
              className={`cursor-pointer transition-all hover:shadow-subtle border-border bg-card min-h-[80px] sm:min-h-[100px] ${
                isToday ? 'ring-2 ring-primary/50 bg-primary/5' : ''
              } ${hasHighValue ? 'border-red-500/30' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-primary' : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {hasHighValue && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                
                {dayExpenses.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-green-600">
                      R$ {dayTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {dayExpenses.slice(0, 2).map(expense => (
                      <div
                        key={expense.id}
                        className={`text-xs p-1 rounded border ${CATEGORY_COLORS[expense.category]} truncate`}
                      >
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="truncate">{expense.description}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          {expense.time && (
                            <span className="text-xs text-muted-foreground">
                              {expense.time}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {dayExpenses.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayExpenses.length - 2} mais
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal do Dia */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Gastos de {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDayExpenses.length > 0 ? (
              <>
                {/* Resumo do dia */}
                <Card className="border-border bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Total do Dia</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedDayExpenses.length} {selectedDayExpenses.length === 1 ? 'gasto' : 'gastos'}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        R$ {selectedDayExpenses.reduce((total, expense) => total + expense.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de gastos */}
                {selectedDayExpenses.map(expense => (
                  <Card key={expense.id} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">
                              {expense.description}
                            </h4>
                            <Badge className={CATEGORY_COLORS[expense.category]}>
                              {CATEGORY_LABELS[expense.category]}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-bold text-green-600">
                              R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            {expense.time && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {expense.time}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <strong>Operação:</strong> {getOperationName(expense.operationId)}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onEdit(expense);
                              setIsDayModalOpen(false);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onDelete(expense.id);
                              setSelectedDayExpenses(prev => prev.filter(e => e.id !== expense.id));
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum gasto
                </h3>
                <p className="text-muted-foreground">
                  Não há gastos registrados para este dia.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}