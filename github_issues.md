# GitHub Issues

Title: Implement User Authentication System

## Context
Users need to securely sign up and log in to the platform to submit reports and track their status.

## Description
Implement a complete authentication flow using Supabase Auth. This includes sign-up, login, and session management.

## Technical considerations
- Use Supabase Auth for backend
- Implement Next.js Middleware for route protection
- Create responsive Login and Signup pages
- Handle auth state persistence

## Acceptance criteria
- [ ] Users can sign up with email/password
- [ ] Users can log in with credentials
- [ ] Protected routes redirect unauthenticated users
- [ ] Auth state persists across reloads

## Resources
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

**Files to push:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `middleware.ts`
- `lib/supabase/server.ts`

---

Title: Implement Report Submission System

## Context
Citizens need a way to report civic issues (potholes, extensive trash, etc.) to the authorities.

## Description
Create a form interface for users to submit new reports. The form should capture all necessary details including location, category, and description.

## Technical considerations
- Support different report types (Issue, Suggestion, etc.)
- specialized categories for civic issues
- Store reports in `reports` table in Supabase
- Use Server Actions for submission

## Acceptance criteria
- [ ] User can select report type and category
- [ ] Form validates required fields
- [ ] Successful submission redirects to feed or confirmation
- [ ] Data is correctly stored in Supabase with user_id

## Resources
- [Supabase Database Definitions](file:///home/user/citizenPulse/complete-database-setup.sql)

**Files to push:**
- `app/create-report/page.tsx`
- `components/ui/select.tsx` (and other form components)
- `app/actions/report.ts` (if applicable)

---

Title: Implement Public Reports Feed

## Context
Community members want to see what issues have been reported in their area to stay informed and avoid duplicate reporting.

## Description
Develop a public feed on the homepage that lists recent reports. Include key details like status, upvotes, and description.

## Technical considerations
- Fetch reports from `reports` table
- Implement real-time updates using Supabase subscriptions
- Optimistic UI updates for interactions (upvotes)
- Responsive grid/list layout

## Acceptance criteria
- [ ] Homepage displays list of recent reports
- [ ] Report cards show title, status, and upvote count
- [ ] Feed updates in real-time or on refresh
- [ ] Empty state handled gracefully

## Resources
- [Figma Designs](link-to-figma)

**Files to push:**
- `app/page.tsx`
- `components/report-feed.tsx`
- `components/report-card.tsx`
- `components/status-badge.tsx`

---

Title: Implement Admin Dashboard

## Context
City officials need a central hub to view, manage, and update the status of submitted reports.

## Description
Create a secure dashboard accessible only to users with 'admin' role. Provide statistics and a list of reports with management actions.

## Technical considerations
- Verify 'admin' role in RLS policies and UI
- Aggregate statistics for the overview
- Interface to change report status (New -> Resolved)

## Acceptance criteria
- [ ] Dashboard is accessible only to admins
- [ ] Key statistics (Total, Resolved, etc.) are displayed
- [ ] Admins can view full usage details
- [ ] Admins can update report status

## Resources
- [Admin Role Migration](file:///home/user/citizenPulse/supabase-migration-admin-role.sql)

**Files to push:**
- `app/admin/page.tsx`
- `app/admin/layout.tsx`
- `components/admin/report-table.tsx` (if exists)

---

Title: Database Schema & Migration Setup

## Context
The application requires a robust data model to store users, reports, and interactions securely.

## Description
Set up the initial database schema including tables, enums, RLS policies, and triggers for automation.

## Technical considerations
- Use Supabase/PostgreSQL
- Define Enums for status, priority, and report types
- Implement Row Level Security (RLS) for data protection
- Triggers for `updated_at` and other auto-fields

## Acceptance criteria
- [ ] All tables created successfully (`reports`, `profiles`, etc.)
- [ ] RLS policies enforced (Users edit own data, Public view)
- [ ] Triggers functioning (Report numbers generated)
- [ ] Types generated for TypeScript

## Resources
- [Schema Definition](file:///home/user/citizenPulse/complete-database-setup.sql)

**Files to push:**
- `complete-database-setup.sql`
- `types/database.types.ts`
