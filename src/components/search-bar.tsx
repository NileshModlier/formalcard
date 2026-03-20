"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        router.push(`?q=${encodeURIComponent(query)}`)
      } else {
        router.push("/dashboard")
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, router])

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search cards by company, designation, or business..."
        className="pl-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}