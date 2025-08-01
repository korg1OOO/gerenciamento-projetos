import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/context/ProfileContext";
import { User, Building2 } from "lucide-react";

export function ProfileToggle() {
  const { activeProfile, setActiveProfile } = useProfile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {activeProfile === 'pf' ? (
            <User className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Building2 className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Alternar perfil</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setActiveProfile("pf")}>
          <User className="mr-2 h-4 w-4" />
          Pessoa Física
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setActiveProfile("pj")}>
          <Building2 className="mr-2 h-4 w-4" />
          Pessoa Jurídica
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}