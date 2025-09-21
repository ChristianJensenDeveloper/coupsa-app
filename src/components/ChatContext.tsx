import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatConversation, ChatMessage, User as UserType } from './types';
import { toast } from "sonner@2.0.3";

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  setActiveConversation: (conversation: ChatConversation | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  createConversation: (userId: string, userName: string, userEmail: string, initialMessage?: ChatMessage) => ChatConversation;
  updateConversationStatus: (conversationId: string, status: ChatConversation['status']) => void;
  assignConversation: (conversationId: string, adminName: string) => void;
  requestHumanAgent: (conversationId: string, userId: string, userName: string) => void;
  markMessagesAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock initial conversations for demo
const mockInitialConversations: ChatConversation[] = [
  {
    id: 'conv-demo-1',
    userId: 'user-demo-1',
    userName: 'Sarah Wilson',
    userEmail: 'sarah@example.com',
    status: 'pending',
    priority: 'high',
    subject: 'Urgent: Deal verification issue',
    lastMessage: 'I need help with the FTMO deal verification badge',
    lastMessageAt: '2025-01-08T15:45:00Z',
    createdAt: '2025-01-08T15:30:00Z',
    assignedAdmin: null,
    unreadCount: 2,
    tags: ['ftmo', 'verification', 'urgent'],
    messages: [
      {
        id: 'msg-demo-1',
        conversationId: 'conv-demo-1',
        senderId: 'user-demo-1',
        senderType: 'user',
        senderName: 'Sarah Wilson',
        message: 'Hi, I clicked on the FTMO deal but the verification badge seems incorrect',
        timestamp: '2025-01-08T15:30:00Z',
        isRead: false
      },
      {
        id: 'msg-demo-2',
        conversationId: 'conv-demo-1',
        senderId: 'user-demo-1',
        senderType: 'user',
        senderName: 'Sarah Wilson',
        message: 'I need help with the FTMO deal verification badge',
        timestamp: '2025-01-08T15:45:00Z',
        isRead: false
      }
    ]
  },
  {
    id: 'conv-demo-2',
    userId: 'user-demo-2',
    userName: 'Mike Chen',
    userEmail: 'mike@example.com',
    status: 'in_progress',
    priority: 'medium',
    subject: 'Question about TopStep trial',
    lastMessage: 'Thank you for the clarification about the trial terms!',
    lastMessageAt: '2025-01-08T14:20:00Z',
    createdAt: '2025-01-08T14:00:00Z',
    assignedAdmin: 'John',
    unreadCount: 0,
    tags: ['topstep', 'trial'],
    messages: [
      {
        id: 'msg-demo-3',
        conversationId: 'conv-demo-2',
        senderId: 'user-demo-2',
        senderType: 'user',
        senderName: 'Mike Chen',
        message: 'Can you explain the TopStep trial terms?',
        timestamp: '2025-01-08T14:00:00Z',
        isRead: true
      },
      {
        id: 'msg-demo-4',
        conversationId: 'conv-demo-2',
        senderId: 'admin-john',
        senderType: 'admin',
        senderName: 'John (REDUZED Support)',
        message: 'Of course! The TopStep trial gives you 7 days of free access to their platform. You just need to register with a credit card but won\'t be charged during the trial period.',
        timestamp: '2025-01-08T14:10:00Z',
        isRead: true
      },
      {
        id: 'msg-demo-5',
        conversationId: 'conv-demo-2',
        senderId: 'user-demo-2',
        senderType: 'user',
        senderName: 'Mike Chen',
        message: 'Thank you for the clarification about the trial terms!',
        timestamp: '2025-01-08T14:20:00Z',
        isRead: true
      }
    ]
  }
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>(mockInitialConversations);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);

  const addMessage = (conversationId: string, message: ChatMessage) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: message.message,
          lastMessageAt: message.timestamp,
          unreadCount: message.senderType === 'user' ? conv.unreadCount + 1 : conv.unreadCount
        };
      }
      return conv;
    }));

    // Show admin notification for new user messages
    if (message.senderType === 'user') {
      toast.success(`New message from ${message.senderName}`, {
        description: message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message
      });
    }
  };

  const createConversation = (userId: string, userName: string, userEmail: string, initialMessage?: ChatMessage): ChatConversation => {
    const newConversation: ChatConversation = {
      id: `conv-${Date.now()}`,
      userId,
      userName,
      userEmail,
      status: 'open',
      priority: 'medium',
      subject: initialMessage ? 'Chat Support Request' : 'New Conversation',
      lastMessage: initialMessage?.message || '',
      lastMessageAt: initialMessage?.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      assignedAdmin: null,
      unreadCount: initialMessage ? 1 : 0,
      tags: [],
      messages: initialMessage ? [initialMessage] : []
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation;
  };

  const updateConversationStatus = (conversationId: string, status: ChatConversation['status']) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, status } : conv
    ));
  };

  const assignConversation = (conversationId: string, adminName: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, assignedAdmin: adminName, status: 'in_progress' } : conv
    ));
  };

  const requestHumanAgent = (conversationId: string, userId: string, userName: string) => {
    // Find existing conversation or create new one
    let conversation = conversations.find(conv => conv.id === conversationId);
    
    if (conversation) {
      // Update existing conversation to request human agent
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            status: 'pending',
            priority: 'high',
            subject: 'Human Agent Requested',
            tags: [...(conv.tags || []), 'agent-requested']
          };
        }
        return conv;
      }));

      // Add system message about agent request
      const systemMessage: ChatMessage = {
        id: `msg-system-${Date.now()}`,
        conversationId,
        senderId: 'system',
        senderType: 'admin',
        senderName: 'REDUZED System',
        message: `${userName} has requested to speak with a human agent. This conversation is now pending admin assignment.`,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      addMessage(conversationId, systemMessage);
    }

    // Show notification to admins
    toast.success(`${userName} requested human agent`, {
      description: 'New agent request in chat support',
      duration: 5000
    });
  };

  const markMessagesAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, isRead: true }))
        };
      }
      return conv;
    }));
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      setActiveConversation,
      addMessage,
      createConversation,
      updateConversationStatus,
      assignConversation,
      requestHumanAgent,
      markMessagesAsRead
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}