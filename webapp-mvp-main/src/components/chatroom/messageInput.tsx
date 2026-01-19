import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SendHorizontal, CloudUpload, X } from "lucide-react"
import { useState, useRef } from "react"

interface MessageInputProps {
  onSend: (message: string, file?: File) => void
  onChange?: (message: string) => void
}

export function MessageInput({ onSend, onChange }: MessageInputProps) {
  const [value, setValue] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleSend = () => {
    if (!value.trim() && !file) return
    onSend(value.trim(), file ?? undefined)
    setValue("")
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleFile = (f?: File) => {
    if (!f) return
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  return (
    <div className="sticky bottom-0 bg-background border-t p-3 flex gap-2">
      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button size="icon" variant="ghost" onClick={() => fileRef.current?.click()} aria-label="Upload image">
        <CloudUpload />
      </Button>

      <div className="flex-1">
        {preview ? (
          <div className="flex items-center gap-2">
            <img src={preview} alt="preview" className="w-20 h-12 object-cover rounded" />
            <input
              placeholder="Type your message here..."
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                onChange?.(e.target.value);
              }}
              className="input w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSend()
              }}
            />
            <Button variant="ghost" size="icon" onClick={() => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setFile(null); if (fileRef.current) fileRef.current.value = "" }}>
              <X />
            </Button>
          </div>
        ) : (
          <Input
            placeholder="Type your message here..."
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              onChange?.(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSend()
            }}
          />
        )}
      </div>

      <Button onClick={handleSend} aria-label="Send message">
        <span>Send</span>
        <SendHorizontal />
      </Button>
    </div>
  )
}


