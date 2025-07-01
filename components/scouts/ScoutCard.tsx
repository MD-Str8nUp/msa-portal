import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface ScoutCardProps {
  scout: {
    id: string;
    name: string;
    age: number;
    groupName: string;
    rank: string;
    joinedDate: string;
    avatarUrl?: string;
  };
  onView: (id: string) => void;
}

export default function ScoutCard({ scout, onView }: ScoutCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{scout.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">Age: {scout.age}</span>
          <span className="text-sm font-medium">Group: {scout.groupName}</span>
          <span className="text-sm font-medium">Rank: {scout.rank}</span>
          <span className="text-sm font-medium">
            Joined: <DateTimeDisplay date={scout.joinedDate} format="short" />
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onView(scout.id)} className="w-full">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
