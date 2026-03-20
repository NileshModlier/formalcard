import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link2, Eye, Download, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CardGridProps {
  cards: any[]
}

export function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📇</div>
        <h3 className="text-xl font-semibold mb-2">No cards yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first business card to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{card.companyName}</h3>
                <p className="text-sm text-muted-foreground">{card.designation}</p>
              </div>
              <Badge variant="secondary" className="ml-2">
                {card.template}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <span className="w-20">Email:</span>
                <span className="truncate">{card.officialEmail}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <span className="w-20">Phone:</span>
                <span className="truncate">{card.phone}</span>
              </div>
              {card.areaOfBusiness && (
                <div className="flex items-center text-muted-foreground">
                  <span className="w-20">Business:</span>
                  <span className="truncate">{card.areaOfBusiness}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/c/${card.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/cards/${card.id}/edit`}>
                    <span>Edit</span>
                  </a>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href={`/c/${card.slug}`} target="_blank" rel="noopener noreferrer">
                      <Link2 className="h-4 w-4 mr-2" />
                      Open Public Link
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/c/${card.slug}`)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href={`/api/cards/${card.id}/export/png`} target="_blank">
                      <Download className="h-4 w-4 mr-2" />
                      Export PNG
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`/api/cards/${card.id}/export/pdf`} target="_blank">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`/api/cards/${card.id}/export/vcard`} target="_blank">
                      <Download className="h-4 w-4 mr-2" />
                      Export vCard
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}