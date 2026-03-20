import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { mobileNumber, otp } = body

    if (!mobileNumber || !otp) {
      return NextResponse.json(
        { error: "Mobile number and OTP are required" },
        { status: 400 }
      )
    }

    // In production, verify OTP from database/Redis
    // For demo, accept any 6-digit OTP
    if (otp.length !== 6) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // Update user profile with mobile number
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { phone: mobileNumber },
      create: { userId: session.user.id, phone: mobileNumber },
    })

    return NextResponse.json({
      message: "OTP verified successfully",
      verified: true,
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}