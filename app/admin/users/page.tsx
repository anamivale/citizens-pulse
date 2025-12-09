import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string }
}) {
    const supabase = await createClient()
    const query = searchParams.q || ""
    const page = Number(searchParams.page) || 1
    const limit = 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let dbQuery = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "user") // Only show "users" role as requested
        .order("created_at", { ascending: false })
        .range(from, to)

    if (query) {
        dbQuery = dbQuery.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    }

    const { data: users, count, error } = await dbQuery

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        View registered citizens.
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Origin/Location</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {users?.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    <td className="p-4 font-medium">{user.full_name || '-'}</td>
                                    <td className="p-4">{user.username}</td>
                                    <td className="p-4">{user.location || '-'}</td>
                                    <td className="p-4">
                                        <Badge variant="secondary" className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {users?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No users found.
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
                    Showing {from + 1}-{Math.min(to + 1, count || 0)} of {count} users
                </div>
            </div>
        </div>
    )
}
