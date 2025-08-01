import { useState, useEffect, useMemo } from "react";
import { useApp, Expense, ExpenseCategory } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { ExpenseCalendarView } from "@/components/calendar/ExpenseCalendarView";
import {
  Plus,
  DollarSign,
  Filter,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  Calendar as CalendarIcon,
  List,
  Grid3X3
} from "lucide-react";
import { ExpenseModal } from "../components/modals/ExpenseModal"; // Import the modal

const CATEGORY_LABELS = {
  infra: "Infraestrutura",
  equipe: "Equipe",
  ferramentas: "Ferramentas",
  marketing: "Marketing",
  juridico: "Jurídico",
  outro: "Outro"
};

const CATEGORY_COLORS = {
  infra: "bg-blue-500/10 text-blue-500",
  equipe: "bg-green-500/10 text-green-500",
  ferramentas: "bg-purple-500/10 text-purple-500",
  marketing: "bg-orange-500/10 text-orange-500",
  juridico: "bg-red-500/10 text-red-500",
  outro: "bg-gray-500/10 text-gray-500"
};

export default function Financeiro() {
  const { expenses, addExpense, updateExpense, deleteExpense, operations } = useApp();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  // Filtros
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOperation, setSelectedOperation] = useState<string>("all");

  // Abrir modal automaticamente se veio da URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewModalOpen(true);
    }
  }, [searchParams]);

  // Verificar se o usuário tem permissão para ver finanças
  if (!currentUser?.permissions.canViewFinance) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar informações financeiras.
          </p>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsNewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este gasto?")) {
      deleteExpense(id);
      toast({
        title: "Sucesso",
        description: "Gasto excluído com sucesso!"
      });
    }
  };

  // Filtrar gastos
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const matchesMonth = expenseDate.getMonth() === selectedMonth;
      const matchesYear = expenseDate.getFullYear() === selectedYear;
      const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
      const matchesOperation = selectedOperation === "all" || expense.operationId === selectedOperation;

      return matchesMonth && matchesYear && matchesCategory && matchesOperation;
    });
  }, [expenses, selectedMonth, selectedYear, selectedCategory, selectedOperation]);

  // Cálculos financeiros
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.value, 0);
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.value;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle completo dos gastos e despesas
          </p>
        </div>
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <ExpenseModal
              open={isNewModalOpen}
              onOpenChange={setIsNewModalOpen}
              expense={editingExpense}
              mode={editingExpense ? 'edit' : 'create'}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total do Período
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Maior Categoria
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {Object.keys(expensesByCategory).length > 0 ? (
              <>
                <div className="text-2xl font-bold text-card-foreground">
                  {CATEGORY_LABELS[Object.keys(expensesByCategory).reduce((a, b) => 
                    expensesByCategory[a as ExpenseCategory] > expensesByCategory[b as ExpenseCategory] ? a : b
                  ) as ExpenseCategory]}
                </div>
                <p className="text-xs text-muted-foreground">
                  R$ {Math.max(...Object.values(expensesByCategory)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-card-foreground">-</div>
                <p className="text-xs text-muted-foreground">Sem dados</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Média por Dia
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              R$ {(totalExpenses / new Date(selectedYear, selectedMonth + 1, 0).getDate()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Base: {new Date(selectedYear, selectedMonth + 1, 0).getDate()} dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filtros */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="filter-month">Mês</Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-year">Ano</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-category">Categoria</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-operation">Operação</Label>
                <Select
                  value={selectedOperation}
                  onValueChange={setSelectedOperation}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {operations.map((operation) => (
                      <SelectItem key={operation.id} value={operation.id}>
                        {operation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de gastos */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Gastos - {months[selectedMonth]} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Operação</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {expense.time || "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={CATEGORY_COLORS[expense.category]}>
                            {CATEGORY_LABELS[expense.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expense.operationId ? (
                            <span className="text-sm text-muted-foreground">
                              {operations.find(op => op.id === expense.operationId)?.name || "N/A"}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum gasto encontrado para os filtros selecionados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <ExpenseCalendarView
            expenses={expenses}
            operations={operations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}