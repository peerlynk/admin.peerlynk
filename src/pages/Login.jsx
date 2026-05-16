import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, EyeOff, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import AnimatedInput from '../components/ui/AnimatedInput';
import GlowingButton from '../components/ui/GlowingButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(async () => {
      try {
        await login(email, password);
        navigate('/');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="login-page">
      {/* Background Animation Elements */}
      <div className="bg-particles">
        <motion.div
          className="particle particle-1"
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        />
        <motion.div
          className="particle particle-2"
          animate={{ x: [0, -150, 0], y: [0, 100, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
      </div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <GlassCard className="login-card" hoverEffect={false}>
          <div className="login-header">
            <motion.h1
              className="text-gradient"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              peerlynk
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'var(--text-secondary)', marginTop: '8px' }}
            >
              Admin Control System
            </motion.p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AnimatedInput
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />
            </motion.div>

            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="password-wrapper" style={{ position: 'relative' }}>
                <AnimatedInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 2
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="form-options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <a href="#" className="forgot-link">Forgot password?</a>
              <div className="secure-mode">
                <ShieldCheck size={16} color="var(--accent-green)" />
                <span style={{ fontSize: '12px', color: 'var(--accent-green)' }}>Secure Connection</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}
            >
              <GlowingButton type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Access System'}
              </GlowingButton>
              <GlowingButton type="button" variant="outline" className="w-full">
                Single Sign-On (SSO)
              </GlowingButton>
            </motion.div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;