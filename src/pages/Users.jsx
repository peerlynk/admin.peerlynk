import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MoreVertical, Eye, ShieldAlert, CheckCircle,
  Ban, Trash2, X, ChevronLeft, ChevronRight, Activity, Users as UsersIcon,
  Filter, Loader2, ShieldCheck, MailCheck
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedInput from '../components/ui/AnimatedInput';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ROLES = ['ALL', 'STUDENT', 'FACULTY', 'ALUMNI', 'COLLEGE', 'UNIVERSITY', 'ADMIN'];
const PAGE_SIZES = [10, 20, 50, 100];

const Users = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    emailVerified: 0,
    adminVerified: 0,
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // New separate filters
  const [emailVerificationFilter, setEmailVerificationFilter] = useState('All'); // All, Verified, Not Verified
  const [adminVerificationFilter, setAdminVerificationFilter] = useState('All'); // All, Verified, Not Verified

  // Pagination
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, totalCount: 0 });

  // Interactions
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = '/admin/users';
      const params = new URLSearchParams();

      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);

      // Use unverified endpoint only if adminVerificationFilter is 'Not Verified'
      if (adminVerificationFilter === 'Not Verified') {
        endpoint = '/admin/users/unverified';
      }

      const res = await api.get(`${endpoint}?${params.toString()}`);

      let fetchedUsers = res.data.users || [];

      // Client-side filtering for email verification
      if (emailVerificationFilter === 'Verified') {
        fetchedUsers = fetchedUsers.filter(u => u.isVerified === true);
      } else if (emailVerificationFilter === 'Not Verified') {
        fetchedUsers = fetchedUsers.filter(u => u.isVerified !== true);
      }

      // For admin verification: if we used /unverified endpoint above, already filtered.
      if (adminVerificationFilter === 'Verified' && endpoint !== '/admin/users/unverified') {
        fetchedUsers = fetchedUsers.filter(u => u.isVerifiedByAdmin === true);
      }
      // 'Not Verified' case is handled by using /unverified endpoint.

      setUsers(fetchedUsers);
      if (res.data.pagination) {
        setPagination(prev => ({ ...prev, ...res.data.pagination, limit: prev.limit }));
      }

      // Update stats based on the fetched users (for counts)
      updateStatsFromUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, emailVerificationFilter, adminVerificationFilter, pagination.page, pagination.limit]);

  // Compute stats from the users list (since we have them all)
  const updateStatsFromUsers = (userList) => {
    const total = userList.length;
    const emailVerified = userList.filter(u => u.isVerified === true).length;
    const adminVerified = userList.filter(u => u.isVerifiedByAdmin === true).length;
    // For active 7 days, we need to compute from lastActive, but we might not have all users.
    // We'll fetch active separately from stats endpoint.
    setStats(prev => ({
      ...prev,
      total,
      emailVerified,
      adminVerified,
    }));
  };

  // Fetch additional stats (active, total users, etc.) from /admin/stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(prev => ({
        ...prev,
        total: res.data.users?.total || 0,
        active: res.data.users?.activeLast7Days || 0,
        // emailVerified and adminVerified will be updated from fetchUsers
      }));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleUpdateStatus = async (userId, data) => {
    try {
      await api.put(`/admin/users/${userId}/status`, data);
      toast.success("User updated successfully");
      fetchUsers();
      setActiveActionMenu(null);
      if (drawerUser && drawerUser.id === userId) {
        setDrawerUser({ ...drawerUser, ...data });
      }
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedUsers.length === 0) return;
    const isConfirm = window.confirm(`Are you sure you want to ${actionType} ${selectedUsers.length} users?`);
    if (!isConfirm) return;

    let dataPayload = {};
    if (actionType === 'verify') dataPayload = { isVerifiedByAdmin: true };
    if (actionType === 'suspend') dataPayload = { isDeleted: true };

    try {
      await Promise.all(selectedUsers.map(id => api.put(`/admin/users/${id}/status`, dataPayload)));
      toast.success(`Successfully processed ${selectedUsers.length} users`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      toast.error("Some bulk actions failed");
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length && users.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  return (
    <div className="users-page">
      <style>{`
        .users-page {
          position: relative;
          overflow-x: hidden;
        }

        .users-page .advanced-select {
          background: var(--glass-bg, rgba(255,255,255,0.05));
          border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
          border-radius: 12px;
          padding: 10px 32px 10px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #fff);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          transition: all 0.2s ease;
        }

        .users-page .advanced-select:hover {
          border-color: var(--accent-blue, #3b82f6);
          background-color: var(--glass-bg-hover, rgba(255,255,255,0.1));
        }

        .users-page .custom-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--accent-blue, #3b82f6);
        }

        .users-page .users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .users-page .users-table thead tr {
          border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.1));
        }

        .users-page .users-table th {
          text-align: left;
          padding: 16px 12px;
          font-weight: 600;
          color: var(--text-secondary, #9ca3af);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .users-page .users-table td {
          padding: 16px 12px;
          border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.05));
          vertical-align: middle;
        }

        .users-page .user-row {
          transition: background 0.2s ease;
          cursor: pointer;
        }

        .users-page .user-row:hover {
          background: var(--glass-bg-hover, rgba(255,255,255,0.05));
        }

        .users-page .user-row.selected {
          background: rgba(59,130,246,0.1);
        }

        .users-page .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .users-page .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--glass-border, rgba(255,255,255,0.2));
        }

        .users-page .user-name {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .users-page .verified-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: var(--accent-green, #10b981);
          border-radius: 50%;
          color: white;
          font-size: 10px;
          font-weight: bold;
        }

        .users-page .role-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          background: var(--glass-bg, rgba(255,255,255,0.08));
          color: var(--text-primary, #fff);
        }

        .users-page .role-admin {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
        .users-page .role-faculty {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }
        .users-page .role-student {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .users-page .role-alumni {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }
        .users-page .role-college, .users-page .role-university {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .users-page .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .users-page .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .users-page .status-online {
          background: var(--accent-green, #10b981);
          box-shadow: 0 0 6px var(--accent-green, #10b981);
        }
        .users-page .status-offline {
          background: var(--accent-orange, #f59e0b);
        }

        .users-page .action-menu-btn {
          background: none;
          border: none;
          color: var(--text-secondary, #9ca3af);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .users-page .action-menu-btn:hover {
          background: var(--glass-bg, rgba(255,255,255,0.1));
          color: var(--text-primary, #fff);
        }

        .users-page .action-menu {
          position: absolute;
          background: var(--glass-bg, rgba(0,0,0,0.8));
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
          border-radius: 12px;
          min-width: 140px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        }

        .users-page .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: var(--text-primary, #fff);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .users-page .menu-item:hover {
          background: rgba(255,255,255,0.1);
        }
        .users-page .menu-item.warning {
          color: var(--accent-blue, #3b82f6);
        }
        .users-page .menu-item.danger {
          color: var(--accent-red, #ef4444);
        }

        .users-page .pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid var(--glass-border, rgba(255,255,255,0.1));
          flex-wrap: wrap;
          gap: 16px;
        }

        .users-page .page-size-select {
          background: var(--glass-bg, rgba(255,255,255,0.05));
          border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
          border-radius: 8px;
          padding: 6px 28px 6px 12px;
          font-size: 13px;
          color: var(--text-primary, #fff);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }

        .users-page .page-btn {
          background: var(--glass-bg, rgba(255,255,255,0.05));
          border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
          color: var(--text-primary, #fff);
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .users-page .page-btn:hover:not(:disabled) {
          background: var(--glass-bg-hover, rgba(255,255,255,0.1));
          border-color: var(--accent-blue, #3b82f6);
        }
        .users-page .page-btn.active {
          background: var(--accent-blue, #3b82f6);
          border-color: var(--accent-blue, #3b82f6);
          color: white;
        }
        .users-page .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .users-page .bulk-actions-bar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--glass-bg, rgba(0,0,0,0.8));
          backdrop-filter: blur(12px);
          border: 1px solid var(--accent-blue, #3b82f6);
          border-radius: 60px;
          padding: 10px 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .users-page .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .users-page .quick-view-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 480px;
          height: 100vh;
          background: var(--glass-bg, rgba(0,0,0,0.95));
          backdrop-filter: blur(20px);
          border-left: 1px solid var(--glass-border, rgba(255,255,255,0.1));
          z-index: 1001;
          display: flex;
          flex-direction: column;
        }

        .users-page .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.1));
        }
        .users-page .close-btn {
          background: var(--glass-bg, rgba(255,255,255,0.05));
          border: none;
          color: var(--text-secondary, #9ca3af);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
        }
        .users-page .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .users-page .drawer-section {
          margin-bottom: 28px;
        }
        .users-page .drawer-section h3 {
          font-size: 16px;
          margin-bottom: 16px;
          color: var(--text-secondary, #9ca3af);
        }
        .users-page .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.05));
        }
        .users-page .metric-box {
          background: var(--glass-bg, rgba(255,255,255,0.05));
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }
        .users-page .metric-val {
          font-size: 24px;
          font-weight: 700;
          color: var(--accent-blue, #3b82f6);
        }
        .users-page .text-accent-green { color: var(--accent-green, #10b981); }
        .users-page .text-accent-orange { color: var(--accent-orange, #f59e0b); }
        .users-page .w-full { width: 100%; }
        .users-page .skeleton-pulse {
          background: linear-gradient(90deg, var(--glass-bg, rgba(255,255,255,0.05)) 25%, var(--glass-bg-hover, rgba(255,255,255,0.1)) 50%, var(--glass-bg, rgba(255,255,255,0.05)) 75%);
          background-size: 200% 100%;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
          .users-page .pagination-bar { flex-direction: column; align-items: stretch; }
          .users-page .quick-view-drawer { max-width: 100%; }
          .users-page .bulk-actions-bar { flex-direction: column; text-align: center; }
          .users-page .users-table th, .users-page .users-table td { padding: 12px 8px; }
        }
      `}</style>

      {/* HEADER & STATS CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>User Management</h1>
          <p>Advanced administrative control center.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total Users', value: stats.total, color: 'var(--accent-blue)', icon: UsersIcon },
            { label: 'Active (7D)', value: stats.active, color: 'var(--accent-green)', icon: Activity },
            { label: 'Email Verified', value: stats.emailVerified, color: 'var(--accent-purple)', icon: MailCheck },
            { label: 'Admin Verified', value: stats.adminVerified, color: 'var(--accent-cyan)', icon: ShieldCheck }
          ].map((stat, i) => (
            <GlassCard key={i} delay={0.1 * i} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '50%', background: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</p>
                <h3 style={{ fontSize: '20px', margin: 0 }}>{stat.value}</h3>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* FILTER BAR */}
      <GlassCard style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <AnimatedInput
            placeholder="Search by name, email, username..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          />
        </div>

        <select
          className="advanced-select"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
        >
          {ROLES.map(r => <option key={r} value={r}>Role: {r}</option>)}
        </select>

        <select
          className="advanced-select"
          value={emailVerificationFilter}
          onChange={(e) => { setEmailVerificationFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
        >
          <option value="All">Email Verified: All</option>
          <option value="Verified">Email Verified ✓</option>
          <option value="Not Verified">Email Not Verified ✗</option>
        </select>

        <select
          className="advanced-select"
          value={adminVerificationFilter}
          onChange={(e) => { setAdminVerificationFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
        >
          <option value="All">Admin Verified: All</option>
          <option value="Verified">Admin Verified ✓</option>
          <option value="Not Verified">Admin Not Verified ✗</option>
        </select>
      </GlassCard>

      {/* BULK ACTIONS BAR */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bulk-actions-bar"
          >
            <span style={{ fontWeight: 500 }}>{selectedUsers.length} users selected</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <GlowingButton variant="outline" onClick={() => handleBulkAction('verify')}>Verify All (Admin)</GlowingButton>
              <GlowingButton variant="outline" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }} onClick={() => handleBulkAction('suspend')}>Suspend All</GlowingButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DATA TABLE */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }} hoverEffect={false}>
        <div style={{ overflowX: 'auto' }}>
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Profile</th>
                <th>Email</th>
                <th>Role</th>
                <th>Email Verified</th>
                <th>Admin Verified</th>
                <th>Joined</th>
                <th>Insights</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td colSpan={9} style={{ padding: '16px' }}>
                      <div className="skeleton-pulse" style={{ height: '40px', width: '100%', borderRadius: '8px' }}></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <ShieldAlert size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                    <p>No users found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      className={`user-row ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                        />
                      </td>
                      <td onClick={() => setDrawerUser(user)} style={{ cursor: 'pointer' }}>
                        <div className="user-info">
                          <img src={user.profileUrl || `https://ui-avatars.com/api/?name=${user.name || 'U'}&background=random`} alt="" className="user-avatar" />
                          <div>
                            <div className="user-name">
                              {user.name || 'Unnamed'}
                              {user.isVerified && <span className="verified-badge">✓</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user.username || 'unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary">{user.email}</td>
                      <td><span className={`role-badge role-${(user.role || 'USER').toLowerCase()}`}>{user.role}</span></td>
                      <td>
                        {user.isVerified ? (
                          <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Verified
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <X size={14} /> Not Verified
                          </span>
                        )}
                      </td>
                      <td>
                        {user.isVerifiedByAdmin ? (
                          <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldAlert size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="text-secondary">{user._count?.insights || 0}</td>
                      <td style={{ position: 'relative', textAlign: 'center' }}>
                        <button className="action-menu-btn" onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === user.id ? null : user.id); }}>
                          <MoreVertical size={18} />
                        </button>
                        <AnimatePresence>
                          {activeActionMenu === user.id && (
                            <motion.div
                              className="action-menu"
                              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                              style={{ position: 'absolute', right: '40px', top: '10px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="menu-item" onClick={() => { setDrawerUser(user); setActiveActionMenu(null); }}><Eye size={14} /> Quick View</button>
                              {!user.isVerifiedByAdmin && (
                                <button className="menu-item warning" onClick={() => handleUpdateStatus(user.id, { isVerifiedByAdmin: true })}><CheckCircle size={14} /> Verify by Admin</button>
                              )}
                              <button className="menu-item danger" onClick={() => handleUpdateStatus(user.id, { isDeleted: true })}><Ban size={14} /> Suspend</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Rows per page:</span>
            <select
              className="page-size-select"
              value={pagination.limit}
              onChange={(e) => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount || 0)} of {pagination.totalCount || 0}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="page-btn" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                <ChevronLeft size={16} />
              </button>
              <button className="page-btn active">{pagination.page}</button>
              <button className="page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* QUICK VIEW DRAWER */}
      <AnimatePresence>
        {drawerUser && (
          <>
            <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerUser(null)} />
            <motion.div className="quick-view-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
              <div className="drawer-header">
                <h2>User Profile</h2>
                <button onClick={() => setDrawerUser(null)} className="close-btn"><X size={20} /></button>
              </div>
              <div className="drawer-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                  <img src={drawerUser.profileUrl || `https://ui-avatars.com/api/?name=${drawerUser.name || 'U'}&background=random`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)' }} alt="" />
                  <div>
                    <h2 style={{ margin: '0 0 4px 0' }}>{drawerUser.name}</h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>@{drawerUser.username || 'unknown'} • {drawerUser.role}</p>
                    {drawerUser.tagline && <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--accent-blue)', marginTop: '4px' }}>"{drawerUser.tagline}"</p>}
                  </div>
                </div>
                <div className="drawer-section">
                  <h3>Contact & Status</h3>
                  <div className="detail-row"><span className="label">Email:</span> <span className="value">{drawerUser.email}</span></div>
                  <div className="detail-row"><span className="label">Location:</span> <span className="value">{drawerUser.location || 'N/A'}</span></div>
                  <div className="detail-row"><span className="label">Joined:</span> <span className="value">{new Date(drawerUser.createdAt).toLocaleDateString()}</span></div>
                  <div className="detail-row"><span className="label">Last Active:</span> <span className="value">{drawerUser.lastActive ? new Date(drawerUser.lastActive).toLocaleDateString() : 'N/A'}</span></div>
                  <div className="detail-row"><span className="label">Email Verified:</span> <span className={`value ${drawerUser.isVerified ? 'text-accent-green' : 'text-accent-orange'}`}>{drawerUser.isVerified ? 'Yes' : 'No'}</span></div>
                  <div className="detail-row"><span className="label">Admin Verified:</span> <span className={`value ${drawerUser.isVerifiedByAdmin ? 'text-accent-green' : 'text-accent-orange'}`}>{drawerUser.isVerifiedByAdmin ? 'Verified by Admin' : 'Pending Admin Approval'}</span></div>
                </div>
                <div className="drawer-section">
                  <h3>Engagement Metrics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="metric-box"><div className="metric-val">{drawerUser._count?.insights || 0}</div><div className="metric-label">Insights</div></div>
                    <div className="metric-box"><div className="metric-val">{drawerUser.lynkerCount || 0}</div><div className="metric-label">Lynkers</div></div>
                    <div className="metric-box"><div className="metric-val">{drawerUser.lynkingCount || 0}</div><div className="metric-label">Lynkings</div></div>
                    <div className="metric-box"><div className="metric-val">{drawerUser.profileCompleted ? '100%' : '50%'}</div><div className="metric-label">Profile Setup</div></div>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '32px', display: 'flex', gap: '16px', flexDirection: 'column' }}>
                  {!drawerUser.isVerifiedByAdmin && (
                    <GlowingButton variant="outline" className="w-full" onClick={() => handleUpdateStatus(drawerUser.id, { isVerifiedByAdmin: true })}>Verify by Admin</GlowingButton>
                  )}
                  <GlowingButton variant="primary" style={{ backgroundColor: 'var(--accent-red)20', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }} className="w-full" onClick={() => handleUpdateStatus(drawerUser.id, { isDeleted: true })}>Suspend User</GlowingButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;