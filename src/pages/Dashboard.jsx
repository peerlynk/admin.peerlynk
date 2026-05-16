import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, AlertTriangle, Link as LinkIcon, Server, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';
import GlassCard from '../components/ui/GlassCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const StatCard = ({ title, value, icon: Icon, delay, color }) => (
  <GlassCard className="stat-card" delay={delay}>
    <div className="stat-header">
      <h3 className="stat-title">{title}</h3>
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        <Icon size={20} />
      </div>
    </div>
    <div className="stat-value">
      {value !== null ? <AnimatedCounter value={value} /> : <span style={{ fontSize: '18px' }}>Loading...</span>}
    </div>
    <div className="stat-sparkline">
      <motion.div 
        className="sparkline-bar"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(title.length * 5 % 60) + 40}%` }}
        transition={{ delay: delay + 0.5, duration: 1 }}
      />
    </div>
  </GlassCard>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 15, 15, 0.9)',
        border: '1px solid var(--glass-border)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }}></div>
            <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: null,
    activeToday: null,
    totalPosts: null,
    totalConfessions: null,
    pendingConfessions: null,
    activeLynks: null,
    totalMessages: null,
    totalComments: null,
    activeLast7Days: null
  });

  const [chartData, setChartData] = useState([]);
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, statsRes, engagementRes, reportsRes] = await Promise.all([
          api.get('/admin/analytics').catch(() => ({ data: {} })),
          api.get('/admin/stats').catch(() => ({ data: {} })),
          api.get('/admin/engagement').catch(() => ({ data: {} })),
          api.get('/admin/reports/all?limit=5').catch(() => ({ data: { reports: [] } }))
        ]);

        const aData = analyticsRes.data;
        const sData = statsRes.data;
        const eData = engagementRes.data;
        const rData = reportsRes.data;

        setStats({
          totalUsers: aData.totalUsers || 0,
          activeToday: aData.activeUsersToday || 0,
          totalPosts: aData.totalPosts || 0,
          totalConfessions: aData.totalConfessions || 0,
          pendingConfessions: aData.pendingConfessions || 0,
          activeLynks: sData.lynks?.totalActive || 0,
          totalMessages: eData.totals?.messages || 0,
          totalComments: eData.totals?.comments || 0,
          activeLast7Days: sData.users?.activeLast7Days || 0
        });

        if (eData.dailyActiveUsers) {
          const formattedChart = eData.dailyActiveUsers.map(item => ({
            name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sessions: item._sum?.sessions || 0,
            time: item._sum?.totalTime || 0
          }));
          setChartData(formattedChart);
        }

        if (rData.reports) {
          const formattedFeed = rData.reports.map(report => ({
            id: report.id,
            text: `Report by ${report.reporter?.name || 'Unknown'}: ${report.status}`,
            time: new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: report.reportedId ? 'user' : 'report'
          }));
          setFeedData(formattedFeed);
        }

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1>System Overview</h1>
        <p>Real-time metrics and platform status.</p>
      </motion.div>

      <div className="stats-grid">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} delay={0.1} color="var(--accent-blue)" />
        <StatCard title="Active Today" value={stats.activeToday} icon={Activity} delay={0.2} color="var(--accent-green)" />
        <StatCard title="Active (7 Days)" value={stats.activeLast7Days} icon={Users} delay={0.25} color="var(--accent-green)" />
        <StatCard title="Total Posts" value={stats.totalPosts} icon={FileText} delay={0.3} color="var(--accent-purple)" />
        <StatCard title="Total Messages" value={stats.totalMessages} icon={Server} delay={0.35} color="var(--accent-cyan)" />
        <StatCard title="Total Comments" value={stats.totalComments} icon={FileText} delay={0.4} color="var(--accent-purple)" />
        <StatCard title="Total Confessions" value={stats.totalConfessions} icon={Server} delay={0.45} color="var(--accent-cyan)" />
        <StatCard title="Pending Confessions" value={stats.pendingConfessions} icon={AlertTriangle} delay={0.5} color="var(--accent-red)" />
        <StatCard title="Active Lynks" value={stats.activeLynks} icon={LinkIcon} delay={0.6} color="var(--accent-orange)" />
      </div>

      <div className="dashboard-content">
        <GlassCard className="chart-section" delay={0.7}>
          <div className="section-header">
            <h2>User Sessions (Last 30 Days)</h2>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-blue)' }}></span> Sessions</span>
            </div>
          </div>
          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorSessions)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {loading ? 'Loading chart data...' : 'No data available'}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="activity-section" delay={0.8}>
          <div className="section-header">
            <h2>Live Feed (Recent Reports)</h2>
            <div className="live-indicator">
              <span className="pulse-dot"></span> Live
            </div>
          </div>
          <div className="feed-list">
            {feedData.length > 0 ? feedData.map((item, index) => (
              <motion.div 
                key={item.id} 
                className="feed-item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + (index * 0.2) }}
              >
                <div className={`feed-icon type-${item.type}`}></div>
                <div className="feed-content">
                  <p className="feed-text">{item.text}</p>
                  <span className="feed-time">{item.time}</span>
                </div>
              </motion.div>
            )) : (
               <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
                 {loading ? 'Loading feed...' : 'No recent activity'}
               </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;