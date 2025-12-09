import type { ReportType, ReportStatus, ReportPriority } from "@/types/database.types"

// Report Types
export const REPORT_TYPES = [
  { value: 'issue' as ReportType, label: 'Issue/Problem', icon: '⚠️', description: 'Report problems, complaints, or infrastructure issues' },
  { value: 'compliment' as ReportType, label: 'Compliment', icon: '👏', description: 'Appreciate well-done work by officials or departments' },
  { value: 'suggestion' as ReportType, label: 'Suggestion', icon: '💡', description: 'Propose ideas for improvement or community enhancement' },
  { value: 'request' as ReportType, label: 'Request', icon: '📝', description: 'Request services, assistance, or resources' },
] as const

// Report Categories
export const REPORT_CATEGORIES = [
  { value: 'roads_highways', label: 'Roads & Highways', icon: '🛣️' },
  { value: 'bridges', label: 'Bridges', icon: '🌉' },
  { value: 'street_lights', label: 'Street Lights', icon: '💡' },
  { value: 'drainage', label: 'Drainage Systems', icon: '🌊' },
  { value: 'public_buildings', label: 'Public Buildings', icon: '🏛️' },
  { value: 'water_supply', label: 'Water Supply', icon: '💧' },
  { value: 'electricity', label: 'Electricity', icon: '⚡' },
  { value: 'internet', label: 'Internet/Connectivity', icon: '📡' },
  { value: 'waste_management', label: 'Waste Management', icon: '🗑️' },
  { value: 'sewerage', label: 'Sewerage', icon: '🚰' },
  { value: 'healthcare', label: 'Healthcare Facilities', icon: '🏥' },
  { value: 'security', label: 'Security/Police', icon: '👮' },
  { value: 'fire_services', label: 'Fire Services', icon: '🚒' },
  { value: 'emergency', label: 'Emergency Services', icon: '🚑' },
  { value: 'public_safety', label: 'Public Safety', icon: '🛡️' },
  { value: 'schools', label: 'Schools', icon: '🏫' },
  { value: 'libraries', label: 'Libraries', icon: '📚' },
  { value: 'education_programs', label: 'Educational Programs', icon: '📖' },
  { value: 'environment', label: 'Environment', icon: '🌳' },
  { value: 'pollution', label: 'Pollution', icon: '🏭' },
  { value: 'public_transport', label: 'Public Transport', icon: '🚌' },
  { value: 'traffic', label: 'Traffic Management', icon: '🚦' },
  { value: 'parking', label: 'Parking', icon: '🅿️' },
  { value: 'community_centers', label: 'Community Centers', icon: '🏘️' },
  { value: 'social_welfare', label: 'Social Welfare', icon: '🤝' },
  { value: 'governance', label: 'Governance', icon: '⚖️' },
  { value: 'corruption', label: 'Corruption Reports', icon: '⚠️' },
  { value: 'other', label: 'Other', icon: '📋' },
] as const

// Report Priorities
export const REPORT_PRIORITIES = [
  {
    value: 'low' as ReportPriority,
    label: 'Low',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    description: 'Non-urgent, can be addressed in normal timeline'
  },
  {
    value: 'medium' as ReportPriority,
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    description: 'Needs attention within a reasonable timeframe'
  },
  {
    value: 'high' as ReportPriority,
    label: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    description: 'Requires prompt attention'
  },
  {
    value: 'urgent' as ReportPriority,
    label: 'Urgent',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    description: 'Immediate action required, safety concern'
  },
] as const

// Report Statuses
export const REPORT_STATUSES = [
  {
    value: 'new' as ReportStatus,
    label: 'New',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: '🆕',
    description: 'Report just submitted, awaiting review'
  },
  {
    value: 'under_review' as ReportStatus,
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: '👀',
    description: 'Authorities have acknowledged, investigation in progress'
  },
  {
    value: 'in_progress' as ReportStatus,
    label: 'In Progress',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    icon: '⚙️',
    description: 'Action being taken, work has started'
  },
  {
    value: 'resolved' as ReportStatus,
    label: 'Resolved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: '✅',
    description: 'Issue fixed/addressed, awaiting confirmation'
  },
  {
    value: 'closed' as ReportStatus,
    label: 'Closed',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: '🔒',
    description: 'Report completed and closed'
  },
  {
    value: 'rejected' as ReportStatus,
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: '❌',
    description: 'Report deemed invalid or duplicate'
  },
] as const

// Helper functions
export function getReportTypeInfo(type: ReportType) {
  return REPORT_TYPES.find(t => t.value === type)
}

export function getCategoryInfo(category: string) {
  return REPORT_CATEGORIES.find(c => c.value === category)
}

export function getPriorityInfo(priority: ReportPriority) {
  return REPORT_PRIORITIES.find(p => p.value === priority)
}

export function getStatusInfo(status: ReportStatus) {
  return REPORT_STATUSES.find(s => s.value === status)
}
