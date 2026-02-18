"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BookmarkCard } from "@/components/bookmark-card"
import { AddBookmarkForm } from "@/components/add-bookmark-form"
import { Bookmark as BookmarkIcon } from "lucide-react"
import type { Bookmark } from "@/lib/types"

export function BookmarkList({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[]
  userId: string
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  const refetchBookmarks = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    
    if (data) {
      setBookmarks(data as Bookmark[])
    }
  }

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          console.log("Real-time event:", payload.eventType, payload)
          
          if (payload.eventType === "INSERT") {
            const newBookmark = payload.new as Bookmark
            setBookmarks((prev) => {
              if (newBookmark.user_id === userId && !prev.find(b => b.id === newBookmark.id)) {
                return [newBookmark, ...prev]
              }
              return prev
            })
          } else if (payload.eventType === "DELETE") {
            const deletedBookmark = payload.old as Bookmark
            if (deletedBookmark.user_id === userId) {
              setBookmarks((prev) => prev.filter((b) => b.id !== deletedBookmark.id))
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("Real-time subscribed for user:", userId)
        }
      })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Polling fallback: refetch every 3 seconds to ensure data stays in sync
  useEffect(() => {
    const pollInterval = setInterval(() => {
      refetchBookmarks()
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [userId])

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <AddBookmarkForm userId={userId} onAdd={refetchBookmarks} />
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <BookmarkIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">No bookmarks yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first bookmark above to get started.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <AddBookmarkForm userId={userId} onAdd={refetchBookmarks} />
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} onDelete={refetchBookmarks} />
          ))}
        </div>
      </div>
    </div>
  )
}
