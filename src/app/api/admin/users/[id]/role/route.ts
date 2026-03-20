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
    const { role } = body

    const validRoles = ["guest", "pending_verification", "verified_member", "corporate_member", "suspended", "admin"]
    
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Prevent changing admin role of other admins
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (targetUser.role === "admin" && targetUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify other admins" },
        { status: 403 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}