import type { User } from "@shared/schema";

export const ROLE_HOME: Record<User["role"], string> = {
  admin: "/admin/overview",
  pos: "/pos/sale",
  user: "/",
};
