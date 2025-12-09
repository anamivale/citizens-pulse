import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background py-8 px-4 sm:px-4 lg:px-10">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Citizen Pulse</h3>
            <p className="text-sm text-muted-foreground">
              A community response platform for posting and viewing issues affecting different constituencies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Find Your Constituency</h4>
            <p className="text-sm text-muted-foreground">
              Select your area when creating reports to help connect with your local community.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Citizen Pulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
