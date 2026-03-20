import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CardGrid } from "@/components/card-grid"
import { SearchBar } from "@/components/search-bar"
import { CreateCardButton } from "@/components/create-card-button"

async function getCards(userId: string, searchQuery?: string) {
  const where: any = {
    userId,
    isDeleted: false,
  }

  if (searchQuery) {
    where.OR = [
      { companyName: { contains: searchQuery, mode: "insensitive" } },
      { designation: { contains: searchQuery, mode: "insensitive" } },
      { areaOfBusiness: { contains: searchQuery, mode: "insensitive" } },
    ]
  }

  const cards = await prisma.businessCard.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
  })

  return cards
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const session = await getServerSession(authOptions)
  const cards = await getCards(session!.user.id, searchParams.q)

  const cardCount = cards.length
  const quotaLimit = 40
  const remainingQuota = quotaLimit - cardCount

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Business Cards</h1>
            <p className="text-muted-foreground mt-1">
              Manage and share your professional cards
            </p>
          </div>
          <CreateCardButton remainingQuota={remainingQuota} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{cardCount}</div>
            <div className="text-sm text-muted-foreground">Total Cards</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{remainingQuota}</div>
            <div className="text-sm text-muted-foreground">Remaining Quota</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
            <div className="text-2xl font-bold text-slate-600">{quotaLimit}</div>
            <div className="text-sm text-muted-foreground">Total Quota Limit</div>
          </div>
        </div>

        {/* Search */}
        <SearchBar />

        {/* Cards Grid */}
        <CardGrid cards={cards} />
      </div>
    </DashboardLayout>
  )
}