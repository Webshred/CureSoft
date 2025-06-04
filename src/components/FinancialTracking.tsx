import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from './ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from './ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from './ui/form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, PlusCircle, FileText } from 'lucide-react';
import PageHeader from './layout/PageHeader';

const transactionSchema = z.object({
  date: z.string(),
  description: z.string().min(3),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) !== 0, {
    message: "Invalid amount"
  }),
  category: z.string().min(1),
  type: z.enum(["income", "expense"]),
});

const FinancialTracking = () => {
  const [transactions, setTransactions] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: '',
      type: 'income'
    }
  });

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/finance');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch transactions');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/finance', {
        ...data,
        amount: parseFloat(data.amount)
      });
      setTransactions([res.data, ...transactions]);
      toast.success('Transaction added');
      form.reset();
      setShowAddDialog(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add transaction');
    }
  };

  const filteredTransactions = transactions
    .filter(t => (categoryFilter === 'all' || t.category === categoryFilter) &&
                 (typeFilter === 'all' || t.type === typeFilter))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('default', { month: 'short' });
    const income = transactions.filter(t => new Date(t.date).getMonth() === i && t.type === 'income')
                                .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => new Date(t.date).getMonth() === i && t.type === 'expense')
                                  .reduce((sum, t) => sum + t.amount, 0);
    return { name: month, income, expenses };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Finance Overview" description="Track your income, expenses, and payments." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>Income</CardTitle><CardDescription>Total earned</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Expenses</CardTitle><CardDescription>Total spent</CardDescription></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Net</CardTitle><CardDescription>Balance</CardDescription></CardHeader>
          <CardContent><p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${balance.toFixed(2)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader><CardTitle>Monthly Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`$${v}`, '']} />
                  <Bar name="Income" dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar name="Expenses" dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                <div key={t._id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{new Date(t.date).toLocaleDateString()}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded ml-2">{t.category}</span>
                    <p className="text-muted-foreground text-sm mt-1">{t.description}</p>
                  </div>
                  <div className="font-semibold text-right text-sm">
                    <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>${t.amount.toFixed(2)}</span>
                  </div>
                </div>
              )) : <p className="text-center text-muted-foreground py-8">No transactions found</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <div className="flex space-x-2">
                    <Button type="button" variant={field.value === 'income' ? 'default' : 'outline'} onClick={() => field.onChange('income')}>Income</Button>
                    <Button type="button" variant={field.value === 'expense' ? 'default' : 'outline'} onClick={() => field.onChange('expense')}>Expense</Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="date" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="amount" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="category" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialTracking;
