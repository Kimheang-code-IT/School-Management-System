import { useState } from 'react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Calendar, Share2, Filter, Download, Plus, Edit, Mail } from 'lucide-react';
import { useEmployeesQuery } from '@/hooks';

// Simple date formatting functions to replace date-fns
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const formatDay = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
const formatDateNum = (date: Date) => date.getDate();

const EmployeeSchedulePage = () => {
  const { data, isLoading } = useEmployeesQuery();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());

  // Generate week days (Monday to Sunday)
  const generateWeekDays = () => {
    const today = new Date(currentWeek);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  const weekDays = generateWeekDays();

  // Filter and search logic
  const filteredSchedules = data?.schedules?.filter(schedule => {
    const employee = data.employees.find(emp => emp.id === schedule.employeeId);
    const matchesDepartment = filterDepartment === 'all' || employee?.department === filterDepartment;
    const matchesSearch = employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  }) || [];

  // Group schedules by employee for better display
  const schedulesByEmployee = filteredSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.employeeId]) {
      acc[schedule.employeeId] = [];
    }
    acc[schedule.employeeId].push(schedule);
    return acc;
  }, {} as Record<string, typeof filteredSchedules>);

  // Get unique departments for filter
  const departments = [...new Set(data?.employees?.map(emp => emp.department) || [])];

  const handleShareSchedule = () => {
    const selectedEmployees = data?.employees?.filter(emp => 
      selectedShifts.size === 0 || selectedShifts.has(emp.id)
    ) || [];
    
    alert(`Sharing schedule with ${selectedEmployees.length} employees`);
  };

  const handleExportSchedule = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Employee,Department,Date,Shift\n"
      + filteredSchedules.map(schedule => {
          const employee = data?.employees?.find(emp => emp.id === schedule.employeeId);
          return `"${employee?.fullName || 'Unknown'}","${employee?.department || 'Unknown'}","${schedule.day}","${schedule.shift}"`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `schedule-${formatDate(currentWeek)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelection = new Set(selectedShifts);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedShifts(newSelection);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Scheduling" description="Weekly shift allocations." />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Employee Scheduling" 
        description="Manage and share weekly shift allocations with your team."
      />

      <Callout>
        <div className="flex items-center justify-between">
          <div>
            Calendar sync and shift bidding automations are in development. 
            Team members can view their schedules through the shared link.
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Sync with Calendar
          </Button>
        </div>
      </Callout>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <select 
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-slate-700 rounded-md bg-slate-800 text-white"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto justify-end">
              <Button variant="outline" onClick={handleExportSchedule}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleShareSchedule}>
                <Share2 className="w-4 h-4 mr-2" />
                Share {selectedShifts.size > 0 && `(${selectedShifts.size})`}
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Shift
              </Button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigateWeek('prev')}
            >
              Previous Week
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold">
                Week of {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-sm text-slate-400">
                {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigateWeek('next')}
            >
              Next Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card className="border-slate-800/80 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-base text-slate-200 flex items-center justify-between">
            <span>Weekly Schedule</span>
            <Badge variant="secondary">
              {filteredSchedules.length} shifts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Employee</TableHead>
                  {weekDays.map(day => (
                    <TableHead key={day.getTime()} className="text-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-normal">{formatDay(day)}</span>
                        <span className="font-medium">{formatDateNum(day)}</span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.employees?.map((employee) => {
                  const employeeSchedules = schedulesByEmployee[employee.id] || [];
                  
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedShifts.has(employee.id)}
                            onChange={() => toggleEmployeeSelection(employee.id)}
                            className="rounded border-slate-600"
                          />
                          <div>
                            <div className="font-medium">{employee.fullName}</div>
                            <div className="text-sm text-slate-400">{employee.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      {weekDays.map(day => {
                        const daySchedule = employeeSchedules.find(s => 
                          s.day === formatDate(day)
                        );
                        
                        return (
                          <TableCell key={day.getTime()} className="text-center">
                            {daySchedule ? (
                              <Badge 
                                variant={
                                  daySchedule.shift.includes('Night') ? 'destructive' :
                                  daySchedule.shift.includes('Evening') ? 'secondary' : 'default'
                                }
                                className="cursor-pointer hover:opacity-80"
                              >
                                {daySchedule.shift}
                              </Badge>
                            ) : (
                              <span className="text-slate-500 text-xs">Off</span>
                            )}
                          </TableCell>
                        );
                      })}
                      
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              {selectedShifts.size > 0 ? (
                `${selectedShifts.size} employees selected`
              ) : (
                "Select employees to share specific schedules"
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedShifts(new Set())}
                disabled={selectedShifts.size === 0}
              >
                Clear Selection
              </Button>
              <Button 
                size="sm"
                onClick={handleShareSchedule}
                disabled={selectedShifts.size === 0}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-slate-200 flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Quick Share Links</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Schedule to All Employees
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Public View Link
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Individual Access</h4>
              <div className="space-y-3">
                <Input placeholder="Enter employee email to share..." />
                <Button className="w-full">Send Individual Invite</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSchedulePage;