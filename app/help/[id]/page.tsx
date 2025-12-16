"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface HelpRequest {
  id: string
  title: string
  description: string
  category: string
  tags: string
  status: string
  user: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

export default function HelpRequestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    if (session) {
      fetchHelpRequest()
    }
  }, [session, params.id])

  const fetchHelpRequest = async () => {
    try {
      const response = await fetch("/api/help-requests")
      if (response.ok) {
        const data = await response.json()
        const request = data.find((r: HelpRequest) => r.id === params.id)
        if (request) {
          setHelpRequest(request)
        }
      }
    } catch (error) {
      console.error("Error fetching help request:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!helpRequest) return

    setMatching(true)
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          helpRequestId: helpRequest.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert("Matched successfully! Chat will be available soon.")
        router.push("/")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to match")
      }
    } catch (error) {
      console.error("Error matching:", error)
      alert("An error occurred")
    } finally {
      setMatching(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!helpRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Help request not found</div>
      </div>
    )
  }

  const tags = JSON.parse(helpRequest.tags || "[]")
  const isOwner = session?.user?.id === helpRequest.user.id

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Peer Help
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{helpRequest.title}</h1>
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
                {helpRequest.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Posted by {helpRequest.user.name || helpRequest.user.email} •{" "}
              {new Date(helpRequest.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{helpRequest.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Category</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
              {helpRequest.category}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isOwner && helpRequest.status === "open" && (
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={handleMatch}
                disabled={matching}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-lg font-medium"
              >
                {matching ? "Matching..." : "I Can Help!"}
              </button>
            </div>
          )}

          {isOwner && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-gray-600">This is your help request.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

