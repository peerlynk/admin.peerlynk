import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/activity-logs', { params: { page: pagination.page, limit: pagination.limit } });
      setLogs(res.data.logs);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (err) {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Activity Log</h1>
      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Action</th>
              <th className="px-6 py-3 text-left">Details</th>
              <th className="px-6 py-3 text-left">IP</th>
              <th className="px-6 py-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b dark:border-gray-700">
                <td className="px-6 py-4">{log.user?.name || log.user?.email}</td>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4">{log.details}</td>
                <td className="px-6 py-4">{log.ip}</td>
                <td className="px-6 py-4">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}