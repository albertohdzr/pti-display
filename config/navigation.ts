// config/navigation.ts
import {
  Home,
  Calendar,
  Users,
  BarChart,
  Settings,
  ClipboardList,
  BookOpen,
  Box,
  Cog,
} from "lucide-react";

import { NavigationItem } from "@/types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    permission: {
      category: "team",
      action: "viewMembers",
    },
  },
  {
    name: "Outreach Events",
    href: "/outreach",
    icon: Calendar,
    permission: {
      category: "events",
      action: "view",
    },
    children: [
      {
        name: "All Events",
        href: "/outreach",
        icon: ClipboardList,
        permission: {
          category: "events",
          action: "view",
        },
      },
      {
        name: "Create Event",
        href: "/outreach/new",
        icon: Calendar,
        permission: {
          category: "events",
          action: "create",
        },
      },
    ],
  },
  {
    name: "Team",
    href: "/users",
    icon: Users,
    permission: {
      category: "team",
      action: "viewMembers",
    },
  },
  {
    name: "Robotics",
    href: "/robotics",
    icon: Cog,
    permission: {
      category: "robotics",
      action: "view",
    },
    children: [
      {
        name: "Design",
        href: "/robotics/design",
        icon: BookOpen,
        permission: {
          category: "robotics",
          action: "manageDesign",
        },
      },
      {
        name: "Build",
        href: "/robotics/build",
        icon: Cog,
        permission: {
          category: "robotics",
          action: "manageBuild",
        },
      },
    ],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Box,
    permission: {
      category: "inventory",
      action: "view",
    },
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart,
    permission: {
      category: "team",
      action: "viewMembers",
    },
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    permission: {
      category: "team",
      action: "manageSettings",
    },
  },
];
