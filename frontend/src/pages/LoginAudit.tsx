import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShieldCheck, ShieldAlert, Search, Filter, RefreshCw, UserCheck, Laptop, Lock } from 'lucide-react';
import { LoginRecord } from '../types';

export const LoginAudit: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/auth/login-history/');
      setRecords(res.data);
    } catch (err: any) {
      console.error('Failed to load login history', err);
      if (err.response?.status === 403) {
        setError('Access Denied: Only administrators and superusers have permission to view login audit records.');
      } else {
        setError(err.response?.data?.error || 'Unable to retrieve login audit records.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  const parseBrowser = (ua: string) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Google Chrome';
    if (ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('Firefox')) return 'Mozilla Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Apple Safari';
    if (ua.includes('Postman')) return 'Postman API Client';
    return ua.length > 30 ? ua.substring(0, 30) + '...' : ua;
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      (rec.email && rec.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rec.ip_address && rec.ip_address.includes(searchTerm)) ||
      (rec.user_name && rec.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLogins = records.length;
  const successfulLogins = records.filter(r => r.status === 'SUCCESS').length;
  const failedLogins = records.filter(r => r.status === 'FAILED').length;
  const uniqueIPs = new Set(records.map(r => r.ip_address).filter(Boolean)).size;

  if (loading) return <LoadingSpinner message="Accessing secure login audit logs..." />;

  if (error) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-8 text-center" style={{ margin: '2rem auto', maxWidth: '600px' }}>
        <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '1rem' }}>
          <Lock size={40} color="var(--accent-rose)" />
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Restricted Access</h2>
        <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          To view login records, log in with an administrator/superuser account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.75rem' }}>User Login Audit Trail</h1>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '999px', 
              background: 'rgba(99, 102, 241, 0.2)', 
              color: 'var(--accent-indigo-light)',
              fontWeight: 600
            }}>
              Admin Only
            </span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            Comprehensive, immutable access logs of every user attempting to authenticate
          </p>
        </div>
        <button 
          onClick={fetchLoginHistory}
          className="btn-secondary flex items-center gap-2"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Attempts</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{totalLogins}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 600 }}>Successful</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>{successfulLogins}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} color="var(--accent-rose)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', textTransform: 'uppercase', fontWeight: 600 }}>Failed Attempts</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-rose)' }}>{failedLogins}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Unique IPs</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>{uniqueIPs}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card flex items-center justify-between gap-4" style={{ padding: '1rem 1.5rem' }}>
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            className="input-field"
            placeholder="Search by email, user name, or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} color="var(--text-secondary)" />
          <select
            className="input-field"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Successful Only</option>
            <option value="FAILED">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>User / Email</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Client Device</th>
                <th style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No login records match your current filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isSuccess = rec.status === 'SUCCESS';
                  const date = new Date(rec.timestamp);
                  const formattedDate = date.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr 
                      key={rec.id}
                      style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {formattedDate}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div className="flex flex-col">
                          <span style={{ fontWeight: 600, color: '#fff' }}>{rec.email || 'Anonymous'}</span>
                          {rec.user_name && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {rec.user_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isSuccess ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                          border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}>
                          {isSuccess ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                          {rec.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                        {rec.ip_address || '127.0.0.1'}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1.5" title={rec.user_agent}>
                          <Laptop size={14} color="var(--text-muted)" />
                          <span>{parseBrowser(rec.user_agent)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: isSuccess ? 'var(--text-muted)' : 'var(--accent-rose)' }}>
                        {rec.failure_reason || (isSuccess ? 'Authenticated' : 'Failed')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoginAudit;
