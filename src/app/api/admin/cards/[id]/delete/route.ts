import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface PageProps {
  params: {
    id: string
  }
}

export async function PATCH(
  req: Request,
  { params }: PageProps
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { isDeleted } = body

    // Update card deletion status
    const updatedCard = await prisma.businessCard.update({
      where: { id: params.id },
      data: {
        isDeleted,
        deletedAt: isDeleted ? new Date() : null,
      },
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error("Toggle card delete error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}