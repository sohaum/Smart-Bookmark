import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark, ArrowRight, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Bookmark className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Markly
          </span>
        </div>
        <Button asChild size="sm">
          <Link href="/auth/login">Sign in</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 pb-20 text-center">
        <div className="flex max-w-xl flex-col items-center gap-4">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Your bookmarks, everywhere.
          </h1>
          <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
            Save links instantly, access them from any device, and watch changes
            sync in real-time across all your tabs.
          </p>
          <Button asChild size="lg" className="mt-4 gap-2">
            <Link href="/auth/login">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Zap className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground">Real-time sync</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Changes appear instantly across all your open tabs and devices.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Shield className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground">Fully private</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your bookmarks are yours alone, protected by row-level security.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Bookmark className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground">Dead simple</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add a URL and title. That&apos;s it. No folders, no tags, no clutter.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
