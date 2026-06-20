import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building, Users, BookOpen, MapPin, Globe, 
  CheckCircle, XCircle, School, GraduationCap, UserCheck
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CollegeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollege();
  }, [id]);

  const fetchCollege = async () => {
    try {
      setLoading(true);
      // We need a backend endpoint for college details – fallback to using GET /colleges and find the one with matching id
      const res = await api.get('/admin/colleges');
      const found = res.data.colleges.find(c => c.id === id);
      if (!found) throw new Error('College not found');
      setCollege(found);
    } catch (err) {
      toast.error('Failed to load college details');
      navigate('/admin/communities');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async () => {
    try {
      await api.put(`/admin/colleges/${id}/verify`, { verified: !college.verified });
      toast.success('Verification updated');
      fetchCollege();
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (!college) return <div style={{ textAlign: 'center', padding: '40px' }}>College not found</div>;

  return (
    <div className="college-detail-page" style={{ padding: '24px' }}>
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
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>{college.name || 'Unnamed College'}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
                <School size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {college.university?.name || 'Independent'} · {college.courses?.length || 0} courses
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`status-badge ${college.verified ? 'status-active' : 'status-inactive'}`} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px',
                background: college.verified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: college.verified ? '#22c55e' : '#ef4444',
                border: `1px solid ${college.verified ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                fontSize: '13px',
                fontWeight: 500,
              }}>
                {college.verified ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {college.verified ? 'Verified' : 'Unverified'}
              </span>
              <GlowingButton onClick={toggleVerify} size="sm">
                {college.verified ? 'Unverify' : 'Verify'}
              </GlowingButton>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Location</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{college.location || 'N/A'}</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Website</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
                {college.website ? (
                  <a href={college.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                    {college.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : 'N/A'}
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Students</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{college._count?.students || 0}</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Faculty</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <UserCheck size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>{college._count?.faculties || 0}</span>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Courses Offered</h3>
          {college.courses?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {college.courses.map(course => (
                <GlassCard 
                  key={course.id} 
                  style={{ padding: '12px 16px', background: 'var(--bg-secondary)' }}
                >
                  <div style={{ fontWeight: 500 }}>{course.name || 'Unnamed Course'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {course.duration ? `${course.duration} years` : 'N/A'} · {course.branch || 'General'}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No courses offered.</div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CollegeDetail;