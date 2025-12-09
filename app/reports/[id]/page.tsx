"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge, PriorityBadge, ReportTypeBadge } from "@/components/status-badge"
import { ThumbsUp, MessageCircle, Eye, ArrowLeft, Send } from "lucide-react"
import type { Report, ReportUpdate } from "@/types/database.types"
import { getCategoryInfo } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const reportId = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [updates, setUpdates] = useState<ReportUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [newUpdate, setNewUpdate] = useState("")
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)

        // Fetch report
        const { data: reportData, error: reportError } = await supabase
          .from('reports')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('id', reportId)
          .single()

        if (reportError) throw reportError

        // Check if user has upvoted
        if (user) {
          const { data: upvoteData } = await supabase
            .from('report_upvotes')
            .select('id')
            .eq('report_id', reportId)
            .eq('user_id', user.id)
            .single()

          setUpvoted(!!upvoteData)
        }

        setReport(reportData)
        setUpvoteCount(reportData.upvotes_count || 0)

        // Fetch updates
        const { data: updatesData, error: updatesError } = await supabase
          .from('report_updates')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('report_id', reportId)
          .order('created_at', { ascending: true })

        if (updatesError) throw updatesError
        setUpdates(updatesData || [])

        // Increment view count (once per session)
        const viewKey = `viewed_report_${reportId}`
        if (!sessionStorage.getItem(viewKey)) {
          await supabase.rpc('increment_report_views', { report_id: reportId })
          sessionStorage.setItem(viewKey, 'true')
        }

      } catch (error) {
        console.error('Error fetching report:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`report-${reportId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'report_updates',
          filter: `report_id=eq.${reportId}`,
        },
        () => {
          fetchReport()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reportId, supabase, router])

  const handleUpvote = async () => {
    try {
      setIsUpvoting(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      if (upvoted) {
        const { error } = await supabase
          .from('report_upvotes')
          .delete()
          .eq('report_id', reportId)
          .eq('user_id', user.id)

        if (error) throw error

        setUpvoted(false)
        setUpvoteCount(prev => prev - 1)
      } else {
        const { error } = await supabase
          .from('report_upvotes')
          .insert({
            report_id: reportId,
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

  const handleSubmitUpdate = async () => {
    if (!newUpdate.trim()) return

    try {
      setIsSubmittingUpdate(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('report_updates')
        .insert({
          report_id: reportId,
          user_id: user.id,
          update_type: 'comment',
          message: newUpdate.trim(),
          is_official: false
        })

      if (error) throw error

      setNewUpdate("")
    } catch (error) {
      console.error('Error submitting update:', error)
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading report...</div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!report) {
    return null
  }

  const categoryInfo = getCategoryInfo(report.category)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Report Card */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                {/* Header: Type, Priority, Status, Report Number */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ReportTypeBadge type={report.report_type} />
                    {report.priority && <PriorityBadge priority={report.priority} />}
                    {report.report_type !== 'compliment' && <StatusBadge status={report.status} />}
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">
                    {report.report_number}
                  </span>
                </div>

                {/* Title */}
                <CardTitle className="text-2xl">{report.title}</CardTitle>

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

            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm whitespace-pre-wrap text-foreground/90">
                  {report.description}
                </p>
              </div>

              {/* Affected Areas */}
              {report.affected_areas && report.affected_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Affected Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.affected_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        📍 {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(report.contact_phone || report.contact_email) && (
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {report.contact_phone && (
                      <p>Phone: {report.contact_phone}</p>
                    )}
                    {report.contact_email && (
                      <p>Email: {report.contact_email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  onClick={handleUpvote}
                  disabled={isUpvoting}
                  className={cn(
                    "flex items-center gap-2 hover:text-primary transition-colors disabled:opacity-50",
                    upvoted && "text-primary font-medium"
                  )}
                >
                  <ThumbsUp className={cn("h-5 w-5", upvoted && "fill-current")} />
                  <span>{upvoteCount} {upvoteCount === 1 ? 'upvote' : 'upvotes'}</span>
                </button>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  <span>{updates.length} {updates.length === 1 ? 'update' : 'updates'}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-5 w-5" />
                  <span>{report.views_count || 0} {report.views_count === 1 ? 'view' : 'views'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Updates & Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Updates */}
              {updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {update.profiles?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{update.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No updates yet. Be the first to comment!
                </p>
              )}

              {/* Add Update Form */}
              {isAuthenticated ? (
                <div className="space-y-3 pt-4 border-t">
                  <Textarea
                    placeholder="Add an update or comment..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    rows={3}
                    maxLength={2000}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitUpdate}
                      disabled={isSubmittingUpdate || !newUpdate.trim()}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmittingUpdate ? "Posting..." : "Post Update"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign in to add updates and comments
                  </p>
                  <Button onClick={() => router.push('/login')} variant="outline">
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
