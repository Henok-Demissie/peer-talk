import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { helpRequestId } = body

    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id: helpRequestId },
      include: { user: true }
    })

    if (!helpRequest) {
      return NextResponse.json({ error: "Help request not found" }, { status: 404 })
    }

    if (helpRequest.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot match with your own request" }, { status: 400 })
    }

    // Find potential helpers based on tags and category
    const requestTags = JSON.parse(helpRequest.tags || "[]")
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id as string }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userSkills = JSON.parse(currentUser.skills || "[]")
    
    // Simple matching: check if user has matching skills/tags
    const hasMatchingTags = requestTags.some((tag: string) => 
      userSkills.some((skill: string) => 
        skill.toLowerCase().includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(skill.toLowerCase())
      )
    )

    if (!hasMatchingTags && requestTags.length > 0) {
      return NextResponse.json({ 
        error: "Your skills don't match this request",
        matchScore: 0
      }, { status: 400 })
    }

    // Create chat
    const chat = await prisma.chat.create({
      data: {
        helpRequestId,
        participants: {
          create: [
            { userId: helpRequest.userId, role: "seeker" },
            { userId: session.user.id as string, role: "helper" }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Update help request status
    await prisma.helpRequest.update({
      where: { id: helpRequestId },
      data: { status: "matched" }
    })

    return NextResponse.json({ chat, matchScore: hasMatchingTags ? 1 : 0.5 })
  } catch (error) {
    console.error("Error matching:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

