import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, MapPin, Calendar, Eye, ThumbsUp } from "lucide-react"
import { StatusBadge, PriorityBadge, ReportTypeBadge } from "@/components/status-badge"
import { ReportAdminControls } from "@/components/admin/ReportAdminControls"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function AdminReportDetailPage({
    params: { id },
}: {
    params: { id: string }
}) {
    const supabase = await createClient()

    // Fetch report details with profile
    const { data: report } = await supabase
        .from("reports")
        .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
        .eq("id", id)
        .single()

    if (!report) {
        notFound()
    }

    // Fetch report updates history
    const { data: updates } = await supabase
        .from("report_updates")
        .select(`
      *,
      profiles (
        username,
        role
      )
    `)
        .eq("report_id", id)
        .order("created_at", { ascending: false })

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Link
                href="/admin/reports"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reports
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm font-mono text-muted-foreground">
                                {report.report_number}
                            </span>
                            <StatusBadge status={report.status} />
                            <ReportTypeBadge type={report.report_type} />
                        </div>

                        <h1 className="text-3xl font-bold mb-4">{report.title}</h1>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(report.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                {report.views_count} views
                            </div>
                            <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                {report.upvotes_count} upvotes
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="prose dark:prose-invert max-w-none">
                        <h3>Description</h3>
                        <p className="whitespace-pre-wrap">{report.description}</p>
                    </div>

                    {/* Location / Areas */}
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Affected Areas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {report.affected_areas.map((area: string) => (
                                <Badge key={area} variant="outline">
                                    {area}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Updates Timeline */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Activity Timeline</h3>
                        <div className="space-y-6 border-l-2 border-muted pl-6 ml-2">
                            {updates?.map((update) => (
                                <div key={update.id} className="relative">
                                    <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 ${update.is_official ? 'bg-primary border-primary' : 'bg-background border-muted'
                                        }`} />

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {update.is_official ? 'Official Update' : update.profiles?.username || 'User'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                                            </span>
                                            {update.is_official && (
                                                <Badge variant="secondary" className="text-xs h-5">Official</Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-foreground/90">
                                            {update.message}
                                        </p>

                                        {update.update_type === 'status_change' && update.old_status && update.new_status && (
                                            <div className="flex items-center gap-2 mt-2 text-xs">
                                                <ReportTypeBadge type={report.report_type} />
                                                {report.priority && <PriorityBadge priority={report.priority} />}
                                                {report.report_type !== 'compliment' && <StatusBadge status={report.status} showIcon={false} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="relative">
                                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-background border-2 border-muted" />
                                <div className="space-y-1">
                                    <span className="font-medium">Report Created</span>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <ReportAdminControls
                            reportId={report.id}
                            currentStatus={report.status}
                            currentPriority={report.priority || null}
                            reportType={report.report_type}
                        />

                        {/* Additional Info Card */}
                        <div className="mt-6 p-4 border rounded-lg bg-muted/30 text-sm space-y-3">
                            <h4 className="font-semibold">Contact Info</h4>
                            {report.is_anonymous ? (
                                <p className="text-muted-foreground italic">Anonymous Reort</p>
                            ) : (
                                <div className="space-y-1">
                                    <p>User: {report.profiles?.full_name || 'N/A'}</p>
                                    {report.contact_email && <p>Email: {report.contact_email}</p>}
                                    {report.contact_phone && <p>Phone: {report.contact_phone}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
