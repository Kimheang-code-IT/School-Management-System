import type { LucideIcon } from 'lucide-react';
import { GraduationCap, LayoutDashboard, PiggyBank, Users, Warehouse } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
}

export interface NavSection {
  label: string;
  icon: LucideIcon;
  to?: string;
  items?: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    label: 'Student Management',
    icon: GraduationCap,
    items: [
      { label: 'Overview', to: '/students' },
      { label: 'Registration', to: '/students/register' },
      { label: 'Classes', to: '/students/class' },
      { label: 'Deadlines', to: '/students/deadline' },
      { label: 'Payments', to: '/students/payment' },
      { label: 'Books', to: '/students/books' },
      { label: 'Graduated', to: '/students/graduated' },
    ],
  },
  {
    label: 'Stock Management',
    icon: Warehouse,
    items: [
      { label: 'Categories', to: '/stock/categories' },
      { label: 'Products', to: '/stock/products' },
      { label: 'Point of Sale', to: '/stock/pos' },
      { label: 'Reports', to: '/stock/reports' },
    ],
  },
  {
    label: 'Employee Management',
    icon: Users,
    items: [
      { label: 'Directory', to: '/employees' },
      { label: 'Attendance', to: '/employees/attendance' },
      { label: 'Salary', to: '/employees/salary' },
      { label: 'Schedules', to: '/employees/schedule' },
    ],
  },
  {
    label: 'Investment',
    icon: PiggyBank,
    items: [
      { label: 'Members', to: '/investment/members' },
      { label: 'Payments', to: '/investment/payments' },
      { label: 'Performance Table', to: '/investment/table' },
    ],
  },
];
