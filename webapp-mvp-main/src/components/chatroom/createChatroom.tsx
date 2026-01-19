import { useState } from "react"
import { chatroomsApi } from "@/services/api"

const createChatroom = () => {
    const [chatroomType, setChatroomType] = useState<string>('group')
    const [chatroomAvatar, setChatroomAvatar] = useState<string>('')
    const [chatroomName, setChatroomName] = useState<string>('')
    const [chatroomDescription, setChatroomDescription] = useState<string>('')
    const [chatroomMemberCount, setChatroomMemberCount] = useState<string>('')
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!chatroomType || !chatroomName.trim()) {
            alert("Please fill in all required fields (Type and Name)")
            return
        }

        try {
            const payload = {
                chatroom_type: chatroomType,
                name: chatroomName.trim(),
                description: chatroomDescription.trim() || undefined,
                avatar_url: chatroomAvatar.trim() || undefined,
                settings: { name: "default" }
            }

            const response = await chatroomsApi.createChatroom(payload)

            console.log("Chatroom created:", response)

            // Reset form
            setChatroomType("group")
            setChatroomName("")
            setChatroomDescription("")
            setChatroomMemberCount("")
            setChatroomAvatar("")

            alert("Chatroom created successfully!")

            // Optional: redirect or refetch chatrooms
            // navigate(`/chatroom/${response.chatroom_id}`)

        } catch (error: any) {
            console.error("Failed to create chatroom", error)
            alert(`Failed to create chatroom: ${error.response?.data?.message || error.message || 'Unknown error'}`)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex items-center justify-center flex-col m-20">
            {/* chatroom type */}
                <div className="flex flex-col">
                    <label htmlFor="">Chatroom Type:</label>
                    <select
                        className='w-120 h-10 border border-black rounded mt-2 p-3'
                        name='chatroomType'
                        value={chatroomType}
                        onChange={(e) => setChatroomType(e.target.value)}
                        id='chatroomType'
                        required
                    >
                        <option value="group">Group</option>
                        <option value="topic_based">Topic Based</option>
                        <option value="direct">Direct (Private)</option>
                    </select>
                </div>
                {/* name, description, avatar url, created by and settings */}
                {/* chatroom name */}
                <div className="flex flex-col">
                    <label htmlFor="">Chatroom Name *</label>
                    <input
                        type="text"
                        className=' w-120 h-10 border border-black rounded mt-2 p-2'
                        name='chatroomName'
                        value={chatroomName}
                        onChange={(e) => setChatroomName(e.target.value)}
                        id='chatroomName'
                        required
                    />
                </div>
                {/*  */}
                <div className="flex flex-col">
                    <label htmlFor="">Chatroom Description</label>
                    <textarea
                        className='w-120 h-10 border border-black rounded mt-2 p-2'
                        name='chatroomDescription'
                        value={chatroomDescription}
                        onChange={(e) => setChatroomDescription(e.target.value)}
                        id='chatroomDescription'
                    />
                </div>
                {/*  */}
                <div className="flex flex-col">
                    <label htmlFor="">chatroom Member count</label>
                    <input
                        type="number"
                        className='w-120 h-10 border border-black rounded mt-2 px-3 py-2'
                        name='chatroomMemberCount'
                        value={chatroomMemberCount}
                        onChange={(e) => setChatroomMemberCount(e.target.value)}
                        id='chatroomMemberCount'
                    />
                </div>
                {/*  */}
                <div className="flex flex-col">
                    <label htmlFor="">chatroom Avatar</label>
                    <textarea
                        className='w-120 h-10 border border-black rounded mt-2 px-3 py-2'

                        name='chatroomAvatar'
                        value={chatroomAvatar}
                        onChange={(e) => setChatroomAvatar(e.target.value)}
                        id='chatroomAvatar'
                    />
                </div>

                <div>
                    <button type="submit" className="bg-gray-500 text-white px-2 py-4 rounded mt-2">Create Chatroom</button>
                </div>
            </form>
        </div>
    )
}

export default createChatroom
