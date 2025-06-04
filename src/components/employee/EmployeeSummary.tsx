import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';
import { EmployeeAttendance } from '@/types/employee';

interface EmployeeSummaryProps {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  recentAttendances: EmployeeAttendance[];
  onShowReport: () => void;
}

const EmployeeSummary: React.FC<EmployeeSummaryProps> = ({
  totalEmployees,
  presentToday,
  absentToday,
  recentAttendances,
  onShowReport
}) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Present Employees Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{presentToday}</div>
          <p className="text-xs text-muted-foreground">
            {calculatePercentage(presentToday, totalEmployees)} employees
          </p>
          <div className="mt-4 h-2 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: calculatePercentage(presentToday, totalEmployees) }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Absent Employees Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Absences</CardTitle>
          <XCircle className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{absentToday}</div>
          <p className="text-xs text-muted-foreground">
            {calculatePercentage(absentToday, totalEmployees)} employees
          </p>
          <div className="mt-4 h-2 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-red-500"
              style={{ width: calculatePercentage(absentToday, totalEmployees) }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Date Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Date</CardTitle>
          <Calendar className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date().toLocaleDateString('eng-EN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalEmployees} registered employees
          </p>
          <Button 
            onClick={onShowReport} 
            variant="outline" 
            className="w-full mt-4 text-sm"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Monthly report
          </Button>
        </CardContent>
      </Card>

      {/* Recent Attendances */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Recent Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttendances.length > 0 ? (
            <div className="space-y-4">
              {recentAttendances.slice(0, 5).map((attendance, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">{attendance.name}</p>
                      <p className="text-xs text-gray-500">
                        {attendance.status === 'late'
                          ? 'Late'
                          : attendance.status === 'leave'
                          ? 'On Leave'
                          : 'On Time'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(attendance.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No attendance recorded today
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSummary;
