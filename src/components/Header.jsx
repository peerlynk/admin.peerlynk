import React, { useState } from 'react';
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedInput from './ui/AnimatedInput';

const Header = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    // Clear authentication token (adjust key if you use a different one)
    localStorage.removeItem('token');
    // If you use a global auth context, also call a logout function from there
    // e.g., authContext.logout();
    setDropdownOpen(false);
    navigate('/login'); // or your admin login route
  };

  return (
    <motion.header 
      className="top-header"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div style={{ width: '300px' }}>
        <AnimatedInput 
          placeholder="Search global..." 
          icon={Search} 
        />
      </div>

      <div className="header-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '14px' }}>
          <motion.div 
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          System Online
        </div>

        <button className="icon-btn" style={{ position: 'relative' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', 
            background: 'var(--accent-red)', borderRadius: '50%', border: '2px solid var(--bg-primary)' 
          }} />
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>

        {/* User profile button with dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 12px', borderRadius: '20px' }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-purple)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
            }}>
              <User size={16} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Admin</span>
            <ChevronDown size={16} style={{ opacity: 0.6 }} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '160px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} style={{ color: 'var(--accent-red)' }} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;