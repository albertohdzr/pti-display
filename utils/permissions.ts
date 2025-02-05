// utils/permissions.ts
import {
  PermissionValue,
  PermissionCategories,
  TeamRole,
  EventPermissions,
  FinancePermissions,
  TeamManagementPermissions,
  StudentManagementPermissions,
  InventoryPermissions,
  RoboticsPermissions,
} from "@/types/team-management";
import { permissionSchema } from "@/constants/base-schema";

type CategoryPermissions = {
  events: EventPermissions;
  finance: FinancePermissions;
  team: TeamManagementPermissions;
  students: StudentManagementPermissions;
  inventory: InventoryPermissions;
  robotics: RoboticsPermissions;
};

type PermissionKey<T extends keyof CategoryPermissions> =
  keyof CategoryPermissions[T];

type CategoryPermissionsMap = {
  events: EventPermissions;
  finance: FinancePermissions;
  team: TeamManagementPermissions;
  students: StudentManagementPermissions;
  inventory: InventoryPermissions;
  robotics: RoboticsPermissions;
};

function createCategoryPermissions<T extends keyof CategoryPermissionsMap>(
  category: T,
  permissions: Partial<CategoryPermissionsMap[T]>,
): CategoryPermissionsMap[T] {
  const schemaPermissions = permissionSchema[category].permissions;
  const result = {} as CategoryPermissionsMap[T];

  for (const key of Object.keys(schemaPermissions)) {
    (result as any)[key] =
      permissions[key as keyof CategoryPermissionsMap[T]] ?? false;
  }

  return result;
}

export function generateFullPermissions(): PermissionValue {
  return {
    events: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manageVolunteers: true,
      manageTasks: true,
      manageFinances: true,
      manageSettings: true,
    },
    finance: {
      view: true,
      create: true,
      approve: true,
      manageSponsors: true,
      manageBudget: true,
      manageExpenses: true,
      manageSettings: true,
    },
    team: {
      viewMembers: true,
      manageMembers: true,
      manageRoles: true,
      managePermissions: true,
      manageSettings: true,
    },
    students: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manageAttendance: true,
      manageTraining: true,
      manageCertifications: true,
      manageSettings: true,
    },
    inventory: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      manageOrders: true,
      manageStock: true,
      manageSuppliers: true,
      manageSettings: true,
    },
    robotics: {
      view: true,
      manageDesign: true,
      manageBuild: true,
      manageCode: true,
      manageStrategy: true,
      manageCompetition: true,
      manageScouting: true,
      manageSettings: true,
    },
  };
}

export function generateDefaultPermissions(): PermissionValue {
  return {
    events: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      manageVolunteers: false,
      manageTasks: false,
      manageFinances: false,
      manageSettings: false,
    },
    finance: {
      view: false,
      create: false,
      approve: false,
      manageSponsors: false,
      manageBudget: false,
      manageExpenses: false,
      manageSettings: false,
    },
    team: {
      viewMembers: true,
      manageMembers: false,
      manageRoles: false,
      managePermissions: false,
      manageSettings: false,
    },
    students: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      manageAttendance: false,
      manageTraining: false,
      manageCertifications: false,
      manageSettings: false,
    },
    inventory: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      manageOrders: false,
      manageStock: false,
      manageSuppliers: false,
      manageSettings: false,
    },
    robotics: {
      view: true,
      manageDesign: false,
      manageBuild: false,
      manageCode: false,
      manageStrategy: false,
      manageCompetition: false,
      manageScouting: false,
      manageSettings: false,
    },
  };
}

export function generateLeadPermissions(): PermissionValue {
  const permissions = generateFullPermissions();

  if (permissions.team && permissions.finance) {
    permissions.team.managePermissions = false;
    permissions.team.manageSettings = false;
    permissions.finance.manageSettings = false;
  }

  return permissions;
}

export function generateMentorPermissions(): PermissionValue {
  const basePermissions = generateDefaultPermissions();

  const mentorOverrides: Partial<CategoryPermissions> = {
    students: {
      view: true,
      manageTraining: true,
      manageCertifications: true,
      manageAttendance: false,
      manageSettings: false,
      create: false,
      edit: false,
      delete: false,
    } as StudentManagementPermissions,
    robotics: {
      view: true,
      manageDesign: true,
      manageBuild: true,
      manageCode: true,
      manageStrategy: true,
      manageCompetition: false,
      manageScouting: false,
      manageSettings: false,
    } as RoboticsPermissions,
    events: {
      view: true,
      manageTasks: true,
      create: false,
      edit: false,
      delete: false,
      manageFinances: false,
      manageSettings: false,
      manageVolunteers: false,
    } as EventPermissions,
  };

  return mergePermissions(basePermissions, mentorOverrides);
}

export function generateStudentLeaderPermissions(): PermissionValue {
  const basePermissions = generateDefaultPermissions();

  const studentLeaderOverrides: Partial<CategoryPermissions> = {
    students: {
      view: true,
      manageAttendance: true,
      manageCertifications: false,
      manageSettings: false,
      manageTraining: false,
      create: false,
      edit: false,
      delete: false,
    } as StudentManagementPermissions,
    robotics: {
      view: true,
      manageScouting: true,
      manageStrategy: true,
      manageBuild: false,
      manageCode: false,
      manageCompetition: false,
      manageDesign: false,
      manageSettings: false,
    } as RoboticsPermissions,
    events: {
      view: true,
      manageVolunteers: true,
      manageTasks: true,
      manageFinances: false,
      manageSettings: false,
      create: false,
      edit: false,
      delete: false,
    } as EventPermissions,
  };

  return mergePermissions(basePermissions, studentLeaderOverrides);
}

export function mergePermissions(
  base: PermissionValue,
  override: Partial<CategoryPermissionsMap>,
): PermissionValue {
  return {
    events: {
      ...base.events,
      ...(override.events || {}),
    },
    finance: {
      ...base.finance,
      ...(override.finance || {}),
    },
    team: {
      ...base.team,
      ...(override.team || {}),
    },
    students: {
      ...base.students,
      ...(override.students || {}),
    },
    inventory: {
      ...base.inventory,
      ...(override.inventory || {}),
    },
    robotics: {
      ...base.robotics,
      ...(override.robotics || {}),
    },
  } as PermissionValue;
}

export function hasPermission<T extends keyof CategoryPermissions>(
  permissions: PermissionValue,
  category: T,
  action: PermissionKey<T>,
): boolean {
  return Boolean(permissions[category]?.[action]);
}

export function validatePermissions(
  permissions: unknown,
): permissions is PermissionValue {
  if (!permissions || typeof permissions !== "object") {
    return false;
  }

  return Object.entries(permissionSchema).every(
    ([category, { permissions: schemaPermissions }]) => {
      if (!(category in permissions)) {
        return false;
      }

      const permissionsForCategory = (permissions as PermissionValue)[
        category as keyof CategoryPermissions
      ];

      return Object.keys(schemaPermissions).every(
        (action) =>
          typeof permissionsForCategory[
            action as keyof typeof permissionsForCategory
          ] === "boolean",
      );
    },
  );
}

export function isAdminRole(role: TeamRole): boolean {
  return role === "Owner" || role === "Admin";
}

export function getAvailableCategories(): PermissionCategories[] {
  return Object.keys(permissionSchema) as PermissionCategories[];
}

export function getAvailableActions<T extends keyof CategoryPermissions>(
  category: T,
): PermissionKey<T>[] {
  return Object.keys(
    permissionSchema[category].permissions,
  ) as PermissionKey<T>[];
}

export function getPermissionInfo(
  category: keyof CategoryPermissions,
  action: string,
) {
  const categoryInfo = permissionSchema[category];
  const actionInfo = categoryInfo.permissions[action];

  return {
    category: {
      name: categoryInfo.name,
      description: categoryInfo.description,
    },
    action: actionInfo
      ? {
          name: actionInfo.name,
          description: actionInfo.description,
        }
      : null,
  };
}

export function getDefaultPermissionsForRole(role: TeamRole): PermissionValue {
  switch (role) {
    case "Owner":
      return generateFullPermissions();
    case "Admin":
      return generateFullPermissions();

    case "Lead":
      return {
        events: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manageVolunteers: true,
          manageTasks: true,
          manageFinances: true,
          manageSettings: false,
        },
        finance: {
          view: true,
          create: true,
          approve: true,
          manageSponsors: true,
          manageBudget: true,
          manageExpenses: true,
          manageSettings: false,
        },
        team: {
          viewMembers: true,
          manageMembers: true,
          manageRoles: false,
          managePermissions: false,
          manageSettings: false,
        },
        students: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manageAttendance: true,
          manageTraining: true,
          manageCertifications: true,
          manageSettings: false,
        },
        inventory: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manageOrders: true,
          manageStock: true,
          manageSuppliers: true,
          manageSettings: false,
        },
        robotics: {
          view: true,
          manageDesign: true,
          manageBuild: true,
          manageCode: true,
          manageStrategy: true,
          manageCompetition: true,
          manageScouting: true,
          manageSettings: false,
        },
      };

    case "Mentor":
      return {
        events: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          manageVolunteers: true,
          manageTasks: true,
          manageFinances: false,
          manageSettings: false,
        },
        finance: {
          view: true,
          create: false,
          approve: false,
          manageSponsors: false,
          manageBudget: false,
          manageExpenses: false,
          manageSettings: false,
        },
        team: {
          viewMembers: true,
          manageMembers: false,
          manageRoles: false,
          managePermissions: false,
          manageSettings: false,
        },
        students: {
          view: true,
          create: false,
          edit: true,
          delete: false,
          manageAttendance: true,
          manageTraining: true,
          manageCertifications: true,
          manageSettings: false,
        },
        inventory: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          manageOrders: false,
          manageStock: false,
          manageSuppliers: false,
          manageSettings: false,
        },
        robotics: {
          view: true,
          manageDesign: true,
          manageBuild: true,
          manageCode: true,
          manageStrategy: true,
          manageCompetition: false,
          manageScouting: false,
          manageSettings: false,
        },
      };

    case "Student Leader":
      return {
        events: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          manageVolunteers: true,
          manageTasks: true,
          manageFinances: false,
          manageSettings: false,
        },
        finance: {
          view: true,
          create: false,
          approve: false,
          manageSponsors: false,
          manageBudget: false,
          manageExpenses: false,
          manageSettings: false,
        },
        team: {
          viewMembers: true,
          manageMembers: false,
          manageRoles: false,
          managePermissions: false,
          manageSettings: false,
        },
        students: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          manageAttendance: true,
          manageTraining: false,
          manageCertifications: false,
          manageSettings: false,
        },
        inventory: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          manageOrders: false,
          manageStock: false,
          manageSuppliers: false,
          manageSettings: false,
        },
        robotics: {
          view: true,
          manageDesign: false,
          manageBuild: false,
          manageCode: false,
          manageStrategy: true,
          manageCompetition: false,
          manageScouting: true,
          manageSettings: false,
        },
      };

    default: // Member
      return generateDefaultPermissions();
  }
}
