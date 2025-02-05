// constants/base-schema.ts
import { PermissionSchema } from "@/types/team-management";

export const permissionSchema: PermissionSchema = {
  events: {
    name: "Event Management",
    description: "Manage team events and outreach activities",
    permissions: {
      view: {
        name: "View Events",
        description: "Can view event details and calendar",
        defaultValue: true,
      },
      create: {
        name: "Create Events",
        description: "Can create new events",
        defaultValue: false,
      },
      edit: {
        name: "Edit Events",
        description: "Can modify existing events",
        defaultValue: false,
      },
      delete: {
        name: "Delete Events",
        description: "Can remove events",
        defaultValue: false,
      },
      manageVolunteers: {
        name: "Manage Volunteers",
        description: "Can assign and manage event volunteers",
        defaultValue: false,
      },
      manageTasks: {
        name: "Manage Tasks",
        description: "Can create and assign event tasks",
        defaultValue: false,
      },
      manageFinances: {
        name: "Manage Event Finances",
        description: "Can manage event-specific budgets and expenses",
        defaultValue: false,
      },
      manageSettings: {
        name: "Manage Event Settings",
        description: "Can modify event configurations",
        defaultValue: false,
      },
    },
  },
  team: {
    name: "Team Management",
    description: "Manage team members and settings",
    permissions: {
      viewMembers: {
        name: "View Members",
        description: "Can view team member information",
        defaultValue: true,
      },
      manageMembers: {
        name: "Manage Members",
        description: "Can add/remove team members",
        defaultValue: false,
      },
      manageRoles: {
        name: "Manage Roles",
        description: "Can assign member roles",
        defaultValue: false,
      },
      managePermissions: {
        name: "Manage Permissions",
        description: "Can modify member permissions",
        defaultValue: false,
      },
      manageSettings: {
        name: "Manage Team Settings",
        description: "Can modify team configurations",
        defaultValue: false,
      },
    },
  },
  finance: {
    name: "Financial Management",
    description: "Manage team finances and budget",
    permissions: {
      view: {
        name: "View Finances",
        description: "Can view financial information and reports",
        defaultValue: false,
      },
      create: {
        name: "Create Transactions",
        description: "Can create financial transactions",
        defaultValue: false,
      },
      approve: {
        name: "Approve Finances",
        description: "Can approve financial transactions and budgets",
        defaultValue: false,
      },
      manageSponsors: {
        name: "Manage Sponsors",
        description: "Can manage sponsor relationships and donations",
        defaultValue: false,
      },
      manageBudget: {
        name: "Manage Budget",
        description: "Can create and modify budget allocations",
        defaultValue: false,
      },
      manageExpenses: {
        name: "Manage Expenses",
        description: "Can manage team expenses and reimbursements",
        defaultValue: false,
      },
      manageSettings: {
        name: "Manage Finance Settings",
        description: "Can modify financial configurations",
        defaultValue: false,
      },
    },
  },
  students: {
    name: "Student Management",
    description: "Manage student members and training",
    permissions: {
      view: {
        name: "View Students",
        description: "Can view student information",
        defaultValue: true,
      },
      create: {
        name: "Add Students",
        description: "Can add new students",
        defaultValue: false,
      },
      edit: {
        name: "Edit Students",
        description: "Can modify student information",
        defaultValue: false,
      },
      delete: {
        name: "Remove Students",
        description: "Can remove students from the team",
        defaultValue: false,
      },
      manageAttendance: {
        name: "Manage Attendance",
        description: "Can track student attendance",
        defaultValue: false,
      },
      manageTraining: {
        name: "Manage Training",
        description: "Can manage student training programs",
        defaultValue: false,
      },
      manageCertifications: {
        name: "Manage Certifications",
        description: "Can manage student certifications and achievements",
        defaultValue: false,
      },
      manageSettings: {
        name: "Manage Student Settings",
        description: "Can modify student management configurations",
        defaultValue: false,
      },
    },
  },
  inventory: {
    name: "Inventory Management",
    description: "Manage team inventory and supplies",
    permissions: {
      view: {
        name: "View Inventory",
        description: "Can view inventory items",
        defaultValue: true,
      },
      create: {
        name: "Add Items",
        description: "Can add new inventory items",
        defaultValue: false,
      },
      edit: {
        name: "Edit Items",
        description: "Can modify inventory items",
        defaultValue: false,
      },
      delete: {
        name: "Remove Items",
        description: "Can remove inventory items",
        defaultValue: false,
      },
      manageOrders: {
        name: "Manage Orders",
        description: "Can manage purchase orders",
        defaultValue: false,
      },
      manageStock: {
        name: "Manage Stock",
        description: "Can manage inventory levels",
        defaultValue: false,
      },
      manageSuppliers: {
        name: "Manage Suppliers",
        description: "Can manage supplier relationships",
        defaultValue: false,
      },
      manageSettings: {
        name: "Manage Inventory Settings",
        description: "Can modify inventory configurations",
        defaultValue: false,
      },
    },
  },
  robotics: {
    name: "Robotics Management",
    description: "Manage robotics development and competition",
    permissions: {
      view: {
        name: "View Robotics",
        description: "Can view robotics information",
        defaultValue: true,
      },
      manageDesign: {
        name: "Manage Design",
        description: "Can manage robot design documentation",
        defaultValue: false,
      },
      manageBuild: {
        name: "Manage Build",
        description: "Can manage build process and documentation",
        defaultValue: false,
      },
      manageCode: {
        name: "Manage Code",
        description: "Can manage robot code and programming",
        defaultValue: false,
      },
      manageStrategy: {
        name: "Manage Strategy",
        description: "Can manage competition strategy",
        defaultValue: false,
      },
      manageCompetition: {
        name: "Manage Competition",
        description: "Can manage competition preparations and logistics",
        defaultValue: false,
      },
      manageScouting: {
        name: "Manage Scouting",
        description: "Can manage competition scouting",
        defaultValue: false,
      },
      manageSettings: {
        name: "Manage Robotics Settings",
        description: "Can modify robotics configurations",
        defaultValue: false,
      },
    },
  },
} as const;
