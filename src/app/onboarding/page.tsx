import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding-wizard"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user has already completed onboarding
  if (session.user.role !== "guest" && session.user.role !== "pending_verification") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to Virtual Business Card & Communication App
          </h1>
          <p className="text-muted-foreground">
            Complete your business verification to get started
          </p>
        </div>

        <OnboardingWizard userId={session!.user.id} />
      </div>
    </div>
  )
}