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
    const { gstin, companyName, brandName } = body

    if (!gstin || !companyName) {
      return NextResponse.json(
        { error: "GSTIN and company name are required" },
        { status: 400 }
      )
    }

    // Validate GSTIN format
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (!gstinRegex.test(gstin)) {
      return NextResponse.json(
        { error: "Invalid GSTIN format" },
        { status: 400 }
      )
    }

    // Check if GSTIN already exists
    const existingGst = await prisma.gstVerification.findUnique({
      where: { gstin },
    })

    if (existingGst) {
      return NextResponse.json(
        { error: "GSTIN already registered" },
        { status: 400 }
      )
    }

    // Simulate GST API call (in production, integrate with Setu GST API)
    const gstData = await mockGstApiCall(gstin)

    // Fuzzy match company name
    const mismatchWarning = !companyName.toLowerCase().includes(
      gstData.legalName?.toLowerCase() || ""
    ) &&
    !companyName.toLowerCase().includes(
      gstData.tradeName?.toLowerCase() || ""
    )

    // Create GST verification record
    const gstVerification = await prisma.gstVerification.create({
      data: {
        userId: session.user.id,
        gstin,
        companyName,
        legalName: gstData.legalName,
        tradeName: gstData.tradeName,
        registrationStatus: gstData.registrationStatus,
        natureOfBusiness: gstData.natureOfBusiness,
        address: gstData.address,
        mismatchWarning,
        manualReview: mismatchWarning,
      },
    })

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "pending_verification" },
    })

    return NextResponse.json({
      ...gstVerification,
      mismatchWarning,
    })
  } catch (error) {
    console.error("GST verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// Mock GST API call - Replace with actual Setu GST API in production
async function mockGstApiCall(gstin: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data based on GSTIN
  const mockData = {
    legalName: "Example Company Private Limited",
    tradeName: "ExampleCo",
    registrationStatus: "Active",
    natureOfBusiness: "IT Services",
    address: "123 Business Street, Mumbai, Maharashtra - 400001",
  }

  return mockData
}