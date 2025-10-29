import { NavLink } from 'react-router-dom';
import { Home, Users, Factory, FileText, BarChart3, TrendingUp } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { to: '/parties', label: 'Parties', icon: <Users size={20} /> },
  { to: '/factories', label: 'Factories', icon: <Factory size={20} /> },
  { to: '/transactions', label: 'Transactions', icon: <FileText size={20} /> },
];

const Sidebar = () => {
  return (
    <aside className="bg-white text-gray-900 w-64 min-h-screen shadow-sm border-r border-gray-200 px-6 py-8 sticky top-0">
      <div className="h-full flex flex-col">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3 shadow-sm">
          <BarChart3 size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          System Billing
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Business Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
              ${isActive
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <div className="flex items-center justify-center w-5 h-5">
              {icon}
            </div>
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">System Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600">All systems operational</span>
          </div>
        </div>
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;
