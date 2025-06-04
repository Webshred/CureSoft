import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

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

const Billing = () => {
  const [patientName, setPatientName] = useState('');
  const [billerName, setBillerName] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unitPrice: 0 });
  const [suggestions, setSuggestions] = useState<InventoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
    try {
      const res = await axios.get('');
      // setCurrentUser(res.data);
      // setBillerName(`${res.data.firstName} ${res.data.lastName}`);
    } catch (err) {
      console.error('Failed to load user account info:', err);
    }
  };
  fetchUserDetails();
  
    const clickOutside = (e: MouseEvent) => {
      if (suggestionBox.current && !suggestionBox.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
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
    if (!newItem.name || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error("Fill in all fields correctly.");
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
      <div style="text-align:center;">
        <strong>The Aga Khan University Hospital</strong><br/>
        Behind Indus Valley School of Art & Architecture<br/>
        Off Shara-e-Saadi, St. 11, Block No. 2<br/>
        Clifton, Karachi<br/>
        Tel: +92 21 111-911-911
      </div>
      <hr/>
      Patient: ${patientName}<br/>
      Address: Karachi <br/>
      Cell: 0987654321 <br/>
      Biller: ${billerName}<br/>
      Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}<br/>
      ----------------------------------------<br/>
      Item                 Qty  Price   Total<br/>
      ----------------------------------------<br/>
      ${billItems.map(i => {
        const name = i.name.slice(0, 18).padEnd(18);
        const qty = String(i.quantity).padStart(3);
        const price = i.unitPrice.toFixed(0).padStart(6);
        const total = (i.quantity * i.unitPrice).toFixed(0).padStart(7);
        return `${name}${qty} ${price} ${total}`;
      }).join('<br/>')}
      <br/>----------------------------------------<br/>
      TOTAL: ${calculateTotal().toFixed(0).padStart(25)} PKR<br/>
      ----------------------------------------<br/>
      Remarks: Care of Emmad Uddin<br/><br/>
      * Drugs once dispensed are not returnable.<br/>
      * Collected within 2 weeks only.<br/>
      * Dispensed at approved prices.<br/><br/>
      Info: 021-34861504 / 1506<br/>
      Email: drug.information@aku.edu<br/>
      Printed: ${date.toLocaleString()}
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
      toast.error("Complete all fields.");
      return;
    }
    try {
      await axios.post('/api/billing/checkout', {
        billItems,
        totalAmount: calculateTotal()
      });
      printReceipt();
      toast.success("Invoice processed.");
      setPatientName('');
      setBillerName('');
      setBillItems([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process billing.");
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
              <Input value={billerName} onChange={e => setBillerName(e.target.value)} />
            </div>
          </div>

          {/* Input Fields and Suggestions */}
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
                  {suggestions.map((item) => (
                    <div
                      key={item._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(item)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} — {item.quantity} {item.unit}
                      </div>
                    </div>
                  ))}
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
                step="0.01"
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
          <div className="text-xl font-semibold">Total: {calculateTotal().toFixed(2)} $</div>
          <Button onClick={handlePrint} disabled={billItems.length === 0 || !patientName || !billerName}>
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Billing;
