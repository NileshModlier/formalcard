import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface PageProps {
  params: {
    id: string
  }
}

export async function POST(
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

    // Get GST verification
    const gstVerification = await prisma.gstVerification.findUnique({
      where: { id: params.id },
    })

    if (!gstVerification) {
      return NextResponse.json(
        { error: "GST verification not found" },
        { status: 404 }
      )
    }

    // Delete GST verification record
    await prisma.gstVerification.delete({
      where: { id: params.id },
    })

    // Revert user role to guest
    await prisma.user.update({
      where: { id: gstVerification.userId },
      data: { role: "guest" },
    })

    return NextResponse.json({
      message: "GST verification rejected",
    })
  } catch (error) {
    console.error("Reject GST verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}