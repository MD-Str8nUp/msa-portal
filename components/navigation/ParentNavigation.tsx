import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare,
  Settings,
  Award,
  FileText,
  BookOpen
} from "lucide-react";

export const parentNavigation = [
  {
    name: "Dashboard",
    href: "/parent/dashboard",
    icon: Home,
  },
  {
    name: "Progress",
    href: "/parent/progress",
    icon: Award,
  },
  {
    name: "Admin",
    href: "/parent/admin",
    icon: FileText,
  },
  {
    name: "Events",
    href: "/parent/events",
    icon: Calendar,
  },
  {
    name: "Messages",
    href: "/parent/messages",
    icon: MessageSquare,
  },
  {
    name: "Resources",
    href: "/parent/resources",
    icon: BookOpen,
  },
];
