// Placeholder content for empty navigation states

export const EmptyState = ({ 
  type, 
  title, 
  description, 
  action 
}: { 
  type: 'users' | 'applications' | 'masaajid' | 'reports' | 'audit' | 'settings';
  title: string;
  description: string;
  action?: string;
}) => {
  const icons = {
    users: '👥',
    applications: '📄',
    masaajid: '🕌',
    reports: '📈',
    audit: '📝',
    settings: '⚙️'
  };

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">
        {icons[type]}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
};

// Sample data for dashboard
export const sampleUsers = [
  {
    id: '1',
    email: 'ibrahim@admin.rw',
    full_name: 'Ibrahim Niyibizi',
    role: 'super_admin',
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    last_login: '2024-03-17T14:20:00Z',
    certificates_count: 0
  },
  {
    id: '2',
    email: 'aisha@mosque.rw',
    full_name: 'Aisha Uwimana',
    role: 'masjid_admin',
    status: 'active',
    created_at: '2024-02-01T09:15:00Z',
    last_login: '2024-03-16T16:45:00Z',
    certificates_count: 45
  },
  {
    id: '3',
    email: 'hassan@user.rw',
    full_name: 'Hassan Mugisha',
    role: 'converted_user',
    status: 'pending',
    created_at: '2024-03-10T11:20:00Z',
    certificates_count: 0
  }
];

export const sampleApplications = [
  {
    id: 'app-1',
    user_id: '2',
    full_name: 'Fatuma Mukamana',
    email: 'fatuma@email.com',
    phone: '+250788123456',
    status: 'pending',
    created_at: '2024-03-17T08:30:00Z',
    language: 'rw',
    masjid_id: 'masjid-1',
    user: {
      email: 'aisha@mosque.rw',
      full_name: 'Aisha Uwimana'
    }
  },
  {
    id: 'app-2',
    user_id: '3',
    full_name: 'Jean-Paul Habimana',
    email: 'jp@islam.rw',
    phone: '+250712345678',
    status: 'approved',
    created_at: '2024-03-16T14:20:00Z',
    completed_at: '2024-03-16T15:45:00Z',
    language: 'fr',
    masjid_id: 'masjid-2',
    user: {
      email: 'hassan@user.rw',
      full_name: 'Hassan Mugisha'
    }
  },
  {
    id: 'app-3',
    user_id: '1',
    full_name: 'Grace Uwase',
    email: 'grace@convert.rw',
    phone: '+250733456789',
    status: 'completed',
    created_at: '2024-03-15T10:15:00Z',
    completed_at: '2024-03-15T11:30:00Z',
    language: 'en',
    masjid_id: 'masjid-1',
    user: {
      email: 'ibrahim@admin.rw',
      full_name: 'Ibrahim Niyibizi'
    }
  }
];

export const sampleMasaajid = [
  {
    id: 'masjid-1',
    name: 'Kigali Central Mosque',
    address: 'KN 123 St, Kigali City',
    city: 'Kigali',
    province: 'Kigali',
    admin_id: '2',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    users_count: 245
  },
  {
    id: 'masjid-2',
    name: 'Nyamata Masjid',
    address: 'Nyamata Town Center',
    city: 'Nyamata',
    province: 'Southern Province',
    admin_id: '3',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    users_count: 89
  },
  {
    id: 'masjid-3',
    name: 'Gitarama Islamic Center',
    address: 'Gitarama Main Street',
    city: 'Gitarama',
    province: 'Northern Province',
    admin_id: '1',
    status: 'inactive',
    created_at: '2024-02-01T00:00:00Z',
    users_count: 156
  }
];

export const sampleAuditLogs = [
  {
    id: 'audit-1',
    user_id: '1',
    action: 'approve_application',
    resource: 'shahada_application',
    details: 'Approved application app-2 for Jean-Paul Habimana',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: '2024-03-17T14:20:00Z',
    user: {
      email: 'ibrahim@admin.rw',
      full_name: 'Ibrahim Niyibizi'
    }
  },
  {
    id: 'audit-2',
    user_id: '2',
    action: 'block_user',
    resource: 'user_account',
    details: 'Blocked user hassan@user.rw due to policy violation',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    created_at: '2024-03-17T13:45:00Z',
    user: {
      email: 'aisha@mosque.rw',
      full_name: 'Aisha Uwimana'
    }
  },
  {
    id: 'audit-3',
    user_id: 'system',
    action: 'certificate_generated',
    resource: 'shahada_certificate',
    details: 'System generated certificate SHA-RWA-2024-001 for Grace Uwase',
    ip_address: '127.0.0.1',
    user_agent: 'Supabase Edge Runtime',
    created_at: '2024-03-17T12:30:00Z',
    user: null
  }
];

export const sampleStatistics = {
  total_applications: 1247,
  approved_applications: 892,
  pending_applications: 156,
  rejected_applications: 89,
  completed_applications: 110,
  total_users: 3421,
  active_users: 3156,
  total_masaajid: 45,
  certificates_today: 23,
  certificates_this_week: 147,
  certificates_this_month: 523
};
