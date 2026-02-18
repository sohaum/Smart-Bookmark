"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bookmark, LogOut } from "lucide-react"

export function DashboardHeader({
  userEmail,
  userName,
  userAvatar,
}: {
  userEmail: string
  userName?: string
  userAvatar?: string
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail.split("@")[0].slice(0, 2).toUpperCase()

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Bookmark className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Markly
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={userEmail} />
            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col md:flex">
            {userName && (
              <span className="text-sm font-medium text-foreground">
                {userName}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {userEmail}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
