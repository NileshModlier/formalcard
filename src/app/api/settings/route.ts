import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user profile
    let profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId: session.user.id },
      })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
      },
    })

    return NextResponse.json({
      name: user?.name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      company: profile?.company || "",
      position: profile?.position || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      linkedin: profile?.linkedin || "",
      website: profile?.website || "",
      showInDirectory: profile?.showInDirectory || false,
    })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
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
      name,
      phone,
      company,
      position,
      bio,
      location,
      linkedin,
      website,
      showInDirectory,
    } = body

    // Update user name
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      })
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        phone,
        company,
        position,
        bio,
        location,
        linkedin,
        website,
        showInDirectory,
      },
      create: {
        userId: session.user.id,
        phone,
        company,
        position,
        bio,
        location,
        linkedin,
        website,
        showInDirectory,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}