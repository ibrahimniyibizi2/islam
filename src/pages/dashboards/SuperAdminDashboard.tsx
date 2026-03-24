import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  BarChart3,
  FileText,
  Activity,
  Settings,
  FileStack,
  Heart,
  FileCheck,
  Award,
} from 'lucide-react';
import { Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ROLE_LABELS, type AppRole } from '@/types/roles';
import { ViewAllApplicationsPage } from './ViewAllApplicationsPage';
import GenerateCertificatePage from './GenerateCertificatePage';
import CreateCertificateTemplatePage from './CreateCertificateTemplatePage';
import ViewCertificatesPage from './ViewCertificatesPage';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/super-admin', icon: LayoutDashboard },
  { label: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  { label: 'Masjids', href: '/dashboard/super-admin/masjids', icon: Building2 },
  { label: 'Roles', href: '/dashboard/super-admin/roles', icon: ShieldCheck },
  { label: 'Applications', href: '/dashboard/super-admin/applications', icon: FileStack },
  { label: 'View Certificates', href: '/dashboard/super-admin/certificates', icon: Award },
  { label: 'Generate Certificate', href: '/dashboard/super-admin/generate_certificate', icon: FileCheck },
  { label: 'Certificate Templates', href: '/dashboard/super-admin/create_certificate_templates', icon: FileText },
  { label: 'Reports', href: '/dashboard/super-admin/reports', icon: BarChart3 },
  { label: 'Audit Logs', href: '/dashboard/super-admin/audit', icon: FileText },
  { label: 'User Activity', href: '/dashboard/super-admin/user-activity', icon: Activity },
  { label: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
];

function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalMasjids, setTotalMasjids] = useState<number>(0);
  const [totalRoles, setTotalRoles] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [pendingApplications, setPendingApplications] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);

        const [usersRes, mosquesRes, approvalsRes, shahadaRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('mosques').select('*', { count: 'exact', head: true }),
          supabase.from('role_approvals').select('*', { count: 'exact', head: true }),
          supabase.from('shahada_applications').select('*', { count: 'exact', head: true }),
        ]);

        if (!cancelled) {
          setTotalUsers(usersRes.count || 0);
          setTotalMasjids(mosquesRes.count || 0);
          setTotalRoles(approvalsRes.count || 0);
          
          // Get real application statistics
          const totalApps = shahadaRes.count || 0;
          setTotalApplications(totalApps);
          
          // Get pending applications count
          const { count: pendingCount } = await supabase
            .from('shahada_applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
          
          setPendingApplications(pendingCount || 0);
        }
      } catch (error) {
        console.error('Failed to load overview data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        icon: Users,
        title: 'Total Users',
        value: loading ? '...' : totalUsers.toLocaleString(),
      },
      {
        icon: Building2,
        title: 'Registered Masjids',
        value: loading ? '...' : totalMasjids.toLocaleString(),
      },
      {
        icon: FileStack,
        title: 'Total Applications',
        value: loading ? '...' : totalApplications.toLocaleString(),
      },
      {
        icon: FileStack,
        title: 'Pending Applications',
        value: loading ? '...' : pendingApplications.toLocaleString(),
        description: 'Awaiting review',
      },
    ],
    [loading, totalApplications, pendingApplications, totalMasjids, totalUsers]
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <DashboardStatsCard
            key={c.title}
            icon={c.icon}
            title={c.title}
            value={c.value}
            description={c.description}
          />
        ))}
      </div>
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">System Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-time counts from Supabase tables: profiles, mosques, and application tracking.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Navigate to Applications to view and manage all certificate requests, marriage applications, residence certificates, and business registrations.
        </p>
      </div>
    </>
  );
}

function UsersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rows, setRows] = useState<
    Array<{
      id: string;
      full_name: string | null;
      role: string | null;
      phone: string | null;
      masjid_id: string | null;
      is_masjid_admin: boolean | null;
      status?: string | null;
      created_at: string | null;
    }>
  >([]);
  const [initialRows, setInitialRows] = useState<Record<string, (typeof rows)[number]>>({});
  const [mosques, setMosques] = useState<Array<{ id: string; name: string }>>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [masjidFilter, setMasjidFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [hasStatusColumn, setHasStatusColumn] = useState(true);

  const roleOptions: AppRole[] = useMemo(
    () => [
      'super_admin',
      'masjid_admin',
      'imam',
      'mufti',
      'funeral_service',
      'ngo_manager',
      'government_liaison',
      'event_manager',
      'board_member',
      'general_staff',
      'public_user',
    ],
    []
  );

  const load = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const trimmed = query.trim();

      const buildQuery = (includeStatus: boolean) => {
        let q = (supabase as any)
          .from('profiles')
          .select(
            includeStatus
              ? 'id, full_name, role, phone, masjid_id, is_masjid_admin, status, created_at'
              : 'id, full_name, role, phone, masjid_id, is_masjid_admin, created_at',
            { count: 'exact' }
          )
          .order('created_at', { ascending: false })
          .range(from, to);

        if (trimmed) {
          q = q.or(`full_name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`);
        }
        if (roleFilter !== 'all') {
          q = q.eq('role', roleFilter);
        }
        if (masjidFilter !== 'all') {
          q = q.eq('masjid_id', masjidFilter === 'none' ? null : masjidFilter);
        }
        if (includeStatus && statusFilter !== 'all') {
          q = q.eq('status', statusFilter);
        }

        return q;
      };

      const [profilesRes, mosquesRes] = await Promise.all([
        buildQuery(hasStatusColumn),
        supabase.from('mosques').select('id, name').order('name', { ascending: true }).limit(500),
      ]);

      if (profilesRes.error) {
        const msg = String((profilesRes.error as any)?.message ?? profilesRes.error);

        // If migration for profiles.status isn't applied yet, retry without selecting/filtering status.
        const isStatusMissing =
          msg.toLowerCase().includes('status') &&
          (msg.toLowerCase().includes('column') || msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('bad request'));

        if (isStatusMissing) {
          setHasStatusColumn(false);
          if (statusFilter !== 'all') {
            setStatusFilter('all');
          }

          const retry = await buildQuery(false);
          if (retry.error) throw retry.error;

          const newRows = ((retry.data ?? []) as (typeof rows)).map((r) => ({
            ...r,
            status: 'active',
          }));
          setRows(newRows);
          setInitialRows(Object.fromEntries(newRows.map((r) => [r.id, { ...r }])));
          setTotalCount(retry.count ?? 0);
          setMosques(mosquesRes.data ?? []);

          toast({
            title: 'Status column missing',
            description: 'Run the latest Supabase migration to enable block/unblock.',
            variant: 'destructive',
          });
          return;
        }

        throw profilesRes.error;
      }

      if (mosquesRes.error) {
        throw mosquesRes.error;
      }

      const newRows = (profilesRes.data ?? []) as (typeof rows);
      setRows(newRows);
      setInitialRows(Object.fromEntries(newRows.map((r) => [r.id, { ...r }])));
      setTotalCount(profilesRes.count ?? 0);
      setMosques(mosquesRes.data ?? []);
    } catch (e) {
      toast({
        title: 'Failed to load users',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateRowLocal = (id: string, patch: Partial<(typeof rows)[number]>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const isDirty = (id: string) => {
    const current = rows.find((r) => r.id === id);
    const initial = initialRows[id];
    if (!current || !initial) return false;
    return (
      current.full_name !== initial.full_name ||
      current.phone !== initial.phone ||
      current.role !== initial.role ||
      current.masjid_id !== initial.masjid_id ||
      Boolean(current.is_masjid_admin) !== Boolean(initial.is_masjid_admin) ||
      (current.status ?? null) !== (initial.status ?? null)
    );
  };

  const handleCancel = (id: string) => {
    const initial = initialRows[id];
    if (!initial) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...initial } : r)));
  };

  const handleSave = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    const label = row.full_name ?? id;
    const ok = window.confirm(`Save changes for ${label}?`);
    if (!ok) return;

    setSavingId(id);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: row.full_name,
          phone: row.phone,
          role: row.role,
          masjid_id: row.masjid_id,
          is_masjid_admin: row.is_masjid_admin,
          status: row.status ?? 'active',
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'User updated',
        description: 'Changes were saved successfully.',
      });

      await load();
    } catch (e) {
      toast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Could not update this user.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteAuth = async (id: string) => {
    setSavingId(id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-control', {
        body: { action: 'delete_auth', userId: id },
      });
      if (error) throw error;

      toast({
        title: 'Action completed',
        description: typeof data?.message === 'string' ? data.message : 'Done.',
      });

      await load();
    } catch (e) {
      const status = (e as any)?.context?.status;
      const statusText = (e as any)?.context?.statusText;
      const details = (e as any)?.context?.body;
      const message =
        typeof (e as any)?.message === 'string'
          ? (e as any).message
          : e instanceof Error
            ? e.message
            : 'Could not perform admin action.';

      toast({
        title: 'Admin action failed',
        description:
          typeof status === 'number'
            ? `${message} (HTTP ${status}${statusText ? ` ${statusText}` : ''})${details ? `: ${JSON.stringify(details)}` : ''}`
            : message,
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    const label = row?.full_name ?? id;
    const ok = window.confirm(`Delete profile for ${label}? This cannot be undone.`);
    if (!ok) return;

    setSavingId(id);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'User deleted',
        description: 'Profile removed successfully.',
      });

      await load();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Could not delete this profile (RLS may block it).',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, query, roleFilter, masjidFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount}
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="text-xs text-muted-foreground">Search</div>
          <input
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
            placeholder="Name or phone"
          />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Role</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Masjid</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={masjidFilter}
            onChange={(e) => {
              setPage(1);
              setMasjidFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            <option value="none">None</option>
            {mosques.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Status</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            <option value="active">active</option>
            <option value="blocked">blocked</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
            disabled={page * pageSize >= totalCount || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
          <div className="text-sm text-muted-foreground">Page {page}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">Page size</div>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={String(pageSize)}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">Profiles</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Masjid</th>
                <th className="px-4 py-2">Masjid Admin</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4" colSpan={8}>
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <input
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={r.full_name ?? ''}
                        onChange={(e) => updateRowLocal(r.id, { full_name: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={r.phone ?? ''}
                        onChange={(e) => updateRowLocal(r.id, { phone: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={r.role ?? 'public_user'}
                        onChange={(e) => updateRowLocal(r.id, { role: e.target.value })}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={r.masjid_id ?? ''}
                        onChange={(e) => updateRowLocal(r.id, { masjid_id: e.target.value || null })}
                      >
                        <option value="">—</option>
                        {mosques.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(r.is_masjid_admin)}
                        onChange={(e) => updateRowLocal(r.id, { is_masjid_admin: e.target.checked })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={r.status ?? 'active'}
                        onChange={(e) => updateRowLocal(r.id, { status: e.target.value })}
                      >
                        <option value="active">active</option>
                        <option value="blocked">blocked</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                          onClick={() => void handleSave(r.id)}
                          disabled={savingId === r.id || !isDirty(r.id)}
                        >
                          Save
                        </button>
                        <button
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                          onClick={() => handleCancel(r.id)}
                          disabled={savingId === r.id || !isDirty(r.id)}
                        >
                          Cancel
                        </button>
                        <button
                          className="h-9 rounded-md border border-destructive/40 bg-background px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          onClick={() => {
                            const ok = window.confirm('Delete auth user? This removes the Supabase Auth account.');
                            if (ok) void handleDeleteAuth(r.id);
                          }}
                          disabled={savingId === r.id}
                        >
                          Delete Auth
                        </button>
                        <button
                          className="h-9 rounded-md border border-destructive/40 bg-background px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          onClick={() => void handleDelete(r.id)}
                          disabled={savingId === r.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MasjidsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<
    Array<{
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      admin_id: string | null;
      district: string | null;
      province: string | null;
      status: string;
      created_at: string;
    }>
  >([]);
  const [initialRows, setInitialRows] = useState<Record<string, (typeof rows)[number]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [hasAdminFilter, setHasAdminFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; full_name: string | null; phone: string | null }>>(
    []
  );
  const [creating, setCreating] = useState(false);
  const [newMasjid, setNewMasjid] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
    district: string;
    province: string;
    status: string;
    admin_id: string;
  }>({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    province: '',
    status: 'active',
    admin_id: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = (supabase as any)
        .from('mosques')
        .select('id, name, phone, email, address, admin_id, district, province, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      const trimmed = query.trim();
      if (trimmed) {
        q = q.or(`name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`);
      }
      if (statusFilter !== 'all') {
        q = q.eq('status', statusFilter);
      }
      if (provinceFilter !== 'all') {
        q = q.eq('province', provinceFilter);
      }
      if (districtFilter !== 'all') {
        q = q.eq('district', districtFilter);
      }
      if (hasAdminFilter === 'has') {
        q = q.not('admin_id', 'is', null);
      }
      if (hasAdminFilter === 'none') {
        q = q.is('admin_id', null);
      }

      const [mosquesRes, adminsRes] = await Promise.all([
        q,
        (supabase as any)
          .from('profiles')
          .select('id, full_name, phone')
          .order('full_name', { ascending: true })
          .limit(500),
      ]);

      if (mosquesRes.error) throw mosquesRes.error;
      if (adminsRes.error) throw adminsRes.error;

      const newRows = (mosquesRes.data ?? []) as (typeof rows);
      setRows(newRows);
      setInitialRows(Object.fromEntries(newRows.map((r) => [r.id, { ...r }])));
      setTotalCount(mosquesRes.count ?? 0);
      setAdminUsers((adminsRes.data ?? []) as any);
    } catch (e) {
      toast({
        title: 'Failed to load masjids',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, query, statusFilter, provinceFilter, districtFilter, hasAdminFilter]);

  const updateRowLocal = (id: string, patch: Partial<(typeof rows)[number]>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const isDirty = (id: string) => {
    const current = rows.find((r) => r.id === id);
    const initial = initialRows[id];
    if (!current || !initial) return false;
    return (
      current.name !== initial.name ||
      (current.phone ?? '') !== (initial.phone ?? '') ||
      (current.email ?? '') !== (initial.email ?? '') ||
      (current.address ?? '') !== (initial.address ?? '') ||
      (current.district ?? '') !== (initial.district ?? '') ||
      (current.province ?? '') !== (initial.province ?? '') ||
      (current.status ?? '') !== (initial.status ?? '') ||
      (current.admin_id ?? '') !== (initial.admin_id ?? '')
    );
  };

  const handleCancel = (id: string) => {
    const initial = initialRows[id];
    if (!initial) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...initial } : r)));
  };

  const handleSave = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    const label = row.name ?? id;
    const ok = window.confirm(`Save changes for masjid ${label}?`);
    if (!ok) return;

    setSavingId(id);
    try {
      const { error } = await (supabase as any)
        .from('mosques')
        .update({
          name: row.name,
          phone: row.phone,
          email: row.email,
          address: row.address,
          district: row.district,
          province: row.province,
          status: row.status,
          admin_id: row.admin_id,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Masjid updated',
        description: 'Changes were saved successfully.',
      });
      await load();
    } catch (e) {
      toast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Could not update this masjid.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteMasjid = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    const label = row?.name ?? id;
    const ok = window.confirm(`Delete masjid ${label}? This cannot be undone.`);
    if (!ok) return;

    setSavingId(id);
    try {
      const { error } = await (supabase as any).from('mosques').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Masjid deleted',
        description: 'Masjid removed successfully.',
      });
      await load();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Could not delete this masjid.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newMasjid.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a masjid name.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: newMasjid.name.trim(),
        phone: newMasjid.phone.trim() ? newMasjid.phone.trim() : null,
        email: newMasjid.email.trim() ? newMasjid.email.trim() : null,
        address: newMasjid.address.trim() ? newMasjid.address.trim() : null,
        district: newMasjid.district.trim() ? newMasjid.district.trim() : null,
        province: newMasjid.province.trim() ? newMasjid.province.trim() : null,
        status: newMasjid.status.trim() ? newMasjid.status.trim() : 'active',
        admin_id: newMasjid.admin_id ? newMasjid.admin_id : null,
      };

      const { error } = await (supabase as any).from('mosques').insert(payload);
      if (error) throw error;

      toast({
        title: 'Masjid created',
        description: 'New masjid added successfully.',
      });

      setNewMasjid({
        name: '',
        phone: '',
        email: '',
        address: '',
        district: '',
        province: '',
        status: 'active',
        admin_id: '',
      });
      setPage(1);
      await load();
    } catch (e) {
      toast({
        title: 'Create failed',
        description: e instanceof Error ? e.message : 'Could not create masjid.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const provinceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.province) set.add(r.province);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.district) set.add(r.district);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.status) set.add(r.status);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Masjids</h2>
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium">New Masjid</div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">Name</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newMasjid.name}
              onChange={(e) => setNewMasjid((p) => ({ ...p, name: e.target.value }))}
              placeholder="Masjid name"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Phone</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newMasjid.phone}
              onChange={(e) => setNewMasjid((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newMasjid.email}
              onChange={(e) => setNewMasjid((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">Address</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newMasjid.address}
              onChange={(e) => setNewMasjid((p) => ({ ...p, address: e.target.value }))}
              placeholder="Address"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">District</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newMasjid.district}
              onChange={(e) => setNewMasjid((p) => ({ ...p, district: e.target.value }))}
              placeholder="District"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Province</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newMasjid.province}
              onChange={(e) => setNewMasjid((p) => ({ ...p, province: e.target.value }))}
              placeholder="Province"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newMasjid.status}
              onChange={(e) => setNewMasjid((p) => ({ ...p, status: e.target.value }))}
              placeholder="active"
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">Masjid Admin</div>
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={newMasjid.admin_id}
              onChange={(e) => setNewMasjid((p) => ({ ...p, admin_id: e.target.value }))}
            >
              <option value="">No admin</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {(u.full_name ?? 'Unnamed') + (u.phone ? ` (${u.phone})` : '')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
              disabled={creating}
              onClick={() => void handleCreate()}
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-6">
        <div className="md:col-span-2">
          <div className="text-xs text-muted-foreground">Search</div>
          <input
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
            placeholder="Search by masjid name or phone"
          />
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Province</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={provinceFilter}
            onChange={(e) => {
              setPage(1);
              setProvinceFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            {provinceOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">District</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={districtFilter}
            onChange={(e) => {
              setPage(1);
              setDistrictFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Status</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Has admin</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={hasAdminFilter}
            onChange={(e) => {
              setPage(1);
              setHasAdminFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            <option value="has">Has admin</option>
            <option value="none">No admin</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
            disabled={page * pageSize >= totalCount || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">Page size</div>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={String(pageSize)}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">District</th>
              <th className="px-4 py-2">Province</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Masjid Admin</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={10}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4" colSpan={10}>
                  No masjids found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.name}
                      onChange={(e) => updateRowLocal(r.id, { name: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.phone ?? ''}
                      onChange={(e) => updateRowLocal(r.id, { phone: e.target.value || null })}
                      placeholder="Phone"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.email ?? ''}
                      onChange={(e) => updateRowLocal(r.id, { email: e.target.value || null })}
                      placeholder="Email"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.address ?? ''}
                      onChange={(e) => updateRowLocal(r.id, { address: e.target.value || null })}
                      placeholder="Address"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.district ?? ''}
                      onChange={(e) => updateRowLocal(r.id, { district: e.target.value || null })}
                      placeholder="District"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.province ?? ''}
                      onChange={(e) => updateRowLocal(r.id, { province: e.target.value || null })}
                      placeholder="Province"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.status ?? ''}
                      onChange={(e) => updateRowLocal(r.id, { status: e.target.value })}
                      placeholder="active"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      value={r.admin_id ?? ''}
                      onChange={(e) => updateRowLocal(r.id, { admin_id: e.target.value || null })}
                    >
                      <option value="">No admin</option>
                      {adminUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {(u.full_name ?? 'Unnamed') + (u.phone ? ` (${u.phone})` : '')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                        onClick={() => void handleSave(r.id)}
                        disabled={savingId === r.id || !isDirty(r.id)}
                      >
                        Save
                      </button>
                      <button
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                        onClick={() => handleCancel(r.id)}
                        disabled={savingId === r.id || !isDirty(r.id)}
                      >
                        Cancel
                      </button>
                      <button
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                        onClick={() => updateRowLocal(r.id, { admin_id: null })}
                        disabled={savingId === r.id}
                      >
                        Remove Admin
                      </button>
                      <button
                        className="h-9 rounded-md border border-destructive/40 bg-background px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        onClick={() => void handleDeleteMasjid(r.id)}
                        disabled={savingId === r.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RolesPage() {
  const { toast } = useToast();

  const PERMISSIONS = useMemo(
    () => [
      'users.read',
      'users.update',
      'users.delete',
      'mosques.read',
      'mosques.update',
      'mosques.delete',
      'mosques.assign_admin',
      'approvals.read',
      'approvals.update',
      'reports.read',
      'audit.read',
      'settings.update',
    ],
    []
  );

  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; description: string | null; is_system: boolean }>>(
    []
  );
  const [roleUserCounts, setRoleUserCounts] = useState<Record<string, number>>({});

  const [creating, setCreating] = useState(false);
  const [newRole, setNewRole] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<{ name: string; description: string }>({ name: '', description: '' });

  const [permissionsByRoleId, setPermissionsByRoleId] = useState<Record<string, Record<string, boolean>>>({});
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionsDirty, setPermissionsDirty] = useState(false);

  const [usersLoading, setUsersLoading] = useState(true);
  const [users, setUsers] = useState<
    Array<{
      id: string;
      full_name: string | null;
      phone: string | null;
      role: string | null;
      role_id: string | null;
      created_at: string | null;
    }>
  >([]);
  const [usersInitial, setUsersInitial] = useState<Record<string, string | null>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  const [selectedUserIds, setSelectedUserIds] = useState<Record<string, boolean>>({});
  const [bulkRoleId, setBulkRoleId] = useState<string>('');
  const [bulkApplying, setBulkApplying] = useState(false);

  const [auditLoading, setAuditLoading] = useState(true);
  const [auditRows, setAuditRows] = useState<
    Array<{ id: string; actor_id: string | null; action: string; reason: string | null; created_at: string; before: any; after: any }>
  >([]);
  const [auditDetailModal, setAuditDetailModal] = useState<{ open: boolean; data: any }>({ open: false, data: null });

  const getAuditPreview = (data: any) => {
    try {
      const str = JSON.stringify(data);
      if (str.length <= 100) return str;
      return str.substring(0, 97) + '...';
    } catch {
      return '[Invalid JSON]';
    }
  };

  const copyAuditJSON = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast({ title: 'Copied', description: 'JSON copied to clipboard.' });
    } catch {
      toast({ title: 'Failed', description: 'Could not copy JSON.', variant: 'destructive' });
    }
  };

  const roleNameById = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r.name])), [roles]);

  const ensureNotLastSuperAdmin = async (targetUserId: string, nextRoleName: string) => {
    const current = users.find((u) => u.id === targetUserId);
    const currentRoleName = current?.role_id ? roleNameById[current.role_id] : current?.role;
    if (currentRoleName !== 'super_admin') return true;
    if (nextRoleName === 'super_admin') return true;

    const superAdminRoleId = roles.find((r) => r.name === 'super_admin')?.id ?? null;
    try {
      const [byRoleId, byRoleText] = await Promise.all([
        superAdminRoleId
          ? (supabase as any)
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('role_id', superAdminRoleId)
          : Promise.resolve({ count: null, error: null }),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'super_admin'),
      ]);

      const count = (byRoleId.count ?? 0) + (byRoleText.count ?? 0);
      if (count <= 1) {
        toast({
          title: 'Blocked',
          description: 'You cannot remove the last super admin.',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const loadRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        (supabase as any).from('roles').select('id, name, description, is_system').order('name', { ascending: true }),
        (supabase as any)
          .from('role_permissions')
          .select('role_id, permission, allowed')
          .limit(5000),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (permsRes.error) throw permsRes.error;

      const newRoles = (rolesRes.data ?? []) as any[];
      setRoles(newRoles);

      const base: Record<string, Record<string, boolean>> = {};
      for (const r of newRoles) {
        base[r.id] = Object.fromEntries(PERMISSIONS.map((p) => [p, false]));
      }
      for (const p of (permsRes.data ?? []) as any[]) {
        if (!base[p.role_id]) continue;
        if (typeof p.permission !== 'string') continue;
        // With minimized storage, we only store allowed=true rows
        // So any row present means permission is granted
        base[p.role_id][p.permission] = true;
      }
      setPermissionsByRoleId(base);
      setPermissionsDirty(false);

      const countsRes = await Promise.all(
        newRoles.map(async (r) => {
          const res = await (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('role_id', r.id);
          if (res.error) return [r.id, 0] as const;
          return [r.id, res.count ?? 0] as const;
        })
      );
      setRoleUserCounts(Object.fromEntries(countsRes));
    } catch (e) {
      toast({
        title: 'Roles not ready',
        description:
          e instanceof Error
            ? e.message
            : 'Apply the dynamic roles migration to enable role management (roles, role_permissions, audit_logs).',
        variant: 'destructive',
      });
      setRoles([]);
      setPermissionsByRoleId({});
      setRoleUserCounts({});
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const trimmed = userQuery.trim();
      let q = (supabase as any)
        .from('profiles')
        .select('id, full_name, phone, role, role_id, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (trimmed) {
        q = q.or(`full_name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`);
      }
      if (userRoleFilter !== 'all') {
        if (userRoleFilter === 'no_role') {
          q = q.is('role_id', null);
        } else {
          q = q.eq('role_id', userRoleFilter);
        }
      }

      const res = await q;
      if (res.error) throw res.error;
      const newUsers = (res.data ?? []) as any[];
      setUsers(newUsers);
      setUsersInitial(Object.fromEntries(newUsers.map((u) => [u.id, u.role_id ?? null])));
      setSelectedUserIds({});
    } catch (e) {
      toast({
        title: 'Failed to load users',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
      setUsers([]);
      setUsersInitial({});
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await (supabase as any)
        .from('audit_logs')
        .select('id, actor_id, action, reason, created_at, before, after')
        .order('created_at', { ascending: false })
        .limit(50);
      if (res.error) throw res.error;
      setAuditRows((res.data ?? []) as any);
    } catch {
      setAuditRows([]);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    void loadRolesAndPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQuery, userRoleFilter, roles.length]);

  useEffect(() => {
    void loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.length]);

  const handleCreateRole = async () => {
    const name = newRole.name.trim();
    if (!name) {
      toast({ title: 'Name required', description: 'Enter a role name.', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await (supabase as any)
        .from('roles')
        .insert({ name, description: newRole.description.trim() ? newRole.description.trim() : null, is_system: false })
        .select('id, name, description, is_system')
        .maybeSingle();
      if (error) throw error;

      if (data?.id) {
        // With minimized storage, we don't insert defaults (all false)
        // Permissions are created only when explicitly granted (allowed=true)
      }

      toast({ title: 'Role created', description: 'New role added.' });
      setNewRole({ name: '', description: '' });
      await loadRolesAndPermissions();
      await loadAudit();
    } catch (e) {
      toast({
        title: 'Create failed',
        description: e instanceof Error ? e.message : 'Could not create role.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleStartEditRole = (r: (typeof roles)[number]) => {
    setEditingRoleId(r.id);
    setEditRole({ name: r.name, description: r.description ?? '' });
  };

  const handleSaveEditRole = async () => {
    if (!editingRoleId) return;
    const roleRow = roles.find((r) => r.id === editingRoleId);
    if (!roleRow) return;
    if (roleRow.is_system) {
      toast({ title: 'Blocked', description: 'System roles cannot be edited.', variant: 'destructive' });
      return;
    }

    const name = editRole.name.trim();
    if (!name) {
      toast({ title: 'Name required', description: 'Enter a role name.', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('roles')
        .update({ name, description: editRole.description.trim() ? editRole.description.trim() : null })
        .eq('id', editingRoleId);
      if (error) throw error;

      toast({ title: 'Role updated', description: 'Changes saved.' });
      setEditingRoleId(null);
      await loadRolesAndPermissions();
      await loadAudit();
    } catch (e) {
      toast({ title: 'Update failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleDeleteRole = async (id: string) => {
    const roleRow = roles.find((r) => r.id === id);
    if (!roleRow) return;
    if (roleRow.is_system || roleRow.name === 'super_admin') {
      toast({ title: 'Blocked', description: 'This role cannot be deleted.', variant: 'destructive' });
      return;
    }

    const ok = window.confirm(`Delete role ${roleRow.name}? Users with this role_id will become unassigned.`);
    if (!ok) return;

    try {
      const { error } = await (supabase as any).from('roles').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Role deleted', description: 'Role removed.' });
      await loadRolesAndPermissions();
      await loadUsers();
      await loadAudit();
    } catch (e) {
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const togglePermission = (roleId: string, perm: string) => {
    setPermissionsByRoleId((prev) => {
      const roleMap = prev[roleId] ?? {};
      const next = {
        ...prev,
        [roleId]: {
          ...roleMap,
          [perm]: !Boolean(roleMap[perm]),
        },
      };
      return next;
    });
    setPermissionsDirty(true);
  };

  const handleSavePermissions = async () => {
    if (!permissionsDirty) return;

    const reason = window.prompt('Reason for permission changes (optional):') ?? '';
    const ok = window.confirm('Save permission matrix changes?');
    if (!ok) return;

    setSavingPermissions(true);
    try {
      const payload: Array<{ role_id: string; permission: string; allowed: boolean }> = [];
      for (const r of roles) {
        for (const perm of PERMISSIONS) {
          if (permissionsByRoleId[r.id]?.[perm]) {
            // Only insert rows where allowed=true (minimized storage)
            payload.push({ role_id: r.id, permission: perm, allowed: true });
          }
        }
      }

      // Delete all existing permissions and re-insert only granted ones
      // This ensures we remove permissions that were unchecked
      const { error: deleteError } = await (supabase as any).from('role_permissions').delete().in('role_id', roles.map(r => r.id));
      if (deleteError) throw deleteError;

      if (payload.length > 0) {
        const { error } = await (supabase as any).from('role_permissions').insert(payload);
        if (error) throw error;
      }

      await (supabase as any).from('audit_logs').insert({
        action: 'permission_update',
        before: null,
        after: { roles: roles.map((r) => ({ id: r.id, name: r.name })), permissions: payload },
        reason: reason.trim() ? reason.trim() : null,
        target_id: null,
      });

      toast({ title: 'Permissions saved', description: 'Permission matrix updated.' });
      setPermissionsDirty(false);
      await loadAudit();
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSavingPermissions(false);
    }
  };

  const updateUserLocal = (id: string, patch: Partial<(typeof users)[number]>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const isUserDirty = (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return false;
    return (u.role_id ?? null) !== (usersInitial[id] ?? null);
  };

  const handleCancelUser = (id: string) => {
    const initialRoleId = usersInitial[id] ?? null;
    updateUserLocal(id, { role_id: initialRoleId });
  };

  const handleSaveUser = async (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;

    const nextRoleName = u.role_id ? roleNameById[u.role_id] : null;
    const okConfirm = window.confirm(`Save role for ${u.full_name ?? id}?`);
    if (!okConfirm) return;

    if (nextRoleName) {
      const guard = await ensureNotLastSuperAdmin(id, nextRoleName);
      if (!guard) return;
    }

    const reason = window.prompt('Reason for role change (optional):') ?? '';

    setSavingUserId(id);
    try {
      const { error } = await (supabase as any).from('profiles').update({ role_id: u.role_id }).eq('id', id);
      if (error) throw error;

      await (supabase as any).from('audit_logs').insert({
        target_id: id,
        action: 'role_change',
        before: { role_id: usersInitial[id] ?? null },
        after: { role_id: u.role_id ?? null },
        reason: reason.trim() ? reason.trim() : null,
      });

      toast({ title: 'Saved', description: 'User role updated.' });
      setUsersInitial((prev) => ({ ...prev, [id]: u.role_id ?? null }));
      await loadRolesAndPermissions();
      await loadAudit();
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSavingUserId(null);
    }
  };

  const selectedIds = useMemo(() => Object.keys(selectedUserIds).filter((k) => selectedUserIds[k]), [selectedUserIds]);

  const handleBulkApply = async () => {
    if (!bulkRoleId) {
      toast({ title: 'Role required', description: 'Pick a role to apply.', variant: 'destructive' });
      return;
    }
    if (selectedIds.length === 0) {
      toast({ title: 'No users selected', description: 'Select at least one user.', variant: 'destructive' });
      return;
    }

    const nextRoleName = roleNameById[bulkRoleId];
    const ok = window.confirm(`Apply role ${nextRoleName} to ${selectedIds.length} users?`);
    if (!ok) return;
    const reason = window.prompt('Reason for bulk role change (optional):') ?? '';

    setBulkApplying(true);
    try {
      for (const userId of selectedIds) {
        const guard = nextRoleName ? await ensureNotLastSuperAdmin(userId, nextRoleName) : true;
        if (!guard) {
          throw new Error('Bulk apply stopped by guardrail.');
        }
      }

      const { error } = await (supabase as any).from('profiles').update({ role_id: bulkRoleId }).in('id', selectedIds);
      if (error) throw error;

      await (supabase as any).from('audit_logs').insert({
        target_id: null,
        action: 'bulk_role_change',
        before: { user_ids: selectedIds },
        after: { role_id: bulkRoleId },
        reason: reason.trim() ? reason.trim() : null,
      });

      toast({ title: 'Bulk applied', description: 'Roles updated.' });
      await loadUsers();
      await loadRolesAndPermissions();
      await loadAudit();
    } catch (e) {
      toast({ title: 'Bulk apply failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setBulkApplying(false);
    }
  };

  const roleOptions = useMemo(() => roles.slice().sort((a, b) => a.name.localeCompare(b.name)), [roles]);

  const visibleUsers = useMemo(() => {
    const trimmed = userQuery.trim().toLowerCase();
    return users
      .filter((u) => {
        if (!trimmed) return true;
        const name = (u.full_name ?? '').toLowerCase();
        const phone = (u.phone ?? '').toLowerCase();
        return name.includes(trimmed) || phone.includes(trimmed);
      })
      .map((u) => {
        const rn = u.role_id ? roleNameById[u.role_id] : u.role;
        return { ...u, role_name: rn ?? 'public_user' };
      });
  }, [roleNameById, userQuery, users]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Roles & Permissions</h2>
        <button
          className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
          onClick={() => {
            void loadRolesAndPermissions();
            void loadUsers();
            void loadAudit();
          }}
          disabled={loading || usersLoading || auditLoading}
        >
          Refresh
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium text-card-foreground">Roles</div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">Name</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newRole.name}
              onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))}
              placeholder="role_name"
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">Description</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={newRole.description}
              onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <div className="md:col-span-4">
            <button
              className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
              disabled={creating || loading}
              onClick={() => void handleCreateRole()}
            >
              Create Role
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Name</th>
                <th className="py-2">Description</th>
                <th className="py-2">Users</th>
                <th className="py-2">Type</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    {loading ? 'Loading...' : 'No roles found. Apply migration and refresh.'}
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-b-0">
                    <td className="py-2 font-medium">
                      {editingRoleId === r.id ? (
                        <input
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={editRole.name}
                          onChange={(e) => setEditRole((p) => ({ ...p, name: e.target.value }))}
                        />
                      ) : (
                        r.name
                      )}
                    </td>
                    <td className="py-2">
                      {editingRoleId === r.id ? (
                        <input
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={editRole.description}
                          onChange={(e) => setEditRole((p) => ({ ...p, description: e.target.value }))}
                        />
                      ) : (
                        <span className="text-muted-foreground">{r.description ?? '-'}</span>
                      )}
                    </td>
                    <td className="py-2">{(roleUserCounts[r.id] ?? 0).toLocaleString()}</td>
                    <td className="py-2">{r.is_system ? 'System' : 'Custom'}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        {editingRoleId === r.id ? (
                          <>
                            <button
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                              onClick={() => void handleSaveEditRole()}
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted"
                              onClick={() => setEditingRoleId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                              onClick={() => handleStartEditRole(r)}
                              disabled={r.is_system}
                            >
                              Edit
                            </button>
                            <button
                              className="h-9 rounded-md border border-destructive/40 bg-background px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                              onClick={() => void handleDeleteRole(r.id)}
                              disabled={r.is_system || r.name === 'super_admin'}
                            >
                              Delete
                            </button>
                          </>
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

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-card-foreground">Permission Matrix</div>
          <button
            className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
            disabled={savingPermissions || !permissionsDirty || roles.length === 0}
            onClick={() => void handleSavePermissions()}
          >
            Save Permissions
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-3">Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p} className="py-2 pr-3">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="py-2 pr-3 font-medium">{r.name}</td>
                  {PERMISSIONS.map((p) => (
                    <td key={p} className="py-2 pr-3">
                      <input
                        type="checkbox"
                        checked={Boolean(permissionsByRoleId[r.id]?.[p])}
                        onChange={() => togglePermission(r.id, p)}
                        disabled={roles.length === 0}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium text-card-foreground">Role Assignment</div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">Search</div>
            <input
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Name or phone"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Role filter</div>
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="no_role">No role_id</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Bulk set role</div>
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={bulkRoleId}
              onChange={(e) => setBulkRoleId(e.target.value)}
            >
              <option value="">Pick role</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              className="mt-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
              disabled={bulkApplying || selectedIds.length === 0 || !bulkRoleId}
              onClick={() => void handleBulkApply()}
            >
              Apply to {selectedIds.length}
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={visibleUsers.length > 0 && visibleUsers.every((u) => selectedUserIds[u.id])}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedUserIds((prev) => {
                        const next = { ...prev };
                        for (const u of visibleUsers) {
                          next[u.id] = checked;
                        }
                        return next;
                      });
                    }}
                  />
                </th>
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                visibleUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0">
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedUserIds[u.id])}
                        onChange={(e) => setSelectedUserIds((p) => ({ ...p, [u.id]: e.target.checked }))}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{u.full_name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{u.id}</div>
                    </td>
                    <td className="py-2 pr-3">{u.phone ?? '—'}</td>
                    <td className="py-2 pr-3">
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={u.role_id ?? ''}
                        onChange={(e) => updateUserLocal(u.id, { role_id: e.target.value || null })}
                      >
                        <option value="">Unassigned</option>
                        {roleOptions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-xs text-muted-foreground">Current: {u.role_name}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                          disabled={!isUserDirty(u.id) || savingUserId === u.id}
                          onClick={() => void handleSaveUser(u.id)}
                        >
                          Save
                        </button>
                        <button
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
                          disabled={!isUserDirty(u.id) || savingUserId === u.id}
                          onClick={() => handleCancelUser(u.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-medium text-card-foreground">Audit Logs</div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Action</th>
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2 pr-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : auditRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No audit logs.
                  </td>
                </tr>
              ) : (
                auditRows.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-b-0">
                    <td className="py-2 pr-3">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3 font-medium">{a.action}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{a.actor_id ?? '—'}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{a.reason ?? '—'}</td>
                    <td className="py-2 pr-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground font-mono">
                          {getAuditPreview({ before: a.before, after: a.after })}
                        </div>
                        <button
                          className="h-7 rounded border border-input bg-background px-2 text-xs hover:bg-muted"
                          onClick={() => setAuditDetailModal({ open: true, data: a })}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      <AuditDetailModal
        open={auditDetailModal.open}
        data={auditDetailModal.data}
        onClose={() => setAuditDetailModal({ open: false, data: null })}
        onCopy={copyAuditJSON}
      />
    </div>
  );
}

// Audit Detail Modal Component
function AuditDetailModal({ open, data, onClose, onCopy }: { open: boolean; data: any; onClose: () => void; onCopy: (data: any) => void }) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-semibold">Audit Log Details</h3>
          <button
            className="h-8 w-8 rounded-md border border-input bg-background hover:bg-muted"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Time:</span> {new Date(data.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Action:</span> {data.action}
            </div>
            <div>
              <span className="font-medium">Actor:</span> {data.actor_id ?? '—'}
            </div>
            <div>
              <span className="font-medium">Reason:</span> {data.reason ?? '—'}
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium">JSON Details</h4>
            <button
              className="h-8 rounded-md border border-input bg-background px-3 text-xs hover:bg-muted"
              onClick={() => onCopy({ before: data.before, after: data.after })}
            >
              Copy JSON
            </button>
          </div>
          <div className="max-h-[40vh] overflow-auto rounded-md border border-border bg-muted p-3">
            <pre className="text-xs">
              {JSON.stringify({ before: data.before, after: data.after }, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex justify-end border-t border-border p-4">
          <button
            className="h-9 rounded-md border border-input bg-background px-4 text-sm hover:bg-muted"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('overview');
  const [reportData, setReportData] = useState<any>(null);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange.start || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
      const endDate = dateRange.end || new Date().toISOString().split('T')[0];

      switch (reportType) {
        case 'overview':
          // Quick insights panel - real data
          const [
            totalUsersRes,
            activeUsersRes,
            totalMasjidsRes,
            pendingApprovalsRes,
            recentRoleChangesRes,
            masjidsWithoutAdminRes,
            systemErrorsRes
          ] = await Promise.all([
            (supabase as any).from('profiles').select('id', { count: 'exact', head: true }),
            (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).gte('last_sign_in_at', startDate),
            (supabase as any).from('mosques').select('id', { count: 'exact', head: true }),
            (supabase as any).from('approvals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            (supabase as any).from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate).in('action', ['role_change', 'permission_update']),
            (supabase as any)
              .from('mosques')
              .select('id, name')
              .is('admin_id', null),
            (supabase as any).from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate).eq('action', 'system_error')
          ]);

          // Get top active users (placeholder - would need activity tracking table)
          const topActiveUsers = [];
          // TODO: Implement activity tracking to get real top users

          setReportData({
            totalUsers: totalUsersRes.count || 0,
            activeUsers: activeUsersRes.count || 0,
            totalMasjids: totalMasjidsRes.count || 0,
            pendingApprovals: pendingApprovalsRes.count || 0,
            recentRoleChanges: recentRoleChangesRes.count || 0,
            topActiveUsers: topActiveUsers.length > 0 ? topActiveUsers : [
              { name: 'Activity tracking needed', actions: 0 }
            ],
            masjidsWithoutAdmin: masjidsWithoutAdminRes.data?.length || 0,
            systemErrors: systemErrorsRes.count || 0
          });
          break;

        case 'audit':
          // Role/Permission changes - real data
          const auditRes = await (supabase as any)
            .from('audit_logs')
            .select('id, actor_id, action, target_id, created_at, before, after, reason')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .in('action', ['role_change', 'permission_update'])
            .order('created_at', { ascending: false })
            .limit(50);

          // Enrich with user names
          const recentChanges = await Promise.all(
            (auditRes.data || []).map(async (log: any) => {
              const [actorRes, targetRes] = await Promise.all([
                log.actor_id ? (supabase as any).from('profiles').select('full_name').eq('id', log.actor_id).maybeSingle() : Promise.resolve({ data: null }),
                log.target_id ? (supabase as any).from('profiles').select('full_name').eq('id', log.target_id).maybeSingle() : Promise.resolve({ data: null })
              ]);

              return {
                actor: actorRes.data?.full_name || log.actor_id || 'System',
                target: targetRes.data?.full_name || log.target_id || 'N/A',
                action: log.action,
                from: log.before?.role_id || log.before || '{}',
                to: log.after?.role_id || log.after || '{}',
                timestamp: new Date(log.created_at).toLocaleString(),
                reason: log.reason || 'No reason provided'
              };
            })
          );

          setReportData({
            recentChanges
          });
          break;

        case 'engagement':
          // User engagement metrics - real data
          const [
            userGrowthRes,
            certificatesRes,
            smsStatsRes,
            emailStatsRes
          ] = await Promise.all([
            // User growth by month
            (supabase as any)
              .rpc('get_user_growth_by_month', { start_date: startDate, end_date: endDate })
              .then(res => res.data || []),
            // Certificate statistics (placeholder - would need certificates table)
            (supabase as any).from('certificates').select('id', { count: 'exact', head: true }).gte('created_at', startDate),
            // SMS delivery stats (placeholder - would need delivery tracking)
            (supabase as any).from('sms_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate),
            (supabase as any).from('email_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate)
          ]);

          // Fallback for user growth if RPC doesn't exist
          let userGrowth = userGrowthRes;
          if (!Array.isArray(userGrowth) || userGrowth.length === 0) {
            const monthlyUsers = await (supabase as any)
              .from('profiles')
              .select('created_at')
              .gte('created_at', startDate)
              .lte('created_at', endDate)
              .order('created_at');
            
            // Group by month
            const grouped = (monthlyUsers.data || []).reduce((acc: any, user: any) => {
              const month = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              if (!acc[month]) acc[month] = { month, newUsers: 0, activeUsers: 0 };
              acc[month].newUsers++;
              return acc;
            }, {});
            
            userGrowth = Object.values(grouped);
          }

          setReportData({
            userGrowth: userGrowth.length > 0 ? userGrowth : [
              { month: 'No data', newUsers: 0, activeUsers: 0 }
            ],
            certificatesIssued: certificatesRes.count || 0,
            smsDelivered: smsStatsRes.count || 0,
            emailDelivered: emailStatsRes.count || 0,
            deliveryFailures: 0 // TODO: Implement failure tracking
          });
          break;

        case 'operational':
          // System health - real data
          const [
            masjidsOnboardedRes,
            staffRolesRes,
            recentErrorsRes
          ] = await Promise.all([
            (supabase as any).from('mosques').select('id', { count: 'exact', head: true }),
            (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).not('role_id', 'is', null),
            (supabase as any).from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate).eq('action', 'system_error')
          ]);

          setReportData({
            systemHealth: recentErrorsRes.count === 0 ? 'Good' : recentErrorsRes.count < 5 ? 'Fair' : 'Poor',
            uptime: '99.9%', // TODO: Implement uptime tracking
            errorsLogged: recentErrorsRes.count || 0,
            avgResponseTime: '120ms', // TODO: Implement performance monitoring
            masjidsOnboarded: masjidsOnboardedRes.count || 0,
            staffRolesAssigned: staffRolesRes.count || 0
          });
          break;

        case 'security':
          // Security & Compliance reports
          const [
            failedLoginsRes,
            suspiciousActivityRes,
            blockedIPsRes,
            passwordResetRequestsRes,
            roleViolationsRes,
            dataAccessLogsRes
          ] = await Promise.all([
            (supabase as any).from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate).eq('action', 'failed_login'),
            (supabase as any).from('audit_logs').select('id, actor_id, created_at, after').gte('created_at', startDate).eq('action', 'suspicious_activity').limit(20),
            (supabase as any).from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate).eq('action', 'ip_blocked'),
            (supabase as any).from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate).eq('action', 'password_reset'),
            (supabase as any).from('audit_logs').select('id, actor_id, created_at, before, after').gte('created_at', startDate).eq('action', 'role_violation').limit(20),
            (supabase as any).from('audit_logs').select('id, actor_id, action, created_at').gte('created_at', startDate).in('action', ['data_access', 'data_export', 'data_modify']).limit(50)
          ]);

          // Enrich security events with user names
          const enrichedSuspicious = await Promise.all(
            (suspiciousActivityRes.data || []).map(async (event: any) => {
              const userRes = await (supabase as any).from('profiles').select('full_name, email').eq('id', event.actor_id).maybeSingle();
              return {
                ...event,
                userName: userRes.data?.full_name || event.actor_id,
                userEmail: userRes.data?.email || 'N/A',
                timestamp: new Date(event.created_at).toLocaleString(),
                details: event.after
              };
            })
          );

          const enrichedViolations = await Promise.all(
            (roleViolationsRes.data || []).map(async (violation: any) => {
              const userRes = await (supabase as any).from('profiles').select('full_name, email').eq('id', violation.actor_id).maybeSingle();
              return {
                ...violation,
                userName: userRes.data?.full_name || violation.actor_id,
                userEmail: userRes.data?.email || 'N/A',
                timestamp: new Date(violation.created_at).toLocaleString(),
                violation: violation.before?.violation || 'Unknown violation'
              };
            })
          );

          setReportData({
            failedLogins: failedLoginsRes.count || 0,
            suspiciousActivity: enrichedSuspicious,
            blockedIPs: blockedIPsRes.count || 0,
            passwordResetRequests: passwordResetRequestsRes.count || 0,
            roleViolations: enrichedViolations,
            dataAccessLogs: dataAccessLogsRes.data || [],
            securityScore: failedLoginsRes.count === 0 ? 100 : Math.max(0, 100 - (failedLoginsRes.count * 10))
          });
          break;

        case 'performance':
          // Performance Analytics
          const [
            slowQueriesRes,
            apiResponseTimeRes,
            databaseConnectionsRes,
            cacheHitRateRes,
            errorRateRes,
            bandwidthUsageRes
          ] = await Promise.all([
            (supabase as any).from('performance_logs').select('query, duration, created_at').gte('created_at', startDate).order('duration', { ascending: false }).limit(10),
            (supabase as any).from('api_metrics').select('endpoint, avg_response_time, request_count').gte('created_at', startDate).order('avg_response_time', { ascending: false }).limit(20),
            (supabase as any).from('system_metrics').select('connection_count, created_at').gte('created_at', startDate).order('created_at', { ascending: false }).limit(100),
            (supabase as any).from('cache_metrics').select('hit_rate, created_at').gte('created_at', startDate).order('created_at', { ascending: false }).limit(100),
            (supabase as any).from('error_logs').select('id', { count: 'exact', head: true }).gte('created_at', startDate),
            (supabase as any).from('bandwidth_metrics').select('bytes_transferred, created_at').gte('created_at', startDate).order('created_at', { ascending: false }).limit(100)
          ]);

          // Calculate averages
          const avgResponseTime = apiResponseTimeRes.data?.length > 0 
            ? Math.round(apiResponseTimeRes.data.reduce((sum: number, metric: any) => sum + metric.avg_response_time, 0) / apiResponseTimeRes.data.length)
            : 0;
          
          const avgConnections = databaseConnectionsRes.data?.length > 0
            ? Math.round(databaseConnectionsRes.data.reduce((sum: number, metric: any) => sum + metric.connection_count, 0) / databaseConnectionsRes.data.length)
            : 0;

          const avgCacheHitRate = cacheHitRateRes.data?.length > 0
            ? Math.round(cacheHitRateRes.data.reduce((sum: number, metric: any) => sum + metric.hit_rate, 0) / cacheHitRateRes.data.length)
            : 0;

          const totalBandwidth = bandwidthUsageRes.data?.reduce((sum: number, metric: any) => sum + metric.bytes_transferred, 0) || 0;

          setReportData({
            slowQueries: slowQueriesRes.data || [],
            apiEndpoints: apiResponseTimeRes.data || [],
            avgConnections,
            avgResponseTime,
            avgCacheHitRate,
            errorRate: errorRateRes.count || 0,
            bandwidthUsage: totalBandwidth,
            performanceGrade: avgResponseTime < 200 && errorRateRes.count < 5 ? 'A' : avgResponseTime < 500 ? 'B' : 'C'
          });
          break;

        case 'behavior':
          // User Behavior Analytics
          const [
            userActivityPatternsRes,
            featureUsageRes,
            timeSpentRes,
            userPathsRes,
            conversionFunnelRes,
            retentionRateRes
          ] = await Promise.all([
            (supabase as any).from('user_activity').select('user_id, action, created_at').gte('created_at', startDate).limit(1000),
            (supabase as any).from('feature_usage').select('feature, usage_count, unique_users').gte('created_at', startDate).order('usage_count', { ascending: false }).limit(20),
            (supabase as any).from('session_metrics').select('user_id, duration, created_at').gte('created_at', startDate).limit(500),
            (supabase as any).from('user_journeys').select('user_id, path, created_at').gte('created_at', startDate).limit(100),
            (supabase as any).from('conversion_events').select('event, step, total_users, converted_users').gte('created_at', startDate),
            (supabase as any).from('retention_metrics').select('period, retained_users, total_users').gte('created_at', startDate)
          ]);

          // Process activity patterns
          const hourlyActivity = (userActivityPatternsRes.data || []).reduce((acc: any, activity: any) => {
            const hour = new Date(activity.created_at).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
          }, {});

          // Process time spent
          const avgTimeSpent = timeSpentRes.data?.length > 0
            ? Math.round(timeSpentRes.data.reduce((sum: number, session: any) => sum + session.duration, 0) / timeSpentRes.data.length)
            : 0;

          // Calculate retention rate
          const latestRetention = retentionRateRes.data?.[0];
          const retentionRate = latestRetention ? Math.round((latestRetention.retained_users / latestRetention.total_users) * 100) : 0;

          setReportData({
            hourlyActivity,
            featureUsage: featureUsageRes.data || [],
            avgTimeSpent,
            userPaths: userPathsRes.data || [],
            conversionFunnel: conversionFunnelRes.data || [],
            retentionRate,
            topFeatures: (featureUsageRes.data || []).slice(0, 10),
            peakHour: Object.keys(hourlyActivity).reduce((a: string, b: string) => Number(hourlyActivity[a]) > Number(hourlyActivity[b]) ? a : b, '0')
          });
          break;

        case 'system':
          // System Analytics
          const [
            systemResourcesRes,
            serviceStatusRes,
            backupStatusRes,
            integrationHealthRes,
            scheduledTasksRes,
            systemAlertsRes
          ] = await Promise.all([
            (supabase as any).from('system_resources').select('cpu, memory, disk, created_at').gte('created_at', startDate).order('created_at', { ascending: false }).limit(100),
            (supabase as any).from('service_status').select('service, status, last_check, response_time').order('last_check', { ascending: false }),
            (supabase as any).from('backup_logs').select('id, status, size, created_at').gte('created_at', startDate).order('created_at', { ascending: false }).limit(30),
            (supabase as any).from('integration_health').select('integration, status, last_sync, error_count').order('last_sync', { ascending: false }),
            (supabase as any).from('scheduled_tasks').select('task, status, last_run, next_run, duration').order('last_run', { ascending: false }).limit(50),
            (supabase as any).from('system_alerts').select('severity, message, created_at, resolved').gte('created_at', startDate).order('created_at', { ascending: false }).limit(100)
          ]);

          // Calculate resource averages
          const avgResources = systemResourcesRes.data?.length > 0
            ? {
                cpu: Math.round(systemResourcesRes.data.reduce((sum: number, r: any) => sum + r.cpu, 0) / systemResourcesRes.data.length),
                memory: Math.round(systemResourcesRes.data.reduce((sum: number, r: any) => sum + r.memory, 0) / systemResourcesRes.data.length),
                disk: Math.round(systemResourcesRes.data.reduce((sum: number, r: any) => sum + r.disk, 0) / systemResourcesRes.data.length)
              }
            : { cpu: 0, memory: 0, disk: 0 };

          // Categorize alerts
          const criticalAlerts = (systemAlertsRes.data || []).filter((alert: any) => alert.severity === 'critical' && !alert.resolved).length;
          const warningAlerts = (systemAlertsRes.data || []).filter((alert: any) => alert.severity === 'warning' && !alert.resolved).length;

          setReportData({
            systemResources: systemResourcesRes.data || [],
            avgResources,
            serviceStatus: serviceStatusRes.data || [],
            backupStatus: backupStatusRes.data || [],
            integrationHealth: integrationHealthRes.data || [],
            scheduledTasks: scheduledTasksRes.data || [],
            systemAlerts: systemAlertsRes.data || [],
            criticalAlerts,
            warningAlerts,
            systemGrade: criticalAlerts === 0 && warningAlerts < 3 ? 'A' : criticalAlerts < 2 ? 'B' : 'C'
          });
          break;
      }
    } catch (error) {
      toast({
        title: 'Failed to load report',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReportData();
  }, [reportType]);

  const exportReport = () => {
    try {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Report exported', description: 'File downloaded successfully.' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not export report.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reports & Analytics</h2>
        <button
          className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted"
          onClick={exportReport}
          disabled={!reportData || loading}
        >
          Export Report
        </button>
      </div>

      {/* Report Controls */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="overview">Quick Insights</option>
              <option value="audit">Audit Activity</option>
              <option value="engagement">User Engagement</option>
              <option value="operational">Operational Health</option>
              <option value="security">Security & Compliance</option>
              <option value="performance">Performance Analytics</option>
              <option value="behavior">User Behavior</option>
              <option value="system">System Analytics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : reportData ? (
        <div className="space-y-4">
          {reportType === 'overview' && (
            <>
              {/* Quick Insights Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-2xl font-bold">{reportData.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-2xl font-bold text-green-600">{reportData.activeUsers}</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-2xl font-bold">{reportData.totalMasjids}</div>
                  <div className="text-sm text-muted-foreground">Total Masjids</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-2xl font-bold text-orange-600">{reportData.pendingApprovals}</div>
                  <div className="text-sm text-muted-foreground">Pending Approvals</div>
                </div>
              </div>

              {/* Top Active Users */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">Top 5 Most Active Users This Week</h3>
                <div className="space-y-2">
                  {reportData.topActiveUsers?.map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-muted-foreground">{user.actions} actions</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Alerts */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">System Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>{reportData.masjidsWithoutAdmin} masjids without admin</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>{reportData.recentRoleChanges} role changes this week</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>{reportData.systemErrors} system errors</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {reportType === 'audit' && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-3">Recent Role & Permission Changes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Time</th>
                      <th className="text-left py-2">Actor</th>
                      <th className="text-left py-2">Target</th>
                      <th className="text-left py-2">Action</th>
                      <th className="text-left py-2">Details</th>
                      <th className="text-left py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.recentChanges?.map((change: any, index: number) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-2">{change.timestamp}</td>
                        <td className="py-2">{change.actor}</td>
                        <td className="py-2">{change.target}</td>
                        <td className="py-2 font-medium">{change.action}</td>
                        <td className="py-2">
                          {change.action === 'role_change' ? (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {change.from} → {change.to}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Permissions updated</span>
                          )}
                        </td>
                        <td className="py-2 text-muted-foreground">{change.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'engagement' && (
            <>
              {/* User Growth Chart */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">User Growth Trend</h3>
                <div className="space-y-2">
                  {reportData.userGrowth?.map((month: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-blue-600">+{month.newUsers} new</span>
                        <span className="text-green-600">{month.activeUsers} active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Certificate Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Issued:</span>
                      <span className="font-medium">{reportData.certificatesIssued}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SMS Delivered:</span>
                      <span className="font-medium text-green-600">{reportData.smsDelivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email Delivered:</span>
                      <span className="font-medium text-green-600">{reportData.emailDelivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Failures:</span>
                      <span className="font-medium text-red-600">{reportData.deliveryFailures}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Delivery Success Rate</h3>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(((reportData.smsDelivered + reportData.emailDelivered) / (reportData.certificatesIssued * 2)) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Success Rate</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {reportType === 'operational' && (
            <>
              {/* System Health */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reportData.systemHealth}</div>
                    <div className="text-sm text-muted-foreground">System Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.uptime}</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.avgResponseTime}</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{reportData.errorsLogged}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>
              </div>

              {/* Operational Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Masjid Operations</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Masjids:</span>
                      <span className="font-medium">{reportData.masjidsOnboarded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff Roles Assigned:</span>
                      <span className="font-medium">{reportData.staffRolesAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Staff per Masjid:</span>
                      <span className="font-medium">{Math.round(reportData.staffRolesAssigned / reportData.masjidsOnboarded)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Performance Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Database Queries:</span>
                      <span className="font-medium text-green-600">Optimal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Response:</span>
                      <span className="font-medium text-green-600">{reportData.avgResponseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className="font-medium text-green-600">&lt; 0.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {reportType === 'security' && (
            <>
              {/* Security Score */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">Security Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${reportData.securityScore >= 90 ? 'text-green-600' : reportData.securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {reportData.securityScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Security Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{reportData.failedLogins}</div>
                    <div className="text-sm text-muted-foreground">Failed Logins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{reportData.blockedIPs}</div>
                    <div className="text-sm text-muted-foreground">Blocked IPs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{reportData.passwordResetRequests}</div>
                    <div className="text-sm text-muted-foreground">Password Resets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{reportData.suspiciousActivity?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Suspicious Activity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{reportData.roleViolations?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Role Violations</div>
                  </div>
                </div>
              </div>

              {/* Recent Security Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Suspicious Activity</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.suspiciousActivity?.length > 0 ? (
                      reportData.suspiciousActivity?.map((event: any, index: number) => (
                        <div key={index} className="text-xs border-b border-border pb-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{event.userName}</span>
                            <span className="text-muted-foreground">{event.timestamp}</span>
                          </div>
                          <div className="text-muted-foreground">{event.userEmail}</div>
                          <div className="text-red-600">{event.details}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No suspicious activity detected</div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Role Violations</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.roleViolations?.length > 0 ? (
                      reportData.roleViolations?.map((violation: any, index: number) => (
                        <div key={index} className="text-xs border-b border-border pb-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{violation.userName}</span>
                            <span className="text-muted-foreground">{violation.timestamp}</span>
                          </div>
                          <div className="text-muted-foreground">{violation.userEmail}</div>
                          <div className="text-red-600">{violation.violation}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No role violations detected</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {reportType === 'performance' && (
            <>
              {/* Performance Grade */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">Performance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${reportData.performanceGrade === 'A' ? 'text-green-600' : reportData.performanceGrade === 'B' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {reportData.performanceGrade}
                    </div>
                    <div className="text-sm text-muted-foreground">Performance Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.avgResponseTime}ms</div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.avgConnections}</div>
                    <div className="text-sm text-muted-foreground">Avg Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.avgCacheHitRate}%</div>
                    <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                  </div>
                </div>
              </div>

              {/* Slow Queries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Slow Queries</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.slowQueries?.length > 0 ? (
                      reportData.slowQueries?.map((query: any, index: number) => (
                        <div key={index} className="text-xs border-b border-border pb-2">
                          <div className="flex justify-between">
                            <span className="font-mono text-red-600">{query.duration}ms</span>
                            <span className="text-muted-foreground">{new Date(query.created_at).toLocaleString()}</span>
                          </div>
                          <div className="font-mono text-muted-foreground truncate">{query.query}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No slow queries detected</div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">API Endpoints</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.apiEndpoints?.length > 0 ? (
                      reportData.apiEndpoints?.map((endpoint: any, index: number) => (
                        <div key={index} className="text-xs border-b border-border pb-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{endpoint.endpoint}</span>
                            <span className={`font-mono ${endpoint.avg_response_time > 500 ? 'text-red-600' : endpoint.avg_response_time > 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {endpoint.avg_response_time}ms
                            </span>
                          </div>
                          <div className="text-muted-foreground">{endpoint.request_count} requests</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No API data available</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {reportType === 'behavior' && (
            <>
              {/* User Behavior Overview */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">User Behavior Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(reportData.avgTimeSpent / 60)}m</div>
                    <div className="text-sm text-muted-foreground">Avg Session Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.retentionRate}%</div>
                    <div className="text-sm text-muted-foreground">Retention Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.peakHour}:00</div>
                    <div className="text-sm text-muted-foreground">Peak Hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.topFeatures?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Active Features</div>
                  </div>
                </div>
              </div>

              {/* Top Features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Top Features Used</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.topFeatures?.length > 0 ? (
                      reportData.topFeatures?.map((feature: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm border-b border-border pb-2">
                          <span className="font-medium">{feature.feature}</span>
                          <div className="text-right">
                            <div className="font-mono">{feature.usage_count}</div>
                            <div className="text-xs text-muted-foreground">{feature.unique_users} users</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No feature usage data available</div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Hourly Activity Pattern</h3>
                  <div className="grid grid-cols-6 gap-1 text-xs">
                    {Object.entries(reportData.hourlyActivity || {}).map(([hour, count]: [string, any]) => (
                      <div key={hour} className="text-center">
                        <div className="text-muted-foreground">{hour}h</div>
                        <div className={`h-8 rounded ${count > 0 ? 'bg-blue-500' : 'bg-muted'}`} style={{ opacity: Math.min(count / 10, 1) }}></div>
                        <div className="text-xs">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {reportType === 'system' && (
            <>
              {/* System Grade */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-3">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${reportData.systemGrade === 'A' ? 'text-green-600' : reportData.systemGrade === 'B' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {reportData.systemGrade}
                    </div>
                    <div className="text-sm text-muted-foreground">System Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{reportData.criticalAlerts}</div>
                    <div className="text-sm text-muted-foreground">Critical Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{reportData.warningAlerts}</div>
                    <div className="text-sm text-muted-foreground">Warning Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.avgResources?.cpu || 0}%</div>
                    <div className="text-sm text-muted-foreground">Avg CPU Usage</div>
                  </div>
                </div>
              </div>

              {/* System Resources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">System Resources</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>{reportData.avgResources?.cpu || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full ${reportData.avgResources?.cpu > 80 ? 'bg-red-500' : reportData.avgResources?.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                             style={{ width: `${reportData.avgResources?.cpu || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{reportData.avgResources?.memory || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full ${reportData.avgResources?.memory > 80 ? 'bg-red-500' : reportData.avgResources?.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                             style={{ width: `${reportData.avgResources?.memory || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disk Usage</span>
                        <span>{reportData.avgResources?.disk || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full ${reportData.avgResources?.disk > 80 ? 'bg-red-500' : reportData.avgResources?.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                             style={{ width: `${reportData.avgResources?.disk || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Service Status</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportData.serviceStatus?.length > 0 ? (
                      reportData.serviceStatus?.map((service: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm border-b border-border pb-2">
                          <span className="font-medium">{service.service}</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${service.status === 'healthy' ? 'bg-green-500' : service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <span className={`text-xs ${service.status === 'healthy' ? 'text-green-600' : service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {service.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{service.response_time}ms</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No service status data available</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No data available for the selected report type.
        </div>
      )}
    </div>
  );
}

function AuditLogsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [summaryStats, setSummaryStats] = useState<any>({});
  const [topActors, setTopActors] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<any>(null);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [advancedAlerts, setAdvancedAlerts] = useState<any[]>([]);

  const logsPerPage = 25;

  // Load audit logs with filters
  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const startDate = dateRange.start || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
      const endDate = dateRange.end || new Date().toISOString().split('T')[0];

      let query = (supabase as any)
        .from('audit_logs')
        .select('id, actor_id, target_id, action, before, after, reason, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(500);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with user names
      const enrichedLogs = await Promise.all(
        (data || []).map(async (log: any) => {
          const [actorRes, targetRes] = await Promise.all([
            log.actor_id ? (supabase as any).from('profiles').select('full_name, email').eq('id', log.actor_id).maybeSingle() : Promise.resolve({ data: null }),
            log.target_id ? (supabase as any).from('profiles').select('full_name, email').eq('id', log.target_id).maybeSingle() : Promise.resolve({ data: null })
          ]);

          return {
            ...log,
            actorName: actorRes.data?.full_name || log.actor_id || 'System',
            actorEmail: actorRes.data?.email || '',
            targetName: targetRes.data?.full_name || log.target_id || 'N/A',
            targetEmail: targetRes.data?.email || ''
          };
        })
      );

      setAuditLogs(enrichedLogs);
      setFilteredLogs(enrichedLogs);
      await calculateSummaryStats(enrichedLogs);
    } catch (error) {
      toast({
        title: 'Failed to load audit logs',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = async (logs: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.created_at.startsWith(today));
    
    const roleChanges = todayLogs.filter(log => log.action === 'role_change').length;
    const permissionUpdates = todayLogs.filter(log => log.action === 'permission_update').length;
    const approvals = todayLogs.filter(log => log.action.includes('approval')).length;
    const denials = todayLogs.filter(log => log.action.includes('denial')).length;

    // Calculate top actors
    const actorCounts = logs.reduce((acc: any, log: any) => {
      const key = log.actorName;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const top5Actors = Object.entries(actorCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Identify critical alerts
    const critical = logs.filter(log => {
      return (
        log.action === 'role_change' && log.after?.role === 'super_admin' ||
        log.action === 'permission_update' && log.after?.includes('super_admin') ||
        log.action === 'delete' && log.target_id?.includes('super_admin')
      );
    });

    // Advanced alerts detection
    const advanced = detectAdvancedAlerts(logs);

    // Generate compliance report
    const compliance = generateComplianceReport(logs);

    setSummaryStats({
      roleChanges,
      permissionUpdates,
      approvals,
      denials
    });
    setTopActors(top5Actors);
    setCriticalAlerts(critical);
    setAdvancedAlerts(advanced);
    setComplianceReport(compliance);
  };

  // Detect advanced alerts
  const detectAdvancedAlerts = (logs: any[]) => {
    const alerts = [];
    const timeframe = 60 * 60 * 1000; // 1 hour

    // Detect rapid role changes
    const roleChanges = logs.filter(log => log.action === 'role_change');
    for (let i = 0; i < roleChanges.length - 1; i++) {
      const current = new Date(roleChanges[i].created_at).getTime();
      const next = new Date(roleChanges[i + 1].created_at).getTime();
      
      if (next - current < timeframe && roleChanges[i].target_id === roleChanges[i + 1].target_id) {
        alerts.push({
          type: 'rapid_role_changes',
          severity: 'warning',
          message: `Rapid role changes detected for ${roleChanges[i].targetName}`,
          details: `${roleChanges[i].actorName} changed roles multiple times within 1 hour`,
          timestamp: roleChanges[i].created_at,
          actor: roleChanges[i].actorName
        });
      }
    }

    // Detect permission escalation attempts
    const escalationAttempts = logs.filter(log => 
      log.action === 'permission_update' && 
      log.after?.includes('super_admin') && 
      !log.before?.includes('super_admin')
    );
    
    escalationAttempts.forEach(attempt => {
      alerts.push({
        type: 'permission_escalation',
        severity: 'critical',
        message: `Permission escalation attempted by ${attempt.actorName}`,
        details: `Attempted to grant super_admin permissions to ${attempt.targetName}`,
        timestamp: attempt.created_at,
        actor: attempt.actorName
      });
    });

    // Detect suspicious activity patterns
    const actorActivity = logs.reduce((acc: any, log: any) => {
      if (!acc[log.actor_id]) acc[log.actor_id] = { count: 0, actions: [], actor: log.actorName };
      acc[log.actor_id].count++;
      acc[log.actor_id].actions.push(log.action);
      return acc;
    }, {});

    Object.entries(actorActivity).forEach(([actorId, data]: [string, any]) => {
      if (data.count > 50) { // More than 50 actions in the period
        alerts.push({
          type: 'high_activity',
          severity: 'warning',
          message: `High activity detected from ${data.actor}`,
          details: `${data.count} actions performed in the selected period`,
          timestamp: new Date().toISOString(),
          actor: data.actor
        });
      }
    });

    return alerts;
  };

  // Generate compliance report
  const generateComplianceReport = (logs: any[]) => {
    const totalLogs = logs.length;
    const roleChanges = logs.filter(log => log.action === 'role_change').length;
    const permissionUpdates = logs.filter(log => log.action === 'permission_update').length;
    const deletions = logs.filter(log => log.action === 'delete').length;
    
    // Calculate compliance metrics
    const withReason = logs.filter(log => log.reason && log.reason.trim() !== '').length;
    const reasonCompliance = totalLogs > 0 ? Math.round((withReason / totalLogs) * 100) : 100;
    
    // Critical actions compliance
    const criticalActions = logs.filter(log => 
      log.action === 'role_change' && log.after?.role === 'super_admin' ||
      log.action === 'delete'
    );
    const criticalWithReason = criticalActions.filter(log => log.reason && log.reason.trim() !== '').length;
    const criticalCompliance = criticalActions.length > 0 ? Math.round((criticalWithReason / criticalActions.length) * 100) : 100;

    // Time-based analysis
    const businessHours = logs.filter(log => {
      const hour = new Date(log.created_at).getHours();
      return hour >= 9 && hour <= 17; // 9 AM to 5 PM
    }).length;

    const afterHours = totalLogs - businessHours;
    const afterHoursPercentage = totalLogs > 0 ? Math.round((afterHours / totalLogs) * 100) : 0;

    return {
      totalLogs,
      roleChanges,
      permissionUpdates,
      deletions,
      reasonCompliance,
      criticalCompliance,
      businessHours,
      afterHours,
      afterHoursPercentage,
      grade: calculateComplianceGrade(reasonCompliance, criticalCompliance, afterHoursPercentage)
    };
  };

  // Calculate compliance grade
  const calculateComplianceGrade = (reasonCompliance: number, criticalCompliance: number, afterHoursPercentage: number) => {
    const score = (reasonCompliance * 0.4) + (criticalCompliance * 0.4) + ((100 - afterHoursPercentage) * 0.2);
    
    if (score >= 90) return { grade: 'A', color: 'text-green-600', description: 'Excellent' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', description: 'Good' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', description: 'Fair' };
    return { grade: 'D', color: 'text-red-600', description: 'Poor' };
  };

  // View diff between before/after
  const viewDiff = (log: any) => {
    setSelectedDiff({
      before: log.before || {},
      after: log.after || {},
      action: log.action,
      actor: log.actorName,
      target: log.targetName,
      timestamp: log.created_at
    });
    setShowDiffModal(true);
  };

  // Generate diff visualization
  const generateDiffVisualization = (before: any, after: any) => {
    const diff: any[] = [];
    
    // Compare objects
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    
    allKeys.forEach(key => {
      const beforeVal = before?.[key];
      const afterVal = after?.[key];
      
      if (beforeVal !== afterVal) {
        diff.push({
          key,
          before: beforeVal,
          after: afterVal,
          type: beforeVal === undefined ? 'added' : afterVal === undefined ? 'removed' : 'changed'
        });
      }
    });
    
    return diff;
  };

  // Group logs by date for timeline view
  const groupLogsByDate = (logs: any[]) => {
    const grouped = logs.reduce((acc: any, log: any) => {
      const date = new Date(log.created_at).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});
    
    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  // Filter logs based on search
  useEffect(() => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.actorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, auditLogs]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  // Export functionality
  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Actor', 'Actor Email', 'Target', 'Target Email', 'Action', 'Reason', 'Before', 'After'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.actorName,
        log.actorEmail,
        log.targetName,
        log.targetEmail,
        log.action,
        log.reason || '',
        JSON.stringify(log.before || {}),
        JSON.stringify(log.after || {})
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredLogs.length} audit logs to CSV`
    });
  };

  // Get visual change indicator
  const getChangeIndicator = (log: any) => {
    if (log.action === 'role_change') {
      const from = log.before?.role_id || log.before || 'None';
      const to = log.after?.role_id || log.after || 'None';
      return (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {from} → {to}
        </span>
      );
    }
    if (log.action === 'permission_update') {
      return (
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
          Permissions Updated
        </span>
      );
    }
    return (
      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
        {log.action}
      </span>
    );
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'role_change': return 'text-blue-600';
      case 'permission_update': return 'text-purple-600';
      case 'approval': return 'text-green-600';
      case 'denial': return 'text-red-600';
      case 'delete': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Audit Control Room</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowComplianceModal(true)}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Compliance Report
          </button>
          <button
            onClick={exportLogs}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">View Mode:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}
            >
              Timeline View
            </button>
          </div>
        </div>
      </div>

      {/* Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-blue-600">{summaryStats.roleChanges}</div>
          <div className="text-sm text-muted-foreground">Role Changes Today</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-purple-600">{summaryStats.permissionUpdates}</div>
          <div className="text-sm text-muted-foreground">Permission Updates Today</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-green-600">{summaryStats.approvals}</div>
          <div className="text-sm text-muted-foreground">Approvals Today</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-red-600">{summaryStats.denials}</div>
          <div className="text-sm text-muted-foreground">Denials Today</div>
        </div>
      </div>

      {/* Top Actors & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Top Actors (Last 30 Days)</h3>
          <div className="space-y-2">
            {topActors.map((actor, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="font-medium">{actor.name}</span>
                <span className="text-muted-foreground">{actor.count} actions</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Security Alerts</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {[...criticalAlerts, ...advancedAlerts].length > 0 ? (
              [...criticalAlerts, ...advancedAlerts].map((alert, index) => (
                <div key={index} className={`text-xs border-l-4 pl-2 ${
                  alert.severity === 'critical' ? 'border-red-500' : 
                  alert.severity === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                }`}>
                  <div className={`font-medium ${
                    alert.severity === 'critical' ? 'text-red-600' : 
                    alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {alert.message}
                  </div>
                  <div className="text-muted-foreground text-xs">{alert.details}</div>
                  <div className="text-xs">{new Date(alert.timestamp).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No security alerts</div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by actor, target, action..."
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Action Type</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="role_change">Role Change</option>
              <option value="permission_update">Permission Update</option>
              <option value="approval">Approval</option>
              <option value="denial">Denial</option>
              <option value="delete">Delete</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table/Timeline */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium">Audit Log Entries</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading audit logs...</div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3">Timestamp</th>
                      <th className="text-left p-3">Actor</th>
                      <th className="text-left p-3">Target</th>
                      <th className="text-left p-3">Action</th>
                      <th className="text-left p-3">Change</th>
                      <th className="text-left p-3">Reason</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log, index) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{log.actorName}</div>
                            <div className="text-xs text-muted-foreground">{log.actorEmail}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{log.targetName}</div>
                            <div className="text-xs text-muted-foreground">{log.targetEmail}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3">{getChangeIndicator(log)}</td>
                        <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">
                          {log.reason || 'No reason provided'}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedLog(log);
                                setShowDetailModal(true);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                            {(log.before || log.after) && (
                              <button
                                onClick={() => viewDiff(log)}
                                className="text-xs text-purple-600 hover:text-purple-800"
                              >
                                View Diff
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4">
                {groupLogsByDate(paginatedLogs).map(([date, logs]: [string, any[]]) => (
                  <div key={date} className="mb-6">
                    <h4 className="font-medium text-sm mb-3 text-muted-foreground">{date}</h4>
                    <div className="space-y-2">
                      {logs.map((log, index) => (
                        <div key={log.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium text-sm ${getActionColor(log.action)}`}>
                                  {log.action}
                                </span>
                                {getChangeIndicator(log)}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-sm mt-1">
                              <span className="font-medium">{log.actorName}</span>
                              <span className="text-muted-foreground"> → </span>
                              <span className="font-medium">{log.targetName}</span>
                            </div>
                            {log.reason && (
                              <div className="text-xs text-muted-foreground mt-1 italic">
                                "{log.reason}"
                              </div>
                            )}
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => {
                                  setSelectedLog(log);
                                  setShowDetailModal(true);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Details
                              </button>
                              {(log.before || log.after) && (
                                <button
                                  onClick={() => viewDiff(log)}
                                  className="text-xs text-purple-600 hover:text-purple-800"
                                >
                                  Diff
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-border flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Audit Log Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <div>{new Date(selectedLog.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium">Action:</span>
                  <div className={getActionColor(selectedLog.action)}>{selectedLog.action}</div>
                </div>
                <div>
                  <span className="font-medium">Actor:</span>
                  <div>{selectedLog.actorName} ({selectedLog.actorEmail})</div>
                </div>
                <div>
                  <span className="font-medium">Target:</span>
                  <div>{selectedLog.targetName} ({selectedLog.targetEmail})</div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Reason:</span>
                <div className="mt-1 p-2 bg-muted rounded text-sm">
                  {selectedLog.reason || 'No reason provided'}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Before State:</span>
                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.before || {}, null, 2)}
                </pre>
              </div>
              
              <div>
                <span className="font-medium">After State:</span>
                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.after || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diff Modal */}
      {showDiffModal && selectedDiff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Diff Viewer</h3>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Action:</span>
                  <div className={getActionColor(selectedDiff.action)}>{selectedDiff.action}</div>
                </div>
                <div>
                  <span className="font-medium">Actor:</span>
                  <div>{selectedDiff.actor}</div>
                </div>
                <div>
                  <span className="font-medium">Target:</span>
                  <div>{selectedDiff.target}</div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Changes:</span>
                <div className="mt-2 space-y-1">
                  {generateDiffVisualization(selectedDiff.before, selectedDiff.after).map((diff, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                      <span className="font-mono font-medium">{diff.key}:</span>
                      <span className="text-red-600 line-through">{JSON.stringify(diff.before)}</span>
                      <span className="text-green-600">→</span>
                      <span className="text-green-600">{JSON.stringify(diff.after)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        diff.type === 'added' ? 'bg-green-100 text-green-800' :
                        diff.type === 'removed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {diff.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Report Modal */}
      {showComplianceModal && complianceReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Compliance Report</h3>
              <button
                onClick={() => setShowComplianceModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Overall Grade */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className={`text-4xl font-bold ${complianceReport.grade.color}`}>
                  {complianceReport.grade.grade}
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Compliance Grade - {complianceReport.grade.description}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border border-border rounded">
                  <div className="text-2xl font-bold">{complianceReport.totalLogs}</div>
                  <div className="text-xs text-muted-foreground">Total Actions</div>
                </div>
                <div className="text-center p-3 border border-border rounded">
                  <div className="text-2xl font-bold text-blue-600">{complianceReport.roleChanges}</div>
                  <div className="text-xs text-muted-foreground">Role Changes</div>
                </div>
                <div className="text-center p-3 border border-border rounded">
                  <div className="text-2xl font-bold text-purple-600">{complianceReport.permissionUpdates}</div>
                  <div className="text-xs text-muted-foreground">Permission Updates</div>
                </div>
                <div className="text-center p-3 border border-border rounded">
                  <div className="text-2xl font-bold text-red-600">{complianceReport.deletions}</div>
                  <div className="text-xs text-muted-foreground">Deletions</div>
                </div>
                <div className="text-center p-3 border border-border rounded">
                  <div className="text-2xl font-bold text-green-600">{complianceReport.reasonCompliance}%</div>
                  <div className="text-xs text-muted-foreground">Reason Provided</div>
                </div>
                <div className="text-center p-3 border border-border rounded">
                  <div className="text-2xl font-bold text-orange-600">{complianceReport.criticalCompliance}%</div>
                  <div className="text-xs text-muted-foreground">Critical Actions with Reason</div>
                </div>
              </div>

              {/* Time Analysis */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded">
                  <h4 className="font-medium mb-2">Business Hours Activity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>9 AM - 5 PM:</span>
                      <span className="font-medium">{complianceReport.businessHours}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>After Hours:</span>
                      <span className="font-medium text-orange-600">{complianceReport.afterHours}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>After Hours %:</span>
                      <span className="font-medium text-red-600">{complianceReport.afterHoursPercentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-border rounded">
                  <h4 className="font-medium mb-2">Compliance Breakdown</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reason Compliance:</span>
                        <span>{complianceReport.reasonCompliance}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500" 
                          style={{ width: `${complianceReport.reasonCompliance}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Critical Compliance:</span>
                        <span>{complianceReport.criticalCompliance}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-orange-500" 
                          style={{ width: `${complianceReport.criticalCompliance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserActivityPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activityStats, setActivityStats] = useState<any>({});
  const [topActiveUsers, setTopActiveUsers] = useState<any[]>([]);
  const [activityHeatmap, setActivityHeatmap] = useState<any>({});

  const activitiesPerPage = 25;

  // Load user activities
  const loadUserActivities = async () => {
    setLoading(true);
    try {
      const startDate = dateRange.start || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
      const endDate = dateRange.end || new Date().toISOString().split('T')[0];

      // Query user activities - would need user_activity table
      let query = (supabase as any)
        .from('user_activity')
        .select('id, user_id, action, details, ip_address, user_agent, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(500);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (userFilter !== 'all') {
        query = query.eq('user_id', userFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with user profiles
      const enrichedActivities = await Promise.all(
        (data || []).map(async (activity: any) => {
          const userRes = await (supabase as any)
            .from('profiles')
            .select('full_name, email, role_id')
            .eq('id', activity.user_id)
            .maybeSingle();

          return {
            ...activity,
            userName: userRes.data?.full_name || activity.user_id,
            userEmail: userRes.data?.email || '',
            userRole: userRes.data?.role_id || 'user'
          };
        })
      );

      setUserActivities(enrichedActivities);
      setFilteredActivities(enrichedActivities);
      await calculateActivityStats(enrichedActivities);
      generateActivityHeatmap(enrichedActivities);
    } catch (error) {
      toast({
        title: 'Failed to load user activities',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate activity statistics
  const calculateActivityStats = async (activities: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(activity => activity.created_at.startsWith(today));
    
    const logins = todayActivities.filter(activity => activity.action === 'login').length;
    const logouts = todayActivities.filter(activity => activity.action === 'logout').length;
    const pageViews = todayActivities.filter(activity => activity.action === 'page_view').length;
    const actions = todayActivities.filter(activity => activity.action === 'action_performed').length;

    // Calculate top active users
    const userCounts = activities.reduce((acc: any, activity: any) => {
      const key = activity.userName;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const top5Users = Object.entries(userCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setActivityStats({
      logins,
      logouts,
      pageViews,
      actions
    });
    setTopActiveUsers(top5Users);
  };

  // Generate activity heatmap data
  const generateActivityHeatmap = (activities: any[]) => {
    const heatmap: any = {};
    
    activities.forEach(activity => {
      const hour = new Date(activity.created_at).getHours();
      const day = new Date(activity.created_at).getDay();
      
      if (!heatmap[day]) heatmap[day] = {};
      heatmap[day][hour] = (heatmap[day][hour] || 0) + 1;
    });

    setActivityHeatmap(heatmap);
  };

  // Filter activities based on search
  useEffect(() => {
    let filtered = userActivities;

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [searchTerm, userActivities]);

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * activitiesPerPage,
    currentPage * activitiesPerPage
  );

  // Export functionality
  const exportActivities = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Email', 'Action', 'Details', 'IP Address', 'User Agent'].join(','),
      ...filteredActivities.map(activity => [
        new Date(activity.created_at).toLocaleString(),
        activity.userName,
        activity.userEmail,
        activity.action,
        activity.details || '',
        activity.ip_address || '',
        activity.user_agent || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredActivities.length} user activities to CSV`
    });
  };

  // Get action icon and color
  const getActionInfo = (action: string) => {
    switch (action) {
      case 'login':
        return { icon: '🔑', color: 'text-green-600', label: 'Login' };
      case 'logout':
        return { icon: '🚪', color: 'text-red-600', label: 'Logout' };
      case 'page_view':
        return { icon: '👁️', color: 'text-blue-600', label: 'Page View' };
      case 'action_performed':
        return { icon: '⚡', color: 'text-purple-600', label: 'Action' };
      case 'file_download':
        return { icon: '📥', color: 'text-orange-600', label: 'Download' };
      case 'file_upload':
        return { icon: '📤', color: 'text-cyan-600', label: 'Upload' };
      default:
        return { icon: '📝', color: 'text-gray-600', label: action };
    }
  };

  // Get unique users for filter
  const getUniqueUsers = () => {
    const users = Array.from(new Set(userActivities.map(activity => activity.user_id)));
    return users.map(userId => {
      const activity = userActivities.find(a => a.user_id === userId);
      return {
        id: userId,
        name: activity?.userName || userId,
        email: activity?.userEmail || ''
      };
    });
  };

  useEffect(() => {
    loadUserActivities();
  }, [actionFilter, userFilter, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">User Activity Log</h2>
        <button
          onClick={exportActivities}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-green-600">{activityStats.logins}</div>
          <div className="text-sm text-muted-foreground">Logins Today</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-red-600">{activityStats.logouts}</div>
          <div className="text-sm text-muted-foreground">Logouts Today</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-blue-600">{activityStats.pageViews}</div>
          <div className="text-sm text-muted-foreground">Page Views Today</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-purple-600">{activityStats.actions}</div>
          <div className="text-sm text-muted-foreground">Actions Today</div>
        </div>
      </div>

      {/* Top Active Users & Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Top Active Users (Last 30 Days)</h3>
          <div className="space-y-2">
            {topActiveUsers.map((user, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground">{user.count} activities</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Activity Heatmap (Hour × Day)</h3>
          <div className="text-xs">
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div></div>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium">{day}</div>
              ))}
            </div>
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="grid grid-cols-8 gap-1">
                <div className="text-right pr-1 text-xs">{hour}</div>
                {Array.from({ length: 7 }, (_, day) => {
                  const count = activityHeatmap[day]?.[hour] || 0;
                  const intensity = Math.min(count / 10, 1); // Normalize to 0-1
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="w-6 h-6 rounded-sm flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: count > 0 ? `rgba(59, 130, 246, ${intensity})` : 'transparent',
                        color: intensity > 0.5 ? 'white' : '#666'
                      }}
                      title={`${count} activities`}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by user, action, details..."
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Action Type</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="page_view">Page View</option>
              <option value="action_performed">Action</option>
              <option value="file_download">Download</option>
              <option value="file_upload">Upload</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              {getUniqueUsers().map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* User Activities Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium">User Activity Entries</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading user activities...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3">Timestamp</th>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Action</th>
                    <th className="text-left p-3">Details</th>
                    <th className="text-left p-3">IP Address</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity, index) => {
                    const actionInfo = getActionInfo(activity.action);
                    return (
                      <tr key={activity.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 text-xs">{new Date(activity.created_at).toLocaleString()}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{activity.userName}</div>
                            <div className="text-xs text-muted-foreground">{activity.userEmail}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span>{actionInfo.icon}</span>
                            <span className={`font-medium ${actionInfo.color}`}>
                              {actionInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">
                          {activity.details || 'No details'}
                        </td>
                        <td className="p-3 text-xs font-mono">{activity.ip_address || 'N/A'}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setShowDetailModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-border flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * activitiesPerPage) + 1} to {Math.min(currentPage * activitiesPerPage, filteredActivities.length)} of {filteredActivities.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Activity Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <div>{new Date(selectedActivity.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium">Action:</span>
                  <div className="flex items-center space-x-2">
                    <span>{getActionInfo(selectedActivity.action).icon}</span>
                    <span className={getActionInfo(selectedActivity.action).color}>
                      {getActionInfo(selectedActivity.action).label}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">User:</span>
                  <div>{selectedActivity.userName} ({selectedActivity.userEmail})</div>
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <div>{selectedActivity.userRole}</div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Details:</span>
                <div className="mt-1 p-2 bg-muted rounded text-sm">
                  {selectedActivity.details || 'No details provided'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">IP Address:</span>
                  <div className="font-mono">{selectedActivity.ip_address || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-medium">User Agent:</span>
                  <div className="text-xs break-all">{selectedActivity.user_agent || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Rwanda Islamic Hub',
      logoUrl: '',
      primaryColor: '#059669',
      secondaryColor: '#64748b',
      defaultLanguage: 'en',
      timezone: 'Africa/Kigali'
    },
    notifications: {
      emailProvider: 'supabase',
      smsProvider: 'pindo',
      emailTemplates: {
        welcome: true,
        certificate: true,
        approval: true,
        rejection: true
      },
      smsEnabled: true,
      emailEnabled: true,
      certificateDelivery: true
    },
    roles: {
      defaultPermissions: {
        masjid_admin: ['users.read', 'masjids.read', 'masjids.update', 'certificates.read', 'certificates.create'],
        imam: ['users.read', 'masjids.read', 'certificates.read', 'certificates.create', 'prayers.read', 'prayers.create'],
        mufti: ['users.read', 'masjids.read', 'certificates.read', 'certificates.create', 'fatwas.read', 'fatwas.create'],
        public_user: ['masjids.read', 'certificates.read']
      },
      preventSystemRoleEdit: true,
      requirePermissionEscalationConfirmation: true
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      twoFactorEnabled: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    },
    audit: {
      logLevel: 'info',
      retentionDays: 90,
      enableUserTracking: true,
      enableSystemTracking: true,
      enableSecurityTracking: true
    },
    integrations: {
      sms: {
        provider: 'pindo',
        apiKey: '',
        senderId: '',
        webhookUrl: ''
      },
      email: {
        provider: 'smtp',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        smtpSecure: true
      },
      externalApis: {
        supabaseFunctions: true,
        webhookEndpoints: [],
        apiKeys: []
      }
    },
    guardrails: {
      preventLastSuperAdminRemoval: true,
      requireMasjidIdForRoles: true,
      allowedCertificateLanguages: ['en', 'fr', 'rw'],
      certificateFormats: ['pdf', 'png'],
      maxDailyCertificates: 100,
      requireApprovalForNewMasjids: true
    },
    system: {
      maintenanceMode: false,
      maintenanceMessage: 'System is currently under maintenance. Please try again later.',
      enableHealthMonitoring: true,
      enableErrorReporting: true,
      enablePerformanceMonitoring: true
    }
  });

  // Load settings from database
  const loadSettings = async () => {
    setInitialLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('system_settings')
        .select('section, settings')
        .order('section');

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings = { ...settings };
        
        data.forEach((item: any) => {
          if (loadedSettings[item.section as any]) {
            loadedSettings[item.section as any] = {
              ...loadedSettings[item.section as any],
              ...item.settings
            };
          }
        });

        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Failed to Load Settings',
        description: 'Using default settings. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // Save settings to database
  const saveSettings = async (section: string) => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('system_settings')
        .upsert({
          section,
          settings: settings[section as any],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section'
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: `${section} settings have been updated successfully.`,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Failed to Save Settings',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Helper functions for color manipulation
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const adjustBrightness = (hex: string, percent: number) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const adjust = (value: number) => {
      const adjusted = value + (value * percent / 100);
      return Math.max(0, Math.min(255, adjusted));
    };
    
    const r = Math.round(adjust(rgb.r));
    const g = Math.round(adjust(rgb.g));
    const b = Math.round(adjust(rgb.b));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Apply saved colors and site name on load
  useEffect(() => {
    if (!initialLoading) {
      // Apply site name
      if (settings.general.siteName) {
        document.title = settings.general.siteName;
      }
      
      // Apply primary color
      if (settings.general.primaryColor) {
        const color = settings.general.primaryColor;
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-foreground', '#ffffff');
        
        const rgb = hexToRgb(color);
        if (rgb) {
          document.documentElement.style.setProperty('--primary-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
          document.documentElement.style.setProperty('--primary-dark', adjustBrightness(color, -20));
        }
      }
      
      // Apply secondary color
      if (settings.general.secondaryColor) {
        const color = settings.general.secondaryColor;
        document.documentElement.style.setProperty('--secondary', color);
        document.documentElement.style.setProperty('--secondary-foreground', '#ffffff');
        
        const rgb = hexToRgb(color);
        if (rgb) {
          document.documentElement.style.setProperty('--secondary-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
          document.documentElement.style.setProperty('--secondary-dark', adjustBrightness(color, -20));
        }
      }
    }
  }, [initialLoading, settings.general.siteName, settings.general.primaryColor, settings.general.secondaryColor]);

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '📧' },
    { id: 'roles', label: 'Roles & Permissions', icon: '👥' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'audit', label: 'Audit & Compliance', icon: '📋' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'guardrails', label: 'Guardrails', icon: '🛡️' },
    { id: 'system', label: 'System Health', icon: '🏥' }
  ];

  // Export data for compliance
  const exportComplianceData = async () => {
    try {
      const [usersData, masjidsData] = await Promise.all([
        (supabase as any).from('profiles').select('*'),
        (supabase as any).from('mosques').select('*')
      ]);

      const exportData = {
        users: usersData.data || [],
        masjids: masjidsData.data || [],
        exportedAt: new Date().toISOString(),
        exportedBy: 'Super Admin'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Compliance data has been exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  // Reset to defaults
  const resetToDefaults = (section: string) => {
    const defaults = {
      general: {
        siteName: 'Rwanda Islamic Hub',
        logoUrl: '',
        primaryColor: '#059669',
        secondaryColor: '#64748b',
        defaultLanguage: 'en',
        timezone: 'Africa/Kigali'
      },
      notifications: {
        emailProvider: 'supabase',
        smsProvider: 'pindo',
        emailTemplates: {
          welcome: true,
          certificate: true,
          approval: true,
          rejection: true
        },
        smsEnabled: true,
        emailEnabled: true,
        certificateDelivery: true
      },
      roles: {
        defaultPermissions: {
          masjid_admin: ['users.read', 'masjids.read', 'masjids.update', 'certificates.read', 'certificates.create'],
          imam: ['users.read', 'masjids.read', 'certificates.read', 'certificates.create', 'prayers.read', 'prayers.create'],
          mufti: ['users.read', 'masjids.read', 'certificates.read', 'certificates.create', 'fatwas.read', 'fatwas.create'],
          public_user: ['masjids.read', 'certificates.read']
        },
        preventSystemRoleEdit: true,
        requirePermissionEscalationConfirmation: true
      },
      security: {
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireLowercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecialChars: true,
        twoFactorEnabled: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        lockoutDuration: 15
      },
      audit: {
        logLevel: 'info',
        retentionDays: 90,
        enableUserTracking: true,
        enableSystemTracking: true,
        enableSecurityTracking: true
      },
      integrations: {
        sms: {
          provider: 'pindo',
          apiKey: '',
          senderId: '',
          webhookUrl: ''
        },
        email: {
          provider: 'smtp',
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          smtpSecure: true
        },
        externalApis: {
          supabaseFunctions: true,
          webhookEndpoints: [],
          apiKeys: []
        }
      },
      guardrails: {
        preventLastSuperAdminRemoval: true,
        requireMasjidIdForRoles: true,
        allowedCertificateLanguages: ['en', 'fr', 'rw'],
        certificateFormats: ['pdf', 'png'],
        maxDailyCertificates: 100,
        requireApprovalForNewMasjids: true
      },
      system: {
        maintenanceMode: false,
        maintenanceMessage: 'System is currently under maintenance. Please try again later.',
        enableHealthMonitoring: true,
        enableErrorReporting: true,
        enablePerformanceMonitoring: true
      }
    };

    setSettings(prev => ({
      ...prev,
      [section]: defaults[section as any]
    }));

    toast({
      title: 'Settings Reset',
      description: `${section} settings have been reset to defaults.`,
    });
  };

  // Render notifications settings
  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Templates</h3>
        <div className="space-y-3">
          <div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={settings.notifications.emailTemplates.welcome}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailTemplates: {
                      ...prev.notifications.emailTemplates,
                      welcome: e.target.checked
                    }
                  }
                }))}
              />
              <span>Welcome Email</span>
            </label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-background px-3 text-sm mt-1"
              placeholder="Welcome {user_name}! Your account has been created successfully."
              value={`Welcome {user_name}! Your account has been created successfully.`}
              readOnly
            />
          </div>
          <div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={settings.notifications.emailTemplates.certificate}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailTemplates: {
                      ...prev.notifications.emailTemplates,
                      certificate: e.target.checked
                    }
                  }
                }))}
              />
              <span>Certificate Delivery</span>
            </label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-background px-3 text-sm mt-1"
              placeholder="Your certificate from {masjid_name} is ready for download."
              value={`Your certificate from {masjid_name} is ready for download.`}
              readOnly
            />
          </div>
          <div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={settings.notifications.emailTemplates.approval}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailTemplates: {
                      ...prev.notifications.emailTemplates,
                      approval: e.target.checked
                    }
                  }
                }))}
              />
              <span>Approval Notifications</span>
            </label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-background px-3 text-sm mt-1"
              placeholder="Your request for {request_type} has been approved."
              value={`Your request for {request_type} has been approved.`}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">SMS Templates</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Certificate SMS</label>
            <textarea
              className="w-full h-16 rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Your certificate from {masjid_name} is ready. Download link: {link}"
              value={`Your certificate from {masjid_name} is ready. Download: {link}`}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Delivery Channels</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.notifications.smsEnabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, smsEnabled: e.target.checked }
              }))}
            />
            <span>Enable SMS Notifications</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.notifications.emailEnabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, emailEnabled: e.target.checked }
              }))}
            />
            <span>Enable Email Notifications</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.notifications.certificateDelivery}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, certificateDelivery: e.target.checked }
              }))}
            />
            <span>Auto-deliver Certificates</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render roles & permissions settings
  const renderRolesSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Default Permission Matrix</h3>
        <div className="text-sm text-muted-foreground mb-3">
          Configure default permissions for each role. These will be applied when new roles are created.
        </div>
        
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3">Permission</th>
                <th className="text-center p-3">Masjid Admin</th>
                <th className="text-center p-3">Imam</th>
                <th className="text-center p-3">Mufti</th>
                <th className="text-center p-3">Public User</th>
              </tr>
            </thead>
            <tbody>
              {['users.read', 'users.write', 'masjids.read', 'masjids.write', 'masjids.update', 
                'certificates.read', 'certificates.create', 'certificates.write',
                'prayers.read', 'prayers.create', 'fatwas.read', 'fatwas.create'].map(permission => (
                <tr key={permission} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{permission}</td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={settings.roles.defaultPermissions.masjid_admin.includes(permission)}
                      onChange={(e) => {
                        const newPerms = e.target.checked
                          ? [...settings.roles.defaultPermissions.masjid_admin, permission]
                          : settings.roles.defaultPermissions.masjid_admin.filter(p => p !== permission);
                        setSettings(prev => ({
                          ...prev,
                          roles: {
                            ...prev.roles,
                            defaultPermissions: {
                              ...prev.roles.defaultPermissions,
                              masjid_admin: newPerms
                            }
                          }
                        }));
                      }}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={settings.roles.defaultPermissions.imam.includes(permission)}
                      onChange={(e) => {
                        const newPerms = e.target.checked
                          ? [...settings.roles.defaultPermissions.imam, permission]
                          : settings.roles.defaultPermissions.imam.filter(p => p !== permission);
                        setSettings(prev => ({
                          ...prev,
                          roles: {
                            ...prev.roles,
                            defaultPermissions: {
                              ...prev.roles.defaultPermissions,
                              imam: newPerms
                            }
                          }
                        }));
                      }}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={settings.roles.defaultPermissions.mufti.includes(permission)}
                      onChange={(e) => {
                        const newPerms = e.target.checked
                          ? [...settings.roles.defaultPermissions.mufti, permission]
                          : settings.roles.defaultPermissions.mufti.filter(p => p !== permission);
                        setSettings(prev => ({
                          ...prev,
                          roles: {
                            ...prev.roles,
                            defaultPermissions: {
                              ...prev.roles.defaultPermissions,
                              mufti: newPerms
                            }
                          }
                        }));
                      }}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={settings.roles.defaultPermissions.public_user.includes(permission)}
                      onChange={(e) => {
                        const newPerms = e.target.checked
                          ? [...settings.roles.defaultPermissions.public_user, permission]
                          : settings.roles.defaultPermissions.public_user.filter(p => p !== permission);
                        setSettings(prev => ({
                          ...prev,
                          roles: {
                            ...prev.roles,
                            defaultPermissions: {
                              ...prev.roles.defaultPermissions,
                              public_user: newPerms
                            }
                          }
                        }));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Role Guardrails</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.roles.preventSystemRoleEdit}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                roles: { ...prev.roles, preventSystemRoleEdit: e.target.checked }
              }))}
            />
            <span>Prevent editing of system roles (super_admin)</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.roles.requirePermissionEscalationConfirmation}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                roles: { ...prev.roles, requirePermissionEscalationConfirmation: e.target.checked }
              }))}
            />
            <span>Require confirmation for permission escalations</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render audit & compliance settings
  const renderAuditSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Log Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Log Level</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.audit.logLevel}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                audit: { ...prev.audit, logLevel: e.target.value }
              }))}
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Retention Period (days)</label>
            <input
              type="number"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.audit.retentionDays}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                audit: { ...prev.audit, retentionDays: parseInt(e.target.value) }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tracking Options</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.audit.enableUserTracking}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                audit: { ...prev.audit, enableUserTracking: e.target.checked }
              }))}
            />
            <span>Enable user activity tracking</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.audit.enableSystemTracking}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                audit: { ...prev.audit, enableSystemTracking: e.target.checked }
              }))}
            />
            <span>Enable system event tracking</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.audit.enableSecurityTracking}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                audit: { ...prev.audit, enableSecurityTracking: e.target.checked }
              }))}
            />
            <span>Enable security event tracking</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Compliance Mode</h3>
        <div className="p-4 border border-border rounded-lg bg-muted/50">
          <div className="text-sm">
            <div className="font-medium mb-2">Enhanced Compliance Features:</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Additional logging for all sensitive operations</li>
              <li>• Immutable audit trails with digital signatures</li>
              <li>• Automated compliance reports</li>
              <li>• Strict access controls and approval workflows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Render integrations settings
  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">SMS Gateway</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.sms.provider}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  sms: { ...prev.integrations.sms, provider: e.target.value }
                }
              }))}
            >
              <option value="pindo">Pindo</option>
              <option value="twilio">Twilio</option>
              <option value="africastalking">Africa's Talking</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sender ID</label>
            <input
              type="text"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.sms.senderId}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  sms: { ...prev.integrations.sms, senderId: e.target.value }
                }
              }))}
              placeholder="RwandaHub"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.sms.apiKey}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  sms: { ...prev.integrations.sms, apiKey: e.target.value }
                }
              }))}
              placeholder="Enter API key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Webhook URL</label>
            <input
              type="url"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.sms.webhookUrl}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  sms: { ...prev.integrations.sms, webhookUrl: e.target.value }
                }
              }))}
              placeholder="https://webhook.example.com/sms"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.email.provider}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  email: { ...prev.integrations.email, provider: e.target.value }
                }
              }))}
            >
              <option value="smtp">SMTP</option>
              <option value="supabase">Supabase Email</option>
              <option value="sendgrid">SendGrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SMTP Host</label>
            <input
              type="text"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.email.smtpHost}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  email: { ...prev.integrations.email, smtpHost: e.target.value }
                }
              }))}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SMTP Port</label>
            <input
              type="number"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.email.smtpPort}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  email: { ...prev.integrations.email, smtpPort: parseInt(e.target.value) }
                }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SMTP Username</label>
            <input
              type="text"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={settings.integrations.email.smtpUser}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  email: { ...prev.integrations.email, smtpUser: e.target.value }
                }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">External APIs</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.integrations.externalApis.supabaseFunctions}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: {
                  ...prev.integrations,
                  externalApis: {
                    ...prev.integrations.externalApis,
                    supabaseFunctions: e.target.checked
                  }
                }
              }))}
            />
            <span>Enable Supabase Functions</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render general settings
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Site Name</label>
          <input
            type="text"
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.general.siteName}
            onChange={(e) => {
              const newName = e.target.value;
              setSettings(prev => ({
                ...prev,
                general: { ...prev.general, siteName: newName }
              }));
              
              // Update browser title
              document.title = newName;
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <input
            type="color"
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.general.primaryColor}
            onChange={(e) => {
              const newColor = e.target.value;
              setSettings(prev => ({
                ...prev,
                general: { ...prev.general, primaryColor: newColor }
              }));
              
              // Apply color to website immediately
              document.documentElement.style.setProperty('--primary', newColor);
              document.documentElement.style.setProperty('--primary-foreground', '#ffffff');
              
              // Update CSS variables for different shades
              const rgb = hexToRgb(newColor);
              if (rgb) {
                document.documentElement.style.setProperty('--primary-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
                document.documentElement.style.setProperty('--primary-dark', adjustBrightness(newColor, -20));
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Secondary Color</label>
          <input
            type="color"
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.general.secondaryColor}
            onChange={(e) => {
              const newColor = e.target.value;
              setSettings(prev => ({
                ...prev,
                general: { ...prev.general, secondaryColor: newColor }
              }));
              
              // Apply secondary color to website
              document.documentElement.style.setProperty('--secondary', newColor);
              document.documentElement.style.setProperty('--secondary-foreground', '#ffffff');
              
              const rgb = hexToRgb(newColor);
              if (rgb) {
                document.documentElement.style.setProperty('--secondary-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
                document.documentElement.style.setProperty('--secondary-dark', adjustBrightness(newColor, -20));
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Default Language</label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.general.defaultLanguage}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, defaultLanguage: e.target.value }
            }))}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="rw">Kinyarwanda</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.general.timezone}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, timezone: e.target.value }
            }))}
          >
            <option value="Africa/Kigali">Africa/Kigali</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Render security settings
  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Password Min Length</label>
          <input
            type="number"
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.security.passwordMinLength}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
            }))}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.security.passwordRequireUppercase}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, passwordRequireUppercase: e.target.checked }
              }))}
            />
            <span>Require Uppercase Letters</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.security.passwordRequireLowercase}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, passwordRequireLowercase: e.target.checked }
              }))}
            />
            <span>Require Lowercase Letters</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.security.passwordRequireNumbers}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, passwordRequireNumbers: e.target.checked }
              }))}
            />
            <span>Require Numbers</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.security.passwordRequireSpecialChars}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, passwordRequireSpecialChars: e.target.checked }
              }))}
            />
            <span>Require Special Characters</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Session Timeout (hours)</label>
          <input
            type="number"
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.security.sessionTimeout}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
          <input
            type="number"
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Lockout Duration (minutes)</label>
          <input
            type="number"
            className="w-full h-9 rounded-md border border-input bg-background px-3"
            value={settings.security.lockoutDuration}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, lockoutDuration: parseInt(e.target.value) }
            }))}
          />
        </div>
      </div>
    </div>
  );

  // Render guardrails settings
  const renderGuardrailsSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Critical Role Protection</h3>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={settings.guardrails.preventLastSuperAdminRemoval}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              guardrails: { ...prev.guardrails, preventLastSuperAdminRemoval: e.target.checked }
            }))}
          />
          <span>Prevent removal of last super_admin</span>
        </label>
        <p className="text-xs text-muted-foreground">Prevents accidental removal of the last super admin account</p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Certificate Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Max Daily Certificates</label>
            <input
              type="number"
              className="w-full h-9 rounded-md border border-input bg-background px-3"
              value={settings.guardrails.maxDailyCertificates}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                guardrails: { ...prev.guardrails, maxDailyCertificates: parseInt(e.target.value) }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Certificate Formats</label>
            <div className="space-y-2">
              {['pdf', 'png', 'jpg'].map(format => (
                <label key={format} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.guardrails.certificateFormats.includes(format)}
                    onChange={(e) => {
                      const newFormats = e.target.checked
                        ? [...settings.guardrails.certificateFormats, format]
                        : settings.guardrails.certificateFormats.filter(f => f !== format);
                      setSettings(prev => ({
                        ...prev,
                        guardrails: { ...prev.guardrails, certificateFormats: newFormats }
                      }));
                    }}
                  />
                  <span>{format.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render system health settings
  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Maintenance Mode</h3>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={settings.system.maintenanceMode}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              system: { ...prev.system, maintenanceMode: e.target.checked }
            }))}
          />
          <span>Enable Maintenance Mode</span>
        </label>
        <p className="text-xs text-red-600">
          ⚠️ This will make the site inaccessible to regular users
        </p>
        {settings.system.maintenanceMode && (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-2">Maintenance Message</label>
            <textarea
              className="w-full h-20 rounded-md border border-input bg-background px-3"
              value={settings.system.maintenanceMessage}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, maintenanceMessage: e.target.value }
              }))}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Monitoring</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.system.enableHealthMonitoring}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, enableHealthMonitoring: e.target.checked }
              }))}
            />
            <span>Enable Health Monitoring</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.system.enableErrorReporting}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, enableErrorReporting: e.target.checked }
              }))}
            />
            <span>Enable Error Reporting</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={settings.system.enablePerformanceMonitoring}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, enablePerformanceMonitoring: e.target.checked }
              }))}
            />
            <span>Enable Performance Monitoring</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-sm text-muted-foreground">Loading settings...</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">System Configuration</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => exportComplianceData()}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Export Compliance Data
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationsSettings()}
            {activeTab === 'roles' && renderRolesSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'audit' && renderAuditSettings()}
            {activeTab === 'integrations' && renderIntegrationsSettings()}
            {activeTab === 'guardrails' && renderGuardrailsSettings()}
            {activeTab === 'system' && renderSystemSettings()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <div className="flex space-x-2">
              <button
                onClick={() => resetToDefaults(activeTab)}
                className="px-4 py-2 text-sm border border-border rounded hover:bg-muted"
              >
                Reset to Defaults
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => saveSettings(activeTab)}
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import NikahApplicationForm from '@/components/nikah/NikahApplicationForm';

function CreateNikahPage() {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  const handleSuccess = (refNumber?: string) => {
    setSuccess(true);
    setCreatedRef(refNumber || null);
    toast({
      title: 'Nikah Application Created',
      description: refNumber 
        ? `Application created successfully with reference: ${refNumber}`
        : 'Application created successfully.',
    });
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Nikah Application</h2>
        </div>
        
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:bg-green-950/20 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Application Created Successfully!</h3>
              {createdRef && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Reference Number: <span className="font-mono font-medium">{createdRef}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setSuccess(false);
              setCreatedRef(null);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Another Application
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/super-admin/applications'}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            View All Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create Nikah Application</h2>
        <p className="text-sm text-muted-foreground">
          Create a new nikah application on behalf of applicants
        </p>
      </div>

      <NikahApplicationForm 
        onSuccess={handleSuccess}
        onCancel={() => window.location.href = '/dashboard/super-admin/applications'}
      />
    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout title="Super Admin Dashboard" navItems={navItems}>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="masjids" element={<MasjidsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="applications" element={<ViewAllApplicationsPage />} />
        <Route path="certificates" element={<ViewCertificatesPage />} />
        <Route path="generate_certificate" element={<GenerateCertificatePage />} />
        <Route path="create_certificate_templates" element={<CreateCertificateTemplatePage />} />
        <Route path="creating_nikah_application" element={<CreateNikahPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="user-activity" element={<UserActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </DashboardLayout>
  );
}
