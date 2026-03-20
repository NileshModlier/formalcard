"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, CreditCard, Settings, LogOut, Plus } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold text-primary">
                FormalCard
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/cards/new"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Card</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/cards/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Card
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t">
        <div className="flex items-center justify-around py-3">
          <Link
            href="/dashboard"
            className="flex flex-col items-center space-y-1 text-xs text-slate-600 hover:text-primary"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/cards/new"
            className="flex flex-col items-center space-y-1 text-xs text-slate-600 hover:text-primary"
          >
            <Plus className="h-5 w-5" />
            <span>Create</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center space-y-1 text-xs text-slate-600 hover:text-primary"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}