import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Trash2, Ban, ArrowUpRight, X } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports/all?limit=50');
      setReports(res.data.reports || []);
    } catch (error) {
      console.error("Failed to fetch reports", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveReport = async (reportId, status) => {
    try {
      await api.put(`/admin/reports/${reportId}/resolve`, { status, adminNotes: "Resolved from Admin UI" });
      toast.success(`Report marked as ${status}`);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      toast.error("Failed to resolve report");
    }
  };

  const getPriorityColor = (status) => {
    switch(status) {
      case 'PENDING': return 'high';
      case 'UNDER_REVIEW': return 'medium';
      case 'RESOLVED': return 'low';
      case 'DISMISSED': return 'low';
      default: return 'medium';
    }
  };

  return (
    <div className="reports-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Moderation Queue</h1>
        <p>Review and act on user reports.</p>
      </motion.div>

      {loading && reports.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading reports...</div>
      ) : (
        <div className="reports-grid">
          {reports.map((report, index) => {
            const priority = getPriorityColor(report.status);
            const targetType = report.reportedId ? 'User' : (report.insightId ? 'Insight' : 'Unknown');
            const targetName = report.reportedUser?.name || report.reportedInsight?.content?.substring(0, 20) + '...' || 'Unknown target';

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index * 0.1, 1) }}
                onClick={() => setSelectedReport({ ...report, priority, targetType, targetName })}
                className="cursor-pointer"
              >
                <GlassCard className={`report-card priority-${priority}`}>
                  <div className="report-header">
                    <span className={`priority-badge bg-${priority}`}>{report.status.toUpperCase()}</span>
                    <span className="report-time">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="report-reason" style={{ fontSize: '16px' }}>
                    {report.reason || `Reported ${targetType}`}
                  </h3>
                  <div className="report-meta">
                    <span>Reporter: {report.reporter?.name || 'Anonymous'}</span>
                    <span>Target: {targetType} ({targetName})</span>
                  </div>
                  
                  {report.status === 'PENDING' && (
                    <motion.div 
                      className="critical-pulse"
                      animate={{ opacity: [0.05, 0.2, 0.05] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
          {reports.length === 0 && !loading && (
             <div style={{ color: 'var(--text-muted)' }}>No reports found.</div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={e => e.stopPropagation()}
            >
              <GlassCard hoverEffect={false} className="report-detail-card">
                <button className="close-btn" onClick={() => setSelectedReport(null)}><X size={20}/></button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <ShieldAlert size={28} className={`text-${selectedReport.priority}`} />
                  <h2>Report Details</h2>
                </div>

                <div className="detail-group">
                  <label>Status</label>
                  <p className="highlight-text">{selectedReport.status}</p>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Reported By</label>
                    <p>{selectedReport.reporter?.name || 'Anonymous'} ({selectedReport.reporter?.email || 'N/A'})</p>
                  </div>
                  <div className="detail-group">
                    <label>Target Content</label>
                    <p>{selectedReport.targetType}: {selectedReport.targetName}</p>
                  </div>
                </div>

                {selectedReport.reportedInsight && (
                  <div className="detail-group content-preview">
                    <label>Insight Content</label>
                    <p>{selectedReport.reportedInsight.content}</p>
                    <div className="blur-overlay">
                      <button className="reveal-btn" onClick={(e) => e.target.parentElement.style.display = 'none'}>Click to reveal sensitive content</button>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <GlowingButton variant="outline" onClick={() => handleResolveReport(selectedReport.id, 'DISMISSED')}>Dismiss</GlowingButton>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <GlowingButton variant="primary" onClick={() => handleResolveReport(selectedReport.id, 'RESOLVED')}>Mark Resolved</GlowingButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;