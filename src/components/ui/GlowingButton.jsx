import React from 'react';
import { motion } from 'framer-motion';

const GlowingButton = ({ 
  children, 
  onClick, 
  variant = 'primary', // primary, secondary, danger, outline
  className = '',
  type = 'button',
  icon: Icon
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 outline-none overflow-hidden group";
  
  const variants = {
    primary: {
      bg: "bg-blue-600/20",
      border: "border border-blue-500/50",
      text: "text-blue-50",
      glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
      hover: "hover:bg-blue-600/30 hover:border-blue-400"
    },
    secondary: {
      bg: "bg-purple-600/20",
      border: "border border-purple-500/50",
      text: "text-purple-50",
      glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      hover: "hover:bg-purple-600/30 hover:border-purple-400"
    },
    danger: {
      bg: "bg-red-600/20",
      border: "border border-red-500/50",
      text: "text-red-50",
      glow: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]",
      hover: "hover:bg-red-600/30 hover:border-red-400"
    },
    outline: {
      bg: "bg-transparent",
      border: "border border-gray-600",
      text: "text-gray-300",
      glow: "group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]",
      hover: "hover:border-gray-400 hover:text-white"
    }
  };

  const selectedVariant = variants[variant] || variants.primary;
  
  // Since we removed Tailwind, let's use style objects or pure CSS classes. Wait, my code just used tailwind classes. I need to replace them with pure CSS inline styles or a CSS module, because we removed Tailwind!
  
  // Let me rewrite this using CSS Modules or pure styled-components logic, or just standard inline styles for now.
  // Actually, I can use inline styles and framer-motion variants since we ripped out Tailwind.
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`glowing-btn glowing-btn-${variant} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {Icon && <Icon size={18} />}
      <span>{children}</span>
    </motion.button>
  );
};

export default GlowingButton;
