import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { getInventoryAlertStatusMap } from './Inventory.tsx';

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface InventoryItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const Billing = () => {
  const [patientName, setPatientName] = useState('');
  const [billerName, setBillerName] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unitPrice: 0 });
  const [suggestions, setSuggestions] = useState<InventoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBox = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [alertStatusMap, setAlertStatusMap] = useState<Record<string, 'normal' | 'warning' | 'critical'>>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/account/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          setBillerName(`${data.firstName} ${data.lastName}`);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();

    const clickOutside = (e: MouseEvent) => {
      if (suggestionBox.current && !suggestionBox.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get('/api/inventory');
        const inventory = res.data;
        setAlertStatusMap(getInventoryAlertStatusMap(inventory));
      } catch (err) {
        console.error('Error fetching inventory:', err);
      }
    };
    fetchInventory();
  }, []);

  const handleItemNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewItem({ ...newItem, name: value });
    if (value.length > 0) {
      try {
        const res = await axios.get(`/api/billing/suggestions?query=${value}`);
        setSuggestions(res.data);
        setShowSuggestions(res.data.length > 0);
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (item: InventoryItem) => {
    setNewItem({ name: item.name, quantity: 1, unitPrice: item.price });
    setShowSuggestions(false);
  };

  const addItem = () => {
    const alertStatus = alertStatusMap[newItem.name];
    if (alertStatus === 'critical') {
      toast.error('This item is critically low or out of stock.');
      return;
    }
    if (!newItem.name || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error('Fill in all fields correctly.');
      return;
    }
    setBillItems([...billItems, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ name: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (id: string) => {
    setBillItems(billItems.filter(i => i.id !== id));
  };

  const calculateTotal = () => billItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const generateReceiptHTML = () => {
  const date = new Date();
  return `
    <div style="font-family:monospace; width:280px; margin:auto; font-size:12px;">
      <div style="text-align:center; font-weight:bold; font-size:14px;">
        <div style="font-size:16px; margin-bottom:4px;">'MEDICAL NAME' </div>
        ${userData?.address || '123 Health St., Wellness City'}<br/>
        ${userData?.phone || '123-456-7890'}
      </div>

      <div>
        Biller Name: ${billerName}<br/>
        Patient Name: ${patientName}<br/>
        Date: ${date.toLocaleDateString()}<br/>
        Time: ${date.toLocaleTimeString()}<br/>
      </div>

      <hr/>
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead style="text-align:left; border-bottom:1px solid #000;">
          <tr>
            <th>#</th>
            <th>Item</th>
            <th style="text-align:right;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${billItems.map((item, idx) => {
            const total = item.quantity * item.unitPrice;
            return `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.name.slice(0, 16)}</td>
                <td style="text-align:right;">${item.quantity}</td>
                <td style="text-align:right;">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align:right;">${total.toFixed(2)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
      <hr/>
      <div style="text-align:right;">
        <strong>Subtotal:</strong> ${calculateTotal().toFixed(2)} Rs<br/>
        <strong>Grand Total:</strong> ${(calculateTotal() * 1.05).toFixed(2)} Rs
      </div>
      <hr/>

      <div style="margin-top:8px; text-align:center;">
        ${userData?.phone}<br/>
        ${userData?.address}<br/>
        <strong>Thank you for choosing 'MEDICAL NAME' !</strong><br/>
        We care for your health.
      </div>
    </div>
  `;
};


  const printReceipt = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<html><body>${generateReceiptHTML()}</body></html>`);
      w.document.close();
      w.print();
    }
  };

  const handlePrint = async () => {
    if (!patientName || !billerName || billItems.length === 0) {
      toast.error('Complete all fields.');
      return;
    }
    try {
      await axios.post('/api/billing/checkout', {
        billItems,
        totalAmount: calculateTotal()
      });
      printReceipt();
      toast.success('Invoice processed.');
      setPatientName('');
      setBillerName('');
      setBillItems([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to process billing.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>New Invoice</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient Name</Label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Biller Name</Label>
              <Input value={billerName} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 relative z-50">
            <div className="relative">
              <Label>Item Name</Label>
              <Input
                placeholder="Start typing..."
                value={newItem.name}
                onChange={handleItemNameChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {showSuggestions && (
                <div
                  ref={suggestionBox}
                  className="absolute z-50 w-full bg-white border rounded shadow max-h-60 overflow-y-auto"
                >
                  {suggestions.map((item) => {
                    const alert = alertStatusMap[item.name];
                    const bgColor =
                      alert === 'critical'
                        ? 'bg-red-100'
                        : alert === 'warning'
                        ? 'bg-yellow-100'
                        : '';

                    return (
                      <div
                        key={item._id}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${bgColor}`}
                        onClick={() => selectSuggestion(item)}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} — {item.quantity} {item.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={newItem.unitPrice}
                onChange={(e) =>
                  setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
          </div>

          <h3 className="font-medium text-lg mt-6 mb-2">Items</h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billItems.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>{i.name}</TableCell>
                    <TableCell>{i.quantity}</TableCell>
                    <TableCell>{i.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{(i.unitPrice * i.quantity).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeItem(i.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-xl font-semibold">Total: {calculateTotal().toFixed(2)} RS</div>
          <Button onClick={handlePrint} disabled={billItems.length === 0 || !patientName || !billerName}>
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Billing;
