import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Printer, FileText } from 'lucide-react';
import {
  Employee,
  EmployeeAttendance,
  EmployeeReport as EmployeeReportType
} from '@/types/employee';

interface EmployeeReportProps {
  employees: Employee[];
  attendances: EmployeeAttendance[];
  open: boolean;
  onClose: () => void;
}

const EmployeeReport: React.FC<EmployeeReportProps> = ({
  employees,
  attendances,
  open,
  onClose
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<EmployeeReportType | null>(null);

  const normalizedEmployees = employees.map(emp => ({
    ...emp,
    id: emp.id || (typeof emp._id === 'string' ? emp._id : emp._id?.toString())
  }));

  const months = [...Array(12).keys()].map(i => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString('en', { month: 'long' })
  }));

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2].map(y => ({
    value: y.toString(),
    label: y.toString()
  }));

  const generateReport = () => {
    const employee = normalizedEmployees.find(e => e.id === selectedEmployeeId);
    if (!employee) return;

    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    const filteredAttendances = attendances.filter(att => {
      const date = new Date(att.timestamp);
      return (
        att.employeeId === selectedEmployeeId &&
        date.getMonth() === month &&
        date.getFullYear() === year
      );
    });

    const attendancesByDate = filteredAttendances.reduce<Record<string, EmployeeAttendance[]>>((acc, att) => {
      const dateStr = new Date(att.timestamp).toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(att);
      return acc;
    }, {});

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const attendanceRecords = Array.from({ length: 30 }, (_, index) => {
      const day = index + 1;
      const dateObj = new Date(year, month, day);
      const dateStr = dateObj.toISOString().split('T')[0];
      const records = attendancesByDate[dateStr] || [];

      const checkIn = records.find(r => r.activityType === 'check-in');
      const checkOut = records.find(r => r.activityType === 'check-out');
      const leave = records.find(r => r.activityType === 'leave');

      return {
        day: dateObj.toLocaleString('en', { weekday: 'short' }),
        date: dateObj.toLocaleDateString(),
        checkIn: checkIn ? new Date(checkIn.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-',
        checkOut: checkOut ? new Date(checkOut.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-',
        leave: !!leave,
        status: leave ? 'Leave' : checkIn ? (checkIn.status === 'late' ? 'Late' : 'On Time') : 'Absent'
      };
    });

    const leaveCount = attendanceRecords.filter(a => a.leave).length;
    const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
    const daysPresent = attendanceRecords.filter(r => r.status === 'On Time' || r.status === 'Late').length;

    setReportData({
      employeeId: employee.id,
      name: employee.name,
      daysPresent,
      attendances: attendanceRecords,
      leaveCount,
      lateCount
    });
    setReportGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetReport = () => {
    setReportGenerated(false);
    setReportData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Monthly Attendance Report</DialogTitle>
        </DialogHeader>

        {!reportGenerated ? (
          <div className="grid gap-4 py-4">
            <div>
              <Label>Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {normalizedEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={generateReport} disabled={!selectedEmployeeId}>
                <FileText className="mr-2 h-4 w-4" /> Generate
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-4 print:p-0">
            <h1 className="text-center text-2xl font-bold underline mb-4">MONTHLY REPORT</h1>
            <h2 className="text-center text-lg font-semibold mb-2">{reportData?.name}</h2>

            <table className="w-full border text-sm print:text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-1">Day</th>
                  <th className="border p-1">Date</th>
                  <th className="border p-1">Arrival</th>
                  <th className="border p-1">Depart</th>
                  <th className="border p-1">Leave</th>
                  <th className="border p-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.attendances.map((record, i) => (
                  <tr key={i} className="text-center">
                    <td className="border p-1">{record.day}</td>
                    <td className="border p-1">{record.date}</td>
                    <td className="border p-1">{record.checkIn}</td>
                    <td className="border p-1">{record.checkOut}</td>
                    <td className="border p-1">{record.leave ? 'Yes' : '-'}</td>
                    <td className="border p-1">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right mt-2 text-sm">
              Month: {months[+selectedMonth].label} | Year: {selectedYear}
            </div>

            <DialogFooter className="mt-4 print:hidden">
              <Button variant="outline" onClick={resetReport}>Back</Button>
              <Button onClick={handlePrint} variant="secondary">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </DialogFooter>
          </div>
        )}
        
      </DialogContent>
    </Dialog>
  );
};
   

export default EmployeeReport;
