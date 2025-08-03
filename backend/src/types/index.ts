import mongoose from 'mongoose';

export type UserRole = 'admin' | 'gestor' | 'colaborador';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: {
    canViewFinance: boolean;
    canEditOperations: boolean;
    canManageUsers: boolean;
    canAccessAllProjects: boolean;
    assignedOperations: string[];
  };
  createdAt: Date;
  lastLogin?: Date;
}

export type OperationStatus = 'planejamento' | 'execucao' | 'finalizado' | 'arquivado';
export type OperationType = 'saas' | 'produto' | 'loja' | 'servico' | 'outro';

export interface Operation {
  id?: string;
  _id?: mongoose.Types.ObjectId;
  name: string;
  type: OperationType;
  status: OperationStatus;
  links: {
    drive: string;
    notion: string;
    domain: string;
    other: string;
  };
  notes: string;
  profile: 'pf' | 'pj';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export type ExpenseCategory = 'infra' | 'equipe' | 'ferramentas' | 'marketing' | 'juridico' | 'outro';

export interface Expense {
  id?: string;
  _id?: mongoose.Types.ObjectId;
  value: number;
  date: Date;
  time?: string;
  category: ExpenseCategory;
  operationId?: string;
  description: string;
  profile: 'pf' | 'pj';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface Task {
  id?: string;
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  time?: string;
  operationId?: string;
  completed: boolean;
  priority: 'baixa' | 'media' | 'alta';
  profile: 'pf' | 'pj';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface Client {
  id?: string;
  _id?: mongoose.Types.ObjectId;
  name: string;
  operationId?: string;
  observations: string;
  contact: string;
  profile: 'pf' | 'pj';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}