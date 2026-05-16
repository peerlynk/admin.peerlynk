import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, ShieldOff, BarChart2, Search, MapPin, Globe } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedInput from '../components/ui/AnimatedInput';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Communities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/universities');
        setUniversities(res.data.universities || []);
      } catch (err) {
        console.error("Failed to fetch universities", err);
        toast.error("Failed to load institutions");
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  const filteredUniversities = universities.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.location && u.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="communities-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <motion.div 
          className="page-header" style={{ marginBottom: 0 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1>Institutions & Communities</h1>
          <p>Monitor and manage Universities and Colleges across the platform.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ width: '300px' }}>
          <AnimatedInput 
            placeholder="Search institutions..." 
            icon={Search} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>
      </div>

      {loading ? (
         <div style={{ color: 'var(--text-muted)' }}>Loading institutions...</div>
      ) : (
        <div className="communities-grid">
          <AnimatePresence>
            {filteredUniversities.map((uni, index) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(index * 0.1, 1) }}
              >
                <GlassCard className="community-card">
                  <div className="community-banner" style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    backgroundImage: 'linear-gradient(45deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%)' 
                  }}>
                    <div className="banner-overlay"></div>
                    <span className={`status-badge status-active`}>
                      {uni.universityType || 'University'}
                    </span>
                  </div>
                  
                  <div className="community-content">
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{uni.name}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} />
                        <span>{uni.location || 'Location Not Specified'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={14} />
                        <a href={uni.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                          {uni.website || 'No Website'}
                        </a>
                      </div>
                    </div>

                    <div className="community-stats">
                      <div className="stat-item">
                        <Users size={16} className="text-accent-purple" />
                        <span>{uni.colleges?.length || 0} Colleges</span>
                      </div>
                      <div className="stat-item">
                         {/* Displaying some placeholder active stats since backend doesn't provide user count per university directly in this route */}
                        <Activity size={16} className="text-accent-green" />
                        <span>Active</span>
                      </div>
                    </div>

                    <div className="community-actions">
                      <button className="icon-btn tooltip-trigger" title="View Details">
                        <BarChart2 size={18} />
                      </button>
                      <GlowingButton variant="outline" className="full-width-btn">Manage</GlowingButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredUniversities.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>No institutions found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Communities;
