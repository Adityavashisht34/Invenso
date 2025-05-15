import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { api } from '../lib/api';

interface Item {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function Sales() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await api.getItems();
      const availableItems = response.data.filter((item: Item) => item.quantity > 0);
      setItems(availableItems);
      if (availableItems.length > 0) {
        setSelectedItem(availableItems[0]._id);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }

  async function handleSale(e: React.FormEvent) {
    e.preventDefault();
    const item = items.find(i => i._id === selectedItem);
    if (!item) return;

    try {
      await api.processSale({
        itemId: selectedItem,
        quantity: quantity
      });
      setQuantity(1);
      fetchItems();
    } catch (error) {
      console.error('Error processing sale:', error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Process Sale</h3>
          <div className="mt-5">
            <form onSubmit={handleSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Item</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} (₹{item.price}) - {item.quantity} available
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={items.find(i => i._id === selectedItem)?.quantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Process Sale
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}