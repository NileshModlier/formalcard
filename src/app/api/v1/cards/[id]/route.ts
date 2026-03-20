import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/v1/cards/:id - Get card details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const card = await prisma.businessCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isDeleted: false,
      },
      include: {
        events: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error("Get card error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/cards/:id - Update card
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Verify ownership
    const existingCard = await prisma.businessCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isDeleted: false,
      },
    })

    if (!existingCard) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      )
    }

    // Update card
    const card = await prisma.businessCard.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error("Update card error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/cards/:id - Soft delete card
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify ownership
    const existingCard = await prisma.businessCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isDeleted: false,
      },
    })

    if (!existingCard) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      )
    }

    // Soft delete card
    await prisma.businessCard.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ message: "Card deleted successfully" })
  } catch (error) {
    console.error("Delete card error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}