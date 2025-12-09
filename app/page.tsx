import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ReportFeed } from "@/components/report-feed"


export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Reports</h1>
            <p className="text-muted-foreground">
              Report issues, share compliments, make suggestions, and submit requests
            </p>
          </div>
          <ReportFeed />
        </div>
      </main>
      <Footer />
    </div>
  )
}
