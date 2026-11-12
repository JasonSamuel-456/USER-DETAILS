import React from 'react';
import { Users, UserCheck, UserX, Clock, Building2 } from 'lucide-react';

export default function StatsCard({ stats }) {
  if (!stats) return null;

  const items = [
    {
      label: 'Total Registered Users',
      value: stats.total_users ?? 0,
      icon: Users,
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      label: 'Active Users',
      value: stats.active_users ?? 0,
      icon: UserCheck,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      label: 'Pending Approvals',
      value: stats.pending_users ?? 0,
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'Departments',
      value: stats.departments?.length ?? 0,
      icon: Building2,
      color: '#06b6d4',
      bg: '#ecfeff',
    },
  ];

  return (
    <div className="stats-grid">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: item.bg, color: item.color }}>
              <Icon size={24} />
            </div>
            <div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
