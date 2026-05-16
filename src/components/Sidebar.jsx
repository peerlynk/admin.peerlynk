import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  BarChart2, 
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/communities', icon: MessageSquare, label: 'Communities' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <motion.aside 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="sidebar-header">
        <motion.div 
          className="text-gradient"
          animate={{ opacity: collapsed ? 0 : 1, display: collapsed ? 'none' : 'block' }}
          transition={{ duration: 0.2 }}
        >
          <h2 style={{ fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            peerlynk
          </h2>
        </motion.div>
        {collapsed && (
          <div className="text-gradient" style={{ fontWeight: 'bold', fontSize: '24px' }}>
            P
          </div>
        )}
      </div>

      <button 
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon"><item.icon size={20} /></span>
            <motion.span 
              className="nav-label"
              animate={{ opacity: collapsed ? 0 : 1, display: collapsed ? 'none' : 'block' }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;