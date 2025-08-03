import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Calendar,
  Briefcase,
  PieChart as PieChartIcon
} from "lucide-react";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function Relatorios() {
  const { operations, expenses, tasks } = useApp();

  // Dados para gráficos
  const expensesByCategory = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryLabels = {
        infra: "Infraestrutura",
        equipe: "Equipe", 
        ferramentas: "Ferramentas",
        marketing: "Marketing",
        juridico: "Jurídico",
        outro: "Outro"
      };
      
      const categoryName = categoryLabels[expense.category] || expense.category;
      acc[categoryName] = (acc[categoryName] || 0) + expense.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      formattedValue: `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }));
  }, [expenses]);

  const expensesByMonth = useMemo(() => {
    const monthTotals = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + expense.value;
      return acc;
    }, {} as Record<string, number>);

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return Object.entries(monthTotals)
      .sort()
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          month: `${months[parseInt(month) - 1]} ${year}`,
          value,
          formattedValue: `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        };
      });
  }, [expenses]);

  const operationsByStatus = useMemo(() => {
    const statusCounts = operations.reduce((acc, operation) => {
      const statusLabels = {
        planejamento: "Planejamento",
        execucao: "Em Execução", 
        finalizado: "Finalizado",
        arquivado: "Arquivado"
      };
      
      const statusName = statusLabels[operation.status] || operation.status;
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [operations]);

  const tasksByPriority = useMemo(() => {
    const priorityCounts = tasks.reduce((acc, task) => {
      const priorityLabels = {
        baixa: "Baixa",
        media: "Média",
        alta: "Alta"
      };
      
      const priorityName = priorityLabels[task.priority] || task.priority;
      acc[priorityName] = (acc[priorityName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [tasks]);

  // Estatísticas gerais
  const totalExpenses = expenses.reduce((total, expense) => total + expense.value, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((total, expense) => total + expense.value, 0);

  const completedTasks = tasks.filter(task => task.completed).length;
  const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">
          Análise detalhada das suas operações e performance
        </p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total de Gastos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} transações registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Gasto Mensal
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Mês atual
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Operações Ativas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {operations.filter(op => op.status !== 'arquivado').length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {operations.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Taxa de Conclusão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {taskCompletionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} de {tasks.length} tarefas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Mês */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gastos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [value.formattedValue || `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gastos por Categoria */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operações por Status */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Status das Operações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {operationsByStatus.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                  </div>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tarefas por Prioridade */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Tarefas por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasksByPriority.map((item, index) => {
                const colors = {
                  'Alta': '#ef4444',
                  'Média': '#f59e0b', 
                  'Baixa': '#22c55e'
                };
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors[item.name as keyof typeof colors] || COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                    </div>
                    <Badge variant="outline">{item.value}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo detalhado */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Operações</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• {operations.filter(op => op.status === 'planejamento').length} em planejamento</p>
              <p>• {operations.filter(op => op.status === 'execucao').length} em execução</p>
              <p>• {operations.filter(op => op.status === 'finalizado').length} finalizadas</p>
              <p>• {operations.filter(op => op.status === 'arquivado').length} arquivadas</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Financeiro</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} gasto total</p>
              <p>• R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês</p>
              <p>• R$ {(totalExpenses / Math.max(expenses.length, 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ticket médio</p>
              <p>• {expenses.length} transações registradas</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Produtividade</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• {tasks.length} tarefas criadas</p>
              <p>• {completedTasks} tarefas concluídas</p>
              <p>• {tasks.filter(task => !task.completed).length} tarefas pendentes</p>
              <p>• {taskCompletionRate.toFixed(1)}% taxa de conclusão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}