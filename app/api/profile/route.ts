import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skills: true,
        reputation: true,
        isOnline: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      skills: JSON.parse(user.skills || "[]")
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, skills, isOnline } = body

    const user = await prisma.user.update({
      where: { id: session.user.id as string },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(skills && { skills: JSON.stringify(skills) }),
        ...(isOnline !== undefined && { isOnline })
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skills: true,
        reputation: true,
        isOnline: true
      }
    })

    return NextResponse.json({
      ...user,
      skills: JSON.parse(user.skills || "[]")
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

