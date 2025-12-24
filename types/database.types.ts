// Database type definitions for CitizenPulse

// Report Types
export type ReportType = 'issue' | 'compliment' | 'suggestion' | 'request'

// Report Priorities
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent'

// Report Statuses
export type ReportStatus = 'new' | 'under_review' | 'in_progress' | 'resolved' | 'closed' | 'rejected'

// User Roles
export type UserRole = 'citizen' | 'official' | 'admin'

// Update Types
export type UpdateType = 'comment' | 'status_change' | 'official_update'

// Profile interface
export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

// Report interface
export interface Report {
  id: string
  user_id: string
  report_number: string
  report_type: ReportType
  title: string
  description: string
  category: string
  affected_areas: string[] | null
  priority: ReportPriority | null
  status: ReportStatus
  is_anonymous: boolean
  contact_phone: string | null
  contact_email: string | null
  latitude: number | null
  longitude: number | null
  upvotes_count: number
  updates_count: number
  views_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
  user_has_upvoted?: boolean
}

// Report Update interface
export interface ReportUpdate {
  id: string
  report_id: string
  user_id: string
  update_type: UpdateType
  message: string
  old_status: ReportStatus | null
  new_status: ReportStatus | null
  is_official: boolean
  created_at: string
  profiles?: Profile
}
