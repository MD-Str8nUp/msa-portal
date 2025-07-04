import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Select";

interface AddScoutModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (scout: {
    name: string;
    age: number;
    groupId: string;
    parentId?: string;
  }) => void;
  groups: { id: string; name: string }[];
}

export default function AddScoutModal({ open, onClose, onSubmit, groups }: AddScoutModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [groupId, setGroupId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !groupId) return;

    onSubmit({
      name,
      age: parseInt(age, 10),
      groupId,
    });

    // Reset form
    setName("");
    setAge("");
    setGroupId("");
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Scout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Scout's full name"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="age" className="text-sm font-medium">
              Age
            </label>
            <Input
              id="age"
              type="number"
              min="5"
              max="18"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Scout's age"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="group" className="text-sm font-medium">
              Group
            </label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Scout</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
