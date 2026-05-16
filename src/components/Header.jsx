import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import AnimatedInput from './ui/AnimatedInput';
import { motion } from 'framer-motion';

const Header = () => {
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

        <button className="icon-btn" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 12px', borderRadius: '20px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-purple)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
          }}>
            <User size={16} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Admin</span>
        </button>
      </div>
    </motion.header>
  );
};

export default Header;
