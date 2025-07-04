import React from "react";
import { Button } from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";

interface AddScoutButtonProps {
  onClick: () => void;
}

export default function AddScoutButton({ onClick }: AddScoutButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="flex items-center space-x-2"
    >
      <PlusCircle className="h-5 w-5" />
      <span>Add Scout</span>
    </Button>
  );
}
