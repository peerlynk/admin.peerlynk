import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building, Users, BookOpen, MapPin, Globe, 
  CheckCircle, XCircle, School, GraduationCap
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';

const UniversityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversity();
  }, [id]);

  const fetchUniversity = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/universities/${id}`);
      setUniversity(res.data.university);
    } catch (err) {
      toast.error('Failed to load university details');
      navigate('/admin/communities');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async () => {
    try {
      await api.put(`/admin/universities/${id}/verify`, { verified: !university.verified });
      toast.success('Verification updated');
      fetchUniversity();
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (!university) return <div style={{ textAlign: 'center', padding: '40px' }}>University not found</div>;

  return (
    <div className="university-detail-page" style={{ padding: '24px' }}>
      <button 
        onClick={() => navigate('/admin/communities')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          marginBottom: '24px', 
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} /> Back to Communities
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>{university.name || 'Unnamed University'}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
                <School size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {university.universityType || 'University'} · {university._count?.colleges || 0} colleges
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`status-badge ${university.verified ? 'status-active' : 'status-inactive'}`} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px',
                background: university.verified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: university.verified ? '#22c55e' : '#ef4444',
                border: `1px solid ${university.verified ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                fontSize: '13px',
                fontWeight: 500,
              }}>
                {university.verified ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {university.verified ? 'Verified' : 'Unverified'}
              </span>
              <GlowingButton onClick={toggleVerify} size="sm">
                {university.verified ? 'Unverify' : 'Verify'}
              </GlowingButton>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Location</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{university.location || 'N/A'}</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Website</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
                {university.website ? (
                  <a href={university.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                    {university.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : 'N/A'}
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Established</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <BookOpen size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{university.establishedYear ? new Date(university.establishedYear).getFullYear() : 'N/A'}</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Students</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{university._count?.users || 0}</span>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Colleges</h3>
          {university.colleges?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {university.colleges.map(college => (
                <GlassCard 
                  key={college.id} 
                  style={{ padding: '14px 16px', background: 'var(--bg-secondary)', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/colleges/${college.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{college.name || 'Unnamed College'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {college._count?.students || 0} students · {college._count?.faculties || 0} faculty
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {college.verified ? (
                        <CheckCircle size={14} color="#22c55e" />
                      ) : (
                        <XCircle size={14} color="#ef4444" />
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No colleges associated with this university.</div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default UniversityDetail;