import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { OperationModal } from "@/components/modals/OperationModal";
import { ExpenseModal } from "@/components/modals/ExpenseModal";
import { TaskModal } from "@/components/modals/TaskModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Briefcase,
  CheckSquare,
  Plus,
  TrendingUp,
  Calendar as CalendarIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { operations, expenses, tasks } = useApp();
  const navigate = useNavigate();
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Cálculos para o dashboard
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((total, expense) => total + expense.value, 0);

  const activeOperations = operations.filter(op => op.status !== 'arquivado').length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const highPriorityTasks = tasks.filter(task => !task.completed && task.priority === 'alta').length;

  const recentOperations = operations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejamento': return 'bg-blue-500/10 text-blue-500';
      case 'execucao': return 'bg-yellow-500/10 text-yellow-500';
      case 'finalizado': return 'bg-green-500/10 text-green-500';
      case 'arquivado': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500/10 text-red-500';
      case 'media': return 'bg-yellow-500/10 text-yellow-500';
      case 'baixa': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas operações e finanças
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setOperationModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Operação
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card 
          className="border-border bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => navigate('/financeiro')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Gastos do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} transações no total
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-border bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => navigate('/operacoes')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Operações Ativas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {activeOperations}
            </div>
            <p className="text-xs text-muted-foreground">
              {operations.length} operações no total
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-border bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => navigate('/agenda')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Tarefas Pendentes
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {pendingTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {highPriorityTasks} de alta prioridade
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Performance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              +0%
            </div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 p-4 sm:p-6">
          <Button 
            onClick={() => setOperationModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Operação
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setExpenseModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Gasto
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setTaskModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/relatorios')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Relatórios
          </Button>
        </CardContent>
      </Card>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Operações Recentes */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Operações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOperations.length > 0 ? recentOperations.map((operation) => (
              <div key={operation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-card-foreground">{operation.name}</p>
                  <p className="text-sm text-muted-foreground">{operation.type}</p>
                </div>
                <Badge className={getStatusColor(operation.status)}>
                  {operation.status}
                </Badge>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma operação criada ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gastos Recentes */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Gastos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-card-foreground">
                    R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                </div>
                <Badge variant="outline">
                  {expense.category}
                </Badge>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum gasto registrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Próximas Tarefas */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Próximas Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(task.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma tarefa pendente
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <OperationModal
        open={operationModalOpen}
        onOpenChange={setOperationModalOpen}
        mode="create"
      />
      <ExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
        mode="create"
      />
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        mode="create"
      />
    </div>
  );
}