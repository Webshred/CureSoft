import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmployeeQRCode from './EmployeeQRCode';
import { Plus, Trash2, QrCode } from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    workHourStart: '08:00',
    workHourEnd: '12:00'
  });
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    try {
      const res = await axios.post('/api/employees', {
        name: newEmployee.name,
        position: newEmployee.position,
        workHours: {
          start: newEmployee.workHourStart,
          end: newEmployee.workHourEnd,
        }
      });
      setEmployees(prev => [...prev, res.data]);
      setNewEmployee({ name: '', position: '', workHourStart: '08:00', workHourEnd: '12:00' });
    } catch (err) {
      console.error('Failed to add employee:', err);
    }
  };

  const handleRemoveEmployee = async (id) => {
    try {
      await axios.delete(`/api/employees/${id}`);
      setEmployees(prev => prev.filter(emp => emp._id !== id));
    } catch (err) {
      console.error('Failed to delete employee:', err);
    }
  };

  const handleShowQR = (employee) => {
    setSelectedEmployee(employee);
    setShowQRDialog(true);
  };

  return (
    <>
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>List of Employees</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add an employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a new employee</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workHourStart">Start time</Label>
                    <Input id="workHourStart" type="time" value={newEmployee.workHourStart} onChange={(e) => setNewEmployee({...newEmployee, workHourStart: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="workHourEnd">End time</Label>
                    <Input id="workHourEnd" type="time" value={newEmployee.workHourEnd} onChange={(e) => setNewEmployee({...newEmployee, workHourEnd: e.target.value})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEmployee}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Working hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position || 'N/A'}</TableCell>
                    <TableCell>
                      {employee.workHours?.start && employee.workHours?.end
                        ? `${employee.workHours.start} - ${employee.workHours.end}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" className="mr-2" onClick={() => handleShowQR(employee)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleRemoveEmployee(employee._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No registered employees
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code - {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6">
            {selectedEmployee && (
              <EmployeeQRCode employeeId={selectedEmployee._id} name={selectedEmployee.name} />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQRDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeeList;
