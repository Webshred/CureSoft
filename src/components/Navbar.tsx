
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Wallet, 
  Menu, 
  X,
  HelpCircle,
  User,
  Receipt,
  Users,
  Settings
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuthContext();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { title: 'Dashboard', path: '/', icon: Home },
    { title: 'Inventory', path: '/inventaire', icon: Package },
    { title: 'Finances', path: '/finances', icon: Wallet },
    { title: 'Billing', path: '/facturation', icon: Receipt },
    { title: 'Employes', path: '/employes', icon: Users },
    { title: 'Setting', path: '/parametres', icon: Settings },
    { title: 'Help', path: '/aide', icon: HelpCircle },
    { title: 'My Account', path: '/compte', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Navigation Toggle with improved animation */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
          onClick={toggleSidebar} 
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation with improved animation and transitions */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative md:translate-x-0 flex flex-col h-full overflow-y-auto`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <svg viewBox="0 0 24 24" width="24" height="24" className="text-blue-600">
              <path fill="currentColor" d="M19.5,6c-1.3-1.3-3-2-4.8-2c-1.8,0-3.5,0.7-4.8,2L8.5,7.3l1.4,1.4l1.4-1.4c1.7-1.7,4.3-1.7,6,0c1.7,1.7,1.7,4.3,0,6l-1.4,1.4l1.4,1.4l1.4-1.4C20.2,13,21,11.3,21,9.5C21,8.1,20.4,6.9,19.5,6z M15.5,11.7L10.3,16.9c-0.4,0.4-1,0.4-1.4,0s-0.4-1,0-1.4l5.2-5.2c0.4-0.4,1-0.4,1.4,0S15.8,11.3,15.5,11.7z M7.5,15.5c-1.7-1.7-1.7-4.3,0-6c0.8-0.8,1.8-1.2,2.8-1.2c1,0,2.1,0.4,2.8,1.2l1.4,1.4l1.4-1.4l-1.4-1.4c-1.3-1.3-3-2-4.8-2c-1.8,0-3.5,0.7-4.8,2C3.6,9.5,3,11.2,3,13c0,1.8,0.7,3.5,2,4.8l1.4,1.4l1.4-1.4L7.5,15.5z"/>
            </svg>
            <span className="text-lg font-bold text-foreground">RWS</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? 'bg-agri-primary/10 text-agri-primary font-medium' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-agri-primary' : ''}`} />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.username || 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground truncate">pharma@rws.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile with improved transition */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
