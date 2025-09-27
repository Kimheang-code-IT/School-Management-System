import { useState, useMemo } from 'react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEmployeesQuery } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/formatters';

const statusColor: Record<string, string> = {
  active: 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50',
  on_leave: 'bg-amber-900/50 text-amber-400 border-amber-800/50',
  terminated: 'bg-rose-900/50 text-rose-400 border-rose-800/50',
  inactive: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
};

// Mock employee data structure with enhanced fields
type Employee = {
  id: string;
  employeeId: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  department: string;
  position: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated' | 'inactive';
  hiredAt: string;
  birthDate: string;
  email: string;
  phone: string;
  address?: string;
};

const EmployeeDirectoryPage = () => {
  const { data, isLoading } = useEmployeesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Enhanced mock data with additional fields
  const enhancedEmployees: Employee[] = useMemo(() => {
    const baseEmployees = data?.employees || [];
    return baseEmployees.map((emp, index) => ({
      ...emp,
      employeeId: `EMP${String(index + 1).padStart(4, '0')}`,
      gender: ['Male', 'Female', 'Other'][index % 3] as 'Male' | 'Female' | 'Other',
      birthDate: new Date(1990 + (index % 20), index % 12, (index % 28) + 1).toISOString(),
      email: `${emp.fullName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      phone: `+1 (555) ${String(100 + index).padStart(3, '0')}-${String(1000 + index).padStart(4, '0')}`,
      address: `${index + 100} Main St, City, State ${10000 + index}`,
    }));
  }, [data?.employees]);

  // Get unique departments and positions for filters
  const departments = useMemo(() => {
    const depts = enhancedEmployees.map(emp => emp.department);
    return ['all', ...Array.from(new Set(depts))];
  }, [enhancedEmployees]);

  const positions = useMemo(() => {
    const pos = enhancedEmployees.map(emp => emp.position);
    return ['all', ...Array.from(new Set(pos))];
  }, [enhancedEmployees]);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return enhancedEmployees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm);
      
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
      const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;
      
      return matchesSearch && matchesDepartment && matchesPosition;
    });
  }, [enhancedEmployees, searchTerm, departmentFilter, positionFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = enhancedEmployees.length;
    const femaleEmployees = enhancedEmployees.filter(emp => emp.gender === 'Female').length;
    const maleEmployees = enhancedEmployees.filter(emp => emp.gender === 'Male').length;
    const uniquePositions = new Set(enhancedEmployees.map(emp => emp.position)).size;
    const uniqueDepartments = new Set(enhancedEmployees.map(emp => emp.department)).size;
    const activeEmployees = enhancedEmployees.filter(emp => emp.status === 'active').length;

    return {
      totalEmployees,
      femaleEmployees,
      maleEmployees,
      uniquePositions,
      uniqueDepartments,
      activeEmployees,
      femalePercentage: totalEmployees > 0 ? (femaleEmployees / totalEmployees * 100).toFixed(1) : '0',
    };
  }, [enhancedEmployees]);

  // Add new employee function
  const addEmployee = (newEmployee: Omit<Employee, 'id' | 'employeeId'>) => {
    // In a real app, this would be an API call
    console.log('Adding new employee:', newEmployee);
    setShowAddModal(false);
  };

  // Delete employee function
  const deleteEmployee = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      // In a real app, this would be an API call
      console.log('Deleting employee:', employeeId);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Employee Directory" description="Human capital snapshot across departments." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Employee Directory" 
        description="Comprehensive employee management system with detailed profiles."
        actions={
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500">
            + Add Employee
          </Button>
        }
      />

      <Callout>
        Complete HR management system with employee tracking, contact information, and organizational analytics. Export functionality and advanced reporting coming soon.
      </Callout>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Employees</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {stats.totalEmployees}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stats.activeEmployees} active</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Female Employees</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {stats.femaleEmployees}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stats.femalePercentage}% of total</p>
              </div>
              <div className="text-2xl">👩</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Positions</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {stats.uniquePositions}
                </p>
                <p className="text-xs text-slate-500 mt-1">job roles</p>
              </div>
              <div className="text-2xl">💼</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Departments</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {stats.uniqueDepartments}
                </p>
                <p className="text-xs text-slate-500 mt-1">teams</p>
              </div>
              <div className="text-2xl">🏢</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name, ID, email, or phone..."
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
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-slate-100"
              >
                <option value="all">All Positions</option>
                {positions.filter(pos => pos !== 'all').map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">
            Employee Directory ({filteredEmployees.length} employees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">ID</TableHead>
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Gender</TableHead>
                  <TableHead className="text-slate-400">Department</TableHead>
                  <TableHead className="text-slate-400">Position</TableHead>
                  <TableHead className="text-slate-400">Salary</TableHead>
                  <TableHead className="text-slate-400">Contact</TableHead>
                  <TableHead className="text-slate-400">Birth Date</TableHead>
                  <TableHead className="text-slate-400">Hired Date</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-slate-400 py-8">
                      No employees found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="font-mono text-sm text-slate-300">
                        {employee.employeeId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-100">{employee.fullName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          employee.gender === 'Female' 
                            ? 'bg-pink-900/50 text-pink-400 border border-pink-800/50'
                            : employee.gender === 'Male'
                            ? 'bg-blue-900/50 text-blue-400 border border-blue-800/50'
                            : 'bg-purple-900/50 text-purple-400 border border-purple-800/50'
                        }`}>
                          {employee.gender}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">{employee.department}</TableCell>
                      <TableCell className="text-slate-300">{employee.position}</TableCell>
                      <TableCell className="text-slate-100 font-medium">
                        {formatCurrency(employee.salary)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-slate-300 truncate">{employee.email}</div>
                          <div className="text-xs text-slate-500">{employee.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(employee.birthDate)}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(employee.hiredAt)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize border ${statusColor[employee.status]}`}>
                          {employee.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => console.log('Edit:', employee.id)}
                            className="p-1.5 rounded-md bg-slate-600 hover:bg-slate-500 transition-colors"
                            title="Edit Employee"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteEmployee(employee.id)}
                            className="p-1.5 rounded-md bg-rose-600 hover:bg-rose-500 transition-colors"
                            title="Delete Employee"
                          >
                            🗑️
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-slate-800 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold">Add New Employee</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-1 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <Input placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                  <select className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-slate-100">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                  <Input placeholder="Enter department" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
                  <Input placeholder="Enter position" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Salary</label>
                  <Input type="number" placeholder="Enter salary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <Input type="email" placeholder="Enter email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <Input placeholder="Enter phone number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Birth Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hire Date</label>
                  <Input type="date" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  <Input placeholder="Enter address" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => addEmployee({
                  fullName: 'New Employee',
                  gender: 'Male',
                  department: 'New Department',
                  position: 'New Position',
                  salary: 0,
                  status: 'active',
                  hiredAt: new Date().toISOString(),
                  birthDate: new Date().toISOString(),
                  email: 'new@company.com',
                  phone: '+1 (555) 000-0000',
                })}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Add Employee
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectoryPage;