// lib/auth/roles.ts
export enum Role {
  ADMIN = "admin",
  COORDINATOR = "coordinator",
  MEMBER = "member",
  VIEWER = "viewer",
}

export interface Permission {
  action: "create" | "read" | "update" | "delete";
  resource: "events" | "resources" | "gallery" | "metrics" | "users";
}

export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    { action: "create", resource: "events" },
    { action: "read", resource: "events" },
    { action: "update", resource: "events" },
    { action: "delete", resource: "events" },
    { action: "create", resource: "users" },
    { action: "read", resource: "users" },
    { action: "update", resource: "users" },
    { action: "delete", resource: "users" },
    // ... all permissions
  ],
  [Role.COORDINATOR]: [
    { action: "create", resource: "events" },
    { action: "read", resource: "events" },
    { action: "update", resource: "events" },
    { action: "create", resource: "resources" },
    { action: "read", resource: "resources" },
    { action: "update", resource: "resources" },
    { action: "read", resource: "metrics" },
  ],
  [Role.MEMBER]: [
    { action: "read", resource: "events" },
    { action: "create", resource: "resources" },
    { action: "read", resource: "resources" },
    { action: "create", resource: "gallery" },
    { action: "read", resource: "gallery" },
  ],
  [Role.VIEWER]: [
    { action: "read", resource: "events" },
    { action: "read", resource: "resources" },
    { action: "read", resource: "gallery" },
  ],
};
