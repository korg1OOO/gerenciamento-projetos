import { useState, useEffect } from "react";
import { useAuth, User, UserRole } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  Users as UsersIcon,
  Shield,
  Crown,
  User as UserIcon,
  Mail,
  Calendar,
  Settings
} from "lucide-react";

const ROLE_COLORS = {
  admin: "bg-red-500/10 text-red-500",
  gestor: "bg-blue-500/10 text-blue-500",
  colaborador: "bg-green-500/10 text-green-500"
};

const ROLE_ICONS = {
  admin: Crown,
  gestor: Shield,
  colaborador: UserIcon
};

const ROLE_LABELS = {
  admin: "Administrador",
  gestor: "Gestor",
  colaborador: "Colaborador"
};

export default function Usuarios() {
  const { currentUser, users, addUser, updateUser, deleteUser, updateUserPermissions } = useAuth();
  const { operations } = useApp();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Verificar se o usuário atual é admin
  const isAdmin = currentUser?.role === 'admin';

  // Formulário para novo usuário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "colaborador" as UserRole,
    permissions: {
      canViewFinance: false,
      canEditOperations: false,
      canManageUsers: false,
      canAccessAllProjects: false,
      assignedOperations: [] as string[]
    }
  });

  // Abrir modal automaticamente se veio da URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewModalOpen(true);
    }
  }, [searchParams]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "colaborador",
      permissions: {
        canViewFinance: false,
        canEditOperations: false,
        canManageUsers: false,
        canAccessAllProjects: false,
        assignedOperations: []
      }
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificar se email já existe
    const emailExists = users.some(user => 
      user.email === formData.email && user.id !== editingUser?.id
    );
    if (emailExists) {
      toast({
        title: "Erro",
        description: "Este email já está sendo usado",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions
      });
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!"
      });
    } else {
      addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions
      });
      toast({
        title: "Sucesso",
        description: "Novo usuário criado com sucesso!"
      });
    }

    setIsNewModalOpen(false);
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
    setIsNewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir sua própria conta",
        variant: "destructive"
      });
      return;
    }

    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      deleteUser(id);
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!"
      });
    }
  };

  const handlePermissionsEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
    setIsPermissionsModalOpen(true);
  };

  const handlePermissionsSubmit = () => {
    if (editingUser) {
      updateUserPermissions(editingUser.id, formData.permissions);
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso!"
      });
    }
    setIsPermissionsModalOpen(false);
    resetForm();
  };

  const toggleOperationAccess = (operationId: string) => {
    const currentAssigned = formData.permissions.assignedOperations;
    const newAssigned = currentAssigned.includes(operationId)
      ? currentAssigned.filter(id => id !== operationId)
      : [...currentAssigned, operationId];
    
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        assignedOperations: newAssigned
      }
    });
  };

  // Verificar permissões
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="p-8 text-center">
          <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar usuários.
          </p>
        </Card>
      </div>
    );
  }

  const UserCard = ({ user }: { user: User }) => {
    const RoleIcon = ROLE_ICONS[user.role];
    
    return (
      <Card className="bg-card border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <RoleIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base text-card-foreground">
                  {user.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(user)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePermissionsEdit(user)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {user.id !== currentUser?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Badge className={ROLE_COLORS[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ver Finanças:</span>
                <Badge variant={user.permissions.canViewFinance ? "default" : "secondary"}>
                  {user.permissions.canViewFinance ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Editar Operações:</span>
                <Badge variant={user.permissions.canEditOperations ? "default" : "secondary"}>
                  {user.permissions.canEditOperations ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Operações Atribuídas:</span>
                <Badge variant="outline">
                  {user.permissions.assignedOperations.length}
                </Badge>
              </div>
            </div>

            {user.lastLogin && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="h-3 w-3" />
                Último acesso: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@empresa.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Nível de Acesso</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Permissões básicas */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Permissões</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Ver Finanças</Label>
                      <p className="text-xs text-muted-foreground">Acesso à seção financeira</p>
                    </div>
                    <Switch
                      checked={formData.permissions.canViewFinance}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canViewFinance: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Editar Operações</Label>
                      <p className="text-xs text-muted-foreground">Criar e editar operações</p>
                    </div>
                    <Switch
                      checked={formData.permissions.canEditOperations}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canEditOperations: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Acesso a Todos os Projetos</Label>
                      <p className="text-xs text-muted-foreground">Ver todas as operações</p>
                    </div>
                    <Switch
                      checked={formData.permissions.canAccessAllProjects}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canAccessAllProjects: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingUser ? "Atualizar" : "Criar"} Usuário
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsNewModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de Permissões */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Permissões - {editingUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Operações atribuídas */}
            {!formData.permissions.canAccessAllProjects && (
              <div>
                <Label className="text-base font-medium">Operações Atribuídas</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione quais operações este usuário pode acessar
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {operations.map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{operation.name}</span>
                      <Switch
                        checked={formData.permissions.assignedOperations.includes(operation.id)}
                        onCheckedChange={() => toggleOperationAccess(operation.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handlePermissionsSubmit} className="bg-primary hover:bg-primary/90">
                Salvar Permissões
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsPermissionsModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'gestor').length}</p>
                <p className="text-sm text-muted-foreground">Gestores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'colaborador').length}</p>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}