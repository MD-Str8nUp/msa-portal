import { 
  Home, 
  Users, 
  UserPlus,
  Building,
  Calendar, 
  MessageSquare, 
  BarChart2,
  Settings,
  FileText,
  DollarSign,
  Shield
} from "lucide-react";

export const executiveNavigation = [
  {
    name: "Dashboard",
    href: "/executive/dashboard",
    icon: Home,
  },
  {
    name: "Groups",
    href: "/executive/groups",
    icon: Building,
  },
  {
    name: "Leaders",
    href: "/executive/leaders",
    icon: UserPlus,
  },
  {
    name: "Members",
    href: "/executive/members",
    icon: Users,
  },
  {
    name: "Events",
    href: "/executive/events",
    icon: Calendar,
  },
  {
    name: "Finance",
    href: "/executive/finance",
    icon: DollarSign,
  },
  {
    name: "Admin",
    href: "/executive/admin",
    icon: Shield,
  },
  {
    name: "Reports",
    href: "/executive/reports",
    icon: BarChart2,
  },
  {
    name: "Documents",
    href: "/executive/documents",
    icon: FileText,
  },
  {
    name: "Messages",
    href: "/executive/messages",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/executive/settings",
    icon: Settings,
  },
];
