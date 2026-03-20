import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CardPreview } from "@/components/card-preview"
import { Button } from "@/components/ui/button"
import { Share2, Download, QrCode } from "lucide-react"
import { toast } from "sonner"

interface PageProps {
  params: {
    slug: string
  }
}

async function getCard(slug: string) {
  const card = await prisma.businessCard.findUnique({
    where: {
      slug,
      isDeleted: false,
      isPublished: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return card
}

export async function generateMetadata({ params }: PageProps) {
  const card = await getCard(params.slug)

  if (!card) {
    return {
      title: "Card Not Found",
    }
  }

  return {
    title: `${card.brandName || card.companyName} - Business Card`,
    description: `Business card for ${card.designation} at ${card.companyName}`,
  }
}

export default async function PublicCardPage({ params }: PageProps) {
  const card = await getCard(params.slug)

  if (!card) {
    notFound()
  }

  // Track view event
  const ipAddress = headers().get("x-forwarded-for") || headers().get("x-real-ip") || "unknown"
  const userAgent = headers().get("user-agent") || "unknown"
  
  // Create a unique key for view counting (hash of IP + UA)
  const uniqueKey = Buffer.from(`${ipAddress}-${userAgent}`).toString("base64")

  await prisma.cardEvent.create({
    data: {
      cardId: card.id,
      eventType: "view_public",
      ipAddress,
      userAgent,
      uniqueKey,
    },
  })

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${card.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Business Card</h1>
          <p className="text-muted-foreground">
            {card.brandName || card.companyName}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <CardPreview cardData={{
            companyName: card.companyName,
            brandName: card.brandName || "",
            officialEmail: card.officialEmail,
            personalEmail: card.personalEmail || "",
            phone: card.phone,
            address: card.address || "",
            designation: card.designation,
            areaOfBusiness: card.areaOfBusiness || "",
            template: card.template,
            aspectRatio: card.aspectRatio,
          }} />
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl)
              toast.success("Link copied to clipboard!")
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              window.open(`/api/cards/${card.id}/export/png`, "_blank")
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              window.open(`/api/cards/${card.id}/export/pdf`, "_blank")
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              window.open(`/api/cards/${card.id}/export/vcard`, "_blank")
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download vCard
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              toast.success("QR code functionality coming soon!")
            }}
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Powered by FormalCard</p>
          <p className="mt-1">
            Create your own business card at{" "}
            <a href="/" className="text-primary hover:underline">
              FormalCard
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}