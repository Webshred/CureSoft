import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  UserCheck,
} from 'lucide-react';

const EmployeeQRScanner = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [activityType, setActivityType] = useState('check-in');
  const [scanSuccess, setScanSuccess] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('/api/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  const handleAttendance = async () => {
    if (!selectedEmployeeId) return;

    try {
      await axios.post('/api/attendance', {
        employeeId: selectedEmployeeId,
        activityType,
      });

      setScanSuccess(true);
      setTimeout(() => {
        setScanSuccess(false);
        setSelectedEmployeeId('');
      }, 3000);
    } catch (err) {
      console.error('Attendance marking failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-md border border-dashed border-gray-300 text-center">
        <div className="w-full max-w-md mx-auto space-y-4">
          <div className="grid gap-2 text-left">
            <Label>Employee</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 text-left">
            <Label>Activity Type</Label>
            <Select
              value={activityType}
              onValueChange={setActivityType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check-in">Arrival</SelectItem>
                <SelectItem value="check-out">Departure</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAttendance}
            disabled={!selectedEmployeeId || scanSuccess}
            className="w-full"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {scanSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {activityType === 'check-in' && "Employee arrival recorded."}
            {activityType === 'check-out' && "Employee departure recorded."}
            {activityType === 'leave' && "Leave recorded for employee."}
          </AlertDescription>
        </Alert>
      )}

      <div className="prose max-w-none">
        <h3>How this works:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Each employee has a unique QR Code.</li>
          <li>QR code is scanned on arrival or leave.</li>
          <li>Attendance is automatically stored with validation.</li>
        </ol>
      </div>
    </div>
  );
};

export default EmployeeQRScanner;
