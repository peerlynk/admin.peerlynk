import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Tag, Building } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AddCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    branch: '',
    collegeId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Course name is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        duration: formData.duration ? parseInt(formData.duration) : null,
        branch: formData.branch.trim() || null,
        collegeId: formData.collegeId || undefined
      };
      await api.post('/admin/courses', payload);
      toast.success('Course added successfully!');
      navigate('/admin/courses'); // or wherever you list courses
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course-page" style={{ padding: '24px' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          marginBottom: '24px', 
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Add New Course</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Enter the course details below.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>
                Course Name *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0 12px' }}>
                <BookOpen size={18} color="var(--text-secondary)" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech Computer Science"
                  style={{ width: '100%', padding: '12px 0', background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>
                Duration (years)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0 12px' }}>
                <Clock size={18} color="var(--text-secondary)" />
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 4"
                  min="1"
                  step="1"
                  style={{ width: '100%', padding: '12px 0', background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>
                Branch / Specialization
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0 12px' }}>
                <Tag size={18} color="var(--text-secondary)" />
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g., Artificial Intelligence"
                  style={{ width: '100%', padding: '12px 0', background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>
                College ID (optional)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0 12px' }}>
                <Building size={18} color="var(--text-secondary)" />
                <input
                  type="text"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  placeholder="e.g., clg_abc123"
                  style={{ width: '100%', padding: '12px 0', background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Leave blank if course is not tied to a specific college.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <GlowingButton type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Adding...' : 'Add Course'}
              </GlowingButton>
              <button 
                type="button"
                onClick={() => navigate('/admin/courses')}
                style={{ 
                  padding: '12px 24px', 
                  background: 'transparent', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AddCourse;