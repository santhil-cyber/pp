
import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { AppConfig } from '../types';

const Settings: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const [formData, setFormData] = useState<AppConfig>(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    updateConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 mt-1">Manage application preferences and mode.</p>
      </div>

      {/* Connection Info */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex items-start space-x-4">
        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="font-bold text-emerald-900">System Connected</h3>
          <p className="text-sm text-emerald-700 mt-1">
            API credentials and server URLs are securely managed via environment variables. 
            Direct modification of sensitive connection strings is disabled in this interface.
          </p>
        </div>
      </div>

      {/* Toggle Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">General Preferences</h3>
         </div>
         <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <label htmlFor="simulationMode" className="text-sm font-semibold text-gray-700 block">
                        Simulation Mode
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Use this to test the UI functionality without making actual requests to EasyEcom.
                    </p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                        type="checkbox" 
                        name="simulationMode" 
                        id="simulationMode" 
                        checked={formData.simulationMode}
                        onChange={handleToggle}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-emerald-500"
                        style={{
                            right: formData.simulationMode ? '0' : 'auto',
                            left: formData.simulationMode ? 'auto' : '0',
                            borderColor: formData.simulationMode ? '#10b981' : '#d1d5db'
                        }}
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer" style={{ backgroundColor: formData.simulationMode ? '#10b981' : '#d1d5db' }}></label>
                </div>
            </div>
         </div>
      </div>
      
      <div className="flex justify-end">
        <button 
            onClick={handleSave}
            className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95 ${saved ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
        >
            <Save size={18} />
            <span>{saved ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
