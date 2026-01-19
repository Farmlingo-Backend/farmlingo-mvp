import { MoreVertical, Menu, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Room {
  name: string
  description?: string
  members?: number
}

interface ChatHeaderProps {
  room: Room
  onToggleSidebar?: () => void
  onBack?: () => void
  showBackButton?: boolean
}

export function ChatHeader({ room, onToggleSidebar, onBack, showBackButton = false }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-3">
        {showBackButton && onBack ? (
          <Button size="icon" variant="ghost" className="md:hidden" onClick={onBack} aria-label="Back">
            <ArrowLeft />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" className="md:hidden" onClick={onToggleSidebar} aria-label="Open sidebar">
            <Menu />
          </Button>
        )}
        <div>
          <h2 className="font-semibold">{room.name}</h2>
          <p className="text-sm text-muted-foreground">
            {room.description} • {room.members} members
          </p>
        </div>
      </div>
      <Button size="icon" variant="ghost">
        <MoreVertical />
      </Button>
    </header>
  )
}
