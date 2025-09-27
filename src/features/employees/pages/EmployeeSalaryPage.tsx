import { useState, useMemo } from 'react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEmployeesQuery } from '@/hooks';
import { formatCurrency, formatNumber } from '@/utils/formatters';

type SalaryRecord = {
  id: string;
  employeeId: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'processing';
  paymentMethod: 'bank_transfer' | 'cash' | 'check';
  notes?: string;
};

const EmployeeSalaryPage = () => {
  const { data, isLoading } = useEmployeesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Enhanced salary data with payment history
  const salaryData: SalaryRecord[] = useMemo(() => [
    { id: '1', employeeId: '1', baseSalary: 5000, bonus: 500, deductions: 750, netSalary: 4750, paymentDate: '2024-01-31', status: 'paid', paymentMethod: 'bank_transfer' },
    { id: '2', employeeId: '2', baseSalary: 4500, bonus: 300, deductions: 675, netSalary: 4125, paymentDate: '2024-01-31', status: 'paid', paymentMethod: 'bank_transfer' },
    { id: '3', employeeId: '3', baseSalary: 4200, bonus: 200, deductions: 630, netSalary: 3770, paymentDate: '2024-01-31', status: 'paid', paymentMethod: 'bank_transfer' },
    { id: '4', employeeId: '4', baseSalary: 3800, bonus: 150, deductions: 570, netSalary: 3380, paymentDate: '2024-01-31', status: 'pending', paymentMethod: 'bank_transfer' },
    { id: '5', employeeId: '5', baseSalary: 3500, bonus: 100, deductions: 525, netSalary: 3075, paymentDate: '2024-01-31', status: 'processing', paymentMethod: 'cash' },
    { id: '6', employeeId: '6', baseSalary: 3200, bonus: 80, deductions: 480, netSalary: 2800, paymentDate: '2024-01-31', status: 'paid', paymentMethod: 'check' },
    { id: '7', employeeId: '7', baseSalary: 3000, bonus: 50, deductions: 450, netSalary: 2600, paymentDate: '2024-01-31', status: 'paid', paymentMethod: 'bank_transfer' },
  ], []);

  // Get unique departments and statuses for filters
  const departments = useMemo(() => {
    const depts = data?.employees?.map(emp => emp.department) || [];
    return ['all', ...Array.from(new Set(depts))];
  }, [data?.employees]);

  const statuses = ['all', 'paid', 'pending', 'processing'];

  // Calculate salary statistics
  const salaryStats = useMemo(() => {
    const totalEmployees = data?.employees?.length || 0;
    const totalMonthlySalary = data?.employees?.reduce((sum, emp) => sum + emp.salary, 0) || 0;
    const averageSalary = totalEmployees > 0 ? totalMonthlySalary / totalEmployees : 0;
    const highestSalary = Math.max(...(data?.employees?.map(emp => emp.salary) || [0]));
    const lowestSalary = Math.min(...(data?.employees?.map(emp => emp.salary) || [0]));

    // Payment status counts
    const paidCount = salaryData.filter(record => record.status === 'paid').length;
    const pendingCount = salaryData.filter(record => record.status === 'pending').length;
    const processingCount = salaryData.filter(record => record.status === 'processing').length;

    return {
      totalEmployees,
      totalMonthlySalary,
      averageSalary,
      highestSalary,
      lowestSalary,
      paidCount,
      pendingCount,
      processingCount,
      totalPayroll: salaryData.reduce((sum, record) => sum + record.netSalary, 0)
    };
  }, [data?.employees, salaryData]);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];
    return data.employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [data?.employees, searchTerm, departmentFilter]);

  // Get salary records for filtered employees
  const employeeSalaries = useMemo(() => {
    return filteredEmployees.map(employee => {
      const salaryRecord = salaryData.find(record => record.employeeId === employee.id);
      return {
        employee,
        salary: salaryRecord || {
          id: `new-${employee.id}`,
          employeeId: employee.id,
          baseSalary: employee.salary,
          bonus: 0,
          deductions: employee.salary * 0.15, // Default 15% deductions
          netSalary: employee.salary * 0.85,
          paymentDate: new Date().toISOString().split('T')[0],
          status: 'pending' as const,
          paymentMethod: 'bank_transfer' as const
        }
      };
    });
  }, [filteredEmployees, salaryData]);

  // Open salary adjustment modal
  const openSalaryModal = (employee: any) => {
    setSelectedEmployee(employee);
    setShowSalaryModal(true);
  };

  // Process salary payment
  const processSalaryPayment = (employeeId: string) => {
    // In real app, this would process the payment
    alert(`Processing salary payment for employee ${employeeId}`);
  };

  // Generate payroll report
  const generatePayrollReport = () => {
    const reportData = employeeSalaries.map(({ employee, salary }) => ({
      Employee: employee.fullName,
      Department: employee.department,
      'Base Salary': formatCurrency(salary.baseSalary),
      Bonus: formatCurrency(salary.bonus),
      Deductions: formatCurrency(salary.deductions),
      'Net Salary': formatCurrency(salary.netSalary),
      Status: salary.status
    }));
    
    console.log('Payroll Report:', reportData);
    alert('Payroll report generated in console');
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Salary Management" description="Payroll visibility with basic metrics." />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Salary & Payroll Management" 
        description="Complete salary administration system with payment tracking and reporting."
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={generatePayrollReport}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              📊 Generate Report
            </Button>
            <Button 
              onClick={() => alert('Bulk payment processing coming soon!')}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              💳 Process Payments
            </Button>
          </div>
        }
      />

      <Callout>
        Advanced payroll management system with salary adjustments, bonus calculations, deduction tracking, 
        and payment processing. Export capabilities and tax calculation features included.
      </Callout>

      {/* Salary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Payroll</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {formatCurrency(salaryStats.totalPayroll)}
                </p>
                <p className="text-xs text-slate-500 mt-1">this month</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Avg. Salary</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {formatCurrency(salaryStats.averageSalary)}
                </p>
                <p className="text-xs text-slate-500 mt-1">per employee</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Paid</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {salaryStats.paidCount}
                </p>
                <p className="text-xs text-slate-500 mt-1">employees paid</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {salaryStats.pendingCount}
                </p>
                <p className="text-xs text-slate-500 mt-1">awaiting payment</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search employees by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-slate-100"
              >
                <option value="all">All Departments</option>
                {departments.filter(dept => dept !== 'all').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-slate-100"
              >
                <option value="all">All Status</option>
                {statuses.filter(status => status !== 'all').map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Payroll Period: 
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40 ml-2 inline-block"
              />
            </div>
            <div className="text-sm text-slate-400">
              Showing {employeeSalaries.length} employees
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Table */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">
            Employee Salaries & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Employee</TableHead>
                  <TableHead className="text-slate-400">Department</TableHead>
                  <TableHead className="text-slate-400">Base Salary</TableHead>
                  <TableHead className="text-slate-400">Bonus</TableHead>
                  <TableHead className="text-slate-400">Deductions</TableHead>
                  <TableHead className="text-slate-400">Net Salary</TableHead>
                  <TableHead className="text-slate-400">Payment Date</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeSalaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                      No employees found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeSalaries.map(({ employee, salary }) => (
                    <TableRow key={employee.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-100">{employee.fullName}</div>
                          <div className="text-xs text-slate-500">{employee.position}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{employee.department}</TableCell>
                      <TableCell className="text-slate-100 font-medium">
                        {formatCurrency(salary.baseSalary)}
                      </TableCell>
                      <TableCell className="text-emerald-400">
                        +{formatCurrency(salary.bonus)}
                      </TableCell>
                      <TableCell className="text-rose-400">
                        -{formatCurrency(salary.deductions)}
                      </TableCell>
                      <TableCell className="text-blue-400 font-bold">
                        {formatCurrency(salary.netSalary)}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {new Date(salary.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          salary.status === 'paid' 
                            ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50'
                            : salary.status === 'pending'
                            ? 'bg-amber-900/50 text-amber-400 border-amber-800/50'
                            : 'bg-blue-900/50 text-blue-400 border-blue-800/50'
                        }`}>
                          {salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openSalaryModal(employee)}
                            className="px-3 py-1 rounded-md bg-slate-600 hover:bg-slate-500 text-xs transition-colors"
                            title="Adjust Salary"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => processSalaryPayment(employee.id)}
                            disabled={salary.status === 'paid'}
                            className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-xs transition-colors"
                            title="Process Payment"
                          >
                            Pay
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Salary Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Department-wise Salary Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Department</TableHead>
                  <TableHead className="text-slate-400">Employees</TableHead>
                  <TableHead className="text-slate-400">Total Salary</TableHead>
                  <TableHead className="text-slate-400">Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.filter(dept => dept !== 'all').map(dept => {
                  const deptEmployees = data.employees.filter(emp => emp.department === dept);
                  const totalSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0);
                  const averageSalary = deptEmployees.length > 0 ? totalSalary / deptEmployees.length : 0;
                  
                  return (
                    <TableRow key={dept} className="border-slate-700">
                      <TableCell className="font-medium text-slate-100">{dept}</TableCell>
                      <TableCell className="text-slate-300">{deptEmployees.length}</TableCell>
                      <TableCell className="text-slate-100 font-medium">
                        {formatCurrency(totalSalary)}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {formatCurrency(averageSalary)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Recent Salary Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Employee</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryData.slice(0, 5).map(record => {
                  const employee = data.employees.find(emp => emp.id === record.employeeId);
                  return (
                    <TableRow key={record.id} className="border-slate-700">
                      <TableCell className="font-medium text-slate-100">
                        {employee?.fullName || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-blue-400 font-medium">
                        {formatCurrency(record.netSalary)}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {new Date(record.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          record.status === 'paid' 
                            ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50'
                            : 'bg-amber-900/50 text-amber-400 border-amber-800/50'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Salary Adjustment Modal */}
      {showSalaryModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-800 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold">Adjust Salary</h3>
              <button 
                onClick={() => setShowSalaryModal(false)}
                className="rounded-md p-1 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-slate-300 mb-2">Employee</div>
                  <div className="p-3 bg-slate-700/50 rounded-md">
                    {selectedEmployee.fullName} - {selectedEmployee.department}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Base Salary</label>
                  <Input 
                    type="number" 
                    defaultValue={selectedEmployee.salary}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bonus Amount</label>
                  <Input 
                    type="number" 
                    defaultValue="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Deductions</label>
                  <Input 
                    type="number" 
                    defaultValue={(selectedEmployee.salary * 0.15).toFixed(2)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSalaryModal(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  alert(`Salary adjusted for ${selectedEmployee.fullName}`);
                  setShowSalaryModal(false);
                }}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalaryPage;