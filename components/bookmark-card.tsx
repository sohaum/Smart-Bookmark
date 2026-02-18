"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, Globe } from "lucide-react"
import type { Bookmark } from "@/lib/types"

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

export function BookmarkCard({ bookmark, onDelete }: { bookmark: Bookmark; onDelete?: () => Promise<void> }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmark.id)

    if (error) {
      setIsDeleting(false)
    } else if (onDelete) {
      await onDelete()
    }
  }

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-md ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate font-medium text-card-foreground text-sm">
            {bookmark.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {getDomain(bookmark.url)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            asChild
          >
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${bookmark.title}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Delete ${bookmark.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
