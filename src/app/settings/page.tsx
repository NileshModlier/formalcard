import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and preferences
          </p>
        </div>
        <SettingsForm userId={session!.user.id} />
      </div>
    </DashboardLayout>
  )
}