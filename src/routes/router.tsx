import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const StudentsOverviewPage = lazy(() => import('@/features/students/pages/StudentsOverviewPage'));
const StudentRegistrationPage = lazy(() => import('@/features/students/pages/StudentRegistrationPage'));
const StudentsClassPage = lazy(() => import('@/features/students/pages/StudentsClassPage'));
const StudentsDeadlinePage = lazy(() => import('@/features/students/pages/StudentsDeadlinePage'));
const StudentsPaymentPage = lazy(() => import('@/features/students/pages/StudentsPaymentPage'));
const StudentsBooksPage = lazy(() => import('@/features/students/pages/StudentsBooksPage'));
const StudentsGraduatedPage = lazy(() => import('@/features/students/pages/StudentsGraduatedPage'));
const StockCategoriesPage = lazy(() => import('@/features/stock/pages/StockCategoriesPage'));
const StockProductsPage = lazy(() => import('@/features/stock/pages/StockProductsPage'));
const StockPosPage = lazy(() => import('@/features/stock/pages/StockPosPage'));
const StockReportsPage = lazy(() => import('@/features/stock/pages/StockReportsPage'));
const EmployeeDirectoryPage = lazy(() => import('@/features/employees/pages/EmployeeDirectoryPage'));
const EmployeeAttendancePage = lazy(() => import('@/features/employees/pages/EmployeeAttendancePage'));
const EmployeeSalaryPage = lazy(() => import('@/features/employees/pages/EmployeeSalaryPage'));
const EmployeeSchedulePage = lazy(() => import('@/features/employees/pages/EmployeeSchedulePage'));
const InvestmentMembersPage = lazy(() => import('@/features/investment/pages/InvestmentMembersPage'));
const InvestmentPaymentsPage = lazy(() => import('@/features/investment/pages/InvestmentPaymentsPage'));
const InvestmentTablePage = lazy(() => import('@/features/investment/pages/InvestmentTablePage'));

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace />, handle: { title: 'Redirecting' } },
          { path: 'dashboard', element: <DashboardPage />, handle: { title: 'Executive Dashboard' } },
          { path: 'students', element: <StudentsOverviewPage />, handle: { title: 'Student Overview' } },
          { path: 'students/register', element: <StudentRegistrationPage />, handle: { title: 'Student Registration' } },
          { path: 'students/class', element: <StudentsClassPage />, handle: { title: 'Class Management' } },
          { path: 'students/deadline', element: <StudentsDeadlinePage />, handle: { title: 'Deadlines & Compliance' } },
          { path: 'students/payment', element: <StudentsPaymentPage />, handle: { title: 'Student Payments' } },
          { path: 'students/books', element: <StudentsBooksPage />, handle: { title: 'Books Distribution' } },
          { path: 'students/graduated', element: <StudentsGraduatedPage />, handle: { title: 'Graduated Students' } },
          { path: 'stock/categories', element: <StockCategoriesPage />, handle: { title: 'Stock Categories' } },
          { path: 'stock/products', element: <StockProductsPage />, handle: { title: 'Product Catalogue' } },
          { path: 'stock/pos', element: <StockPosPage />, handle: { title: 'Point of Sale' } },
          { path: 'stock/reports', element: <StockReportsPage />, handle: { title: 'Inventory Reports' } },
          { path: 'employees', element: <EmployeeDirectoryPage />, handle: { title: 'Employee Directory' } },
          { path: 'employees/attendance', element: <EmployeeAttendancePage />, handle: { title: 'Attendance Tracking' } },
          { path: 'employees/salary', element: <EmployeeSalaryPage />, handle: { title: 'Salary Management' } },
          { path: 'employees/schedule', element: <EmployeeSchedulePage />, handle: { title: 'Scheduling' } },
          { path: 'investment/members', element: <InvestmentMembersPage />, handle: { title: 'Investment Members' } },
          { path: 'investment/payments', element: <InvestmentPaymentsPage />, handle: { title: 'Investment Payments' } },
          { path: 'investment/table', element: <InvestmentTablePage />, handle: { title: 'Investment Performance' } },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
    handle: { title: 'Login' },
  },
  {
    path: '*',
    element: <NotFoundPage />,
    handle: { title: 'Not found' },
  },
]);
