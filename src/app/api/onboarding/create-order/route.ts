import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
})

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
    const { type, amount } = body

    if (!type || !amount) {
      return NextResponse.json(
        { error: "Type and amount are required" },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${session.user.id}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        type,
      },
    }

    const order = await razorpay.orders.create(options)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        type,
        amount,
        status: "pending",
        razorpayOrderId: order.id,
        refundable: type === "deposit",
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}