
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  workHours: {
    start: string; // Format: "HH:MM"
    end: string;   // Format: "HH:MM"
  };
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';
export type ActivityType = 'check-in' | 'check-out' | 'leave';

export interface EmployeeAttendance {
  employeeId: string;
  name: string;
  timestamp: string; // ISO string
  date: string;      // ISO date string (for grouping)
  status: AttendanceStatus;
  activityType?: ActivityType; // New field to track the type of activity
}

export interface EmployeeReport {
  employeeId: string;
  name: string;
  daysPresent: number;
  attendances: {
    date: string;
    checkIn?: string;
    checkOut?: string;
    isLate: boolean;
  }[];
  leaveCount: number;
  lateCount: number;
}
