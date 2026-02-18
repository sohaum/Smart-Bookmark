import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { BookmarkList } from "@/components/bookmark-list"
import type { Bookmark } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader
        userEmail={user.email ?? ""}
        userName={user.user_metadata?.full_name}
        userAvatar={user.user_metadata?.avatar_url}
      />

      <main className="flex flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Your Bookmarks
            </h1>
            <p className="text-sm text-muted-foreground">
              Save and manage your favorite links.
            </p>
          </div>

          <BookmarkList
            initialBookmarks={(bookmarks as Bookmark[]) ?? []}
            userId={user.id}
          />
        </div>
      </main>
    </div>
  )
}
