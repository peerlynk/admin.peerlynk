import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle, Key, Shield, User, Monitor, Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlowingButton from '../components/ui/GlowingButton';
import AnimatedInput from '../components/ui/AnimatedInput';

const ToggleSwitch = ({ checked, onChange, label, description }) => (
  <div className="toggle-container">
    <div className="toggle-info">
      <span className="toggle-label">{label}</span>
      {description && <span className="toggle-desc">{description}</span>}
    </div>
    <div 
      className={`toggle-track ${checked ? 'checked' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <motion.div 
        className="toggle-thumb"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  </div>
);

const Settings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    twoFactor: true,
    emailAlerts: true,
    autoBackup: false,
    publicProfile: true,
    darkMode: true,
    apiKey: 'pk_live_51Hxxxxxxxxxxxxxxxxx',
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1500);
  };

  return (
    <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <motion.div 
          className="page-header" style={{ marginBottom: 0 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1>System Configuration</h1>
          <p>Manage platform settings and security preferences.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <GlowingButton 
            variant={isSaved ? "outline" : "primary"} 
            onClick={handleSave}
            disabled={isSaving}
            className={isSaved ? "text-accent-green border-accent-green" : ""}
            icon={isSaved ? CheckCircle : Save}
          >
            {isSaving ? 'Saving...' : isSaved ? 'Saved Successfully' : 'Save Changes'}
          </GlowingButton>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="settings-section">
          <div className="section-title">
            <Shield size={20} className="text-accent-purple" />
            <h2>Security Settings</h2>
          </div>
          
          <div className="settings-group">
            <ToggleSwitch 
              label="Two-Factor Authentication (2FA)"
              description="Require a security key or authenticator app when logging in."
              checked={settings.twoFactor}
              onChange={(v) => updateSetting('twoFactor', v)}
            />
            <div className="divider"></div>
            <ToggleSwitch 
              label="Email Login Alerts"
              description="Receive an email when an unrecognized device logs in."
              checked={settings.emailAlerts}
              onChange={(v) => updateSetting('emailAlerts', v)}
            />
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="settings-section">
          <div className="section-title">
            <Key size={20} className="text-accent-blue" />
            <h2>API & Integrations</h2>
          </div>
          
          <div className="settings-group">
            <div className="api-key-container">
              <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Production API Key</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <AnimatedInput 
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => updateSetting('apiKey', e.target.value)}
                  icon={Key}
                />
                <GlowingButton variant="outline">Regenerate</GlowingButton>
              </div>
            </div>
            <div className="divider"></div>
            <ToggleSwitch 
              label="Webhooks Active"
              description="Send real-time updates to connected applications."
              checked={true}
              onChange={() => {}}
            />
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="settings-section">
          <div className="section-title">
            <Zap size={20} className="text-accent-orange" />
            <h2>System Preferences</h2>
          </div>
          
          <div className="settings-group">
            <ToggleSwitch 
              label="Automated Backups"
              description="Run daily database backups at 00:00 UTC."
              checked={settings.autoBackup}
              onChange={(v) => updateSetting('autoBackup', v)}
            />
            <div className="divider"></div>
            <div style={{ padding: '16px 0' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', display: 'block' }}>Performance Mode</label>
              <input type="range" className="neon-slider" min="1" max="3" defaultValue="2" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span>Power Saver</span>
                <span>Balanced</span>
                <span>Maximum Performance</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Settings;
