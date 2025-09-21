import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { 
  MessageCircle, 
  Send, 
  Clock, 
  User, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Archive,
  Tag,
  Users
} from "lucide-react";
import { ChatConversation, ChatMessage } from "./types";
import { useChatContext } from "./ChatContext";
import { toast } from "sonner@2.0.3";

// Mock data for admin chat support
const mockConversations: ChatConversation[] = [
  {
    id: 'conv-1',
    userId: 'user-1',
    userName: 'John Trader',
    userEmail: 'john@example.com',
    status: 'open',
    priority: 'medium',
    subject: 'Question about FTMO deal',
    lastMessage: 'Can you help me understand the verification process?',
    lastMessageAt: '2025-01-08T14:30:00Z',
    createdAt: '2025-01-08T14:15:00Z',
    assignedAdmin: 'Sarah',
    unreadCount: 1,
    tags: ['ftmo', 'verification'],
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderType: 'user',
        senderName: 'John Trader',
        message: 'Hi! I have a question about the FTMO 30% off deal. Is it still valid?',
        timestamp: '2025-01-08T14:15:00Z',
        isRead: true
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'admin-1',
        senderType: 'admin',
        senderName: 'Sarah',
        message: 'Hello John! Yes, the FTMO deal is still active until March 15th. You can use code FTMO30 at checkout.',
        timestamp: '2025-01-08T14:20:00Z',
        isRead: true
      },
      {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderType: 'user',
        senderName: 'John Trader',
        message: 'Great! Can you help me understand the verification process?',
        timestamp: '2025-01-08T14:30:00Z',
        isRead: false
      }
    ]
  },
  {
    id: 'conv-2',
    userId: 'user-2',
    userName: 'Sarah Wilson',
    userEmail: 'sarah@example.com',
    status: 'open',
    priority: 'high',
    subject: 'Problem with TopStep deal',
    lastMessage: 'The code is not working for me',
    lastMessageAt: '2025-01-08T15:45:00Z',
    createdAt: '2025-01-08T15:30:00Z',
    assignedAdmin: 'Mike',
    unreadCount: 2,
    tags: ['topstep', 'code-issue'],
    messages: [
      {
        id: 'msg-4',
        conversationId: 'conv-2',
        senderId: 'user-2',
        senderType: 'user',
        senderName: 'Sarah Wilson',
        message: 'I tried using the TopStep free trial code but it says it\'s invalid.',
        timestamp: '2025-01-08T15:30:00Z',
        isRead: true
      },
      {
        id: 'msg-5',
        conversationId: 'conv-2',
        senderId: 'user-2',
        senderType: 'user',
        senderName: 'Sarah Wilson',
        message: 'The code is not working for me',
        timestamp: '2025-01-08T15:45:00Z',
        isRead: false
      }
    ]
  },
  {
    id: 'conv-3',
    userId: 'user-3',
    userName: 'Michael Chen',
    userEmail: 'michael@example.com',
    status: 'resolved',
    priority: 'low',
    subject: 'Thank you for the help',
    lastMessage: 'Perfect, thank you so much!',
    lastMessageAt: '2025-01-08T13:20:00Z',
    createdAt: '2025-01-08T12:45:00Z',
    assignedAdmin: 'Sarah',
    unreadCount: 0,
    tags: ['resolved', 'prop-trading'],
    messages: [
      {
        id: 'msg-6',
        conversationId: 'conv-3',
        senderId: 'user-3',
        senderType: 'user',
        senderName: 'Michael Chen',
        message: 'Can you recommend the best prop trading firm for beginners?',
        timestamp: '2025-01-08T12:45:00Z',
        isRead: true
      },
      {
        id: 'msg-7',
        conversationId: 'conv-3',
        senderId: 'admin-1',
        senderType: 'admin',
        senderName: 'Sarah',
        message: 'For beginners, I\'d recommend starting with FTMO or TopStep. They both have great educational resources and reasonable evaluation criteria.',
        timestamp: '2025-01-08T13:00:00Z',
        isRead: true
      },
      {
        id: 'msg-8',
        conversationId: 'conv-3',
        senderId: 'user-3',
        senderType: 'user',
        senderName: 'Michael Chen',
        message: 'Perfect, thank you so much!',
        timestamp: '2025-01-08T13:20:00Z',
        isRead: true
      }
    ]
  }
];

export function AdminChatSupport() {
  const { 
    conversations, 
    activeConversation,
    setActiveConversation,
    addMessage, 
    updateConversationStatus,
    assignConversation,
    markMessagesAsRead
  } = useChatContext();
  
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'resolved'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  // Filter conversations
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || conversation.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Sort conversations by last message time
  const sortedConversations = filteredConversations.sort((a, b) => 
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'admin-current',
      senderType: 'admin',
      senderName: 'REDUZED Support',
      message: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Add message through context
    addMessage(selectedConversation.id, newMessage);
    
    // Update selected conversation locally
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: newMessage.message,
      lastMessageAt: newMessage.timestamp,
      unreadCount: 0
    };
    setSelectedConversation(updatedConversation);

    // Assign conversation to current admin if not already assigned
    if (!selectedConversation.assignedAdmin) {
      assignConversation(selectedConversation.id, 'REDUZED Support');
    }

    // Update status to in_progress if it was pending
    if (selectedConversation.status === 'pending') {
      updateConversationStatus(selectedConversation.id, 'in_progress');
    }

    setCurrentMessage('');
    toast.success('Message sent successfully!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkAsRead = (conversationId: string) => {
    markMessagesAsRead(conversationId);
  };

  const handleUpdateStatus = (conversationId: string, status: 'open' | 'closed' | 'resolved') => {
    updateConversationStatus(conversationId, status);
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { ...prev, status } : null);
    }
    
    toast.success(`Conversation marked as ${status}`);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'closed':
        return <XCircle className="w-3 h-3 text-slate-400" />;
      default:
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const openConversations = conversations.filter(c => c.status === 'open').length;
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Chat Support
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Manage customer support conversations and respond to user inquiries
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {openConversations} Open
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {totalUnread} Unread
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="w-4 h-4 mr-2" />
                {filterStatus === 'all' ? 'All Status' : 
                 filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Conversations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('open')}>
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('resolved')}>
                Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('closed')}>
                Closed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Conversations ({sortedConversations.length})
            </h3>
          </div>
          <ScrollArea className="h-[520px]">
            <div className="p-2">
              {sortedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    handleMarkAsRead(conversation.id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="w-8 h-8 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {conversation.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                            {conversation.userName}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(conversation.status)}
                          <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(conversation.priority)}`}>
                            {conversation.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    {conversation.subject}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">
                      {conversation.lastMessage}
                    </p>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  
                  {conversation.tags && conversation.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <div className="flex gap-1">
                        {conversation.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {conversation.tags.length > 2 && (
                          <span className="text-xs text-slate-400">+{conversation.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {sortedConversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No conversations found
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600">
                      <span className="text-white font-semibold">
                        {selectedConversation.userName.charAt(0).toUpperCase()}
                      </span>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedConversation.userName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Mail className="w-3 h-3" />
                        {selectedConversation.userEmail}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(selectedConversation.priority)}`}>
                      {selectedConversation.priority} priority
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedConversation.id, 'resolved')}>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedConversation.id, 'closed')}>
                          <XCircle className="w-4 h-4 mr-2 text-slate-500" />
                          Close Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedConversation.id, 'open')}>
                          <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                          Reopen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatDate(message.timestamp) !== formatDate(selectedConversation.messages[index - 1].timestamp);
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <Badge variant="secondary" className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {formatDate(message.timestamp)}
                            </Badge>
                          </div>
                        )}
                        
                        <div className={`flex gap-3 ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          {message.senderType === 'user' && (
                            <Avatar className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 flex-shrink-0">
                              <span className="text-white text-sm font-semibold">
                                {selectedConversation.userName.charAt(0).toUpperCase()}
                              </span>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] ${message.senderType === 'admin' ? 'order-1' : ''}`}>
                            <div
                              className={`px-4 py-2 rounded-2xl text-sm ${
                                message.senderType === 'admin'
                                  ? 'bg-blue-500 text-white rounded-br-md'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'
                              }`}
                            >
                              {message.message}
                            </div>
                            <div className={`text-xs text-slate-400 mt-1 flex items-center gap-1 ${
                              message.senderType === 'admin' ? 'justify-end' : 'justify-start'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 flex-shrink-0">
                        <span className="text-white text-sm font-semibold">
                          {selectedConversation.userName.charAt(0).toUpperCase()}
                        </span>
                      </Avatar>
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Reply Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-3">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your reply..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    disabled={selectedConversation.status === 'closed'}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || selectedConversation.status === 'closed'}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {selectedConversation.status === 'closed' && (
                  <p className="text-xs text-slate-400 mt-2">
                    This conversation is closed. Reopen it to send messages.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No conversation selected
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Choose a conversation from the list to start responding
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}