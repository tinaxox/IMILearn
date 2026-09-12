import type { ReactNode } from "react";

export function RoleGuard({
  allow,
  role,
  children,
}: {
  allow: Array<string | null>;
  role: string | null;
  children: ReactNode;
}) {
  if (!allow.includes(role)) return null;
  return <>{children}</>;
}
