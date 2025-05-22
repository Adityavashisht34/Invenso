import axios from 'axios';

const API_URL = process.env.API_URL;

const api = {
  setToken: (token: string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clearToken: () => {
    delete axios.defaults.headers.common['Authorization'];
  },

  // Items
  getItems: () => axios.get(`${API_URL}/items`),
  addItem: (item: any) => axios.post(`${API_URL}/items`, item),
  deleteItem: (id: string) => axios.delete(`${API_URL}/items/${id}`),
  restockItem: (id: string, quantity: number) =>
    axios.patch(`${API_URL}/items/${id}`, { quantity }),

  // Sales
  processSale: (sale: any) => axios.post(`${API_URL}/sales`, sale),
  getSalesSummary: () => axios.get(`${API_URL}/sales/summary`),
  getSalesTrend: () => axios.get(`${API_URL}/sales/trend`), // New endpoint for sales trend
};

export { api };
