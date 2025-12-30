import React from 'react';
import { LayoutDashboard, Package, TrendingUp, Settings, LogOut, FileText, X, PieChart } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentTab, setCurrentTab } = useNavigation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: 'Stock Reports', icon: Package },
    { id: 'sales', label: 'Sales Reports', icon: TrendingUp },
    { id: 'analyser', label: 'Analyser', icon: PieChart },
    { id: 'orders', label: 'Orders', icon: FileText },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    onClose(); // Close sidebar on mobile when item clicked
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static flex flex-col
      `}>
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Protein Pantry</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentTab === 'settings' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} className={currentTab === 'settings' ? 'text-emerald-600' : 'text-gray-400'} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-1">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
