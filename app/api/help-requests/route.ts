import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const helpRequests = await prisma.helpRequest.findMany({
      where: {
        status: "open",
        OR: [
          { privacy: "public" },
          { userId: session.user.id as string }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            skills: true,
            reputation: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(helpRequests)
  } catch (error) {
    console.error("Error fetching help requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, tags, privacy } = body

    const helpRequest = await prisma.helpRequest.create({
      data: {
        title,
        description,
        category,
        tags: JSON.stringify(tags || []),
        privacy: privacy || "public",
        userId: session.user.id as string
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(helpRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating help request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

