import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Activity, Eye, Download, Share2 } from "lucide-react"

async function getAdminStats() {
  const [
    totalUsers,
    totalCards,
    totalEvents,
    recentUsers,
    recentCards,
    templateStats,
    monthlyStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.businessCard.count({ where: { isDeleted: false } }),
    prisma.cardEvent.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    }),
    prisma.businessCard.findMany({
      take: 5,
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.businessCard.groupBy({
      by: ["template"],
      where: { isDeleted: false },
      _count: true,
    }),
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "BusinessCard"
      WHERE "isDeleted" = false
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    ` as any[],
  ])

  // Get event type statistics
  const eventStats = await prisma.cardEvent.groupBy({
    by: ["eventType"],
    _count: true,
  })

  return {
    totalUsers,
    totalCards,
    totalEvents,
    recentUsers,
    recentCards,
    templateStats,
    monthlyStats,
    eventStats,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const eventsByType = stats.eventStats.reduce((acc, item) => {
    acc[item.eventType] = item._count
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform activity and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              Active business cards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Tracked interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsByType.view_public || 0}</div>
            <p className="text-xs text-muted-foreground">
              Card views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PNG Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsByType.export_png || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDF Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsByType.export_pdf || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsByType.share_copied || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Cards</CardTitle>
            <CardDescription>Latest created business cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{card.companyName}</div>
                    <div className="text-sm text-muted-foreground">
                      {card.user.name || card.user.email}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Template Usage</CardTitle>
          <CardDescription>Most popular card templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.templateStats.map((item) => (
              <div key={item.template} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="font-medium capitalize">{item.template}</div>
                </div>
                <div className="text-2xl font-bold">{item._count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}