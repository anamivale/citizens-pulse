import { Badge } from "@/components/ui/badge"
import { getStatusInfo, getPriorityInfo, getReportTypeInfo } from "@/lib/constants"
import type { ReportStatus, ReportPriority, ReportType } from "@/types/database.types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: ReportStatus
  showIcon?: boolean
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const statusInfo = getStatusInfo(status)

  if (!statusInfo) return null

  return (
    <Badge className={cn("font-medium", statusInfo.color)}>
      {showIcon && <span className="mr-1">{statusInfo.icon}</span>}
      {statusInfo.label}
    </Badge>
  )
}

interface PriorityBadgeProps {
  priority: ReportPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityInfo = getPriorityInfo(priority)

  if (!priorityInfo) return null

  return (
    <Badge className={cn("font-medium", priorityInfo.color)}>
      {priorityInfo.label}
    </Badge>
  )
}

interface ReportTypeBadgeProps {
  type: ReportType
  showIcon?: boolean
}

export function ReportTypeBadge({ type, showIcon = true }: ReportTypeBadgeProps) {
  const typeInfo = getReportTypeInfo(type)

  if (!typeInfo) return null

  const colorMap = {
    issue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    compliment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    suggestion: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    request: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }

  return (
    <Badge className={cn("font-medium", colorMap[type])}>
      {showIcon && <span className="mr-1">{typeInfo.icon}</span>}
      {typeInfo.label}
    </Badge>
  )
}
