import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, CreditCard, BarChart3, Settings, LogOut, Shield } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-2xl font-bold text-primary">
                <Shield className="h-8 w-8 inline mr-2" />
                Admin Panel
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
                <Link
                  href="/admin/cards"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Cards</span>
                </Link>
                <Link
                  href="/admin/analytics"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/admin/gst"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>GST Verification</span>
                </Link>
              </nav>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}