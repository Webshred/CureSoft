import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Printer, FileText } from 'lucide-react';
import { Employee, EmployeeAttendance, EmployeeReport as EmployeeReportType } from '@/types/employee';

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

  const months = [...Array(12).keys()].map(i => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString('en', { month: 'long' })
  }));

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2].map(y => ({ value: y.toString(), label: y.toString() }));

  const generateReport = () => {
    const employee = employees.find(e => e.id === selectedEmployeeId);
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

    const attendanceRecords = Object.entries(attendancesByDate).map(([date, records]) => {
      records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const checkIn = records.find(r => r.activityType === 'check-in');
      const checkOut = records.find(r => r.activityType === 'check-out');
      const isLate = checkIn?.status === 'late';

      return {
        date,
        checkIn: checkIn ? new Date(checkIn.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined,
        checkOut: checkOut ? new Date(checkOut.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined,
        isLate
      };
    });

    const leaveCount = filteredAttendances.filter(a => a.activityType === 'leave').length;
    const lateCount = attendanceRecords.filter(r => r.isLate).length;

    setReportData({
      employeeId: employee.id,
      name: employee.name,
      daysPresent: attendanceRecords.length,
      attendances: attendanceRecords,
      leaveCount,
      lateCount
    });
    setReportGenerated(true);
  };

  const handlePrint = () => {
    if (!reportData) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre>${JSON.stringify(reportData, null, 2)}</pre>`);
      win.document.close();
      win.print();
    }
  };

  const resetReport = () => {
    setReportGenerated(false);
    setReportData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
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
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
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
                <FileText className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold">{reportData?.name}</h2>
              <p className="text-sm text-gray-500">{months[+selectedMonth].label} {selectedYear}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-blue-100 rounded-md">
                <p className="text-sm">Days Present</p>
                <p className="text-2xl font-bold">{reportData?.daysPresent}</p>
              </div>
              <div className="p-4 bg-red-100 rounded-md">
                <p className="text-sm">Late Arrivals</p>
                <p className="text-2xl font-bold">{reportData?.lateCount}</p>
              </div>
              <div className="p-4 bg-yellow-100 rounded-md">
                <p className="text-sm">Days Off</p>
                <p className="text-2xl font-bold">{reportData?.leaveCount}</p>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Check-In</th>
                    <th className="p-2 text-left">Check-Out</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.attendances.map((record, i) => (
                    <tr key={i}>
                      <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="p-2">{record.checkIn || '-'}</td>
                      <td className="p-2">{record.checkOut || '-'}</td>
                      <td className="p-2">
                        {record.isLate ? <span className="text-red-500">Late</span> : <span className="text-green-600">On Time</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={resetReport}>Back</Button>
              <Button onClick={handlePrint} variant="secondary">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeReport;
