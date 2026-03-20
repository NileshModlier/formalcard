"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreateCardButtonProps {
  remainingQuota: number
}

export function CreateCardButton({ remainingQuota }: CreateCardButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (remainingQuota <= 0) {
      router.push("/dashboard?quota_exceeded=true")
      return
    }
    router.push("/cards/new")
  }

  return (
    <Button onClick={handleClick} size="lg" disabled={remainingQuota <= 0}>
      <Plus className="h-5 w-5 mr-2" />
      Create New Card
    </Button>
  )
}