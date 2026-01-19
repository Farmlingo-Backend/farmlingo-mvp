"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { chatsApi, usersApi } from "@/services/api";
import type { User } from "@/services/api";
import { websocketService } from "@/services/websocket";

import ChatSidebar from "@/components/chat/chatSidebar";
import ChatHeader from "@/components/chat/chatHeader";
import MessageList from "@/components/chat/messageList";
import ReplyBar from "@/components/chat/replyBar";
import ChatFooter from "@/components/chat/messageInput";

interface MessageReply {
  sender: string;
  text: string;
}
interface Message {
  id: number;
  sender: string;
  role: string;
  avatar: string;
  time: string;
  text?: string;
  images?: string[];
  file?: string | null;
  replyTo?: MessageReply;
  isSent: boolean;
  edited?: boolean;
}
// Direct chats loaded from API
interface DirectChat {
  chatId: string;
  participants: string[];
  lastMessage?: any;
  lastActivity: string;
}

export default function ChatUI() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First sync current user data
        await usersApi.syncUser({});

        const [usersRes, currentUserRes, chatsRes] = await Promise.all([
          usersApi.getUsers(),
          usersApi.getCurrentUser(),
          chatsApi.getUserChats()
        ]);

        setUsers(usersRes.users);
        setCurrentUser(currentUserRes.data);
        setDirectChats(chatsRes.data || []);

        // Connect to WebSocket
        if (currentUserRes.data) {
          websocketService.connect(currentUserRes.data.user_id);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle user selection from URL
  useEffect(() => {
    if (userId && users.length > 0) {
      const userIdStr = userId;
      const foundUser = users.find((u) => u.user_id === userIdStr);
      if (foundUser) {
        setSelectedUser(foundUser);
        // Find or create chat
        const existingChat = directChats.find(chat =>
          chat.participants.includes(currentUser?.user_id || '') &&
          chat.participants.includes(foundUser.user_id)
        );
        if (existingChat) {
          setCurrentChatId(existingChat.chatId);
          loadMessages(existingChat.chatId);
        } else {
          createChatWithUser(foundUser);
        }
      } else {
        // User not found, redirect to first user
        if (users.length > 0) {
          navigate(`/community/chats/${users[0].user_id}`, { replace: true });
        }
      }
    } else if (!userId && users.length > 0) {
      // No user selected, select first
      setSelectedUser(users[0]);
      navigate(`/community/chats/${users[0].user_id}`, { replace: true });
    }
  }, [userId, users, directChats, currentUser, navigate]);

  const loadMessages = async (chatId: string) => {
    try {
      const res = await chatsApi.getMessages(chatId);
      // Transform API messages to component format
      const transformedMessages: Message[] = res.data.map((msg: any) => ({
        id: parseInt(msg.message_id),
        sender: msg.user_id === currentUser?.user_id ? 'You' : selectedUser?.first_name || 'Unknown',
        role: 'STUDENT', // TODO: get from user data
        avatar: msg.user_id === currentUser?.user_id ? 'YO' : (selectedUser?.first_name?.slice(0, 2).toUpperCase() || 'UN'),
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        text: msg.content,
        isSent: msg.user_id === currentUser?.user_id,
        edited: msg.is_edited
      }));
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createChatWithUser = async (user: User) => {
    if (!currentUser) return;
    try {
      const res = await chatsApi.createDirectChat({
        userId1: currentUser.user_id,
        userId2: user.user_id
      });
      const newChat: DirectChat = {
        chatId: res.data.chatroom_id,
        participants: [currentUser.user_id, user.user_id],
        lastActivity: new Date().toISOString()
      };
      setDirectChats(prev => [...prev, newChat]);
      setCurrentChatId(newChat.chatId);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    navigate(`/community/chats/${user.user_id}`);
  };

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);

    if (currentChatId && newMessage.trim()) {
      // Start typing
      websocketService.startTyping(currentChatId);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (currentChatId) {
          websocketService.stopTyping(currentChatId);
        }
      }, 1000);
    } else if (currentChatId) {
      // Stop typing if message is empty
      websocketService.stopTyping(currentChatId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // WebSocket event listeners
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      // Only update if it's for the current chat
      if (message.chatId === currentChatId) {
        const transformedMessage: Message = {
          id: parseInt(message.messageId),
          sender: message.senderId === currentUser?.user_id ? 'You' : selectedUser?.first_name || 'Unknown',
          role: 'STUDENT',
          avatar: message.senderId === currentUser?.user_id ? 'YO' : (selectedUser?.first_name?.slice(0, 2).toUpperCase() || 'UN'),
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          text: message.content,
          isSent: message.senderId === currentUser?.user_id,
          edited: message.isEdited
        };
        setMessages(prev => [...prev, transformedMessage]);
      }
    };

    const handleMessageEdited = (data: any) => {
      if (currentChatId) {
        setMessages(prev => prev.map(msg =>
          msg.id === parseInt(data.messageId) ? { ...msg, text: data.content, edited: true } : msg
        ));
      }
    };

    const handleMessageDeleted = (data: any) => {
      if (currentChatId) {
        setMessages(prev => prev.filter(msg => msg.id !== parseInt(data.messageId)));
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.chatId === currentChatId) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.userId), data.userId]);
      }
    };

    const handleUserStoppedTyping = (data: any) => {
      if (data.chatId === currentChatId) {
        setTypingUsers(prev => prev.filter(u => u !== data.userId));
      }
    };

    websocketService.on('new_message', handleNewMessage);
    websocketService.on('message_edited', handleMessageEdited);
    websocketService.on('message_deleted', handleMessageDeleted);
    websocketService.on('user_typing', handleUserTyping);
    websocketService.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      websocketService.off('new_message', handleNewMessage);
      websocketService.off('message_edited', handleMessageEdited);
      websocketService.off('message_deleted', handleMessageDeleted);
      websocketService.off('user_typing', handleUserTyping);
      websocketService.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [currentChatId, currentUser, selectedUser]);

  // Join/leave chat rooms
  useEffect(() => {
    if (currentChatId) {
      websocketService.joinChat(currentChatId);
    }

    return () => {
      if (currentChatId) {
        websocketService.leaveChat(currentChatId);
      }
    };
  }, [currentChatId]);

  const [message, setMessage] = useState("");
  const [nextMessageId, setNextMessageId] = useState(100);
  const [replyingTo, setReplyingTo] = useState<{
    id: number;
    sender: string;
    text: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMessages = messages;

  const resetFile = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/"))
      setFilePreview(URL.createObjectURL(file));
    else setFilePreview(null);
  };

  const handleEditMessage = async (
    messageId: number | string,
    newText: string,
    _newImages: string[]
  ) => {
    if (!currentChatId) return;
    try {
      await chatsApi.sendMessage(currentChatId, { content: newText }); // Actually should be edit API, but using send for now
      // Update local state
      const idNum = typeof messageId === "number" ? messageId : parseInt(String(messageId), 10);
      setMessages(prev => prev.map(msg =>
        msg.id === idNum ? { ...msg, text: newText, edited: true } : msg
      ));
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number | string) => {
    if (!currentChatId) return;
    try {
      // Assume messageId is string from API
      await chatsApi.sendMessage(currentChatId, {}); // Should be delete API, but for now
      // Update local state
      const idNum = typeof messageId === "number" ? messageId : parseInt(String(messageId), 10);
      setMessages(prev => prev.filter(msg => msg.id !== idNum));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !selectedFile) return;
    if (!currentChatId) return;

    const content = message.trim();

    // Use WebSocket for real-time sending
    websocketService.sendMessage({
      chatId: currentChatId,
      content: content,
      messageType: 'text'
    });

    // Optimistically add to local messages
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    const newMsg: Message = {
      id: nextMessageId,
      sender: "You",
      avatar: "YO",
      role: "STUDENT",
      text: content,
      images: selectedFile && filePreview ? [filePreview] : [],
      file: selectedFile && !filePreview ? selectedFile.name : null,
      time: timeString,
      isSent: true,
      replyTo: replyingTo || undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage("");
    setReplyingTo(null);
    resetFile();
    setNextMessageId((prev) => prev + 1);
  };

  const handleReplyClick = (msg: Message) => {
    setReplyingTo({
      id: msg.id,
      sender: msg.sender,
      text:
        msg.text?.trim() ||
        (msg.images?.length
          ? "[Photo]"
          : msg.file
          ? `[File: ${msg.file}]`
          : ""),
    });
  };

  const showChatList = isMobile && !userId;
  const showChatThread = !showChatList;

  // Transform users to Chat format for sidebar
  const transformedChats: { id: number; name: string; avatar: string }[] = users.map(user => ({
    id: parseInt(user.user_id),
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
    avatar: user.first_name ? user.first_name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()
  }));

  // Create chatMessages record for sidebar
  const chatMessagesRecord: Record<number, Message[]> = {};
  users.forEach(user => {
    chatMessagesRecord[parseInt(user.user_id)] = messages; // Simplified, all have same messages for now
  });

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar: desktop always, mobile only when no chat selected */}
      {!isMobile || showChatList ? (
        <ChatSidebar
          chats={transformedChats}
          selectedChatId={selectedUser ? parseInt(selectedUser.user_id) : 0}
          chatMessages={chatMessagesRecord}
          onSelectChat={(chat) => {
            const user = users.find(u => parseInt(u.user_id) === chat.id);
            if (user) handleSelectUser(user);
          }}
        />
      ) : null}

      {/* Main chat thread */}
      {showChatThread && (
        // ✅ Reserve space for footer + safe area on mobile
        <div className="flex-1 flex flex-col bg-white w-full pb-[80px] sm:pb-0">
          <ChatHeader selectedChat={selectedUser ? {
            id: parseInt(selectedUser.user_id),
            name: `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.email,
            avatar: selectedUser.first_name ? selectedUser.first_name.slice(0, 2).toUpperCase() : selectedUser.email.slice(0, 2).toUpperCase()
          } : { id: 0, name: 'Loading...', avatar: 'LD' }} />

          {/* ✅ Scrollable message area */}
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            {currentMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">
                    Send a message to start the conversation
                  </p>
                </div>
              </div>
            ) : (
              <MessageList
                messages={currentMessages}
                onReply={handleReplyClick}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            )}
          </div>

          {/* ✅ Sticky footer area */}
          <div className="px-4 pt-2 pb-4 bg-white">
            {replyingTo && (
              <div className="mb-2">
                <ReplyBar
                  replyingTo={replyingTo}
                  onCancel={() => setReplyingTo(null)}
                />
              </div>
            )}

            {typingUsers.length > 0 && (
              <div className="mb-2 text-sm text-muted-foreground">
                {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
              </div>
            )}

            <ChatFooter
              message={message}
              setMessage={handleMessageChange}
              onSend={handleSend}
              fileInputRef={fileInputRef}
              onFileSelect={handleFileUpload}
              selectedFile={selectedFile}
              filePreview={filePreview}
              onRemoveFile={resetFile}
            />
          </div>
        </div>
      )}
    </div>
  );
}
