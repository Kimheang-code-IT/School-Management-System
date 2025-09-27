import { useState, useMemo } from 'react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEmployeesQuery } from '@/hooks';
import { formatDate, formatTime, formatHours } from '@/utils/formatters';

const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
  present: { label: 'Present', class: 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50', icon: '✅' },
  absent: { label: 'Absent', class: 'bg-rose-900/50 text-rose-400 border-rose-800/50', icon: '❌' },
  late: { label: 'Late', class: 'bg-amber-900/50 text-amber-400 border-amber-800/50', icon: '⏰' },
  remote: { label: 'Remote', class: 'bg-indigo-900/50 text-indigo-400 border-indigo-800/50', icon: '🏠' },
  vacation: { label: 'Vacation', class: 'bg-blue-900/50 text-blue-400 border-blue-800/50', icon: '🌴' },
  sick: { label: 'Sick Leave', class: 'bg-purple-900/50 text-purple-400 border-purple-800/50', icon: '🤒' },
};

type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  notes?: string;
};

const EmployeeAttendancePage = () => {
  const { data, isLoading } = useEmployeesQuery();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('present');

  // Enhanced attendance data with more details
  const attendanceData: AttendanceRecord[] = useMemo(() => [
    { id: '1', employeeId: '1', date: '2024-01-15', status: 'present', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8 },
    { id: '2', employeeId: '2', date: '2024-01-15', status: 'late', checkIn: '09:45', checkOut: '17:30', hoursWorked: 7.75 },
    { id: '3', employeeId: '3', date: '2024-01-15', status: 'remote', checkIn: '08:30', checkOut: '17:15', hoursWorked: 8.75 },
    { id: '4', employeeId: '4', date: '2024-01-15', status: 'sick', notes: 'Medical appointment' },
    { id: '5', employeeId: '5', date: '2024-01-15', status: 'present', checkIn: '08:45', checkOut: '17:15', hoursWorked: 8.5 },
    { id: '6', employeeId: '6', date: '2024-01-15', status: 'vacation', notes: 'Annual leave' },
    { id: '7', employeeId: '7', date: '2024-01-15', status: 'absent', notes: 'Unexcused absence' },
    { id: '8', employeeId: '1', date: '2024-01-14', status: 'present', checkIn: '08:55', checkOut: '17:05', hoursWorked: 8.17 },
    { id: '9', employeeId: '2', date: '2024-01-14', status: 'present', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8 },
    { id: '10', employeeId: '3', date: '2024-01-14', status: 'remote', checkIn: '08:45', checkOut: '17:20', hoursWorked: 8.58 },
  ], []);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = data?.employees?.map(emp => emp.department) || [];
    return ['all', ...Array.from(new Set(depts))];
  }, [data?.employees]);

  // Filter employees based on search and department
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

  // Get attendance records for selected date
  const todayAttendance = useMemo(() => {
    return filteredEmployees.map(employee => {
      const existingRecord = attendanceData.find(record => 
        record.employeeId === employee.id && record.date === selectedDate
      );
      
      return {
        employee,
        record: existingRecord || {
          id: `new-${employee.id}`,
          employeeId: employee.id,
          date: selectedDate,
          status: 'absent', // Default status
        }
      };
    });
  }, [filteredEmployees, attendanceData, selectedDate]);

  // Calculate attendance statistics
  const stats = useMemo(() => {
    const totalEmployees = todayAttendance.length;
    const presentCount = todayAttendance.filter(item => 
      ['present', 'late', 'remote'].includes(item.record.status)
    ).length;
    const absentCount = todayAttendance.filter(item => 
      ['absent', 'sick', 'vacation'].includes(item.record.status)
    ).length;
    const lateCount = todayAttendance.filter(item => item.record.status === 'late').length;
    const remoteCount = todayAttendance.filter(item => item.record.status === 'remote').length;

    return {
      totalEmployees,
      presentCount,
      absentCount,
      lateCount,
      remoteCount,
      attendanceRate: totalEmployees > 0 ? (presentCount / totalEmployees * 100).toFixed(1) : '0',
    };
  }, [todayAttendance]);

  // Update attendance status
  const updateAttendance = (employeeId: string, status: string, checkIn?: string, checkOut?: string) => {
    console.log('Updating attendance:', { employeeId, status, checkIn, checkOut });
    // In real app, this would update the API
  };

  // Bulk update attendance
  const bulkUpdateAttendance = () => {
    todayAttendance.forEach(item => {
      updateAttendance(item.employee.id, bulkStatus);
    });
    setShowQuickActions(false);
    alert(`Updated ${todayAttendance.length} employees to ${statusConfig[bulkStatus]?.label}`);
  };

  // Mark all as present
  const markAllPresent = () => {
    todayAttendance.forEach(item => {
      updateAttendance(item.employee.id, 'present', '09:00', '17:00');
    });
    alert(`Marked all ${todayAttendance.length} employees as present`);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Attendance Tracking" description="Daily presence overview for staff." />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Attendance Management" 
        description="Complete employee attendance tracking system with real-time monitoring."
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowQuickActions(!showQuickActions)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ⚡ Quick Actions
            </Button>
            <Button 
              onClick={markAllPresent}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Mark All Present
            </Button>
          </div>
        }
      />

      <Callout>
        Comprehensive attendance management system with bulk actions, time tracking, and detailed reporting. 
        Supports multiple attendance statuses and working hour calculations.
      </Callout>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-800 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold">Quick Attendance Actions</h3>
              <button 
                onClick={() => setShowQuickActions(false)}
                className="rounded-md p-1 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Set Status for All Employees
                  </label>
                  <select 
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-slate-100"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-slate-400">
                  This will update attendance for {todayAttendance.length} employees to "{statusConfig[bulkStatus]?.label}"
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
              <Button 
                variant="outline" 
                onClick={() => setShowQuickActions(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={bulkUpdateAttendance}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Apply to All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Employees</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{stats.totalEmployees}</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Present Today</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.presentCount}</p>
                <p className="text-xs text-slate-500 mt-1">{stats.attendanceRate}% attendance rate</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Absent Today</p>
                <p className="text-2xl font-bold text-rose-400 mt-1">{stats.absentCount}</p>
                <p className="text-xs text-slate-500 mt-1">{stats.lateCount} late arrivals</p>
              </div>
              <div className="text-2xl">❌</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Working Remote</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.remoteCount}</p>
                <p className="text-xs text-slate-500 mt-1">remote workers</p>
              </div>
              <div className="text-2xl">🏠</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Date Selection */}
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
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-400">
            Viewing attendance for: {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">
            Daily Attendance ({todayAttendance.length} employees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Employee</TableHead>
                  <TableHead className="text-slate-400">Department</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Check In</TableHead>
                  <TableHead className="text-slate-400">Check Out</TableHead>
                  <TableHead className="text-slate-400">Hours</TableHead>
                  <TableHead className="text-slate-400">Notes</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      No employees found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  todayAttendance.map(({ employee, record }) => (
                    <TableRow key={employee.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-100">{employee.fullName}</div>
                          <div className="text-xs text-slate-500">{employee.position}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{employee.department}</TableCell>
                      <TableCell>
                        <select
                          value={record.status}
                          onChange={(e) => updateAttendance(employee.id, e.target.value)}
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize border ${
                            statusConfig[record.status]?.class || 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                          }`}
                        >
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <option key={key} value={key}>{config.icon} {config.label}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={record.checkIn || ''}
                          onChange={(e) => updateAttendance(employee.id, record.status, e.target.value, record.checkOut)}
                          className="w-24 h-8 text-sm"
                          disabled={!['present', 'late', 'remote'].includes(record.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={record.checkOut || ''}
                          onChange={(e) => updateAttendance(employee.id, record.status, record.checkIn, e.target.value)}
                          className="w-24 h-8 text-sm"
                          disabled={!['present', 'late', 'remote'].includes(record.status)}
                        />
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono">
                        {record.hoursWorked ? formatHours(record.hoursWorked) : '–'}
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Add notes..."
                          value={record.notes || ''}
                          onChange={(e) => console.log('Update notes:', e.target.value)}
                          className="w-32 h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateAttendance(employee.id, 'present', '09:00', '17:00')}
                            className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 transition-colors"
                            title="Mark Present"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => updateAttendance(employee.id, 'absent')}
                            className="p-1.5 rounded-md bg-rose-600 hover:bg-rose-500 transition-colors"
                            title="Mark Absent"
                          >
                            ❌
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

      {/* Recent Attendance History */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Recent Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Employee</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Time</TableHead>
                <TableHead className="text-slate-400">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.slice(0, 5).map((record) => {
                const employee = data.employees.find(emp => emp.id === record.employeeId);
                const config = statusConfig[record.status] || statusConfig.absent;
                
                return (
                  <TableRow key={record.id} className="border-slate-700">
                    <TableCell className="font-medium text-slate-100">
                      {employee?.fullName || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize border ${config.class}`}>
                        {config.icon} {config.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {record.checkIn && record.checkOut ? (
                        `${formatTime(record.checkIn)} - ${formatTime(record.checkOut)}`
                      ) : (
                        '–'
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono">
                      {record.hoursWorked ? formatHours(record.hoursWorked) : '–'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendancePage;