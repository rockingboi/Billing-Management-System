// src/components/Layout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Hamburger Menu Button */}
      <div 
        className="fixed top-4 left-4 z-50 bg-white rounded-md p-2 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onMouseEnter={() => setIsSidebarVisible(true)}
        onMouseLeave={() => setIsSidebarVisible(false)}
      >
        <Menu size={20} className="text-gray-600" />
      </div>

      {/* Sidebar with hover functionality */}
      <div 
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-200 ease-in-out ${
          isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseEnter={() => setIsSidebarVisible(true)}
        onMouseLeave={() => setIsSidebarVisible(false)}
      >
        <Sidebar />
      </div>

      {/* Main content area - dynamically adjusts based on sidebar visibility */}
      <main 
        className={`transition-all duration-200 ease-in-out overflow-auto ${
          isSidebarVisible ? 'ml-64' : 'ml-0'
        }`}
        style={{ 
          width: isSidebarVisible ? 'calc(100% - 16rem)' : '100%',
          minHeight: '100vh'
        }}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
