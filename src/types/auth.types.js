/** @typedef {"CMD" | "ADMIN" | "STAFF" | "DOCTOR" | "NURSE" | "LAB_TECH" | "PHARMACIST"} UserRole */
/** @typedef {{ id: string, name: string, email: string, role: UserRole, hospitalId: string }} AuthUser */
/** @typedef {{ accessToken: string, user: AuthUser }} AuthSession */
export const USER_ROLES = ["CMD", "ADMIN", "STAFF", "DOCTOR", "NURSE", "LAB_TECH", "PHARMACIST"];
