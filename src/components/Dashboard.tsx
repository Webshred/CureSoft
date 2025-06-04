import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface MetricData {
  income: number;
  production: number;
  sales: number;
  efficiency: number;
  date: string;
}

const StatCard = ({
  label,
  value,
  change,
  color = 'text-agri-success'
}: {
  label: string;
  value: string | number;
  change: string;
  color?: string;
}) => (
  <div className="stat-card card-hover">
    <p className="stat-label">{label}</p>
    <div className="flex items-baseline justify-between mt-2">
      <p className="stat-value">{value}</p>
      <span className={`${color} text-sm font-medium flex items-center`}>
        <TrendingUp className="h-4 w-4 mr-1" />
        {change}
      </span>
    </div>
  </div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [latest, setLatest] = useState<MetricData | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token'); // Make sure token is stored at login
        if (!token) throw new Error('No auth token found');

        const res = await axios.get('/api/dashboard/metrics', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMetrics(res.data);
        if (res.data.length > 0) {
          setLatest(res.data[res.data.length - 1]);
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold mb-1">Hello, RWS User</h1>
          <p className="text-muted-foreground">Here’s a look at pharmaceutical statistics</p>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Monthly Income"
          value={`$${latest?.income ?? 0}`}
          change={`+${((latest?.income ?? 0) / 100).toFixed(1)}%`}
        />
        <StatCard
          label="Production"
          value={`${latest?.production ?? 0} units`}
          change="Total Produced"
          color="text-agri-primary"
        />
        <StatCard
          label="Sales"
          value={latest?.sales ?? 0}
          change={`+${((latest?.sales ?? 0) / 100).toFixed(1)}%`}
        />
        <StatCard
          label="Efficiency"
          value={`${latest?.efficiency ?? 0}%`}
          change={`+${((latest?.efficiency ?? 0) / 100).toFixed(1)}%`}
        />
      </div>

      {/* Income Chart */}
      <div className="dashboard-card col-span-full card-hover">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Monthly Income</h3>
          <button className="text-xs px-3 py-1.5 bg-muted rounded-md text-foreground">2025</button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={metrics.map(m => ({
                month: new Date(m.date).toLocaleDateString('en-US', { month: 'short' }),
                revenue: m.income
              }))}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v}`, 'Income']} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4CAF50"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
