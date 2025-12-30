
import React from 'react';
import { Package, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

const Dashboard: React.FC = () => {
  const { setCurrentTab } = useNavigation();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to Protein Pantry CRM</h2>
        <p className="text-gray-500 mt-2">Centralized reporting hub powered by EasyEcom.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock Report Card */}
        <div 
          onClick={() => setCurrentTab('stock')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Stock Reports</h3>
          <p className="text-gray-500 mb-6">
            Generate status-wise stock reports to monitor inventory levels across warehouses.
          </p>
          <div className="flex items-center text-blue-600 font-medium">
             <span>Go to Stock Reports</span>
             <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Sales Report Card */}
        <div 
          onClick={() => setCurrentTab('sales')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sales Analytics</h3>
          <p className="text-gray-500 mb-6">
            Download detailed sales reports based on order dates.
          </p>
          <div className="flex items-center text-emerald-600 font-medium">
             <span>Go to Sales Reports</span>
             <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
        <p className="text-sm text-gray-500">
            System connected to EasyEcom API.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
