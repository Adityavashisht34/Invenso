import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

interface Item {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  createdAt: string;
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });
  const [loading, setLoading] = useState(true);
  const [restockQuantities, setRestockQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await api.getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.addItem(newItem);
      setNewItem({ name: '', quantity: 0, price: 0 });
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  async function deleteItem(id: string) {
    try {
      await api.deleteItem(id);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  const handleRestockChange = (id: string, value: string) => {
    const quantity = parseInt(value);
    setRestockQuantities(prev => ({
      ...prev,
      [id]: isNaN(quantity) ? 0 : quantity
    }));
  };

  const restockItem = async (id: string) => {
    const quantityToAdd = restockQuantities[id];
    if (!quantityToAdd || quantityToAdd <= 0) {
      return;
    }
    try {
      await api.restockItem(id, quantityToAdd);
      setRestockQuantities(prev => ({ ...prev, [id]: 0 }));
      fetchItems();
    } catch (error) {
      console.error('Error restocking item:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Inventory Management</h2>
        <form onSubmit={addItem} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </form>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restock</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={restockQuantities[item._id] || ''}
                        onChange={(e) => handleRestockChange(item._id, e.target.value)}
                        className="w-16 md:w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => restockItem(item._id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Restock
                      </button>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}