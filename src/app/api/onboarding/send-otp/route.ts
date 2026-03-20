import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const { mobileNumber } = body

    if (!mobileNumber) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      )
    }

    // Validate mobile number format
    const phoneRegex = /^\+91[6-9]\d{9}$/
    if (!phoneRegex.test(mobileNumber)) {
      return NextResponse.json(
        { error: "Invalid mobile number format" },
        { status: 400 }
      )
    }

    // Simulate sending OTP (in production, integrate with SMS API)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP in session or database (simplified for demo)
    // In production, use Redis or database with expiry
    console.log(`OTP for ${mobileNumber}: ${otp}`)

    // For demo purposes, return the OTP
    // In production, don't return the actual OTP
    return NextResponse.json({
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}