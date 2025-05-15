import { Package, BarChart3, ShoppingCart, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Package className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">
                {user?.warehouseName || 'WareHub'}
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link
              to="/inventory"
              className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-indigo-600"
            >
              <Package className="h-5 w-5 mr-1" />
              Inventory
            </Link>
            <Link
              to="/sales"
              className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-indigo-600"
            >
              <ShoppingCart className="h-5 w-5 mr-1" />
              Sales
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-indigo-600"
            >
              <BarChart3 className="h-5 w-5 mr-1" />
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-indigo-600"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}