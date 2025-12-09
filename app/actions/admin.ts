"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ReportStatus, ReportPriority } from "@/types/database.types"

// Helper to check admin role
async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'official')) {
        throw new Error("Forbidden")
    }

    return { supabase, user }
}

export async function updateReportStatus(reportId: string, newStatus: ReportStatus, message: string = "") {
    const { supabase, user } = await checkAdmin()

    // 1. Get current status to record in history
    const { data: report } = await supabase
        .from("reports")
        .select("status")
        .eq("id", reportId)
        .single()

    if (!report) throw new Error("Report not found")

    const oldStatus = report.status

    if (oldStatus === newStatus) return { success: true }

    // 2. Insert update record
    const { error: updateError } = await supabase
        .from("report_updates")
        .insert({
            report_id: reportId,
            user_id: user.id,
            update_type: 'status_change',
            message: message || `Status changed from ${oldStatus} to ${newStatus}`,
            old_status: oldStatus,
            new_status: newStatus,
            is_official: true
        })

    if (updateError) throw new Error(updateError.message)

    // 3. Update report status
    const { error: reportError } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId)

    if (reportError) throw new Error(reportError.message)

    revalidatePath(`/admin/reports/${reportId}`)
    revalidatePath(`/reports/${reportId}`)
    revalidatePath("/admin/reports")
    return { success: true }
}

export async function updateReportPriority(reportId: string, newPriority: ReportPriority) {
    const { supabase } = await checkAdmin()

    const { error } = await supabase
        .from("reports")
        .update({ priority: newPriority })
        .eq("id", reportId)

    if (error) throw new Error(error.message)

    revalidatePath(`/admin/reports/${reportId}`)
    revalidatePath("/admin/reports")
    return { success: true }
}

export async function postOfficialUpdate(reportId: string, message: string) {
    const { supabase, user } = await checkAdmin()

    const { error } = await supabase
        .from("report_updates")
        .insert({
            report_id: reportId,
            user_id: user.id,
            update_type: 'official_update',
            message: message,
            is_official: true
        })

    if (error) throw new Error(error.message)

    revalidatePath(`/admin/reports/${reportId}`)
    revalidatePath(`/reports/${reportId}`)
    return { success: true }
}
