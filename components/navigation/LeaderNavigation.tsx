import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  Clipboard,
  BarChart,
  Settings
} from "lucide-react";

export const leaderNavigation = [
  {
    name: "Dashboard",
    href: "/leader/dashboard",
    icon: Home,
  },
  {
    name: "Scouts",
    href: "/leader/scouts",
    icon: Users,
  },
  {
    name: "Attendance",
    href: "/leader/attendance",
    icon: Clipboard,
  },
  {
    name: "Events",
    href: "/leader/events",
    icon: Calendar,
  },
  {
    name: "Reports",
    href: "/leader/reports",
    icon: BarChart,
  },
  {
    name: "Messages",
    href: "/leader/messages",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/leader/settings",
    icon: Settings,
  },
];
