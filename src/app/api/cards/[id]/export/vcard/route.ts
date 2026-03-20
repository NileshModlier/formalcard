import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        eventType: "export_vcard",
        ipAddress,
        userAgent,
      },
    })

    // Generate vCard
    const vCardContent = generateVCard(card)

    return new NextResponse(vCardContent, {
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${card.slug}.vcf"`,
      },
    })
  } catch (error) {
    console.error("Export vCard error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

function generateVCard(card: any): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  
  // Format phone number for vCard (remove + and spaces)
  const formattedPhone = card.phone.replace(/\+|\s/g, "")
  
  // Format name
  const displayName = card.brandName || card.companyName
  const nameParts = displayName.split(" ")
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
  const firstName = nameParts.slice(0, -1).join(" ") || displayName

  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${displayName}
N:${lastName};${firstName};;;
ORG:${card.companyName}
TITLE:${card.designation}
TEL;TYPE=WORK,VOICE:${formattedPhone}
EMAIL;TYPE=WORK:${card.officialEmail}`

  if (card.personalEmail) {
    vcard += `\nEMAIL;TYPE=HOME:${card.personalEmail}`
  }

  if (card.address) {
    const formattedAddress = card.address.replace(/\n/g, "\\n")
    vcard += `\nADR;TYPE=WORK:;;${formattedAddress};;;;`
  }

  if (card.areaOfBusiness) {
    vcard += `\nNOTE:${card.areaOfBusiness}`
  }

  vcard += `
REV:${now}
END:VCARD`

  return vcard
}