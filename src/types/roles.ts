export type AppRole =
  | 'super_admin'
  | 'masjid_admin'
  | 'imam'
  | 'mufti'
  | 'funeral_service'
  | 'ngo_manager'
  | 'government_liaison'
  | 'event_manager'
  | 'board_member'
  | 'general_staff'
  | 'public_user';

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  masjid_admin: 'Masjid Admin',
  imam: 'Imam',
  mufti: 'Mufti',
  funeral_service: 'Funeral Service Provider',
  ngo_manager: 'NGO Manager',
  government_liaison: 'Government Liaison',
  event_manager: 'Event Manager',
  board_member: 'Board Member',
  general_staff: 'General Staff',
  public_user: 'Public User',
};

export const ROLE_DASHBOARD_PATHS: Record<AppRole, string> = {
  super_admin: '/dashboard/super-admin',
  masjid_admin: '/dashboard/masjid-admin',
  imam: '/dashboard/imam',
  mufti: '/dashboard/mufti',
  funeral_service: '/dashboard/funeral-service',
  ngo_manager: '/dashboard/ngo-manager',
  government_liaison: '/dashboard/government-liaison',
  event_manager: '/dashboard/event-manager',
  board_member: '/dashboard/board-member',
  general_staff: '/dashboard/general-staff',
  public_user: '/dashboard/user',
};
