import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/clearance/new', label: 'New Request', icon: '📝' },
    { to: '/clearance', label: 'My Requests', icon: '📋' },
    { to: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const officerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/clearance', label: 'Review Requests', icon: '📋' },
    { to: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'User Management', icon: '👥' },
    { to: '/clearance', label: 'All Requests', icon: '📋' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📜' },
    { to: '/admin/reports', label: 'Reports', icon: '📈' },
    { to: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'officer'
        ? officerLinks
        : studentLinks;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 font-medium'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-lg bg-primary-600">
            SC
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Clearance System</h1>
            <p className="text-xs text-gray-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              onClick={onClose}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full bg-primary-100 text-primary-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div> */
            /* <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div> */}
      </aside>
    </>
  );
};

export default Sidebar;
