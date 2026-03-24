// Complete Super Admin Dashboard with all tabs and sample data

import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../ui/use-toast';
import { useAuth } from '../../hooks/useAuth';

// Sample data for demonstration
const sampleUsers = [
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

const sampleApplications = [
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

const sampleMasaajid = [
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

const sampleAuditLogs = [
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

const sampleStatistics = {
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

// Empty State Component
const EmptyState = ({ 
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

// Main Super Admin Dashboard
export const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [activeTab]);

  const handleApproveApplication = async (applicationId: string) => {
    try {
      toast({
        title: 'Application Approved',
        description: 'Certificate application has been approved successfully.',
      });

      // Log action
      const newAuditLog = {
        id: `audit-${Date.now()}`,
        user_id: user?.id || 'system',
        action: 'approve_application',
        resource: 'shahada_application',
        details: `Approved application ${applicationId}`,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
        user: user || null
      };
      
      console.log('Audit log created:', newAuditLog);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve application',
        variant: 'destructive',
      });
    }
  };

  const handleRejectApplication = async (applicationId: string, reason: string) => {
    try {
      toast({
        title: 'Application Rejected',
        description: 'Certificate application has been rejected.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'approved': case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'blocked': case 'rejected': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-purple-600 bg-purple-100';
      case 'masjid_admin': return 'text-blue-600 bg-blue-100';
      case 'converted_user': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🕌 Super Admin Dashboard</h1>
              <span className="text-sm text-gray-500">Rwanda Islamic Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                🔔
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  SA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'users', label: '👥 Users', icon: '👥' },
              { id: 'masaajid', label: '🕌 Masjids', icon: '🕌' },
              { id: 'applications', label: '📄 Applications', icon: '📄' },
              { id: 'reports', label: '📈 Reports', icon: '📈' },
              { id: 'audit', label: '📝 Audit Logs', icon: '📝' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">📊 Dashboard Overview</h2>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Total Applications</p>
                        <p className="text-2xl font-semibold text-gray-900">{sampleStatistics.total_applications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Approved</p>
                        <p className="text-2xl font-semibold text-gray-900">{sampleStatistics.approved_applications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                        <span className="text-2xl">⏳</span>
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Pending</p>
                        <p className="text-2xl font-semibold text-gray-900">{sampleStatistics.pending_applications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Active Users</p>
                        <p className="text-2xl font-semibold text-gray-900">{sampleStatistics.active_users}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Recent Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{sampleStatistics.certificates_today}</p>
                      <p className="text-sm text-gray-600">Certificates Today</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{sampleStatistics.certificates_this_week}</p>
                      <p className="text-sm text-gray-600">This Week</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{sampleStatistics.certificates_this_month}</p>
                      <p className="text-sm text-gray-600">This Month</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">👥 Users Management</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                      📥 Export CSV
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.certificates_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 text-xs">📧</button>
                              <button className="text-green-600 hover:text-green-900 text-xs">📱</button>
                              <button className="text-red-600 hover:text-red-900 text-xs">🚫</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Masjids Tab */}
            {activeTab === 'masaajid' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">🕌 Masjids Management</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                      🕌 Export CSV
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masjid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleMasaajid.map((masjid) => (
                        <tr key={masjid.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{masjid.name}</div>
                              <div className="text-sm text-gray-500">ID: {masjid.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{masjid.address}</div>
                            <div className="text-xs text-gray-400">{masjid.city}, {masjid.province}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Admin ID: {masjid.admin_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {masjid.users_count || 0} users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(masjid.status)}`}>
                              {masjid.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 text-xs">👁</button>
                              <button className="text-green-600 hover:text-green-900 text-xs">✏️</button>
                              <button className="text-red-600 hover:text-red-900 text-xs">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">📄 Certificate Applications</h2>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                      📥 Export CSV
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleApplications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                              <div className="text-sm text-gray-500">{app.email}</div>
                              {app.user?.full_name && (
                                <div className="text-xs text-gray-400">User: {app.user.full_name}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveApplication(app.id)}
                                    className="text-green-600 hover:text-green-900 text-xs"
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Rejection reason:');
                                      if (reason) handleRejectApplication(app.id, reason);
                                    }}
                                    className="text-red-600 hover:text-red-900 text-xs"
                                  >
                                    ❌ Reject
                                  </button>
                                </>
                              )}
                              <button className="text-blue-600 hover:text-blue-900 text-xs">📧</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">📈 System Reports</h2>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Certificate Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700">Language Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">English</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 ml-2">45%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Kinyarwanda</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 ml-2">30%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Arabic</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 ml-2">15%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">French</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{width: '10%'}}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 ml-2">10%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700">Monthly Trends</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <p>📈 January: 89 certificates</p>
                          <p>📈 February: 124 certificates</p>
                          <p>📈 March: 147 certificates (current)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      📊 Export Full Report (PDF/CSV)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">📝 Audit Logs</h2>
                
                <div className="bg-white shadow rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleAuditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{log.user?.full_name || 'System'}</div>
                              <div className="text-sm text-gray-500">{log.user?.email || 'System'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">⚙️ System Settings</h2>
                
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">🌍 Supported Languages</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['English', 'Kinyarwanda', 'Arabic', 'French'].map((lang) => (
                          <label key={lang} className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600" />
                            <span className="text-sm text-gray-700">{lang}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">📧 Email Configuration</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                          <input type="text" defaultValue="smtp.gmail.com" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                          <input type="text" defaultValue="587" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                          <input type="email" defaultValue="noreply@islamrwanda.rw" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                          <input type="password" defaultValue="••••••••••••••••••••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">📱 SMS Configuration</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option>Pindo</option>
                            <option>Vonage</option>
                            <option>Twilio</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                          <input type="password" defaultValue="••••••••••••••••••••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        💾 Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
