
export interface MessageReply {
  sender: string;
  text: string;
}

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  role: string;
  text: string;
  images?: string[];
  time: string;
  isSent: boolean;
  replyTo?: MessageReply;
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
}