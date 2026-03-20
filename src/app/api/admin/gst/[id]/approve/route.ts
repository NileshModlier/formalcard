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

    // Find and update deposit payment for refund
    const depositPayment = await prisma.payment.findFirst({
      where: {
        userId: gstVerification.userId,
        type: "deposit",
        status: "completed",
        refundable: true,
        approvedForRefund: false,
      },
    })

    if (depositPayment) {
      // In production, initiate Razorpay refund here
      // const refund = await initiateRazorpayRefund(depositPayment.razorpayPaymentId)
      
      // Mark payment for refund
      await prisma.payment.update({
        where: { id: depositPayment.id },
        data: {
          approvedForRefund: true,
          refundStatus: "pending",
          updatedAt: new Date(),
        },
      })
    }

    // Update GST verification
    await prisma.gstVerification.update({
      where: { id: params.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: session.user.id,
      },
    })

    // Update user role to verified_member
    await prisma.user.update({
      where: { id: gstVerification.userId },
      data: { role: "verified_member" },
    })

    return NextResponse.json({
      message: "GST verification approved and refund initiated",
    })
  } catch (error) {
    console.error("Approve GST verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}