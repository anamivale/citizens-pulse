"use client"

import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge, PriorityBadge, ReportTypeBadge } from "@/components/status-badge"
import { ThumbsUp, MessageCircle, Eye } from "lucide-react"
import type { Report } from "@/types/database.types"
import { getCategoryInfo } from "@/lib/constants"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ReportCardProps {
  report: Report
}

export function ReportCard({ report }: ReportCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isExpanded, setIsExpanded] = useState(false)
  const [upvoted, setUpvoted] = useState(report.user_has_upvoted || false)
  const [upvoteCount, setUpvoteCount] = useState(report.upvotes_count || 0)
  const [isUpvoting, setIsUpvoting] = useState(false)

  const shouldTruncate = report.description.length > 200

  const displayContent = shouldTruncate && !isExpanded
    ? report.description.substring(0, 200) + "..."
    : report.description

  const categoryInfo = getCategoryInfo(report.category)

  const handleUpvote = async () => {
    try {
      setIsUpvoting(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      if (upvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('report_upvotes')
          .delete()
          .eq('report_id', report.id)
          .eq('user_id', user.id)

        if (error) throw error

        setUpvoted(false)
        setUpvoteCount(prev => prev - 1)
      } else {
        // Add upvote
        const { error } = await supabase
          .from('report_upvotes')
          .insert({
            report_id: report.id,
            user_id: user.id
          })

        if (error) throw error

        setUpvoted(true)
        setUpvoteCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling upvote:', error)
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleCardClick = () => {
    router.push(`/reports/${report.id}`)
  }

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="space-y-3">
          {/* Header: Type, Priority, Status, Report Number */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <ReportTypeBadge type={report.report_type} />
              {report.priority && <PriorityBadge priority={report.priority} />}
              {report.report_type !== 'compliment' && <StatusBadge status={report.status} />}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {report.report_number}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold leading-tight">{report.title}</h3>

          {/* Meta: Author, Category, Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>
              {report.is_anonymous || !report.profiles ? (
                <Badge variant="secondary">Anonymous</Badge>
              ) : (
                <span className="font-medium">{report.profiles?.username}</span>
              )}
            </span>
            {categoryInfo && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>{categoryInfo.icon}</span>
                  <span>{categoryInfo.label}</span>
                </span>
              </>
            )}
            <span>•</span>
            <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm whitespace-pre-wrap text-foreground/90">{displayContent}</p>
        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Affected Areas */}
        {report.affected_areas && report.affected_areas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {report.affected_areas.map((area, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                📍 {area}
              </Badge>
            ))}
          </div>
        )}

        {/* Status */}
        {report.report_type !== 'compliment' && (
          <div className="pt-2">
            <StatusBadge status={report.status} />
          </div>
        )}

        {/* Footer: Stats */}
        <div className="flex items-center gap-4 pt-2 border-t text-sm text-muted-foreground">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleUpvote()
            }}
            disabled={isUpvoting}
            className={cn(
              "flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50",
              upvoted && "text-primary font-medium"
            )}
          >
            <ThumbsUp className={cn("h-4 w-4", upvoted && "fill-current")} />
            <span>{upvoteCount}</span>
          </button>

          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{report.updates_count || 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{report.views_count || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
