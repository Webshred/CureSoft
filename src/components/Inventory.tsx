import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import {
  Package,
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  X,
  Check,
  Save,
  Trash2
} from 'lucide-react';
import { EditableTable, Column } from './ui/editable-table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { EditableField } from './ui/editable-field';
import ConfirmDialog from './inventory/ConfirmDialog';
import InventoryAlerts from './inventory/InventoryAlerts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { number } from 'framer-motion';

const initialTransactionHistory = [
  { id: 1, itemId: 1, type: 'out', quantity: 50, date: '2023-08-20', user: 'Jean Dupont', notes: 'Semis parcelle nord' },
  { id: 2, itemId: 2, type: 'out', quantity: 200, date: '2023-08-18', user: 'Jean Dupont', notes: 'Application parcelle est' },
  { id: 3, itemId: 4, type: 'in', quantity: 500, date: '2023-08-18', user: 'Marie Martin', notes: 'Livraison mensuelle' },
  { id: 4, itemId: 3, type: 'out', quantity: 5, date: '2023-08-15', user: 'Jean Dupont', notes: 'Application parcelle sud' },
  { id: 5, itemId: 1, type: 'in', quantity: 200, date: '2023-08-10', user: 'Marie Martin', notes: 'Achat supplémentaire' },
  { id: 6, itemId: 6, type: 'out', quantity: 5, date: '2023-08-05', user: 'Pierre Leroy', notes: 'Vidange tracteur' },
];
const initialCategoryStats = [
  { name: 'Semences', value: 580, fill: '#4CAF50' },
  { name: 'Engrais', value: 800, fill: '#8D6E63' },
  { name: 'Phytosanitaires', value: 50, fill: '#F44336' },
  { name: 'Carburants', value: 350, fill: '#2196F3' },
  { name: 'Lubrifiants', value: 25, fill: '#FFC107' },
  { name: 'Consommables', value: 15, fill: '#9C27B0' }
];

interface InventoryItem {
  id?: number;
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  price: number;
  location: string;
  lastUpdated: string;
  notes?: string;
}

interface InventoryProps {
  dateRange?: DateRange;
  searchTerm?: string;
}

const Inventory: React.FC<InventoryProps> = ({ dateRange, searchTerm: externalSearchTerm }) => {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [transactionHistory, setTransactionHistory] = useState(initialTransactionHistory);
  const [categoryStats, setCategoryStats] = useState(initialCategoryStats);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'stats'>('list');
  const [showTransactionForm, setShowTransactionForm] = useState<'in' | 'out' | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | number | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [transactionDeleteConfirmOpen, setTransactionDeleteConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTransaction, setNewTransaction] = useState({
    quantity: 0,
    price: 0 ,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    price: 0,
    location: '',
    notes: ''
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/inventory', {
          headers: { Authorization: token }
        });
        setInventoryData(res.data);
      } catch (err) {
        console.error('Failed to load inventory:', err);
      }
    };

    fetchInventory();
  }, []);

  const generateAlerts = () => {
    return inventoryData
      .filter(item => item.quantity <= item.minQuantity)
      .map(item => ({
        id: item._id || item.id,
        name: item.name,
        current: item.quantity,
        min: item.minQuantity,
        status: item.quantity < item.minQuantity * 0.5 ? 'critical' as const : 'warning' as const
      }));
  };

  const alerts = generateAlerts();

  const filteredItems = inventoryData
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (categoryFilter === 'all') return matchesSearch;
      return matchesSearch && item.category === categoryFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'quantity') {
        return sortOrder === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      } else if (sortBy === 'price') {
        return sortOrder === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      } else if (sortBy === 'lastUpdated') {
        return sortOrder === 'asc'
          ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
          : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      return 0;
    });

  const categories = ['all', ...new Set(inventoryData.map(item => item.category))];

  const confirmDeleteItem = (id: number | string) => {
    console.log("Preparing to delete item ID:", id); // Debug log
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

 const handleDeleteItem = async () => {
  console.log("Delete initiated with itemToDelete:", itemToDelete); // Debug log
  
  if (!itemToDelete) {
    console.error("No item selected for deletion");
    return;
  }

  try {
    console.log("Attempting to delete..."); // Debug log
    const token = localStorage.getItem('token');
    const response = await axios.delete(`/api/inventory/${itemToDelete}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log("Delete response:", response); // Debug log
    
    setInventoryData(prev => prev.filter(item => 
      (item._id || item.id) !== itemToDelete
    ));
    
    if (selectedItem && (selectedItem._id === itemToDelete || selectedItem.id === itemToDelete)) {
      setSelectedItem(null);
    }
    
    toast.success("Item deleted successfully");
  } catch (err) {
    console.error("Full delete error:", err); // Debug log
    toast.error(err.response?.data?.message || "Failed to delete item");
  } finally {
    setDeleteConfirmOpen(false);
  }
};

  const confirmDeleteTransaction = (id: number) => {
    setTransactionToDelete(id);
    setTransactionDeleteConfirmOpen(true);
  };

  const handleDeleteTransaction = () => {
    if (transactionToDelete === null || !selectedItem) return;

    const transaction = transactionHistory.find(t => t.id === transactionToDelete);
    if (!transaction) return;

    const updatedTransactions = transactionHistory.filter(t => t.id !== transactionToDelete);
    setTransactionHistory(updatedTransactions);

    const quantityChange = transaction.type === 'in'
      ? -transaction.quantity
      : transaction.quantity;

    handleUpdateItem(
      selectedItem._id || selectedItem.id,
      'quantity',
      Math.max(0, selectedItem.quantity + quantityChange)
    );

    toast.success("Transaction deleted and stock adjusted");
    setTransactionToDelete(null);
    setTransactionDeleteConfirmOpen(false);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/inventory', newItem, {
        headers: { Authorization: token }
      });

      setInventoryData([...inventoryData, res.data]);

      const existingCategoryStat = categoryStats.find(stat => stat.name === newItem.category);
      if (existingCategoryStat) {
        setCategoryStats(categoryStats.map(stat =>
          stat.name === newItem.category
            ? { ...stat, value: stat.value + Number(newItem.quantity) }
            : stat
        ));
      } else {
        setCategoryStats([...categoryStats, {
          name: newItem.category,
          value: Number(newItem.quantity),
          fill: getRandomColor()
        }]);
      }

      setShowAddForm(false);
      setNewItem({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        minQuantity: 0,
        price: 0,
        location: '',
        notes: ''
      });

      toast.success(`${newItem.name} has been added to inventory`);
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error('Failed to add item to inventory');
    }
  };

  const getRandomColor = () => {
    const colors = ['#4CAF50', '#8D6E63', '#F44336', '#2196F3', '#FFC107', '#9C27B0', '#FF5722', '#3F51B5'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleUpdateItem = async (id: string | number | undefined, field: string, value: any) => {
    if (!id) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/inventory/${id}`,
        { [field]: value }, // Corrected payload format
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setInventoryData(prev =>
        prev.map(item => {
          if ((item._id || item.id) !== id) return item;
          return {
            ...item,
            [field]: value,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        })
      );

      if (selectedItem && (selectedItem._id === id || selectedItem.id === id)) {
        setSelectedItem(prev => prev ? {
          ...prev,
          [field]: value,
          lastUpdated: new Date().toISOString().split('T')[0]
        } : null);
      }

      toast.success("Update successful");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleAddTransaction = (type: 'in' | 'out') => {
    setShowTransactionForm(type);
  };

  const handleSubmitTransaction = () => {
    if (!selectedItem || !showTransactionForm || newTransaction.quantity <= 0) {
      toast.error("Please specify a valid quantity");
      return;
    }

    const newId = Math.max(...transactionHistory.map(t => t.id), 0) + 1;
    const transaction = {
      id: newId,
      itemId: selectedItem._id || selectedItem.id,
      type: showTransactionForm,
      quantity: newTransaction.quantity,
      date: newTransaction.date,
      user: 'Current user',
      notes: newTransaction.notes
    };

    setTransactionHistory([transaction, ...transactionHistory]);

    const updatedQuantity = showTransactionForm === 'in'
      ? selectedItem.quantity + newTransaction.quantity
      : Math.max(0, selectedItem.quantity - newTransaction.quantity);

    handleUpdateItem(selectedItem._id || selectedItem.id, 'quantity', updatedQuantity);

    setShowTransactionForm(null);
    setNewTransaction({
      quantity: 0,
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });

    toast.success(`${newTransaction.quantity} ${selectedItem.unit} ${showTransactionForm === 'in' ? 'added' : 'removed'} of inventory`);
  };

  const itemTransactions = selectedItem
    ? transactionHistory.filter(t => t.itemId === (selectedItem._id || selectedItem.id)).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    : [];

  const inventoryColumns: Column[] = [
    { id: 'name', header: 'Item', accessorKey: 'name', isEditable: true },
    { id: 'category', header: 'Category', accessorKey: 'category', isEditable: true },
    { id: 'quantity', header: 'Quantity', accessorKey: 'quantity', type: 'number', isEditable: true },
    { id: 'price', header: 'Unit price', accessorKey: 'price', type: 'number', isEditable: true },
    { id: 'value', header: 'Total value', accessorKey: 'value', type: 'text', isEditable: false },
    { id: 'status', header: 'Status', accessorKey: 'status', type: 'text', isEditable: false },
  ];

  const tableData = filteredItems.map(item => ({
    ...item,
    value: `${(item.quantity * item.price).toFixed(2)} Rs`,
    status: item.quantity <= item.minQuantity
      ? item.quantity < item.minQuantity * 0.5 ? 'critical' : 'warning'
      : 'normal'
  }));

  const handleTableUpdate = (rowIndex: number, columnId: string, value: any) => {
    const item = filteredItems[rowIndex];
    if (!item) return;

    handleUpdateItem(item._id || item.id, columnId, value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: Function) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
  return (
    <div className="animate-enter">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 bg-gray-100 p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold mb-1">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your inventory and track stock levels</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add stock
          </Button>
        </div>
      </header>

      <InventoryAlerts
        alerts={alerts}
        onQuantityChange={handleUpdateItem}
      />

      {view === 'list' ? (
        selectedItem ? (
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-agri-primary text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="mr-3 hover:bg-white/10 p-1 rounded"
                  aria-label="Back to list"
                >
                  <ChevronRight className="h-5 w-5 transform rotate-180" />
                </button>
                <EditableField
                  value={selectedItem.name}
                  onSave={(value) => handleUpdateItem(selectedItem.id, 'name', value)}
                  className="text-xl font-semibold"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleAddTransaction('in')}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-none"
                >
                  <ArrowDown className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Entry</span>
                </Button>
                <Button
                  onClick={() => handleAddTransaction('out')}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-none"
                >
                  <ArrowUp className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Exit</span>
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    if (selectedItem) {
                      confirmDeleteItem(selectedItem._id || selectedItem.id);
                    }
                  }}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-none"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">DELETE</span>
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Item Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Category:</span>
                      <EditableField
                        value={selectedItem.category}
                        onSave={(value) => handleUpdateItem(selectedItem.id, 'category', value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Quantity:</span>
                      <div className="flex items-center">
                        <EditableField
                          value={selectedItem.quantity}
                          type="number"
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'quantity', Number(value))}
                          className="font-medium"
                        />
                        <EditableField
                          value={selectedItem.unit}
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'unit', value)}
                          className="ml-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Minimum threshold:</span>
                      <div className="flex items-center">
                        <EditableField
                          value={selectedItem.minQuantity}
                          type="number"
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'minQuantity', Number(value))}
                        />
                        <span className="ml-1">{selectedItem.unit}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Unit price:</span>
                      <div className="flex items-center">
                        <EditableField
                          value={selectedItem.price}
                          type="number"
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'price', Number(value))}
                        />
                        <span className="ml-1">Rs/{selectedItem.unit}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total value:</span>
                      <span className="font-medium">{(selectedItem.quantity * selectedItem.price).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Emplacement:</span>
                      <EditableField
                        value={selectedItem.location}
                        onSave={(value) => handleUpdateItem(selectedItem.id, 'location', value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last update:</span>
                      <span>{new Date(selectedItem.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Statistics</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Current stock', value: selectedItem.quantity },
                          { name: 'Minimum threshold', value: selectedItem.minQuantity }
                        ]}
                        margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} ${selectedItem.unit}`, '']} />
                        <Bar
                          dataKey="value"
                          fill="#4CAF50"
                          radius={[4, 4, 0, 0]}
                          fillOpacity={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {showTransactionForm && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">
                      {showTransactionForm === 'in' ? 'New entry' : 'New release'}
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={() => setShowTransactionForm(null)}
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="quantity"
                          type="number"
                          value={newTransaction.quantity}
                          onChange={(e) => setNewTransaction({
                            ...newTransaction,
                            quantity: parseInt(e.target.value) || 0
                          })}
                          min={0}
                        />
                        <span className="ml-2">{selectedItem.unit}</span>
                      </div>
                    </div>
                    <div>
                    <Label htmlFor="price">Unit price (rs)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newTransaction.price}
                      onChange={(e) => setNewTransaction({
                          ...newTransaction,
                          price: parseInt(e.target.value) || 0
                          })}
                          min={0}
                    />
                  </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({
                          ...newTransaction,
                          date: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={newTransaction.notes}
                        onChange={(e) => setNewTransaction({
                          ...newTransaction,
                          notes: e.target.value
                        })}
                        placeholder="Comment..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowTransactionForm(null)}
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitTransaction}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Transaction history</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Notes</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t">
                          <td className="px-4 py-3">{new Date(transaction.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${transaction.type === 'in'
                                ? 'bg-agri-success/10 text-agri-success'
                                : 'bg-agri-warning/10 text-agri-warning'
                              }`}>
                              {transaction.type === 'in' ? (
                                <>
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                  Entrance
                                </>
                              ) : (
                                <>
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                  Exit
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">{transaction.quantity} {selectedItem.unit}</td>
                          <td className="px-4 py-3">{transaction.user}</td>
                          <td className="px-4 py-3">
                            <EditableField
                              value={transaction.notes}
                              onSave={(value) => {
                                const updatedTransactions = [...transactionHistory];
                                const index = updatedTransactions.findIndex(t => t.id === transaction.id);
                                if (index !== -1) {
                                  updatedTransactions[index] = {
                                    ...updatedTransactions[index],
                                    notes: value.toString()
                                  };
                                  setTransactionHistory(updatedTransactions);
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => confirmDeleteTransaction(transaction.id)}
                              className="p-1.5 hover:bg-agri-danger/10 text-agri-danger rounded"
                              title="Delete transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {itemTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">
                            No transactions recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EditableTable
              data={tableData}
              columns={inventoryColumns}
              onUpdate={handleTableUpdate}
              actions={[
                {
                  icon: "Update" ,
                  label: "See details",
                  onClick: (rowIndex) => setSelectedItem(filteredItems[rowIndex])
                }
              ]}
              className="mb-6"
              sortable={true}
            />

            {showAddForm && (
              <div className="border rounded-xl p-6 bg-muted/5 animate-enter">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Add a new article</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Item Name*</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: Panadol"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category*</Label>
                    <Input
                      id="category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="mt-1"
                      list="categories-list"
                      placeholder="Ex: Medicine"
                    />
                    <datalist id="categories-list">
                      {categories
                        .filter(cat => cat !== 'all')
                        .map((category) => (
                          <option key={category} value={category} />
                        ))}
                    </datalist>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Initial quantity*</Label>
                    <div className="flex mt-1">
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                        min={0}
                      />
                      <Input
                        className="w-24 ml-2"
                        placeholder="Unit"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="minQuantity">Minimum alert threshold</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      value={newItem.minQuantity}
                      onChange={(e) => setNewItem({ ...newItem, minQuantity: Number(e.target.value) })}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Unit price (rs)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                      min={0}
                      step="0.01"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: Dealer"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    className="mt-1"
                    placeholder="Additional information..."
                  />
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>
                    <Check className="mr-2 h-4 w-4" />
                    Add item
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      ) : null}

      <ConfirmDialog
  open={deleteConfirmOpen}
  onOpenChange={(open) => {
    console.log("Dialog open state:", open); // Debug log
    setDeleteConfirmOpen(open);
  }}
  onConfirm={handleDeleteItem} // ← Make sure this points to the right function
  title="Delete the article"
  description="Are you sure you want to delete this item?"
/>

      <ConfirmDialog
        open={transactionDeleteConfirmOpen}
        onOpenChange={() => setTransactionDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTransaction}
        title="Delete transaction"
        description="Are you sure you want to delete this transaction? The inventory will be adjusted accordingly."
      />
    </div>
  );
};

// Utility to get alert status for a single item
export const getItemAlertStatus = (item: { quantity: number; minQuantity: number }) => {
  if (item.quantity <= item.minQuantity) {
    return item.quantity < item.minQuantity * 0.5 ? 'critical' : 'warning';
  }
  return 'normal';
};

// Utility to create a name-based lookup from inventory data
export const getInventoryAlertStatusMap = (inventoryList: any[]) => {
  const map: Record<string, 'normal' | 'warning' | 'critical'> = {};
  inventoryList.forEach(item => {
    map[item.name] = getItemAlertStatus(item);
  });
  return map;
};

export default Inventory;