import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch stats (we could optimize this with a single query or view later)
    const { count: totalReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })

    const { count: newReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "new")

    const { count: activeReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .in("status", ["under_review", "in_progress"])

    const { count: resolvedReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved")

    const stats = [
        {
            title: "Total Reports",
            value: totalReports || 0,
            icon: FileText,
            description: "All time reports",
            color: "text-blue-500",
        },
        {
            title: "New Reports",
            value: newReports || 0,
            icon: Clock,
            description: "Requires attention",
            color: "text-yellow-500",
        },
        {
            title: "Active Cases",
            value: activeReports || 0,
            icon: AlertTriangle,
            description: "Under review or in progress",
            color: "text-orange-500",
        },
        {
            title: "Resolved",
            value: resolvedReports || 0,
            icon: CheckCircle,
            description: "Successfully closed",
            color: "text-green-500",
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Welcome back. Here is what&apos;s happening today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h - 4 w - 4 ${stat.color} `} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Todo: Recent Activity Chart or List could go here */}
        </div>
    )
}
