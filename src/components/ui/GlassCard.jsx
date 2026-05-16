import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, delay = 0 }) => {
  return (
    <motion.div
      className={`glass-panel ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect ? { 
        y: -5,
        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.4)"
      } : {}}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
