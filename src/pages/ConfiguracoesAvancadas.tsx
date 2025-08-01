import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Users,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Bell,
  Lock,
  Globe,
  Zap
} from "lucide-react";

interface SystemSettings {
  appearance: {
    theme: 'dark' | 'light' | 'auto';
    accentColor: string;
    compactMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    taskReminders: boolean;
    expenseAlerts: boolean;
    weeklyReports: boolean;
  };
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    passwordPolicy: 'basic' | 'medium' | 'strict';
  };
  system: {
    autoBackup: boolean;
    dataRetention: number;
    auditLog: boolean;
  };
}

export default function ConfiguracoesAvancadas() {
  const { currentUser, users } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SystemSettings>({
    appearance: {
      theme: 'dark',
      accentColor: '#3b82f6',
      compactMode: false
    },
    notifications: {
      emailNotifications: true,
      taskReminders: true,
      expenseAlerts: true,
      weeklyReports: false
    },
    security: {
      sessionTimeout: 60,
      requireTwoFactor: false,
      passwordPolicy: 'medium'
    },
    system: {
      autoBackup: true,
      dataRetention: 365,
      auditLog: true
    }
  });

  const [categories, setCategories] = useState([
    { id: '1', name: 'Infraestrutura', color: '#3b82f6' },
    { id: '2', name: 'Equipe', color: '#10b981' },
    { id: '3', name: 'Ferramentas', color: '#8b5cf6' },
    { id: '4', name: 'Marketing', color: '#f59e0b' },
    { id: '5', name: 'Jurídico', color: '#ef4444' }
  ]);

  const [operationTypes, setOperationTypes] = useState([
    { id: '1', name: 'SaaS', icon: 'Zap' },
    { id: '2', name: 'Produto', icon: 'Package' },
    { id: '3', name: 'Loja', icon: 'Store' },
    { id: '4', name: 'Serviço', icon: 'Tool' }
  ]);

  const isAdmin = currentUser?.role === 'admin';

  const handleSaveSettings = () => {
    // Simular salvamento
    toast({
      title: "Configurações salvas",
      description: "Todas as alterações foram aplicadas com sucesso!"
    });
  };

  const handleExportData = () => {
    // Simular exportação
    toast({
      title: "Exportação iniciada",
      description: "Os dados serão enviados por email em breve."
    });
  };

  const handleImportData = () => {
    // Simular importação
    toast({
      title: "Importação realizada",
      description: "Dados importados com sucesso!"
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar as configurações avançadas.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações Avançadas</h1>
          <p className="text-muted-foreground">
            Configure o sistema, permissões e personalização
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
          <Settings className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tema</Label>
              <Select
                value={settings.appearance.theme}
                onValueChange={(value) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, theme: value as 'dark' | 'light' | 'auto' }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cor de Destaque</Label>
              <Input
                type="color"
                value={settings.appearance.accentColor}
                onChange={(e) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, accentColor: e.target.value }
                })}
                className="w-full h-10"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">Interface mais densa</p>
              </div>
              <Switch
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, compactMode: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">Receber notificações por email</p>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailNotifications: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lembretes de Tarefas</Label>
                <p className="text-sm text-muted-foreground">Alertas para prazos</p>
              </div>
              <Switch
                checked={settings.notifications.taskReminders}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, taskReminders: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Gastos</Label>
                <p className="text-sm text-muted-foreground">Notificar gastos altos</p>
              </div>
              <Switch
                checked={settings.notifications.expenseAlerts}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, expenseAlerts: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Relatórios Semanais</Label>
                <p className="text-sm text-muted-foreground">Resumo semanal por email</p>
              </div>
              <Switch
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, weeklyReports: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Timeout de Sessão (minutos)</Label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 60 }
                })}
                min="15"
                max="480"
              />
            </div>

            <div>
              <Label>Política de Senha</Label>
              <Select
                value={settings.security.passwordPolicy}
                onValueChange={(value) => setSettings({
                  ...settings,
                  security: { ...settings.security, passwordPolicy: value as 'basic' | 'medium' | 'strict' }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básica</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="strict">Rigorosa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticação 2FA</Label>
                <p className="text-sm text-muted-foreground">Obrigar dois fatores</p>
              </div>
              <Switch
                checked={settings.security.requireTwoFactor}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  security: { ...settings.security, requireTwoFactor: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Backup diário dos dados</p>
              </div>
              <Switch
                checked={settings.system.autoBackup}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  system: { ...settings.system, autoBackup: checked }
                })}
              />
            </div>

            <div>
              <Label>Retenção de Dados (dias)</Label>
              <Input
                type="number"
                value={settings.system.dataRetention}
                onChange={(e) => setSettings({
                  ...settings,
                  system: { ...settings.system, dataRetention: parseInt(e.target.value) || 365 }
                })}
                min="30"
                max="3650"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Log de Auditoria</Label>
                <p className="text-sm text-muted-foreground">Registrar ações dos usuários</p>
              </div>
              <Switch
                checked={settings.system.auditLog}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  system: { ...settings.system, auditLog: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias Personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">2.4GB</p>
                <p className="text-sm text-muted-foreground">Armazenamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">1.2s</p>
                <p className="text-sm text-muted-foreground">Resposta Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
            <Button onClick={handleImportData} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Backup Manual
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}