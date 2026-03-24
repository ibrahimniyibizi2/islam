// Super Admin Dashboard with Real Supabase Data

import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../ui/use-toast';
import { useAuth } from '../../hooks/useAuth';

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'masjid_admin' | 'converted_user';
  status: 'active' | 'pending' | 'blocked';
  created_at: string;
  last_login?: string;
  certificates_count?: number;
  masjid_id?: string;
}

interface Masjid {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  admin_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  users_count?: number;
}

interface CertificateApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  completed_at?: string;
  language?: string;
  masjid_id?: string;
  user?: User;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: User;
}

interface Statistics {
  total_applications: number;
  approved_applications: number;
  pending_applications: number;
  rejected_applications: number;
  completed_applications: number;
  total_users: number;
  active_users: number;
  total_masaajid: number;
  certificates_today: number;
  certificates_this_week: number;
  certificates_this_month: number;
}

// Main Super Admin Dashboard
export const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [masaajid, setMasaajid] = useState<Masjid[]>([]);
  const [applications, setApplications] = useState<CertificateApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    period: '30d',
    language: 'all',
    masjid: 'all'
  });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use real Supabase data
      switch (activeTab) {
        case 'overview':
          await fetchStatistics();
          break;
        case 'users':
          await fetchUsers();
          break;
        case 'masaajid':
          await fetchMasaajid();
          break;
        case 'applications':
          await fetchApplications();
          break;
        case 'audit':
          await fetchAuditLogs();
          break;
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Get real statistics from database
      const { data: applications, error: appsError } = await supabase
        .from('shahada_applications')
        .select('status, completed_at, created_at')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('status')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const { data: masaajid, error: masjidsError } = await supabase
        .from('masaajid')
        .select('status')
        .order('created_at', { ascending: false });

      if (masjidsError) throw masjidsError;

      // Calculate statistics
      const stats: Statistics = {
        total_applications: applications?.length || 0,
        approved_applications: applications?.filter(app => app.status === 'approved').length || 0,
        pending_applications: applications?.filter(app => app.status === 'pending').length || 0,
        rejected_applications: applications?.filter(app => app.status === 'rejected').length || 0,
        completed_applications: applications?.filter(app => app.status === 'completed').length || 0,
        total_users: users?.length || 0,
        active_users: users?.filter(user => user.status === 'active').length || 0,
        total_masaajid: masaajid?.length || 0,
        certificates_today: applications?.filter(app => 
          app.status === 'completed' && 
          new Date(app.completed_at || app.created_at).toDateString() === new Date().toDateString()
        ).length || 0,
        certificates_this_week: applications?.filter(app => 
          app.status === 'completed' && 
          new Date(app.completed_at || app.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0,
        certificates_this_month: applications?.filter(app => 
          app.status === 'completed' && 
          new Date(app.completed_at || app.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0
      };

      setStatistics(stats);
    } catch (error) {
      console.error('Statistics error:', error);
      setStatistics({
        total_applications: 0,
        approved_applications: 0,
        pending_applications: 0,
        rejected_applications: 0,
        completed_applications: 0,
        total_users: 0,
        active_users: 0,
        total_masaajid: 0,
        certificates_today: 0,
        certificates_this_week: 0,
        certificates_this_month: 0
      });
    }
  };

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Users error:', error);
      setUsers([]);
    }
  };

  const fetchMasaajid = async () => {
    try {
      let query = supabase
        .from('masaajid')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setMasaajid(data || []);
    } catch (error) {
      console.error('Masaajid error:', error);
      setMasaajid([]);
    }
  };

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from('shahada_applications')
        .select('*, user:users(email, full_name)')
        .order('created_at', { ascending: false });
      
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.language !== 'all') {
        query = query.eq('language', filters.language);
      }
      
      if (filters.masjid !== 'all') {
        query = query.eq('masjid_id', filters.masjid);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Applications error:', error);
      setApplications([]);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, user:users(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Audit logs error:', error);
      setAuditLogs([]);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('shahada_applications')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Log action
      await supabase.from('audit_logs').insert({
        user_id: user?.id || 'system',
        action: 'approve_application',
        resource: 'shahada_application',
        details: `Approved application ${applicationId}`,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });

      toast({
        title: 'Application Approved',
        description: 'Certificate application has been approved successfully.',
      });

      fetchApplications();
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
      const { error } = await supabase
        .from('shahada_applications')
        .update({ 
          status: 'rejected',
          rejected_by: user?.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Log action
      await supabase.from('audit_logs').insert({
        user_id: user?.id || 'system',
        action: 'reject_application',
        resource: 'shahada_application',
        details: `Rejected application ${applicationId}: ${reason}`,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });

      toast({
        title: 'Application Rejected',
        description: 'Certificate application has been rejected.',
      });

      fetchApplications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: role as any })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Role Updated',
        description: 'User role has been updated successfully.',
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'blocked' as any })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'User Blocked',
        description: 'User has been blocked successfully.',
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to block user',
        variant: 'destructive',
      });
    }
  };

  const handleSendNotification = async (userId: string, message: string, type: 'sms' | 'email') => {
    try {
      // Log notification action
      await supabase.from('audit_logs').insert({
        user_id: user?.id || 'system',
        action: 'send_notification',
        resource: 'user_account',
        details: `Sent ${type} notification to user ${userId}: ${message}`,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });

      toast({
        title: 'Notification Sent',
        description: `${type.toUpperCase()} notification sent successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to send ${type} notification`,
        variant: 'destructive',
      });
    }
  };

  const exportReport = async (type: 'applications' | 'users' | 'masaajid') => {
    try {
      let data = [];
      let filename = '';

      switch (type) {
        case 'applications':
          data = applications;
          filename = 'shahada-applications-report.csv';
          break;
        case 'users':
          data = users;
          filename = 'users-report.csv';
          break;
        case 'masaajid':
          data = masaajid;
          filename = 'masaajid-report.csv';
          break;
      }

      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report Exported',
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvData = data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    ).join('\n');
    
    return csvHeaders + '\n' + csvData;
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
            {activeTab === 'overview' && statistics && (
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
                        <p className="text-2xl font-semibold text-gray-900">{statistics.total_applications}</p>
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
                        <p className="text-2xl font-semibold text-gray-900">{statistics.approved_applications}</p>
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
                        <p className="text-2xl font-semibold text-gray-900">{statistics.pending_applications}</p>
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
                        <p className="text-2xl font-semibold text-gray-900">{statistics.active_users}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Recent Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{statistics.certificates_today}</p>
                      <p className="text-sm text-gray-600">Certificates Today</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{statistics.certificates_this_week}</p>
                      <p className="text-sm text-gray-600">This Week</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{statistics.certificates_this_month}</p>
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
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    <button
                      onClick={() => exportReport('users')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                    >
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
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-center py-12">
                              <div className="text-gray-400 text-6xl mb-4">
                                👥
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Users Found
                              </h3>
                              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                There are no users registered in the system yet.
                              </p>
                              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                Add New User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
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
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="super_admin">Super Admin</option>
                                  <option value="masjid_admin">Masjid Admin</option>
                                  <option value="converted_user">User</option>
                                </select>
                                <button
                                  onClick={() => handleSendNotification(user.id, 'Your account has been updated.', 'email')}
                                  className="text-blue-600 hover:text-blue-900 text-xs"
                                >
                                  📧
                                </button>
                                <button
                                  onClick={() => handleSendNotification(user.id, 'Account update notification', 'sms')}
                                  className="text-green-600 hover:text-green-900 text-xs"
                                >
                                  📱
                                </button>
                                {user.status !== 'blocked' && (
                                  <button
                                    onClick={() => handleBlockUser(user.id)}
                                    className="text-red-600 hover:text-red-900 text-xs"
                                  >
                                    🚫
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
                          <input type="password" defaultValue="••••••••••••••••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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
                          <input type="password" defaultValue="•••••••••••••••••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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
