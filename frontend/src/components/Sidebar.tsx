import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Receipt, 
  Package, 
  Users, 
  ListOrdered, 
  Sparkles, 
  Upload,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff || user?.is_superuser;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Sales', path: '/sales', icon: TrendingUp },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Transactions', path: '/transactions', icon: ListOrdered },
    { label: 'Insights & AI', path: '/insights', icon: Sparkles },
    { label: 'Upload Data', path: '/upload', icon: Upload },
    ...(isAdmin ? [{ label: 'Login Records', path: '/audit', icon: ShieldAlert }] : []),
  ];


  return (
    <aside className="glass-card flex flex-col gap-2" style={{ width: '240px', minHeight: 'calc(100vh - 65px)', padding: '1.5rem 1rem', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
        Analytics Navigation
      </span>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 ${isActive ? 'active-nav' : ''}`
            }
            style={({ isActive }) => ({
              padding: '0.7rem 0.9rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.15))' : 'transparent',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            })}
          >
            <Icon size={18} color="var(--accent-indigo-light)" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
