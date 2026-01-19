'use client';

import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CloudUpload, SendHorizontal, X } from 'lucide-react';

type Props = {
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile?: File | null;
  filePreview?: string | null;
  onRemoveFile?: () => void;
};

export default function ChatFooter({
  message,
  setMessage,
  onSend,
  fileInputRef,
  onFileSelect,
  selectedFile,
  filePreview,
  onRemoveFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (selectedFile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedFile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    // COMMENT: Add safe-area padding on mobile
    <div
      className="bg-white p-2 flex flex-col gap-2"
      style={{ paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 8px)' : '8px' }}
    >
      {selectedFile && (
        <div className="border p-2 rounded-md bg-gray-100 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{selectedFile.name}</p>
            {filePreview && (
              // COMMENT: Full-width on mobile, capped on desktop
              <img
                src={filePreview}
                alt="Preview"
                className="w-full max-w-full sm:max-w-[240px] h-24 object-cover rounded-md mt-1.5"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-2 flex-shrink-0 p-0"
            onClick={onRemoveFile}
            aria-label="Remove file"
          >
            <X className="w-3.5 h-3.5 text-red-500" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileSelect}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 w-9 flex-shrink-0 rounded-full hover:bg-gray-200"
          aria-label="Attach file"
        >
          <CloudUpload className="w-5 h-5 text-gray-700" />
        </Button>

        <Input
          ref={inputRef}
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-full border border-gray-300 bg-gray-100 focus:bg-white focus:border-gray-400 focus:ring-0 focus:ring-offset-0 min-w-0 text-sm py-2 px-4"
        />

        <Button
          onClick={onSend}
          disabled={!message.trim() && !selectedFile}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <SendHorizontal className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  );
}