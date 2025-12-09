"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReportCard } from "@/components/report-card"
import type { Report } from "@/types/database.types"

export function ReportFeed() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch reports
        const { data, error } = await supabase
          .from('reports')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        // Check which reports the user has upvoted
        if (user && data) {
          const reportIds = data.map(r => r.id)
          const { data: upvotes } = await supabase
            .from('report_upvotes')
            .select('report_id')
            .eq('user_id', user.id)
            .in('report_id', reportIds)

          const upvotedIds = new Set(upvotes?.map(u => u.report_id) || [])

          const reportsWithUpvotes = data.map(report => ({
            ...report,
            user_has_upvoted: upvotedIds.has(report.id)
          }))

          setReports(reportsWithUpvotes)
        } else {
          setReports(data || [])
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('reports-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
        },
        () => {
          fetchReports()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading reports...</div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">No reports yet</p>
        <p className="text-sm text-muted-foreground">Be the first to report an issue!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  )
}
