"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updateReportStatus, updateReportPriority, postOfficialUpdate } from "@/app/actions/admin"
import { REPORT_STATUSES, REPORT_PRIORITIES } from "@/lib/constants"
import { ReportStatus, ReportPriority, ReportType } from "@/types/database.types"
import { Loader2 } from "lucide-react"

interface ReportAdminControlsProps {
    reportId: string
    currentStatus: ReportStatus
    currentPriority: ReportPriority | null
    reportType: ReportType
}

export function ReportAdminControls({
    reportId,
    currentStatus,
    currentPriority,
    reportType,
}: ReportAdminControlsProps) {
    const router = useRouter()
    const { toast } = useToast()

    const [status, setStatus] = useState<ReportStatus>(currentStatus)
    const [priority, setPriority] = useState<ReportPriority | string>(currentPriority || "low")
    const [officialUpdate, setOfficialUpdate] = useState("")

    const [isStatusLoading, setIsStatusLoading] = useState(false)
    const [isPriorityLoading, setIsPriorityLoading] = useState(false)
    const [isUpdateLoading, setIsUpdateLoading] = useState(false)

    const handleStatusChange = async () => {
        setIsStatusLoading(true)
        try {
            await updateReportStatus(reportId, status, "")
            toast({
                title: "Status Updated",
                description: `Report status changed to ${status}`,
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            })
        } finally {
            setIsStatusLoading(false)
        }
    }

    const handlePriorityChange = async (val: string) => {
        const newPriority = val as ReportPriority
        setPriority(newPriority)
        setIsPriorityLoading(true)
        try {
            await updateReportPriority(reportId, newPriority)
            toast({
                title: "Priority Updated",
                description: `Priority set to ${newPriority}`,
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update priority",
                variant: "destructive",
            })
        } finally {
            setIsPriorityLoading(false)
        }
    }

    const handlePostUpdate = async () => {
        if (!officialUpdate.trim()) return

        setIsUpdateLoading(true)
        try {
            await postOfficialUpdate(reportId, officialUpdate)
            toast({
                title: "Update Posted",
                description: "Official update added to timeline",
            })
            setOfficialUpdate("")
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to post update",
                variant: "destructive",
            })
        } finally {
            setIsUpdateLoading(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* Workflow Controls */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Status Update (Not for Compliments) */}
                {reportType !== 'compliment' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                        <h3 className="font-semibold">Update Status</h3>
                        <div className="flex gap-2">
                            <Select
                                value={status}
                                onValueChange={(val) => setStatus(val as ReportStatus)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_STATUSES.map((statusItem) => (
                                        <SelectItem key={statusItem.value} value={statusItem.value}>
                                            <div className="flex items-center gap-2">
                                                <span>{statusItem.icon}</span>
                                                <span>{statusItem.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleStatusChange}
                                disabled={status === currentStatus || isStatusLoading}
                            >
                                {isStatusLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update
                            </Button>
                        </div>
                    </div>
                )}

                {/* Priority */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold flex items-center gap-2">
                        Priority Level
                    </h3>
                    <Select
                        value={priority}
                        onValueChange={handlePriorityChange}
                        disabled={isPriorityLoading}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {REPORT_PRIORITIES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Official Update Form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h3 className="font-semibold">Post Official Update</h3>
                <p className="text-sm text-muted-foreground">
                    This update will be visible to the public and marked as &quot;Official&quot;.
                </p>
                <Textarea
                    placeholder="Write an official response or update..."
                    value={officialUpdate}
                    onChange={(e) => setOfficialUpdate(e.target.value)}
                    rows={4}
                />
                <div className="flex justify-end">
                    <Button
                        onClick={handlePostUpdate}
                        disabled={!officialUpdate.trim() || isUpdateLoading}
                    >
                        {isUpdateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Update
                    </Button>
                </div>
            </div>
        </div>
    )
}
