import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { StatusBadge, PriorityBadge, ReportTypeBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage({
    searchParams,
}: {
    searchParams: { q?: string; status?: string; page?: string }
}) {
    const supabase = await createClient()
    const query = searchParams.q || ""
    const statusFilter = searchParams.status || "all"
    const page = Number(searchParams.page) || 1
    const limit = 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let dbQuery = supabase
        .from("reports")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to)

    if (statusFilter !== "all") {
        dbQuery = dbQuery.eq("status", statusFilter)
    }

    if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,report_number.ilike.%${query}%`)
    }

    const { data: reports, count, error } = await dbQuery

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports Management</h2>
                    <p className="text-muted-foreground">
                        View and manage citizen reports.
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search reports..."
                        className="pl-8"
                    // Note: In a real app we'd bind this to URL params via client component or form
                    // For now just UI or simplified server-side handling if form submission
                    />
                </div>
                {/* Add Status Filter Dropdown here if needed */}
            </div>

            {/* Reports Table */}
            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Report #</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Priority</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Comments</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {reports?.map((report) => (
                                <tr
                                    key={report.id}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    <td className="p-4 font-medium">{report.report_number}</td>
                                    <td className="p-4 max-w-[200px] truncate">{report.title}</td>
                                    <td className="p-4">
                                        <ReportTypeBadge type={report.report_type} />
                                    </td>
                                    <td className="p-4">
                                        {report.report_type !== 'compliment' ? (
                                            <StatusBadge status={report.status} />
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {report.priority ? (
                                            <PriorityBadge priority={report.priority} />
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">{report.updates_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/reports/${report.id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {reports?.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        No reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {from + 1}-{Math.min(to + 1, count || 0)} of {count} reports
                </div>
                <div className="flex gap-2">
                    {/* Pagination buttons would go here (linked to URL params) */}
                </div>
            </div>
        </div>
    )
}
