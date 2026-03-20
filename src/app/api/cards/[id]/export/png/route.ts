import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCanvas, loadImage } from "canvas"

interface PageProps {
  params: {
    id: string
  }
}

export async function GET(
  req: Request,
  { params }: PageProps
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const card = await prisma.businessCard.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
        isDeleted: false,
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      )
    }

    // Track export event
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"
    
    await prisma.cardEvent.create({
      data: {
        cardId: card.id,
        eventType: "export_png",
        ipAddress,
        userAgent,
      },
    })

    // Generate PNG
    const pngBuffer = await generateCardPNG(card)

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${card.slug}-card.png"`,
      },
    })
  } catch (error) {
    console.error("Export PNG error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

async function generateCardPNG(card: any): Promise<Buffer> {
  // Set dimensions based on aspect ratio
  let width = 1200
  let height = 800

  switch (card.aspectRatio) {
    case "square":
      width = 800
      height = 800
      break
    case "portrait":
      width = 800
      height = 1200
      break
    case "landscape":
    default:
      width = 1200
      height = 800
      break
  }

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Get template colors
  const colors = getTemplateColors(card.template)

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, colors.bgStart)
  gradient.addColorStop(1, colors.bgEnd)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Set text color
  ctx.fillStyle = colors.text

  // Draw content
  const padding = 80
  let y = padding + 60

  // Company Name / Brand Name
  ctx.font = "bold 48px Arial"
  const displayName = card.brandName || card.companyName
  ctx.fillText(displayName, padding, y)
  y += 40

  // Company Name (if different from brand name)
  if (card.brandName && card.brandName !== card.companyName) {
    ctx.font = "24px Arial"
    ctx.fillText(card.companyName, padding, y)
    y += 40
  }

  // Designation
  ctx.font = "bold 32px Arial"
  ctx.fillText(card.designation, padding, y)
  y += 40

  // Area of Business
  if (card.areaOfBusiness) {
    ctx.font = "20px Arial"
    ctx.fillText(card.areaOfBusiness, padding, y)
    y += 60
  }

  // Contact Information
  ctx.font = "18px Arial"
  const lineHeight = 35

  ctx.fillText(`Email: ${card.officialEmail}`, padding, y)
  y += lineHeight

  ctx.fillText(`Phone: ${card.phone}`, padding, y)
  y += lineHeight

  if (card.personalEmail) {
    ctx.fillText(`Personal: ${card.personalEmail}`, padding, y)
    y += lineHeight
  }

  if (card.address) {
    // Wrap address text
    const maxWidth = width - (padding * 2)
    const words = card.address.split(" ")
    let line = ""
    
    for (const word of words) {
      const testLine = line + word + " "
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(`Address: ${line}`, padding, y)
        y += lineHeight
        line = word + " "
      } else {
        line = testLine
      }
    }
    ctx.fillText(`Address: ${line}`, padding, y)
    y += lineHeight
  }

  // QR Code placeholder
  const qrSize = 100
  const qrX = width - padding - qrSize
  const qrY = height - padding - qrSize
  
  ctx.strokeStyle = colors.text
  ctx.lineWidth = 2
  ctx.strokeRect(qrX, qrY, qrSize, qrSize)
  
  ctx.font = "12px Arial"
  ctx.fillText("QR Code", qrX + 20, qrY + qrSize / 2)
  ctx.fillText("Scan to view", qrX + 15, qrY + qrSize / 2 + 15)

  return canvas.toBuffer("image/png")
}

function getTemplateColors(template: string) {
  const templates: Record<string, any> = {
    "minimal-light": {
      bgStart: "#ffffff",
      bgEnd: "#f8fafc",
      text: "#0f172a",
    },
    "corporate-indigo": {
      bgStart: "#4f46e5",
      bgEnd: "#3730a3",
      text: "#ffffff",
    },
    "bold-accent": {
      bgStart: "#f97316",
      bgEnd: "#dc2626",
      text: "#ffffff",
    },
    "monochrome-pro": {
      bgStart: "#000000",
      bgEnd: "#1f2937",
      text: "#ffffff",
    },
  }

  return templates[template] || templates["minimal-light"]
}