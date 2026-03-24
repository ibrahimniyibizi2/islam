import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ViewAllApplicationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);

  // Application types configuration
  const applicationTypes = {
    shahada: {
      title: 'Shahada Certificate',
      description: 'Apply for conversion certificate',
      icon: '🕌',
      color: '#059669',
      statuses: ['pending', 'approved', 'rejected', 'processing']
    },
    nikah: {
      title: 'Nikah Application',
      description: 'Submit Nikah marriage application',
      icon: '💑',
      color: '#dc2626',
      statuses: ['pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled', 'denied', 'delivered']
    },
    residence: {
      title: 'Certificate of Residence',
      description: 'Get residence certificate',
      icon: '🏠',
      color: '#2563eb',
      statuses: ['pending', 'approved', 'rejected', 'processing']
    },
    business: {
      title: 'Business Registration',
      description: 'Register new business',
      icon: '🏢',
      color: '#7c3aed',
      statuses: ['pending', 'approved', 'rejected', 'processing']
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const applications = [];
      
      // Load Shahada Certificate applications with defensive querying
      try {
        // First try to get basic columns that should exist
        const { data: shahadaApps, error: shahadaError } = await supabase
          .from('shahada_applications')
          .select(`
            id,
            status,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false })
          .limit(1); // Just get one to test if table exists
        
        if (shahadaError) {
          console.error('Shahada applications table not accessible:', shahadaError);
        } else {
          // Table exists, now try to get all data with as any casting
          const { data: fullShahadaApps, error: fullError } = await supabase
            .from('shahada_applications')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fullError) {
            console.error('Error loading shahada applications:', fullError);
            // Try with minimal columns
            const { data: minimalApps, error: minimalError } = await supabase
              .from('shahada_applications')
              .select('id, status, created_at, updated_at')
              .order('created_at', { ascending: false });
            
            if (!minimalError && minimalApps) {
              minimalApps.forEach(app => {
                applications.push({
                  id: app.id,
                  type: 'shahada',
                  applicantName: 'Unknown Applicant',
                  applicantEmail: 'No email',
                  applicantPhone: null,
                  status: app.status,
                  submittedAt: app.created_at,
                  lastUpdated: app.updated_at,
                  details: {
                    note: 'Limited data available - table structure may be incomplete'
                  }
                });
              });
            }
          } else if (fullShahadaApps && Array.isArray(fullShahadaApps)) {
            fullShahadaApps.forEach((app: any) => {
              applications.push({
                id: app.id,
                type: 'shahada',
                applicantName: app.first_name && app.last_name ? `${app.first_name} ${app.last_name}` : 
                               app.applicant_name || 'Unknown Applicant',
                applicantEmail: app.email || app.applicant_email || 'No email',
                applicantPhone: app.phone || app.applicant_phone || null,
                status: app.status,
                submittedAt: app.created_at,
                lastUpdated: app.updated_at,
                details: {
                  currentReligion: app.current_religion,
                  desiredReligion: 'Islam',
                  reason: app.conversion_reason,
                  references: [app.witness1_name, app.witness2_name].filter(Boolean),
                  ...app // Include all other fields for debugging
                }
              });
            });
          }
        }
      } catch (tableError) {
        console.log('Shahada applications table not found or major schema issues:', tableError);
      }
      
      // Load other application types with graceful fallback
      const otherTypes = [
        { type: 'nikah', table: 'nikah_applications' },
        { type: 'residence', table: 'residence_applications' },
        { type: 'business', table: 'business_applications' }
      ];

      for (const { type, table } of otherTypes) {
        try {
          if (type === 'nikah') {
            // Handle nikah_applications with its specific structure
            const { data: apps, error } = await supabase
              .from('nikah_applications')
              .select(`
                id,
                bride_name,
                bride_email,
                bride_phone,
                groom_name,
                groom_email,
                groom_phone,
                status,
                created_at,
                updated_at,
                preferred_date,
                preferred_time,
                preferred_masjid,
                mosque_id,
                payment_status,
                payment_method,
                certificate_number,
                reference_number,
                hiv_test_url,
                groom_id_document_url,
                bride_id_document_url,
                groom_birth_cert_url,
                bride_birth_cert_url,
                groom_passport_photo_url,
                bride_passport_photo_url
              `)
              .order('created_at', { ascending: false });
            
            if (!error && apps && Array.isArray(apps)) {
              apps.forEach(app => {
                applications.push({
                  id: app.id,
                  type: 'nikah',
                  applicantName: `${app.groom_name || 'Groom'} & ${app.bride_name || 'Bride'}`,
                  applicantEmail: app.groom_email || app.bride_email || 'No email',
                  applicantPhone: app.groom_phone || app.bride_phone || null,
                  status: app.status,
                  submittedAt: app.created_at,
                  lastUpdated: app.updated_at,
                  details: {
                    brideName: app.bride_name,
                    brideEmail: app.bride_email,
                    bridePhone: app.bride_phone,
                    groomName: app.groom_name,
                    groomEmail: app.groom_email,
                    groomPhone: app.groom_phone,
                    preferredDate: app.preferred_date,
                    preferredTime: app.preferred_time,
                    preferredMasjid: app.preferred_masjid,
                    mosqueId: app.mosque_id,
                    paymentStatus: app.payment_status,
                    paymentMethod: app.payment_method,
                    certificateNumber: app.certificate_number,
                    referenceNumber: app.reference_number,
                    // Document URLs
                    hivTestUrl: app.hiv_test_url,
                    groomIdDocumentUrl: app.groom_id_document_url,
                    brideIdDocumentUrl: app.bride_id_document_url,
                    groomBirthCertUrl: app.groom_birth_cert_url,
                    brideBirthCertUrl: app.bride_birth_cert_url,
                    groomPassportPhotoUrl: app.groom_passport_photo_url,
                    bridePassportPhotoUrl: app.bride_passport_photo_url
                  }
                });
              });
            }
          } else if (type === 'residence' || type === 'business') {
            // These tables will be created by the migration - try to load them
            const { data: apps, error } = await supabase
              .from(table as any)
              .select('*')
              .order('created_at', { ascending: false });
            
            if (!error && apps && Array.isArray(apps)) {
              apps.forEach(app => {
                applications.push({
                  id: app.id,
                  type,
                  applicantName: app.applicant_name || `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Unknown Applicant',
                  applicantEmail: app.applicant_email || app.email || 'No email',
                  applicantPhone: app.applicant_phone || app.phone || null,
                  status: app.status,
                  submittedAt: app.created_at,
                  lastUpdated: app.updated_at,
                  details: app
                });
              });
            } else if (error && error.code === 'PGRST116') {
              // Table doesn't exist yet - skip silently
              console.log(`${type} applications table not found - skipping`);
            }
          } else {
            // Handle other application types with defensive querying
            const { data: apps, error } = await supabase
              .from(table as any)
              .select('*')
              .order('created_at', { ascending: false });
            
            if (!error && apps && Array.isArray(apps)) {
              apps.forEach(app => {
                applications.push({
                  id: app.id,
                  type,
                  applicantName: app.applicant_name || `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Unknown Applicant',
                  applicantEmail: app.applicant_email || app.email || 'No email',
                  applicantPhone: app.applicant_phone || app.phone || null,
                  status: app.status,
                  submittedAt: app.created_at,
                  lastUpdated: app.updated_at,
                  details: app
                });
              });
            } else if (error && error.code === 'PGRST116') {
              // Table doesn't exist - skip silently
              console.log(`${type} applications table not found - skipping`);
            }
          }
        } catch (error: any) {
          if (error.code === 'PGRST116') {
            // Table doesn't exist - skip silently
            console.log(`${type} applications table not found - skipping`);
          } else {
            console.log(`${type} applications table not accessible:`, error);
          }
        }
      }
      
      // Sort all applications by submission date
      applications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      setApplications(applications);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast({
        title: 'Failed to Load Applications',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update application status with audit logging
  const updateApplicationStatus = async (applicationId, newStatus, reason = '') => {
    try {
      setStatusUpdating(prev => ({ ...prev, [applicationId]: true }));

      const application = applications.find(app => app.id === applicationId);
      if (!application) throw new Error('Application not found');

      let tableName = '';
      switch (application.type) {
        case 'shahada':
          tableName = 'shahada_applications';
          break;
        case 'nikah':
          tableName = 'nikah_applications';
          break;
        case 'residence':
          tableName = 'residence_applications' as any;
          break;
        case 'business':
          tableName = 'business_applications' as any;
          break;
        default:
          throw new Error('Unknown application type');
      }

      // Check if table exists before trying to update
      if ((application.type === 'residence' || application.type === 'business') && tableName.includes('applications')) {
        // These tables should exist after migration, but handle gracefully if they don't
        try {
          const testQuery = await supabase.from(tableName).select('id').limit(1);
          if (testQuery.error) {
            throw new Error(`${application.type} applications table not available yet`);
          }
        } catch (testError) {
          throw new Error(`${application.type} applications table not available yet`);
        }
      }

      const updateData: any = {
        status: newStatus,
        ...(application.type === 'residence' || application.type === 'business'
          ? {}
          : { updated_at: new Date().toISOString() })
      };

      // Only add rejection_reason if the table supports it
      if (newStatus === 'rejected' && reason) {
        // Check which table we're working with
        if (application.type === 'nikah') {
          // For nikah, don't try to add rejection_reason since column might not exist
          console.log('Nikah rejection reason logged but not stored (column not available)');
        } else if (application.type === 'residence' || application.type === 'business') {
          // For new tables, try to add rejection_reason
          updateData.rejection_reason = reason;
        } else {
          // For other tables (like shahada), try to add rejection_reason
          updateData.rejection_reason = reason;
        }
      }

      const attemptUpdate = async (payload: any) => {
        return await supabase.from(tableName).update(payload).eq('id', applicationId);
      };

      let { error } = await attemptUpdate(updateData);

      // If the table doesn't have updated_at yet, retry without it
      if (error?.code === 'PGRST204' && typeof error.message === 'string' && error.message.includes("updated_at")) {
        const { updated_at: _updatedAt, ...payloadWithoutUpdatedAt } = updateData;
        ({ error } = await attemptUpdate(payloadWithoutUpdatedAt));
      }

      if (error) {
        // Handle status constraint violations specifically
        if (error.code === '23514' && error.message.includes('status_check')) {
          console.log(`Status '${newStatus}' not allowed for ${application.type}, trying alternative...`);
          
          // Try alternative status mappings for nikah
          if (application.type === 'nikah') {
            let alternativeStatus = '';
            if (newStatus === 'rejected') {
              alternativeStatus = 'rejected'; // Try the same value first
            } else if (newStatus === 'approved') {
              alternativeStatus = 'approved'; // Try the same value first
            }
            
            // If original failed, try just basic statuses
            if (alternativeStatus === newStatus) {
              console.log('Original status failed, trying minimal status set...');
              const minimalStatuses = ['pending', 'approved', 'rejected'];
              if (minimalStatuses.includes(newStatus)) {
                throw new Error(`Status '${newStatus}' should be allowed but constraint is blocking it. Check table schema.`);
              }
            }
          }
          
          throw new Error(`Status '${newStatus}' violates constraint for ${application.type} applications. Allowed statuses may be different than expected.`);
        }
        throw error;
      }

      // Audit logging (optional - skip if table doesn't exist)
      try {
        await supabase.from('audit_logs' as any).insert({
          action: 'application_status_updated',
          table_name: tableName,
          record_id: applicationId,
          old_values: { status: application.status },
          new_values: updateData,
          reason: reason || null
        });
      } catch (auditError) {
        console.log('Audit logging failed, but status update succeeded:', auditError);
        // Don't fail the whole operation if audit logging fails
      }

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, lastUpdated: new Date().toISOString(), ...(reason && { rejectionReason: reason }) }
          : app
      ));

      // Send notifications for approved/rejected status
      if ((newStatus === 'approved' || newStatus === 'rejected') && application) {
        console.log(`Sending notifications for ${application.type} application ${applicationId} - Status: ${newStatus}`);
        console.log('Application details:', JSON.stringify({
          applicantPhone: application.applicantPhone,
          applicantEmail: application.applicantEmail,
          groomPhone: application.details?.groomPhone,
          bridePhone: application.details?.bridePhone,
        }));
        try {
          // Prepare notification data based on application type
          const isApproved = newStatus === 'approved';
          const statusText = isApproved ? 'approved' : 'rejected';
          
          if (application.type === 'nikah' && application.details) {
            // Use certificate_number for Nikah ID, fallback to database ID
            const nikahId = application.details.certificate_number || applicationId;
            
            // Send to groom
            if (application.details.groomPhone) {
              console.log(`Sending SMS to groom: ${application.details.groomPhone}`);
              const { data, error: smsErr } = await supabase.functions.invoke('send-status-sms', {
                body: {
                  phone: application.details.groomPhone,
                  name: application.details.groomName,
                  application_id: nikahId,
                  status: statusText,
                  type: 'nikah',
                  reason: reason || undefined,
                },
              });
              if (smsErr) console.error('SMS to groom failed:', smsErr);
              else console.log('SMS to groom success:', data);
            } else {
              console.log('Groom phone not available');
            }
            if (application.details.groomEmail) {
              await supabase.functions.invoke('send-status-email', {
                body: {
                  email: application.details.groomEmail,
                  name: application.details.groomName,
                  application_id: nikahId,
                  status: statusText,
                  type: 'nikah',
                  reason: reason || undefined,
                },
              }).catch(err => console.error('Email to groom failed:', err));
            }
            // Send to bride
            if (application.details.bridePhone) {
              console.log(`Sending SMS to bride: ${application.details.bridePhone}`);
              const { data, error: smsErr } = await supabase.functions.invoke('send-status-sms', {
                body: {
                  phone: application.details.bridePhone,
                  name: application.details.brideName,
                  application_id: nikahId,
                  status: statusText,
                  type: 'nikah',
                  reason: reason || undefined,
                },
              });
              if (smsErr) console.error('SMS to bride failed:', smsErr);
              else console.log('SMS to bride success:', data);
            } else {
              console.log('Bride phone not available');
            }
            if (application.details.brideEmail) {
              await supabase.functions.invoke('send-status-email', {
                body: {
                  email: application.details.brideEmail,
                  name: application.details.brideName,
                  application_id: nikahId,
                  status: statusText,
                  type: 'nikah',
                  reason: reason || undefined,
                },
              }).catch(err => console.error('Email to bride failed:', err));
            }
          } else {
            // For other application types (shahada, residence, business)
            if (application.applicantPhone) {
              console.log(`Sending SMS to applicant: ${application.applicantPhone}`);
              const { data, error: smsErr } = await supabase.functions.invoke('send-status-sms', {
                body: {
                  phone: application.applicantPhone,
                  name: application.applicantName,
                  application_id: applicationId,
                  status: statusText,
                  type: application.type,
                  reason: reason || undefined,
                },
              });
              if (smsErr) console.error('SMS failed:', smsErr);
              else console.log('SMS success:', data);
            } else {
              console.log('Applicant phone not available');
            }
            if (application.applicantEmail && application.applicantEmail !== 'No email') {
              await supabase.functions.invoke('send-status-email', {
                body: {
                  email: application.applicantEmail,
                  name: application.applicantName,
                  application_id: applicationId,
                  status: statusText,
                  type: application.type,
                  reason: reason || undefined,
                },
              }).catch(err => console.error('Email failed:', err));
            }
          }
        } catch (notifyErr) {
          console.error('Status notification failed:', notifyErr);
          // Don't fail the whole operation if notification fails
        }
      }

      toast({
        title: 'Status Updated',
        description: `Application status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Failed to update application status:', error);
      toast({
        title: 'Failed to Update Status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setStatusUpdating(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Bulk status update
  const bulkUpdateStatus = async (newStatus, reason = '') => {
    try {
      if (bulkSelected.length === 0) return;

      const updatePromises = bulkSelected.map(appId => 
        updateApplicationStatus(appId, newStatus, reason)
      );

      await Promise.all(updatePromises);

      setBulkSelected([]);
      setShowBulkConfirm(false);
      setBulkAction('');
      setRejectionReason('');

      toast({
        title: 'Bulk Update Complete',
        description: `${bulkSelected.length} applications have been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Failed to bulk update status:', error);
      toast({
        title: 'Bulk Update Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  // Export applications
  const exportApplications = async (format = 'json') => {
    try {
      const exportData = filteredApplications.map(app => ({
        id: app.id,
        type: app.type,
        typeName: applicationTypes[app.type]?.title || app.type,
        applicantName: app.applicantName,
        applicantEmail: app.applicantEmail,
        applicantPhone: app.applicantPhone,
        status: app.status,
        submittedAt: app.submittedAt,
        lastUpdated: app.lastUpdated,
        ...app.details
      }));

      const content = format === 'csv' 
        ? [
            Object.keys(exportData[0] || {}).join(','),
            ...exportData.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
          ].join('\n')
        : JSON.stringify(exportData, null, 2);

      const blob = new Blob([content], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-export-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Applications have been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Failed to export applications:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  // Filter and paginate applications
  const filteredApplications = applications.filter(app => {
    const matchesType = filter === 'all' || app.type === filter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#059669',
      rejected: '#dc2626',
      processing: '#2563eb',
      completed: '#10b981',
      cancelled: '#6b7280'
    };
    return colors[status] || '#64748b';
  };

  // Toggle bulk selection
  const toggleBulkSelection = (applicationId) => {
    setBulkSelected(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    if (bulkSelected.length === paginatedApplications.length) {
      setBulkSelected([]);
    } else {
      setBulkSelected(paginatedApplications.map(app => app.id));
    }
  };

  // Load data on mount
  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">View All Applications</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => exportApplications('csv')}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportApplications('json')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export JSON
          </button>
          <button
            onClick={() => loadApplications()}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Application Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(applicationTypes).map(([type, config]) => {
          const count = applications.filter(app => app.type === type).length;
          const pendingCount = applications.filter(app => app.type === type && app.status === 'pending').length;
          
          return (
            <div key={type} className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">{config.icon}</div>
                <div className="text-xs text-muted-foreground">{count} total</div>
              </div>
              <h3 className="font-medium mb-1">{config.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{config.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-xs">
                  <span className="text-amber-600">{pendingCount} pending</span>
                </div>
                <button
                  onClick={() => setFilter(type)}
                  className={`text-xs px-2 py-1 rounded ${
                    filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          {Object.entries(applicationTypes).map(([type, config]) => (
            <option key={type} value={type}>{config.title}</option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <span className="text-sm">{bulkSelected.length} items selected</span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setBulkAction('approved');
                setShowBulkConfirm(true);
              }}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve Selected
            </button>
            <button
              onClick={() => {
                setBulkAction('rejected');
                setShowBulkConfirm(true);
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject Selected
            </button>
            <button
              onClick={() => setBulkSelected([])}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-muted"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg mb-2">📋</div>
            <div>No applications found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      checked={bulkSelected.length === paginatedApplications.length && paginatedApplications.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-3 text-sm font-medium">Type</th>
                  <th className="text-left p-3 text-sm font-medium">Applicant</th>
                  <th className="text-left p-3 text-sm font-medium">Contact</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Submitted</th>
                  <th className="text-left p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((application) => {
                  const typeConfig = applicationTypes[application.type];
                  
                  return (
                    <tr key={application.id} className="border-t border-border hover:bg-muted/50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={bulkSelected.includes(application.id)}
                          onChange={() => toggleBulkSelection(application.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span>{typeConfig?.icon}</span>
                          <div>
                            <div className="text-sm font-medium">{typeConfig?.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-sm">{application.applicantName}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{application.applicantEmail}</div>
                          {application.applicantPhone && (
                            <div className="text-muted-foreground">{application.applicantPhone}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getStatusColor(application.status) }}
                          ></div>
                          <span 
                            className="text-sm font-medium capitalize"
                            style={{ color: getStatusColor(application.status) }}
                          >
                            {application.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowDetailsModal(true);
                            }}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            View
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateApplicationStatus(application.id, 'approved')}
                                disabled={statusUpdating[application.id]}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectionTarget(application.id);
                                  setShowRejectionModal(true);
                                }}
                                disabled={statusUpdating[application.id]}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <DetailsModal
          application={selectedApplication}
          applicationTypes={applicationTypes}
          onClose={() => setShowDetailsModal(false)}
          onUpdateStatus={(status, reason) => {
            updateApplicationStatus(selectedApplication.id, status, reason);
            setShowDetailsModal(false);
          }}
        />
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <RejectionModal
          onConfirm={(reason) => {
            updateApplicationStatus(rejectionTarget, 'rejected', reason);
            setShowRejectionModal(false);
            setRejectionTarget(null);
          }}
          onCancel={() => {
            setShowRejectionModal(false);
            setRejectionTarget(null);
          }}
        />
      )}

      {/* Bulk Confirmation Modal */}
      {showBulkConfirm && (
        <BulkConfirmModal
          action={bulkAction}
          count={bulkSelected.length}
          onConfirm={(reason) => {
            bulkUpdateStatus(bulkAction, reason);
          }}
          onCancel={() => {
            setShowBulkConfirm(false);
            setBulkAction('');
            setRejectionReason('');
          }}
        />
      )}
    </div>
  );
}

// Details Modal Component
function DetailsModal({ application, applicationTypes, onClose, onUpdateStatus }) {
  const [status, setStatus] = useState(application.status);
  const [reason, setReason] = useState('');
  const [showRawData, setShowRawData] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{url: string, label: string} | null>(null);

  const handleStatusUpdate = () => {
    if (status === 'rejected' && !reason.trim()) {
      return;
    }
    onUpdateStatus(status, reason);
  };

  const typeConfig = applicationTypes[application.type];
  const details = application.details || {};

  // Get available statuses based on application type
  const getAvailableStatuses = () => {
    if (application.type === 'nikah') {
      return ['pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled', 'denied', 'delivered'];
    }
    return ['pending', 'processing', 'approved', 'rejected'];
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate reference number
  const referenceNumber = details.referenceNumber || `NIK-${application.id?.slice(0, 8).toUpperCase() || '00000000'}`;

  const isNikah = application.type === 'nikah';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{typeConfig?.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{typeConfig?.title} Preview</h3>
                  <p className="text-sm text-muted-foreground">{typeConfig?.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-muted-foreground">
                  Ref: <span className="font-mono font-medium">{referenceNumber}</span>
                </span>
                <span className="text-muted-foreground">
                  Submitted: {formatDate(application.submittedAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)} capitalize`}>
                {application.status}
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Certificate Actions */}
          {isNikah && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCertificatePreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Certificate
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-muted rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {isNikah ? (
            <>
              {/* SECTION 1: Couple Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bride Card */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-xl border border-pink-200 dark:border-pink-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">👰</span>
                    <h4 className="font-semibold text-pink-800 dark:text-pink-200">Bride Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                      <p className="text-sm font-medium">{details.brideName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                      <p className="text-sm">{details.brideEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                      <p className="text-sm">{details.bridePhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Groom Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🤵</span>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Groom Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                      <p className="text-sm font-medium">{details.groomName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                      <p className="text-sm">{details.groomEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                      <p className="text-sm">{details.groomPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Marriage Details */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📅</span>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">Marriage Details</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preferred Date</label>
                    <p className="text-sm font-medium">{formatDate(details.preferredDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preferred Time</label>
                    <p className="text-sm font-medium">{details.preferredTime || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mosque</label>
                    <p className="text-sm font-medium">{details.preferredMasjid || details.mosqueName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</label>
                    <p className="text-sm">{details.location || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Application Status */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📄</span>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">Application Status</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Status</label>
                    <p className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColor(application.status)} capitalize mt-1`}>
                      {application.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Status</label>
                    <p className="text-sm font-medium mt-1">
                      <span className={`inline-flex items-center gap-1 ${details.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {details.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Certificate No.</label>
                    <p className="text-sm font-medium font-mono mt-1">{details.certificateNumber || 'Not issued'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reference</label>
                    <p className="text-sm font-medium font-mono mt-1">{referenceNumber}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Attached Documents */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📎</span>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200">Attached Documents</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'HIV Test (HV/SIDA)', url: details.hivTestUrl },
                    { label: "Groom's Valid ID", url: details.groomIdDocumentUrl },
                    { label: "Bride's Valid ID", url: details.brideIdDocumentUrl },
                    { label: "Groom's Birth Certificate", url: details.groomBirthCertUrl },
                    { label: "Bride's Birth Certificate", url: details.brideBirthCertUrl },
                    { label: "Groom's Passport Photos", url: details.groomPassportPhotoUrl },
                    { label: "Bride's Passport Photos", url: details.bridePassportPhotoUrl },
                  ].map((doc, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${doc.url ? 'bg-white dark:bg-background border-purple-200 dark:border-purple-800' : 'bg-muted/50 border-border'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{doc.url ? '📄' : '❌'}</span>
                        <span className={`text-sm font-medium truncate ${doc.url ? 'text-purple-700 dark:text-purple-300' : 'text-muted-foreground'}`}>
                          {doc.label}
                        </span>
                      </div>
                      {doc.url ? (
                        <button
                          onClick={() => setPreviewDoc({ url: doc.url!, label: doc.label })}
                          className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground px-2">Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Generic Application Details for non-Nikah */
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Applicant Name</label>
                <p className="text-sm font-medium">{application.applicantName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{application.applicantEmail}</p>
              </div>
              {application.applicantPhone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{application.applicantPhone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm capitalize">{application.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                <p className="text-sm">{formatDate(application.submittedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(application.lastUpdated)}</p>
              </div>
            </div>
          )}

          {/* View Raw Data Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {showRawData ? 'Hide Raw Data' : 'View Raw Data'}
            </button>
          </div>

          {/* Raw Data Section */}
          {showRawData && (
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Application Data (JSON)</label>
              <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap">{JSON.stringify(application.details, null, 2)}</pre>
            </div>
          )}

          {/* Status Management */}
          <div className="border-t border-border pt-6">
            <label className="text-sm font-medium text-foreground mb-3 block">Update Application Status</label>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="flex-1 h-10 rounded-lg border border-input bg-background px-3"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {getAvailableStatuses().map(statusOption => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleStatusUpdate}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Update Status
                </button>
              </div>
              
              {status === 'rejected' && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                  <textarea
                    className="w-full h-24 rounded-lg border border-input bg-background px-3 py-2 mt-1 resize-none"
                    placeholder="Please provide a reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Certificate Preview Modal */}
        {showCertificatePreview && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Certificate Header */}
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Nikah Certificate Preview</h3>
                  <button
                    onClick={() => setShowCertificatePreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Certificate Design */}
                <div className="border-4 border-double border-amber-600 p-8 bg-gradient-to-b from-amber-50 to-white rounded-lg relative">
                  {/* Decorative corners */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

                  <div className="text-center">
                    {/* Islamic Header */}
                    <div className="mb-4">
                      <p className="text-lg font-serif text-amber-800 mb-2">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                      <p className="text-xs text-gray-600">In the name of Allah, the Most Gracious, the Most Merciful</p>
                    </div>

                    <h2 className="text-3xl font-bold text-amber-800 mb-2 font-serif">Certificate of Nikah</h2>
                    <div className="w-24 h-1 bg-amber-600 mx-auto mb-6" />

                    {/* Certificate Content */}
                    <div className="space-y-4 text-left">
                      <p className="text-gray-700">
                        This is to certify that the marriage (Nikah) has been solemnized between:
                      </p>

                      <div className="grid grid-cols-2 gap-6 my-6">
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Groom</p>
                          <p className="text-xl font-bold text-gray-800">{details.groomName || '_______________'}</p>
                        </div>
                        <div className="text-center p-4 bg-pink-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bride</p>
                          <p className="text-xl font-bold text-gray-800">{details.brideName || '_______________'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Date of Nikah:</span>
                          <span className="ml-2 font-medium">{formatDate(details.preferredDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Place:</span>
                          <span className="ml-2 font-medium">{details.preferredMasjid || details.mosqueName || '_______________'}</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-amber-200">
                        <p className="text-sm text-gray-600 italic">
                          This certificate is issued under the authority of the Rwanda Islamic Community
                        </p>
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-3 gap-4 mt-8 pt-8">
                        <div className="text-center">
                          <div className="border-t border-gray-400 pt-2">
                            <p className="text-xs text-gray-500">Imam/Witness</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="border-t border-gray-400 pt-2">
                            <p className="text-xs text-gray-500">Groom Signature</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="border-t border-gray-400 pt-2">
                            <p className="text-xs text-gray-500">Bride Signature</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Number */}
                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-400">Certificate No: {details.certificateNumber || referenceNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Actions */}
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Certificate
                  </button>
                  <button
                    onClick={() => setShowCertificatePreview(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[70]">
            <div className="bg-white dark:bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  {previewDoc.label}
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://olpvftgnmycofavltxoa.supabase.co/storage/v1/object/public/nikah-documents/${previewDoc.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Open in New Tab
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Document Preview */}
              <div className="flex-1 overflow-auto p-4 bg-muted/30">
                {previewDoc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  // Image preview
                  <img
                    src={`https://olpvftgnmycofavltxoa.supabase.co/storage/v1/object/public/nikah-documents/${previewDoc.url}`}
                    alt={previewDoc.label}
                    className="max-w-full mx-auto rounded-lg shadow-lg"
                  />
                ) : previewDoc.url.match(/\.pdf$/i) ? (
                  // PDF preview
                  <iframe
                    src={`https://olpvftgnmycofavltxoa.supabase.co/storage/v1/object/public/nikah-documents/${previewDoc.url}`}
                    className="w-full h-[70vh] rounded-lg border border-border"
                    title={previewDoc.label}
                  />
                ) : (
                  // Generic file download
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg font-medium mb-2">{previewDoc.label}</p>
                    <p className="text-sm text-muted-foreground mb-4">This file type cannot be previewed</p>
                    <a
                      href={`https://olpvftgnmycofavltxoa.supabase.co/storage/v1/object/public/nikah-documents/${previewDoc.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Rejection Modal Component
function RejectionModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg border border-border max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please provide a reason for rejecting this application.
          </p>
          <textarea
            className="w-full h-24 rounded-md border border-input bg-background px-3 py-2"
            placeholder="Enter rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-border rounded hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bulk Confirmation Modal Component
function BulkConfirmModal({ action, count, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (action === 'rejected' && !reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg border border-border max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {action === 'approved' ? 'Approve' : 'Reject'} {count} Applications
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to {action} {count} selected applications?
          </p>
          
          {action === 'rejected' && (
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
              <textarea
                className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 mt-1"
                placeholder="Enter rejection reason for all selected applications..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-border rounded hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={action === 'rejected' && !reason.trim()}
              className={`px-4 py-2 text-sm text-white rounded hover:opacity-90 disabled:opacity-50 ${
                action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action === 'approved' ? 'Approve' : 'Reject'} {count} Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
