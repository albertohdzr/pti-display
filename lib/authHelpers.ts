// lib/authHelpers.ts
import { adminAuth, admindb } from "./firebaseAdmin";

export async function verifyUserAccess(
  token: string | undefined,
  teamId: string,
) {
  if (!token) {
    return { error: "No authentication token provided", status: 401 };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const memberDoc = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("teamMembers")
      .doc(uid)
      .get();

    if (!memberDoc.exists) {
      return { error: "User is not a team member", status: 403, uid };
    }

    const memberData = memberDoc.data();

    return {
      authorized: true,
      uid,
      role: memberData?.role,
      isAdmin: memberData?.role === "Admin" || memberData?.role === "Owner",
    };
  } catch (error) {
    return { error: "Authentication failed", status: 401 };
  }
}

export async function verifyPermission(
  token: string | undefined,
  teamId: string,
  permission: string,
) {
  const baseAccess = await verifyUserAccess(token, teamId);

  if (!baseAccess.authorized || baseAccess.error) {
    return baseAccess;
  }

  // Admins y Owners tienen todos los permisos
  if (baseAccess.isAdmin) {
    return baseAccess;
  }

  try {
    const permissionDoc = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("permissions")
      .doc(baseAccess.uid)
      .get();

    if (!permissionDoc.exists) {
      return { error: "No permissions found", status: 403 };
    }

    const permissions = permissionDoc.data();

    const [category, action] = permission.split(".");

    if (!permissions || !permissions[category]?.[action]) {
      return { error: "Insufficient permissions", status: 403 };
    }

    return baseAccess;
  } catch (error) {
    return { error: "Permission check failed", status: 500 };
  }
}
