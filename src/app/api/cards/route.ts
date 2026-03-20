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
    const {
      gstin,
      companyName,
      brandName,
      officialEmail,
      personalEmail,
      phone,
      address,
      designation,
      areaOfBusiness,
      template,
      aspectRatio,
    } = body

    // Validate required fields
    if (!gstin || !companyName || !officialEmail || !phone || !designation) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Validate phone format
    const phoneRegex = /^\+91[6-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      )
    }

    // Check card quota
    const cardCount = await prisma.businessCard.count({
      where: {
        userId: session.user.id,
        isDeleted: false,
      },
    })

    const quotaLimit = parseInt(process.env.CARD_QUOTA_LIMIT || "40")
    if (cardCount >= quotaLimit) {
      return NextResponse.json(
        { error: "Card quota limit reached" },
        { status: 400 }
      )
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(companyName)

    // Check if GSTIN already exists
    const existingGstin = await prisma.businessCard.findUnique({
      where: { gstin },
    })

    if (existingGstin) {
      return NextResponse.json(
        { error: "GSTIN already registered" },
        { status: 400 }
      )
    }

    // Create card
    const card = await prisma.businessCard.create({
      data: {
        userId: session.user.id,
        slug,
        gstin,
        companyName,
        brandName,
        officialEmail,
        personalEmail,
        phone,
        address,
        designation,
        areaOfBusiness,
        template,
        aspectRatio,
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error("Create card error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

async function generateUniqueSlug(companyName: string): Promise<string> {
  const baseSlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  
  let slug = baseSlug
  let counter = 1

  while (await prisma.businessCard.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}