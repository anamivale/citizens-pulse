"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { REPORT_TYPES, REPORT_CATEGORIES, REPORT_PRIORITIES } from "@/lib/constants"
import type { ReportType, ReportPriority } from "@/types/database.types"

export const dynamic = 'force-dynamic'

const reportSchema = z.object({
  reportType: z.enum(['issue', 'compliment', 'suggestion', 'request']),
  category: z.string().min(1, "Category is required"),
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z.string()
    .min(1, "Description is required")
    .max(5000, "Description must be at most 5000 characters"),
  affectedAreas: z.string().min(1, "At least one affected area is required"),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().or(z.literal('')),
  isAnonymous: z.boolean(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
})

type ReportForm = z.infer<typeof reportSchema>

export default function CreateReportPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'issue',
      isAnonymous: false,
    },
  })

  const reportType = watch('reportType')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [supabase])

  const onSubmit = async (data: ReportForm) => {
    try {
      setLoading(true)
      setError("")

      const { data: { user } } = await supabase.auth.getUser()

      // Convert comma-separated areas to array
      const affectedAreasArray = data.affectedAreas
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0)

      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          user_id: user?.id || null,
          report_type: data.reportType as ReportType,
          category: data.category,
          title: data.title,
          description: data.description,
          affected_areas: affectedAreasArray,
          priority: (data.priority === "" ? null : data.priority) as ReportPriority || null,
          is_anonymous: user ? data.isAnonymous : true,
          contact_phone: data.contactPhone || null,
          contact_email: data.contactEmail || null,
          status: 'new',
        })

      if (insertError) throw insertError

      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create a Report</CardTitle>
            <CardDescription>
              Report issues, give compliments, make suggestions, or submit requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Report Type */}
              <div className="space-y-3">
                <Label>Report Type *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {REPORT_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                    >
                      <input
                        type="radio"
                        value={type.value}
                        {...register("reportType")}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.reportType && (
                  <p className="text-sm text-destructive">{errors.reportType.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a category</option>
                  {REPORT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Priority (only for issues) */}
              {reportType === 'issue' && (
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    {...register("priority")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select priority level</option>
                    {REPORT_PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label} - {priority.description}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="text-sm text-destructive">{errors.priority.message}</p>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Brief summary of your report"
                  maxLength={200}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Provide detailed information..."
                  rows={6}
                  maxLength={5000}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Affected Areas */}
              <div className="space-y-2">
                <Label htmlFor="affectedAreas">Affected Areas / Constituencies *</Label>
                <Input
                  id="affectedAreas"
                  {...register("affectedAreas")}
                  placeholder="e.g., Downtown, Eastside, Westborough (comma-separated)"
                />
                <p className="text-sm text-muted-foreground">
                  Separate multiple areas with commas
                </p>
                {errors.affectedAreas && (
                  <p className="text-sm text-destructive">{errors.affectedAreas.message}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm">Contact Information (Optional)</h4>
                <p className="text-xs text-muted-foreground">
                  Provide your contact details if you&apos;d like to be reached about this report
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      {...register("contactPhone")}
                      placeholder="+123456789"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      {...register("contactEmail")}
                      placeholder="email@example.com"
                      type="email"
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Anonymous posting */}
              {!isAuthenticated && (
                <div className="p-3 text-sm bg-muted rounded-md">
                  ℹ️ You are not logged in. Your report will be automatically submitted anonymously.
                </div>
              )}

              {isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    {...register("isAnonymous")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isAnonymous" className="cursor-pointer">
                    Submit anonymously
                  </Label>
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
