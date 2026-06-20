import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Search, MapPin, Globe, 
  CheckCircle, XCircle, Building, School, BarChart2,
  GraduationCap, BookOpen
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedInput from '../components/ui/AnimatedInput';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Communities = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('universities');
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'universities') {
        const res = await api.get('/admin/universities');
        setUniversities(Array.isArray(res.data.universities) ? res.data.universities : []);
      } else {
        const res = await api.get('/admin/colleges');
        setColleges(Array.isArray(res.data.colleges) ? res.data.colleges : []);
      }
    } catch (err) {
      toast.error(`Failed to load ${activeTab}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, currentStatus, type) => {
    try {
      const endpoint = type === 'university' 
        ? `/admin/universities/${id}/verify` 
        : `/admin/colleges/${id}/verify`;
      await api.put(endpoint, { verified: !currentStatus });
      toast.success(`Verification updated successfully`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  const filterItems = (items) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return items;
    return items.filter(item => {
      const name = (item.name || '').toLowerCase();
      const location = (item.location || '').toLowerCase();
      return name.includes(query) || location.includes(query);
    });
  };

  const filteredUniversities = filterItems(universities);
  const filteredColleges = filterItems(colleges);

  const renderCard = (item, type) => {
    const isUniversity = type === 'university';
    const name = item.name || 'Unnamed';
    const location = item.location || 'Location not specified';
    const website = item.website;
    const verified = item.verified || false;
    const count = isUniversity ? item.colleges?.length || 0 : item.courses?.length || 0;
    const countLabel = isUniversity ? 'Colleges' : 'Courses';
    const stats = isUniversity ? (
      <><Users size={14} /> {count} {countLabel}</>
    ) : (
      <><BookOpen size={14} /> {count} {countLabel}</>
    );

    return (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="community-card" style={{ overflow: 'hidden' }}>
          <div className="community-banner" style={{ 
            height: '80px',
            background: isUniversity 
              ? 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.2) 100%)'
              : 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.2) 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '12px',
          }}>
            <span className={`status-badge ${verified ? 'status-active' : 'status-inactive'}`} style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px',
              background: verified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: verified ? '#22c55e' : '#ef4444',
              border: `1px solid ${verified ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              fontSize: '12px',
              fontWeight: 500,
            }}>
              {verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          
          <div className="community-content" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', fontWeight: 600 }}>{name}</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="icon-btn" 
                  style={{ padding: '6px' }}
                  onClick={() => {
                    if (isUniversity) {
                      navigate(`/admin/universities/${item.id}`);
                    } else {
                      navigate(`/admin/colleges/${item.id}`);
                    }
                  }}
                  title="View Details"
                >
                  <BarChart2 size={18} />
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} />
                <span>{location}</span>
              </div>
              {website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={14} />
                  <a href={website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '14px' }}>
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                {stats}
              </div>
              <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Activity size={14} />
                <span>Active</span>
              </div>
            </div>

            <GlowingButton 
              variant={verified ? 'outline' : 'primary'} 
              className="full-width-btn"
              onClick={() => handleVerify(item.id, verified, type)}
              style={{ width: '100%' }}
            >
              {verified ? 'Unverify' : 'Verify'}
            </GlowingButton>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  return (
    <div className="communities-page" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <motion.div 
          className="page-header" style={{ marginBottom: 0 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>Institutions & Communities</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Monitor and manage Universities and Colleges across the platform.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ minWidth: '280px' }}>
          <AnimatedInput 
            placeholder="Search institutions..." 
            icon={Search} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </motion.div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
        <button
          className={`tab-btn ${activeTab === 'universities' ? 'active' : ''}`}
          onClick={() => setActiveTab('universities')}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            background: activeTab === 'universities' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'universities' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            fontWeight: 500,
          }}
        >
          <School size={18} /> Universities ({universities.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => setActiveTab('colleges')}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            background: activeTab === 'colleges' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'colleges' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            fontWeight: 500,
          }}
        >
          <Building size={18} /> Colleges ({colleges.length})
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading {activeTab}...</div>
      ) : (
        <div className="communities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          <AnimatePresence>
            {activeTab === 'universities' 
              ? filteredUniversities.map(uni => renderCard(uni, 'university'))
              : filteredColleges.map(col => renderCard(col, 'college'))
            }
          </AnimatePresence>
          {activeTab === 'universities' && filteredUniversities.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
              No universities found. {searchTerm && 'Try adjusting your search.'}
            </div>
          )}
          {activeTab === 'colleges' && filteredColleges.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
              No colleges found. {searchTerm && 'Try adjusting your search.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Communities;