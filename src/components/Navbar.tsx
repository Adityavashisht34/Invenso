import { Package, BarChart3, ShoppingCart, LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <Package className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
              <span className="ml-2 text-lg md:text-xl font-bold text-gray-800">
                {user?.warehouseName || 'WareHub'}
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
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

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/inventory"
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Inventory
            </div>
          </Link>
          <Link
            to="/sales"
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sales
            </div>
          </Link>
          <Link
            to="/dashboard"
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Dashboard
            </div>
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}