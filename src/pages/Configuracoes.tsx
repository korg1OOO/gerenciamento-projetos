import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Palette, Database, Plus, Trash2, Users, DollarSign } from "lucide-react";

// Mock de configurações (em um app real viria de um backend)
const defaultCategories = [
  { id: '1', name: 'Infraestrutura', type: 'expense' },
  { id: '2', name: 'Equipe', type: 'expense' },
  { id: '3', name: 'Ferramentas', type: 'expense' },
  { id: '4', name: 'Marketing', type: 'expense' },
  { id: '5', name: 'Jurídico', type: 'expense' }
];

const defaultOperationTypes = [
  { id: '1', name: 'SaaS' },
  { id: '2', name: 'Produto' },
  { id: '3', name: 'Loja' },
  { id: '4', name: 'Serviço' }
];

export default function Configuracoes() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState({
    admin: true,
    financial: true,
    operations: true,
    clients: true
  });
  
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoSave: true
  });

  const [categories, setCategories] = useState(defaultCategories);
  const [operationTypes, setOperationTypes] = useState(defaultOperationTypes);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isNewTypeOpen, setIsNewTypeOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTypeName, setNewTypeName] = useState("");

  const handlePermissionChange = (permission: string, value: boolean) => {
    setPermissions(prev => ({ ...prev, [permission]: value }));
    toast({
      title: "Permissão atualizada",
      description: `${permission} ${value ? 'ativada' : 'desativada'} com sucesso!`
    });
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Configuração atualizada",
      description: `${setting} ${value ? 'ativada' : 'desativada'} com sucesso!`
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      type: 'expense'
    };
    
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName("");
    setIsNewCategoryOpen(false);
    
    toast({
      title: "Categoria adicionada",
      description: `Nova categoria "${newCategoryName}" criada com sucesso!`
    });
  };

  const addOperationType = () => {
    if (!newTypeName.trim()) return;
    
    const newType = {
      id: Date.now().toString(),
      name: newTypeName
    };
    
    setOperationTypes(prev => [...prev, newType]);
    setNewTypeName("");
    setIsNewTypeOpen(false);
    
    toast({
      title: "Tipo de operação adicionado",
      description: `Novo tipo "${newTypeName}" criado com sucesso!`
    });
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    toast({
      title: "Categoria removida",
      description: "Categoria excluída com sucesso!"
    });
  };

  const removeOperationType = (id: string) => {
    setOperationTypes(prev => prev.filter(type => type.id !== id));
    toast({
      title: "Tipo removido",
      description: "Tipo de operação excluído com sucesso!"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissões de Acesso */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissões de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="admin">Acesso Administrativo</Label>
                <p className="text-xs text-muted-foreground">Controle total do sistema</p>
              </div>
              <Switch 
                id="admin" 
                checked={permissions.admin}
                onCheckedChange={(value) => handlePermissionChange('admin', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="financial">Acesso Financeiro</Label>
                <p className="text-xs text-muted-foreground">Visualizar e editar dados financeiros</p>
              </div>
              <Switch 
                id="financial" 
                checked={permissions.financial}
                onCheckedChange={(value) => handlePermissionChange('financial', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="operations">Gerenciar Operações</Label>
                <p className="text-xs text-muted-foreground">Criar e editar operações</p>
              </div>
              <Switch 
                id="operations" 
                checked={permissions.operations}
                onCheckedChange={(value) => handlePermissionChange('operations', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="clients">Gerenciar Clientes</Label>
                <p className="text-xs text-muted-foreground">Acessar dados de clientes</p>
              </div>
              <Switch 
                id="clients" 
                checked={permissions.clients}
                onCheckedChange={(value) => handlePermissionChange('clients', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações Gerais */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-xs text-muted-foreground">Interface com fundo escuro</p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={settings.darkMode}
                onCheckedChange={(value) => handleSettingChange('darkMode', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notificações</Label>
                <p className="text-xs text-muted-foreground">Receber notificações do sistema</p>
              </div>
              <Switch 
                id="notifications" 
                checked={settings.notifications}
                onCheckedChange={(value) => handleSettingChange('notifications', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save">Salvamento Automático</Label>
                <p className="text-xs text-muted-foreground">Salvar alterações automaticamente</p>
              </div>
              <Switch 
                id="auto-save" 
                checked={settings.autoSave}
                onCheckedChange={(value) => handleSettingChange('autoSave', value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias de Gastos */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Categorias de Gastos
          </CardTitle>
          <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria de Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Nome da Categoria</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Assinaturas"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={addCategory} className="bg-primary hover:bg-primary/90">
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewCategoryOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category.id} variant="outline" className="flex items-center gap-2">
                {category.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(category.id)}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Operação */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tipos de Operação
          </CardTitle>
          <Dialog open={isNewTypeOpen} onOpenChange={setIsNewTypeOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Tipo de Operação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type-name">Nome do Tipo</Label>
                  <Input
                    id="type-name"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="Ex: Consultoria"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={addOperationType} className="bg-primary hover:bg-primary/90">
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewTypeOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {operationTypes.map((type) => (
              <Badge key={type.id} variant="outline" className="flex items-center gap-2">
                {type.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOperationType(type.id)}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup e Dados */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup e Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline">
            Exportar Dados
          </Button>
          <Button variant="outline">
            Importar Dados
          </Button>
          <Button variant="outline">
            Backup Automático
          </Button>
          <Button variant="destructive">
            Limpar Dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}