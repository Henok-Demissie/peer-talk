"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
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

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchHelpRequests()
    }
  }, [status, router])

  const fetchHelpRequests = async () => {
    try {
      const response = await fetch("/api/help-requests")
      if (response.ok) {
        const data = await response.json()
        setHelpRequests(data)
      }
    } catch (error) {
      console.error("Error fetching help requests:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Peer Help</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <Link
                href="/create-request"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Ask for Help
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Help Requests</h2>
          <p className="mt-2 text-gray-600">Find people who need your help</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {helpRequests.map((request) => {
            const tags = JSON.parse(request.tags || "[]")
            return (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {request.title}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    {request.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {request.description}
                </p>
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Category:{" "}
                  </span>
                  <span className="text-sm text-indigo-600">{request.category}</span>
                </div>
                {tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    by {request.user.name || request.user.email}
                  </span>
                  <Link
                    href={`/help/${request.id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {helpRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No help requests yet.</p>
            <Link
              href="/create-request"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Be the first to ask for help →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
