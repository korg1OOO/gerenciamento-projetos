import React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
}

export function DateInput({ value, onChange, className, required, id, placeholder, ...props }: DateInputProps) {
  // Função para garantir que a data seja tratada corretamente
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    // Passar o valor direto como string no formato YYYY-MM-DD
    onChange(dateValue);
  };

  // Garantir que o valor está no formato correto para o input date
  const formatDateForInput = (dateValue: string | Date) => {
    if (!dateValue) return "";
    
    if (typeof dateValue === "string") {
      // Se já é uma string, assumir que está no formato correto
      return dateValue;
    }
    
    // Se é um objeto Date, converter para YYYY-MM-DD local sem timezone offset
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Input
      id={id}
      type="date"
      value={formatDateForInput(value)}
      onChange={handleDateChange}
      className={cn("", className)}
      required={required}
      placeholder={placeholder}
      {...props}
    />
  );
}