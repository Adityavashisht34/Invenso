import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../lib/api';

interface Item {
  _id: string;
  name: string;
  quantity: number;
}

interface SalesSummary {
  _id: string;
  item_name: string;
  total_quantity: number;
  total_amount: number;
}

interface SalesTrend {
  date: string;
  total_sales: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [inventory, setInventory] = useState<Item[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary[]>([]);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [inventoryRes, salesRes, salesTrendRes] = await Promise.all([
        api.getItems(),
        api.getSalesSummary(),
        api.getSalesTrend(),
      ]);

      setInventory(inventoryRes.data);
      setSalesSummary(salesRes.data);
      setSalesTrend(salesTrendRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  const inventoryData = inventory.map(item => ({
    name: item.name,
    quantity: item.quantity,
  }));

  const salesData = salesSummary.map(sale => ({
    name: sale.item_name,
    value: sale.total_quantity,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-semibold mb-4">Current Inventory Levels</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-semibold mb-4">Sales Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-base md:text-lg font-semibold mb-4">Sales Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_sales" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow lg:col-span-2 overflow-x-auto">
          <h3 className="text-base md:text-lg font-semibold mb-4">Top Selling Items</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity Sold</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesSummary.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.item_name}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.total_quantity}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{sale.total_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}