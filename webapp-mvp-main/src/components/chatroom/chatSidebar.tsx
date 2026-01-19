import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

interface ChatRoom {
  id: number | string
  name: string
  members: number
  unread?: number
}

interface ChatSidebarProps {
  chatrooms: ChatRoom[]
  activeId?: number | string
  onSelect: (id: number | string) => void
  onCreate?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function ChatSidebar({ chatrooms, activeId, onSelect, onCreate, isOpen, onClose }: ChatSidebarProps) {
  const [search, setSearch] = useState("")
  const filtered = useMemo(
    () =>
      chatrooms.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [chatrooms, search]
  )
  return (
    <>
      {/* overlay for mobile when open */}
      {isOpen ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative z-40 w-72 h-full bg-background border-r p-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 w-full">
                <Input
                  placeholder="Search chatrooms"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
                ✕
              </Button>
            </div>

            <div className="space-y-1">
              {filtered.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onSelect(room.id)
                    onClose?.()
                  }}
                  className={`w-full flex items-center gap-3 text-left p-2 rounded-lg ${
                    activeId === room.id ? "bg-muted border-l-4" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{room.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {room.members} members
                    </span>
                  </div>
                  {room.unread ? (
                    <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                      {room.unread}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="mt-auto">
              <Button size="sm" className="w-full" onClick={onCreate}>
                Create chatroom
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* desktop sidebar */}
      <aside className="hidden md:block w-72 border-r p-3 space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search chatrooms"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button size="icon" variant="ghost" aria-label="Create chatroom" onClick={onCreate}>
          <Plus />
        </Button>
      </div>

        <div className="space-y-1">
          {filtered.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelect(room.id)}
              className={`w-full flex items-center gap-3 text-left p-2 rounded-lg ${
                activeId === room.id ? "bg-muted border-l-4" : ""
              }`}
            >
              <div className="flex-1">
                <p className="font-medium">{room.name}</p>
                <span className="text-xs text-muted-foreground">{room.members} members</span>
              </div>
              {room.unread ? (
                <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{room.unread}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="mt-auto">
          <Button size="sm" className="w-full" onClick={onCreate}>
            Create chatroom
          </Button>
        </div>
    </aside>
    </>
  )
}
