
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import EmployeeManagement from '../components/employee/EmployeeManagement';

const EmployeesPage = () => {
  return (
    <PageLayout>
      <div className="p-6 animate-enter">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
            <p className="text-gray-500">
              Manage employees and track their attendance
            </p>
          </div>
        </div>
        
        <EmployeeManagement />
      </div>
    </PageLayout>
  );
};

export default EmployeesPage;
