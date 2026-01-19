'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import type { Post, Reply } from '@/lib/community';
import { chatroomsApi, usersApi } from '@/services/api';
import { websocketService } from '@/services/websocket';

import { ChatHeader } from '@/components/chatroom/chatHeader';
import { MessageInput } from '@/components/chatroom/messageInput';
import { PostContent } from '@/components/chatroom/postContent';
import { ChatSidebar } from '@/components/chatroom/chatSidebar';
import ReplyModal from '@/components/chatroom/replyModal';

// For mobile: simulate "back" navigation between list and feed
interface ChatRoom {
  id: string;
  name: string;
  members: number;
  unread?: number;
}

export default function ChatRoomsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string>('');
  const [showFeed, setShowFeed] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Post | null>(null);
  const [chatrooms, setChatrooms] = useState<ChatRoom[]>([]);
  const [chatroomsLoading, setChatroomsLoading] = useState(true);
  const [chatroomsError, setChatroomsError] = useState<string | null>(null);
  const [postsByRoom, setPostsByRoom] = useState<Record<string, Post[]>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>();

  // Detect screen size
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch current user and connect WebSocket
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // First sync user data to ensure it exists in DB
        await usersApi.syncUser({});
        // Then get the current user profile
        const userRes = await usersApi.getCurrentUser();
        setCurrentUser(userRes.data);
        // Connect to WebSocket
        websocketService.connect(userRes.data.user_id);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        setChatroomsError('Failed to authenticate user. Please try refreshing the page.');
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch chat rooms from API
  useEffect(() => {
    const fetchChatrooms = async () => {
      try {
        setChatroomsLoading(true);
        setChatroomsError(null);
        const response = await chatroomsApi.getChatrooms();

        // Transform API response to component format
        const transformedChatrooms: ChatRoom[] = response.data.map((room) => ({
          id: room.chatroom_id,
          name: room.name || 'Unnamed Chatroom',
          members: room.member_count || 0,
          unread: 0, // TODO: Get from notification system
        }));

        setChatrooms(transformedChatrooms);

        // Set first room as active if no room is selected
        if (transformedChatrooms.length > 0 && !roomId) {
          setActiveRoom(transformedChatrooms[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch chat rooms:', err);
        setChatroomsError('Failed to load chat rooms. Please try again.');
      } finally {
        setChatroomsLoading(false);
      }
    };

    fetchChatrooms();
  }, [roomId]);

  // Sync URL with active room
  useEffect(() => {
    if (roomId) {
      setActiveRoom(roomId);
      setShowFeed(true);
    }
  }, [roomId]);

  // Fetch messages when active room changes
  useEffect(() => {
    if (activeRoom) {
      const fetchMessages = async () => {
        try {
          setMessagesLoading(true);
          const response = await chatroomsApi.getChatMessages(activeRoom);

          // Transform messages to posts format
          const posts: Post[] = response.data.map((msg: any) => ({
            id: parseInt(msg.message_id),
            user: {
              id: parseInt(msg.user_id),
              name: msg.user_id, // TODO: get user name from API
              avatar: msg.user_id.slice(0, 2).toUpperCase(),
              role: 'STUDENT' as const
            },
            text: msg.content,
            image: undefined, // TODO: handle attachments
            timestamp: new Date(msg.created_at).toLocaleString(),
            likes: 0, // TODO: get reactions count
            replies: [], // Messages don't have replies in this format
            isLiked: false,
            isBookmarked: false
          }));

          setPostsByRoom(prev => ({
            ...prev,
            [activeRoom]: posts
          }));
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        } finally {
          setMessagesLoading(false);
        }
      };

      fetchMessages();
    }
  }, [activeRoom]);

  // WebSocket event listeners
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      // Only update if it's for the current room
      if (message.chatId === activeRoom) {
        const newPost: Post = {
          id: parseInt(message.messageId),
          user: {
            id: parseInt(message.senderId),
            name: message.senderId === currentUser?.user_id ? 'You' : 'Unknown User', // TODO: get user name
            avatar: message.senderId === currentUser?.user_id ? 'YO' : 'UN',
            role: 'STUDENT'
          },
          text: message.content,
          timestamp: new Date(message.createdAt).toLocaleString(),
          likes: 0,
          replies: [],
          isLiked: false,
          isBookmarked: false
        };
        setPostsByRoom(prev => ({
          ...prev,
          [activeRoom]: [...(prev[activeRoom] || []), newPost]
        }));
      }
    };

    const handleMessageEdited = (data: any) => {
      if (activeRoom) {
        setPostsByRoom(prev => ({
          ...prev,
          [activeRoom]: prev[activeRoom]?.map(post =>
            post.id === parseInt(data.messageId) ? { ...post, text: data.content } : post
          ) || []
        }));
      }
    };

    const handleMessageDeleted = (data: any) => {
      if (activeRoom) {
        setPostsByRoom(prev => ({
          ...prev,
          [activeRoom]: prev[activeRoom]?.filter(post => post.id !== parseInt(data.messageId)) || []
        }));
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.chatId === activeRoom) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.userId), data.userId]);
      }
    };

    const handleUserStoppedTyping = (data: any) => {
      if (data.chatId === activeRoom) {
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
  }, [activeRoom, currentUser]);

  // Join/leave chat rooms
  useEffect(() => {
    if (activeRoom) {
      websocketService.joinChat(activeRoom);
    }

    return () => {
      if (activeRoom) {
        websocketService.leaveChat(activeRoom);
      }
    };
  }, [activeRoom]);

  // Handle chatroom selection
  const handleSelectRoom = (id: string | number) => {
    const roomIdStr = String(id);
    setActiveRoom(roomIdStr);
    if (isMobile) {
      setShowFeed(true);
      navigate(`/community/chatrooms/${roomIdStr}`);
    }
  };

  const handleBackToList = () => {
    setShowFeed(false);
    navigate('/community/chatrooms');
  };

  const handleCreateChatroom = async () => {
    const name = prompt('Enter chatroom name')?.trim();
    if (!name) return;

    try {
      const newChatroom = await chatroomsApi.createChatroom({
        chatroom_type: 'group',
        name: name,
        description: 'New chatroom'
      });

      // Add to local state
      setChatrooms((prev) => [...prev, {
        id: newChatroom.chatroom_id,
        name: newChatroom.name || name,
        members: newChatroom.member_count || 1,
        unread: 0
      }]);

      // Switch to the new chatroom
      setActiveRoom(newChatroom.chatroom_id);
    } catch (err) {
      console.error('Failed to create chatroom:', err);
    }
  };

  const handleSend = (message: string, file?: File) => {
    if (file) {
      // TODO: Handle file uploads
      console.log('File upload not implemented yet');
      return;
    }

    // Use WebSocket for real-time sending
    websocketService.sendMessage({
      chatId: activeRoom,
      content: message,
      messageType: 'text'
    });

    // Optimistically add to local state
    const newPost: Post = {
      id: Date.now(), // Temporary ID until WebSocket response
      user: {
        id: currentUser?.user_id || 0,
        name: 'You',
        avatar: 'YO',
        role: 'STUDENT'
      },
      text: message,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      replies: [],
      isLiked: false,
      isBookmarked: false
    };

    setPostsByRoom(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), newPost]
    }));
  };

  const handleToggleLike = async (postId: number) => {
    try {
      await chatroomsApi.addReaction(activeRoom, String(postId), { emoji: '👍' });
      // TODO: Refresh messages or use real-time updates
      console.log('Reaction added successfully');
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const handleOpenReply = (post: Post) => setReplyTarget(post);

  const handleSubmitReply = (text: string, file?: File) => {
    if (!replyTarget) return;
    const image = file ? URL.createObjectURL(file) : undefined;
    const reply: Reply = {
      id: Date.now(),
      user: { id: 99, name: 'You', avatar: '', role: 'STUDENT' },
      text,
      image,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false,
    };
    setPostsByRoom((prev) => ({
      ...prev,
      [activeRoom]: (prev[activeRoom] || []).map((post) =>
        post.id === replyTarget.id
          ? { ...post, replies: [reply, ...post.replies] }
          : post
      ),
    }));
    setReplyTarget(null);
  };

  const handleEditPost = async (messageId: number | string, newText: string, _newImages: string[]) => {
    try {
      await chatroomsApi.editMessage(activeRoom, String(messageId), { content: newText });
      // TODO: Refresh messages or use real-time updates
      console.log('Message edited successfully');
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleDeletePost = async (messageId: number | string) => {
    try {
      await chatroomsApi.deleteMessage(activeRoom, String(messageId));
      // TODO: Refresh messages or use real-time updates
      console.log('Message deleted successfully');
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleEditReply = (
    postId: number,
    replyId: number | string,
    newText: string,
    newImages: string[]
  ) => {
    const rId = Number(replyId);
    setPostsByRoom((prev) => ({
      ...prev,
      [activeRoom]: (prev[activeRoom] || []).map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: post.replies.map((r) =>
                r.id === rId
                  ? {
                      ...r,
                      text: newText,
                      image: newImages && newImages.length
                        ? newImages[0]
                        : undefined,
                    }
                  : r
              ),
            }
          : post
      ),
    }));
  };

  const handleDeleteReply = (postId: number, replyId: number | string) => {
    const rId = Number(replyId);
    setPostsByRoom((prev) => ({
      ...prev,
      [activeRoom]: (prev[activeRoom] || []).map((post) =>
        post.id === postId
          ? { ...post, replies: post.replies.filter((r) => r.id !== rId) }
          : post
      ),
    }));
  };

  const handleMessageChange = (message: string) => {
    if (activeRoom && message.trim()) {
      // Start typing
      websocketService.startTyping(activeRoom);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (activeRoom) {
          websocketService.stopTyping(activeRoom);
        }
      }, 1000);
    } else if (activeRoom) {
      // Stop typing if message is empty
      websocketService.stopTyping(activeRoom);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const currentPosts = postsByRoom[activeRoom] || [];

  // Render chatroom list (mobile) or sidebar (desktop)
  const renderChatroomList = () => (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader
        room={{ name: 'Community Chatrooms', description: '', members: 0 }}
        onToggleSidebar={() => {}}
        showBackButton={false}
      />
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {chatroomsLoading ? (
          <p className="text-center text-muted-foreground">Loading chat rooms...</p>
        ) : chatroomsError ? (
          <p className="text-center text-red-600">{chatroomsError}</p>
        ) : chatrooms.length === 0 ? (
          <p className="text-center text-muted-foreground">No chat rooms yet</p>
        ) : (
          chatrooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {room.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {room.members} member{room.members !== 1 ? 's' : ''}
                </p>
              </div>
              {room.unread && room.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                  {room.unread}
                </span>
              )}
            </div>
          ))
        )}
      </main>
      <MessageInput onSend={handleSend} />
    </div>
  );

  // Render chatroom feed (posts)
  const renderChatroomFeed = () => (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader
        room={{
          name: chatrooms.find((r) => r.id === activeRoom)?.name || 'Chatroom',
          description: '',
          members: 0,
        }}
        onToggleSidebar={() => {}}
        showBackButton={isMobile}
        onBack={handleBackToList}
      />
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {messagesLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : currentPosts.length === 0 ? (
          <p className="text-center text-muted-foreground">No posts yet</p>
        ) : (
          currentPosts.map((post) => (
            <PostContent
              key={post.id}
              post={post}
              onLike={handleToggleLike}
              onReply={handleOpenReply}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </main>
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(', ')} are typing...`}
        </div>
      )}
      <MessageInput onSend={handleSend} />
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* DESKTOP: Show sidebar + feed side-by-side */}
      {!isMobile && (
        <>
          <ChatSidebar
            chatrooms={chatrooms}
            activeId={activeRoom}
            onSelect={handleSelectRoom}
            onCreate={handleCreateChatroom}
            isOpen={true}
            onClose={() => {}}
          />
          <div className="flex-1 flex flex-col">
            <ChatHeader
              room={{
                name: chatrooms.find((r) => r.id === activeRoom)?.name || 'Chatroom',
                description: '',
                members: 0,
              }}
              onToggleSidebar={() => {}}
            />
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
              {currentPosts.length === 0 ? (
                <p className="text-center text-muted-foreground">No posts yet</p>
              ) : (
                currentPosts.map((post) => (
                  <PostContent
                    key={post.id}
                    post={post}
                    onLike={handleToggleLike}
                    onReply={handleOpenReply}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))
              )}
            </main>
            {typingUsers.length > 0 && (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(', ')} are typing...`}
              </div>
            )}
            <div className="relative">
         {typingUsers.length > 0 && (
           <div className="absolute bottom-full left-3 mb-2 text-sm text-muted-foreground">
             {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
           </div>
         )}
         <MessageInput onSend={handleSend} onChange={handleMessageChange} />
       </div>
          </div>
        </>
      )}

      {/* MOBILE: Show either list or feed */}
      {isMobile && (
        <>
          {showFeed ? renderChatroomFeed() : renderChatroomList()}
        </>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <ReplyModal
          open={Boolean(replyTarget)}
          post={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSubmit={handleSubmitReply}
          onEditReply={handleEditReply}
          onDeleteReply={handleDeleteReply}
        />
      )}
    </div>
  );
}
