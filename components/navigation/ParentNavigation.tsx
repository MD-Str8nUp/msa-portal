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
    name: "My Scouts",
    href: "/parent/scouts",
    icon: Users,
  },
  {
    name: "Progress",
    href: "/parent/progress",
    icon: Award,
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
  {
    name: "Admin Info",
    href: "/parent/admin",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/parent/settings",
    icon: Settings,
  },
];
