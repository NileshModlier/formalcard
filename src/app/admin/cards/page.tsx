import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, RotateCcm, Eye } from "lucide-react"

async function getCards(searchQuery?: string, showDeleted?: string) {
  const where: any = {
    isDeleted: showDeleted === "true",
  }

  if (searchQuery) {
    where.OR = [
      { companyName: { contains: searchQuery, mode: "insensitive" } },
      { gstin: { contains: searchQuery, mode: "insensitive" } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
    ]
  }

  const cards = await prisma.businessCard.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          events: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return cards
}

function CardsList({ cards, showDeleted }: { cards: any[], showDeleted: boolean }) {
  const handleToggleDelete = async (cardId: string, isDeleted: boolean) => {
    const response = await fetch(`/api/admin/cards/${cardId}/delete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDeleted: !isDeleted }),
    })

    if (response.ok) {
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold">{card.companyName}</h3>
                  <Badge variant={card.isPublished ? "default" : "secondary"}>
                    {card.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline">{card.template}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  GSTIN: {card.gstin} | {card.designation}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Owner: {card.user.name || card.user.email}</span>
                  <span>Views: {card._count.events}</span>
                  <span>Created: {new Date(card.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/c/${card.slug}`, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                {showDeleted ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleToggleDelete(card.id, card.isDeleted)}
                  >
                    <Restore className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleToggleDelete(card.id, card.isDeleted)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function AdminCardsPage({
  searchParams,
}: {
  searchParams: { q?: string; deleted?: string }
}) {
  const showDeleted = searchParams.deleted === "true"
  const cards = await getCards(searchParams.q, searchParams.deleted)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Card Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage business cards and moderation
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <Input
                name="q"
                type="search"
                placeholder="Search by company, GSTIN, or owner..."
                defaultValue={searchParams.q}
              />
            </form>
          </CardContent>
        </Card>

        <Button
          variant={showDeleted ? "default" : "outline"}
          onClick={() => window.location.href = showDeleted ? "/admin/cards" : "/admin/cards?deleted=true"}
        >
          {showDeleted ? "Show Active" : "Show Deleted"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {showDeleted ? "Deleted Cards" : "Active Cards"}
            </div>
          </CardContent>
        </Card>
      </div>

      <CardsList cards={cards} showDeleted={showDeleted} />
    </div>
  )
}