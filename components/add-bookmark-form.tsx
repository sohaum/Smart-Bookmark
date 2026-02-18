"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function AddBookmarkForm({ userId, onAdd }: { userId: string; onAdd?: () => Promise<void> }) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !title.trim()) return

    setIsAdding(true)
    setError(null)

    const supabase = createClient()

    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`
    }

    const { error: insertError } = await supabase.from("bookmarks").insert({
      url: finalUrl,
      title: title.trim(),
      user_id: userId,
    })

    if (insertError) {
      setError(insertError.message)
      setIsAdding(false)
      return
    }

    setUrl("")
    setTitle("")
    setIsAdding(false)

    if (onAdd) {
      await onAdd()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="Title (e.g. React docs)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="sm:flex-1"
        />
        <Input
          type="text"
          placeholder="URL (e.g. react.dev)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="sm:flex-[2]"
        />
        <Button
          type="submit"
          disabled={isAdding || !url.trim() || !title.trim()}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
