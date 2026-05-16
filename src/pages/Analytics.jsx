import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import GlassCard from '../components/ui/GlassCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

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

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dailyActiveUsers, setDailyActiveUsers] = useState([]);
  const [insightsPerDay, setInsightsPerDay] = useState([]);
  const [topInsights, setTopInsights] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [engagementRes, insightsAnalyticsRes] = await Promise.all([
          api.get('/admin/engagement').catch(() => ({ data: {} })),
          api.get('/admin/insights-analytics').catch(() => ({ data: {} }))
        ]);

        const eData = engagementRes.data;
        const iData = insightsAnalyticsRes.data;

        if (eData.dailyActiveUsers) {
          const formatted = eData.dailyActiveUsers.map(item => ({
            name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sessions: item._sum?.sessions || 0,
            time: item._sum?.totalTime || 0
          }));
          setDailyActiveUsers(formatted);
        }

        if (iData.insightsByDay || eData.insightsPerDay) {
          const rawInsights = iData.insightsByDay || eData.insightsPerDay || [];
          const formattedInsights = rawInsights.map(item => ({
            name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: Number(item.count) || 0
          }));
          setInsightsPerDay(formattedInsights);
        }

        if (iData.topInsights) {
          setTopInsights(iData.topInsights);
        }
      } catch (err) {
        console.error("Analytics fetch error", err);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="analytics-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Platform Analytics</h1>
        <p>Deep dive into user engagement and growth metrics.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Daily Active Sessions (Last 30 Days)</h2>
          <div style={{ width: '100%', height: '400px' }}>
            {dailyActiveUsers.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={dailyActiveUsers} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {loading ? 'Loading...' : 'No data available'}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard style={{ padding: '24px', height: '100%' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Insights Created (Last 30 Days)</h2>
            <div style={{ width: '100%', height: '300px' }}>
              {insightsPerDay.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={insightsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="count" name="Insights Created" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  {loading ? 'Loading...' : 'No data available'}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard style={{ padding: '24px', height: '100%', overflowY: 'auto', maxHeight: '400px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Top Engaging Insights</h2>
            {topInsights.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {topInsights.map((insight, idx) => (
                  <div key={insight.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--accent-blue)' }}>#{idx + 1}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>❤️ {insight.likeCount} Likes</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>"{insight.content}"</p>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>By: {insight.isAnonymous ? 'Anonymous' : (insight.author?.name || 'Unknown')}</span>
                      <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {loading ? 'Loading...' : 'No top insights available'}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
