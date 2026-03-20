import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardCreator } from "@/components/card-creator"

export default async function NewCardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Business Card</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details and design your card
          </p>
        </div>
        <CardCreator />
      </div>
    </DashboardLayout>
  )
}