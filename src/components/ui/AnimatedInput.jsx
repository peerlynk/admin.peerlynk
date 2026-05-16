import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedInput = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`animated-input-wrapper ${className}`}>
      <motion.div
        className="input-container"
        animate={{
          borderColor: isFocused ? 'var(--accent-blue)' : 'var(--glass-border)',
          boxShadow: isFocused ? '0 0 15px rgba(59, 130, 246, 0.3)' : '0 0 0px transparent'
        }}
        transition={{ duration: 0.3 }}
      >
        {Icon && <Icon className="input-icon" size={18} color={isFocused ? 'var(--accent-blue)' : 'var(--text-muted)'} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="animated-input"
        />
      </motion.div>
    </div>
  );
};

export default AnimatedInput;
