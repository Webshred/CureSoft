import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeSummary from './EmployeeSummary';
import EmployeeList from './EmployeeList';
import EmployeeQRScanner from './EmployeeQRScanner';
import EmployeeReport from './EmployeeReport';
import { useToast } from '@/hooks/use-toast';
import { Employee, EmployeeAttendance, ActivityType } from '@/types/employee';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<EmployeeAttendance[]>([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [showReportModal, setShowReportModal] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('/api/attendance');
      setAttendances(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  const handleAddEmployee = async (employee: Employee) => {
    try {
      const res = await axios.post('/api/employees', employee);
      setEmployees(prev => [...prev, res.data]);
      toast({
        title: 'Employee added',
        description: `${employee.name} added successfully`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add employee',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveEmployee = async (id: string) => {
    try {
      await axios.delete(`/api/employees/${id}`);
      setEmployees(prev => prev.filter(emp => emp.id !== id)); // ✅ Fixed from emp.id to emp._id
      toast({
        title: 'Employee removed',
        description: `Employee ${id} removed`,
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove employee',
        variant: 'destructive',
      });
    }
  };

  const handleScanAttendance = async (employeeId: string, activityType: ActivityType = 'check-in') => {
    try {
      const res = await axios.post('/api/attendance', { employeeId, activityType });
      await fetchAttendance(); // Keep data fresh

      const typeMsg = {
        'check-in': 'Arrival recorded',
        'check-out': 'Departure recorded',
        'leave': 'Leave recorded',
      };

      const employee = employees.find(e => e.id === employeeId); // ✅ Corrected reference
      toast({
        title: 'Attendance Recorded',
        description: `${employee?.name || 'Employee'} - ${typeMsg[activityType]}`,
        variant: 'success',
      });
    } catch (err: any) {
      console.error('Attendance error:', err);
      toast({
        title: 'Attendance Failed',
        description: err?.response?.data?.message || 'Could not mark attendance',
        variant: 'destructive',
      });
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter(
    att => att.date === todayDate && att.activityType === 'check-in'
  );
  const presentToday = todayAttendances.length;
  const absentToday = employees.length - presentToday;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="employees">List of Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <EmployeeSummary
            totalEmployees={employees.length}
            presentToday={presentToday}
            absentToday={absentToday}
            recentAttendances={todayAttendances}
            onShowReport={() => setShowReportModal(true)}
          />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeList
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeQRScanner onScan={handleScanAttendance} employees={employees} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showReportModal && (
        <EmployeeReport
          employees={employees}
          attendances={attendances}
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;
