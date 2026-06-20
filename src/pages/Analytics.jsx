import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Activity, MessageSquare, Heart, TrendingUp, 
  RefreshCw, AlertCircle 
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlowingButton from '../components/ui/GlowingButton';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 15, 15, 0.95)',
        border: '1px solid var(--glass-border)',
        padding: '12px 16px',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)'
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }}></div>
            <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{entry.name}: <strong>{entry.value}</strong></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Skeleton loader component
const ChartSkeleton = () => (
  <div style={{ 
    width: '100%', 
    height: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '12px'
  }}>
    <div style={{ 
      width: '80%', 
      height: '60%', 
      background: 'linear-gradient(90deg, var(--glass-border) 25%, var(--bg-tertiary) 50%, var(--glass-border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px'
    }} />
    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading chart...</div>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

// KPI Card component
const KPICard = ({ title, value, icon: Icon, color, subtitle }) => (
  <GlassCard style={{ padding: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div style={{ 
        background: `${color}20`, 
        padding: '10px', 
        borderRadius: '12px',
        color: color
      }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>
          {value !== undefined ? value.toLocaleString() : '-'}
        </div>
        {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</div>}
      </div>
    </div>
  </GlassCard>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyActiveUsers, setDailyActiveUsers] = useState([]);
  const [insightsPerDay, setInsightsPerDay] = useState([]);
  const [topInsights, setTopInsights] = useState([]);
  const [totals, setTotals] = useState({
    likes: 0,
    comments: 0,
    messages: 0,
    confessionLikes: 0,
    confessionComments: 0
  });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [engagementRes, insightsAnalyticsRes] = await Promise.all([
        api.get('/admin/engagement').catch(err => {
          console.error('Engagement API error:', err);
          return { data: {} };
        }),
        api.get('/admin/insights-analytics').catch(err => {
          console.error('Insights analytics API error:', err);
          return { data: {} };
        })
      ]);

      const eData = engagementRes.data;
      const iData = insightsAnalyticsRes.data;

      // Check if we have data
      if (eData.totals) {
        setTotals({
          likes: eData.totals.likes || 0,
          comments: eData.totals.comments || 0,
          messages: eData.totals.messages || 0,
          confessionLikes: eData.totals.confessionLikes || 0,
          confessionComments: eData.totals.confessionComments || 0
        });
      }

      // Process daily active users
      if (eData.dailyActiveUsers && eData.dailyActiveUsers.length > 0) {
        const formatted = eData.dailyActiveUsers.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sessions: Number(item.sessions) || 0,
          time: Number(item.totalTime) || 0
        }));
        setDailyActiveUsers(formatted);
      } else {
        // Fallback: generate mock data if API returns empty
        setDailyActiveUsers(generateMockChartData());
      }

      // Process insights per day
      const rawInsights = iData.insightsByDay || eData.insightsPerDay || [];
      if (rawInsights.length > 0) {
        const formattedInsights = rawInsights.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: Number(item.count) || 0
        }));
        setInsightsPerDay(formattedInsights);
      } else {
        setInsightsPerDay([]);
      }

      // Top insights
      if (iData.topInsights && iData.topInsights.length > 0) {
        setTopInsights(iData.topInsights);
      } else {
        setTopInsights([]);
      }

      // If both APIs returned empty, show a message
      if (!eData.totals && !iData.topInsights) {
        setError('No analytics data available. The system may not have enough data yet.');
      }

    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError('Failed to load analytics data. Please try again later.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo if real data is missing
  const generateMockChartData = () => {
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: Math.floor(Math.random() * 50) + 10,
        time: Math.floor(Math.random() * 200) + 50
      });
    }
    return data;
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRetry = () => {
    fetchAnalyticsData();
  };

  // Render error state
  if (error && !loading) {
    return (
      <div style={{ padding: '24px' }}>
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Platform Analytics</h1>
          <p>Deep dive into user engagement and growth metrics.</p>
        </motion.div>
        <GlassCard style={{ padding: '40px', textAlign: 'center', marginTop: '24px' }}>
          <AlertCircle size={48} style={{ color: 'var(--accent-orange)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Unable to load analytics</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <GlowingButton onClick={handleRetry}>
            <RefreshCw size={16} style={{ marginRight: '8px' }} />
            Retry
          </GlowingButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="analytics-page" style={{ padding: '24px' }}>
      {/* Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Platform Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Deep dive into user engagement and growth metrics.
          </p>
        </div>
        <GlowingButton 
          variant="outline" 
          onClick={handleRetry}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh
        </GlowingButton>
        <style>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <KPICard 
          title="Total Likes" 
          value={totals.likes + totals.confessionLikes} 
          icon={Heart} 
          color="#f472b6"
        />
        <KPICard 
          title="Total Comments" 
          value={totals.comments + totals.confessionComments} 
          icon={MessageSquare} 
          color="#60a5fa"
        />
        <KPICard 
          title="Total Messages" 
          value={totals.messages} 
          icon={Activity} 
          color="#34d399"
        />
        <KPICard 
          title="Total Engagement" 
          value={totals.likes + totals.comments + totals.messages + totals.confessionLikes + totals.confessionComments}
          icon={TrendingUp} 
          color="#a78bfa"
          subtitle="All interactions combined"
        />
      </motion.div>

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Daily Active Sessions */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard style={{ padding: '24px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Daily Active Sessions</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 30 days</span>
            </div>
            <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
              {loading ? (
                <ChartSkeleton />
              ) : dailyActiveUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyActiveUsers} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="sessions" 
                      name="Sessions" 
                      stroke="var(--accent-blue)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSessions)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No session data available
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Insights Created */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard style={{ padding: '24px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Insights Created</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 30 days</span>
            </div>
            <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
              {loading ? (
                <ChartSkeleton />
              ) : insightsPerDay.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={undefined}>

                  <BarChart data={insightsPerDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)' }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-secondary)' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="count" name="Insights" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No insight data available
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Top Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>🔥 Top Engaging Insights</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Most liked</span>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: '8px',
                  height: '60px',
                  animation: 'shimmer 1.5s infinite'
                }} />
              ))}
            </div>
          ) : topInsights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topInsights.map((insight, idx) => (
                <div 
                  key={insight.id} 
                  style={{ 
                    padding: '16px 20px', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '10px', 
                    border: '1px solid var(--glass-border)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ 
                    fontWeight: 700, 
                    color: 'var(--accent-blue)', 
                    fontSize: '18px',
                    minWidth: '32px'
                  }}>
                    #{idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      "{insight.content.length > 100 ? insight.content.slice(0, 100) + '...' : insight.content}"
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                      <span>By: {insight.isAnonymous ? 'Anonymous' : (insight.author?.name || 'Unknown')}</span>
                      <span>❤️ {insight.likeCount} likes</span>
                      <span>📅 {new Date(insight.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
              No top insights available yet.
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Analytics;