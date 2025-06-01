import { NavLink } from 'react-router-dom';
import { Home, Users, Factory, FileText } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: <Home size={18} /> },
  { to: '/parties', label: 'Parties', icon: <Users size={18} /> },
  { to: '/factories', label: 'Factories', icon: <Factory size={18} /> },
  { to: '/transactions', label: 'Transactions', icon: <FileText size={18} /> },
];

const Sidebar = () => {
  return (
    <aside className="bg-[#1f2937] text-white w-64 min-h-screen shadow-md px-4 py-6 sticky top-0">
      <h1 className="text-2xl font-bold text-center mb-10 tracking-wide text-[#34d399]">
        Scrap Manager
      </h1>
      <nav className="flex flex-col gap-2">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition-all
              ${isActive ? 'bg-[#34d399] text-gray-900' : 'hover:bg-[#374151]'}`
            }
          >
            {icon}
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
