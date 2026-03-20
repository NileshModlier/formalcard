import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/v1/analytics - Get user's analytics
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const cardId = searchParams.get("cardId")
    const days = parseInt(searchParams.get("days") || "30")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const where: any = {
      card: {
        userId: session.user.id,
      },
      createdAt: {
        gte: startDate,
      },
    }

    if (cardId) {
      where.cardId = cardId
    }

    // Get event statistics
    const eventStats = await prisma.cardEvent.groupBy({
      by: ["eventType"],
      where,
      _count: true,
    })

    // Get unique views
    const uniqueViews = await prisma.cardEvent.groupBy({
      by: ["uniqueKey"],
      where: {
        ...where,
        eventType: "view_public",
      },
    })

    // Get daily stats
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        "eventType",
        COUNT(*) as count
      FROM "CardEvent"
      WHERE "cardId" IN (
        SELECT id FROM "BusinessCard" 
        WHERE "userId" = ${session.user.id}
          AND "isDeleted" = false
      )
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt"), "eventType"
      ORDER BY date DESC, "eventType" ASC
    ` as any[]

    // Get card performance
    const cardPerformance = await prisma.businessCard.findMany({
      where: {
        userId: session.user.id,
        isDeleted: false,
      },
      select: {
        id: true,
        slug: true,
        companyName: true,
        template: true,
        _count: {
          select: {
            events: {
              where: {
                createdAt: {
                  gte: startDate,
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      period: `${days} days`,
      summary: {
        totalEvents: eventStats.reduce((sum, item) => sum + item._count, 0),
        totalViews: eventStats.find(e => e.eventType === "view_public")?._count || 0,
        uniqueViews: uniqueViews.length,
        pngExports: eventStats.find(e => e.eventType === "export_png")?._count || 0,
        pdfExports: eventStats.find(e => e.eventType === "export_pdf")?._count || 0,
        vcardExports: eventStats.find(e => e.eventType === "export_vcard")?._count || 0,
        linkShares: eventStats.find(e => e.eventType === "share_copied")?._count || 0,
      },
      byEventType: eventStats.reduce((acc, item) => {
        acc[item.eventType] = item._count
        return acc
      }, {} as Record<string, number>),
      dailyStats,
      cardPerformance: cardPerformance.map(card => ({
        ...card,
        totalEvents: card._count.events,
      })),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}