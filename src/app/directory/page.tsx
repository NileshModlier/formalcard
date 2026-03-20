import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link2, MapPin, Building2 } from "lucide-react"
import Link from "next/link"

async function getDirectory(searchParams?: {
  q?: string
  industry?: string
  location?: string
}) {
  const where: any = {
    isDeleted: false,
    isPublished: true,
    user: {
      profile: {
        showInDirectory: true,
      },
    },
  }

  if (searchParams?.q) {
    where.OR = [
      { companyName: { contains: searchParams.q, mode: "insensitive" } },
      { user: { name: { contains: searchParams.q, mode: "insensitive" } } },
      { user: { profile: { company: { contains: searchParams.q, mode: "insensitive" } } } },
      { areaOfBusiness: { contains: searchParams.q, mode: "insensitive" } },
    ]
  }

  if (searchParams?.industry) {
    where.areaOfBusiness = {
      contains: searchParams.industry,
      mode: "insensitive",
    }
  }

  if (searchParams?.location) {
    where.user = {
      ...where.user,
      profile: {
        ...where.user?.profile,
        location: {
          contains: searchParams.location,
          mode: "insensitive",
        },
      },
    }
  }

  const cards = await prisma.businessCard.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  return cards
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { q?: string; industry?: string; location?: string }
}) {
  const cards = await getDirectory(searchParams)

  // Get unique industries for filter
  const industries = await prisma.businessCard.findMany({
    where: {
      isDeleted: false,
      isPublished: true,
      areaOfBusiness: { not: null },
    },
    select: {
      areaOfBusiness: true,
    },
    distinct: ["areaOfBusiness"],
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Business Directory</h1>
          <p className="text-muted-foreground">
            Discover and connect with businesses on FormalCard
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Directory</CardTitle>
            <CardDescription>Find businesses by name, industry, or location</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input
                name="q"
                type="search"
                placeholder="Search by company name, person, or industry..."
                defaultValue={searchParams.q}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <Input
                    name="industry"
                    type="search"
                    placeholder="e.g., Technology, Manufacturing"
                    defaultValue={searchParams.industry}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    name="location"
                    type="search"
                    placeholder="e.g., Mumbai, Bangalore"
                    defaultValue={searchParams.location}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = "/directory"}
                >
                  Clear Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {cards.length} {cards.length === 1 ? "business" : "businesses"} found
          </p>
        </div>

        {/* Directory Listings */}
        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{card.companyName}</CardTitle>
                    <Badge variant="secondary">{card.template}</Badge>
                  </div>
                  {card.brandName && (
                    <CardDescription>{card.brandName}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-semibold">{card.designation}</div>
                    <div className="text-sm text-muted-foreground">
                      {card.user.name || card.user.email}
                    </div>
                  </div>

                  {card.areaOfBusiness && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 mr-2" />
                      {card.areaOfBusiness}
                    </div>
                  )}

                  {card.user.profile?.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {card.user.profile.location}
                    </div>
                  )}

                  <Link href={`/c/${card.slug}`} target="_blank">
                    <Button className="w-full" variant="outline">
                      <Link2 className="h-4 w-4 mr-2" />
                      View Business Card
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Your Own CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-2">
                Not in the directory?
              </h3>
              <p className="mb-4 opacity-90">
                Create your professional business card and join the network
              </p>
              <Link href="/auth/signup">
                <Button variant="secondary" size="lg">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}