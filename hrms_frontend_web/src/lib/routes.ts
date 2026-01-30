export type Role = "admin" | "hr" | "manager" | "employee";

export const AppRoutes = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  app: "/app",
} as const;

export interface NavItem {
  label: string;
  href: string;
  roles: Role[];
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/app", roles: ["admin", "hr", "manager", "employee"] },
  { label: "Employees", href: "/app/employees", roles: ["admin", "hr", "manager"] },
  { label: "Attendance", href: "/app/attendance", roles: ["admin", "hr", "manager", "employee"] },
  { label: "Leaves", href: "/app/leaves", roles: ["admin", "hr", "manager", "employee"] },
  { label: "Approvals", href: "/app/approvals", roles: ["admin", "hr", "manager"] },
  { label: "Payroll", href: "/app/payroll", roles: ["admin", "hr"] },
  { label: "Holidays", href: "/app/holidays", roles: ["admin", "hr", "manager", "employee"] },
  { label: "Audit", href: "/app/audit", roles: ["admin", "hr"] },
];
