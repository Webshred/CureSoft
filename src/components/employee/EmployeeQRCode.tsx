
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface EmployeeQRCodeProps {
  employeeId: string;
  name: string;
}

const EmployeeQRCode: React.FC<EmployeeQRCodeProps> = ({ employeeId, name }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code on component mount or when employeeId changes
  useEffect(() => {
    if (canvasRef.current) {
      const data = JSON.stringify({
        employeeId,
        timestamp: new Date().toISOString() // Add timestamp for uniqueness
      });
      
      QRCode.toCanvas(canvasRef.current, data, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch(error => {
        console.error("Error generating QR code:", error);
      });
    }
  }, [employeeId]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas ref={canvasRef} className="border p-2 rounded-md" />
      <p className="text-center font-medium">{name}</p>
      <p className="text-center text-sm text-gray-500">ID: {employeeId}</p>
    </div>
  );
};

export default EmployeeQRCode;