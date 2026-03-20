import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Charts component
async function AnalyticsChart({ title, data }: { title: string; data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          {data.length > 0 ? (
            <div className="w-full">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center">
                    <div 
                      className="bg-primary h-4 rounded"
                      style={{ 
                        width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`,
                        minWidth: "20px" 
                      }}
                    />
                    <span className="ml-2 text-sm font-medium w-16 text-right">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminAnalyticsPage() {
  // Get event statistics by type
  const eventStats = await prisma.cardEvent.groupBy({
    by: ["eventType"],
    _count: true,
    orderBy: {
      _count: {
        eventType: "desc",
      },
    },
  })

  // Get template usage
  const templateStats = await prisma.businessCard.groupBy({
    by: ["template"],
    where: { isDeleted: false },
    _count: true,
    orderBy: {
      _count: {
        template: "desc",
      },
    },
  })

  // Get aspect ratio usage
  const aspectRatioStats = await prisma.businessCard.groupBy({
    by: ["aspectRatio"],
    where: { isDeleted: false },
    _count: true,
  })

  // Get monthly card creation stats
  const monthlyStats = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as count
    FROM "BusinessCard"
    WHERE "isDeleted" = false
      AND "createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  ` as any[]

  // Get top viewed cards
  const topViewedCards = await prisma.cardEvent.groupBy({
    by: ["cardId"],
    where: {
      eventType: "view_public",
    },
    _count: true,
    orderBy: {
      _count: {
        cardId: "desc",
      },
    },
    take: 10,
  })

  // Get card details for top viewed cards
  const topCardsWithDetails = await Promise.all(
    topViewedCards.map(async (item) => {
      const card = await prisma.businessCard.findUnique({
        where: { id: item.cardId },
        select: {
          companyName: true,
          slug: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      })
      return {
        ...card,
        viewCount: item._count,
      }
    })
  )

  // Get daily event stats for last 7 days
  const dailyStats = await prisma.$queryRaw`
    SELECT 
      DATE("createdAt") as date,
      "eventType",
      COUNT(*) as count
    FROM "CardEvent"
    WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    GROUP BY DATE("createdAt"), "eventType"
    ORDER BY date DESC, "eventType" ASC
  ` as any[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Detailed analytics and insights
        </p>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <AnalyticsChart
            title="Events by Type"
            data={eventStats.map((item) => ({
              name: item.eventType,
              value: item._count,
            }))}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Template Usage"
              data={templateStats.map((item) => ({
                name: item.template,
                value: item._count,
              }))}
            />
            <AnalyticsChart
              title="Aspect Ratio Usage"
              data={aspectRatioStats.map((item) => ({
                name: item.aspectRatio,
                value: item._count,
              }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Viewed Cards</CardTitle>
              <CardDescription>Most viewed business cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCardsWithDetails.map((card: any, index) => (
                  <div key={card.slug} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{card.companyName}</div>
                      <div className="text-sm text-muted-foreground">
                        {card.user?.name || "Unknown"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div className="text-2xl font-bold">{card.viewCount}</div>
                      <span className="text-sm text-muted-foreground">views</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <AnalyticsChart
            title="Monthly Card Creation"
            data={monthlyStats.map((item: any) => ({
              name: new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
              value: Number(item.count),
            }))}
          />
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days Activity</CardTitle>
              <CardDescription>Daily event breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyStats.map((item: any, index) => (
                  <div key={`${item.date}-${item.eventType}`} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="text-sm text-muted-foreground">{item.eventType}</div>
                    </div>
                    <div className="text-2xl font-bold">{Number(item.count)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}