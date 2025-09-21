import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { MessageCircle, X, Send, Minimize2, Maximize2, Clock, User, Bot, HelpCircle } from "lucide-react";
import { ChatConversation, ChatMessage, User as UserType } from "./types";
import { useChatContext } from "./ChatContext";
import { toast } from "sonner@2.0.3";

// Enhanced FAQ Data for bot responses with better keyword coverage
const faqData = [
  {
    question: "How does KOOCAO work?",
    answer: "KOOCAO is a deal aggregator that scans social media and websites for live prop firm and broker campaigns. We don't provide trading challenges or accounts ourselves - instead, we find active discount codes and limited-time offers from partner firms and forward you directly to their deals. Swipe left to dismiss offers, swipe right to save them to your collection.",
    keywords: ["how", "work", "works", "koocao", "what", "platform", "service", "what is", "explain", "about", "overview", "does"],
    category: "general"
  },
  {
    question: "Can I buy challenges from KOOCAO?",
    answer: "No, KOOCAO doesn't sell trading challenges or provide prop firm accounts directly. We're a deal aggregator - we find discounts and special offers from actual prop firms like FTMO, TopStep, and others, then connect you to their official websites to purchase. Think of us like a coupon website for trading challenges!",
    keywords: ["buy", "purchase", "sell", "challenge", "challenges", "account", "accounts", "trading account", "prop account", "fund", "funding", "directly", "from you"],
    category: "misconception"
  },
  {
    question: "What is 'My Deals' and how do I use it?",
    answer: "My Deals is your personal collection of saved deals. When you swipe right on deals or click the save button, they're automatically added here. You can view all your active deals, expired deals, copy promo codes, and open deal pages directly. It's like your personal wallet for trading deals!",
    keywords: ["my deals", "saved deals", "collection", "wallet", "saved", "personal", "my folder", "deal folder"],
    category: "features"
  },
  {
    question: "How do I access my Profile and account settings?",
    answer: "Access your Profile from the main menu to view and edit your account information, including your name, email, join date, and account statistics. You can also log out from here. Your profile shows your deal activity and engagement with the platform.",
    keywords: ["profile", "account", "settings", "edit profile", "account info", "personal info", "account settings"],
    category: "features"
  },
  {
    question: "What are Preferences and how do I customize them?",
    answer: "In Preferences, you can customize your KOOCAO experience by setting your preferred deal categories, enabling push notifications for new deals, choosing your notification frequency, and setting up email preferences. This helps us show you more relevant deals.",
    keywords: ["preferences", "settings", "customize", "notifications", "categories", "email settings", "notification settings"],
    category: "features"
  },
  {
    question: "What are KOOCAO Giveaways?",
    answer: "Our Giveaways section features exclusive contests and prizes for KOOCAO users! We regularly run giveaways for trading-related prizes like funded account challenges, trading tools, educational resources, and more. Check this section frequently and enter the giveaways you're interested in.",
    keywords: ["giveaways", "giveaway", "contest", "contests", "prizes", "win", "competition", "free stuff", "enter"],
    category: "features"
  },
  {
    question: "How do I enter giveaways?",
    answer: "Visit the Giveaways section from the main menu, browse available contests, and click 'Enter Giveaway' on the ones you want to participate in. Some giveaways may have entry requirements or deadlines. Make sure you're logged in to enter giveaways.",
    keywords: ["enter giveaway", "join contest", "participate", "giveaway entry", "how to enter", "contest entry"],
    category: "features"
  },
  {
    question: "What is the Share Leaderboard?",
    answer: "The Share Leaderboard tracks user engagement and sharing activity. Users earn points for sharing deals, referring friends, and participating in community activities. Top performers get special recognition and may qualify for exclusive rewards or early access to premium deals.",
    keywords: ["leaderboard", "share leaderboard", "points", "ranking", "share", "refer", "rewards", "competition"],
    category: "features"
  },
  {
    question: "How can I contact KOOCAO support?",
    answer: "You can reach us through multiple ways: Use the Contact page from the main menu to send us a message, use this chat widget for instant support, or email us directly at support@koocao.com. Our chat support includes both automated assistance and human agents.",
    keywords: ["contact", "support", "help", "contact us", "get help", "customer service", "reach out"],
    category: "support"
  },
  {
    question: "What's the difference between the chat bot and human agents?",
    answer: "I'm the automated chat bot and I can instantly answer common questions about deals, categories, and platform features. For complex issues, account problems, or personalized help, you can request to speak with a human agent who will provide detailed assistance. Just ask to speak with an agent anytime!",
    keywords: ["bot", "human agent", "agent", "human support", "talk to agent", "speak to human", "real person"],
    category: "support"
  },
  {
    question: "How do I navigate between different sections?",
    answer: "Use the main menu (hamburger icon) at the top of the screen to navigate between sections: Home (main deals feed), My Deals (saved deals), Profile (account info), Preferences (settings), Giveaways (contests), Contact (support), and more. Each section has specific features to enhance your experience.",
    keywords: ["navigate", "menu", "sections", "pages", "how to use", "getting around", "navigation"],
    category: "features"
  },
  {
    question: "Are the deals verified?",
    answer: "Yes! All deals are verified by our team before being added to the platform. Look for the verification badge on deal cards. We regularly check affiliate links and terms to ensure they're accurate and up-to-date.",
    keywords: ["verify", "verified", "real", "legit", "legitimate", "check", "badge", "trust", "trusted", "authentic", "safe", "scam"],
    category: "trust"
  },
  {
    question: "How do I claim a saved deal?",
    answer: "Go to 'My Deals' from the menu, find your saved deal, and click 'Open Deal'. This will take you directly to the merchant's offer page with your promo code ready to use. You can also copy the promo code to your clipboard.",
    keywords: ["claim", "save", "saved", "my deals", "use", "code", "promo", "redeem", "activate", "apply"],
    category: "usage"
  },
  {
    question: "What are the different deal categories?",
    answer: "We have three main categories: CFD Prop (discounts on CFD prop trading challenges from firms like FTMO), Futures Prop (deals on futures trading evaluations from TopStep, Apex), and Broker Bonuses (welcome bonuses from retail brokers). KOOCAO doesn't provide challenges directly - we're a deal finder that connects you with verified offers from partner firms.",
    keywords: ["category", "categories", "types", "cfd", "futures", "broker", "bonus", "kind", "sorts", "what kind"],
    category: "general"
  },
  {
    question: "Is KOOCAO free to use?",
    answer: "Yes, KOOCAO is completely free! We're a deal aggregator (not a prop firm or broker) that earns small affiliate commissions when you use our partner links to claim offers. This keeps the platform free while funding our system to scan more sources for better deals.",
    keywords: ["free", "cost", "costs", "price", "pricing", "money", "pay", "payment", "affiliate", "charge", "subscription"],
    category: "pricing"
  },
  {
    question: "How often are new deals added?",
    answer: "Our system scans social media campaigns 24/7, adding new deals as soon as companies post them. This means you see live offers before they become widely known. Enable notifications in Preferences to get instant alerts for new deals.",
    keywords: ["new", "deals", "often", "update", "updates", "fresh", "24/7", "notifications", "frequency", "how many", "daily"],
    category: "general"
  },
  {
    question: "What if a deal doesn't work?",
    answer: "If you encounter any issues with a deal, please contact us through the Contact page or this chat. We'll work with the merchant to resolve the issue and may be able to provide an alternative offer or solution.",
    keywords: ["problem", "problems", "issue", "issues", "doesn't work", "not working", "broken", "error", "help", "support", "failed"],
    category: "support"
  },
  {
    question: "Do you offer trading signals or education?",
    answer: "No, KOOCAO is purely a deal aggregator for prop firm challenges and broker bonuses. We don't provide trading signals, education, or trading advice. Our focus is finding you the best discounts and offers from legitimate prop firms and brokers.",
    keywords: ["signals", "education", "trading signals", "learn", "teaching", "course", "courses", "training", "advice", "tips", "strategies"],
    category: "misconception"
  },
  {
    question: "Are you a prop firm?",
    answer: "No, KOOCAO is not a prop firm. We're a deal aggregator that finds discounts and special offers from actual prop firms. We don't provide funding, challenges, or trading accounts - we help you find better deals from companies that do.",
    keywords: ["prop firm", "proprietary", "trading firm", "are you", "company", "firm", "funding company"],
    category: "misconception"
  },
  {
    question: "How do I sign up or register?",
    answer: "Simply click 'Sign In' in the menu to create your free account. You'll need to provide a name and email address. Once registered, you can save deals, access your personal deal collection, customize your preferences, and enter giveaways.",
    keywords: ["sign up", "register", "registration", "account", "create account", "join", "signup", "sign in", "login"],
    category: "usage"
  },
  {
    question: "What companies do you work with?",
    answer: "We work with various prop firms and brokers including FTMO, TopStep, Apex Trader, IC Markets, and many others. Our AI constantly scans for new partners and deals. We only feature legitimate, verified companies with active offers.",
    keywords: ["companies", "partners", "firms", "brokers", "ftmo", "topstep", "apex", "which firms", "who", "list"],
    category: "general"
  },
  {
    question: "What should I do if I'm new to KOOCAO?",
    answer: "Welcome! Start by browsing deals on the Home page using swipe gestures or buttons. Save interesting deals to My Deals, customize your experience in Preferences, check out available Giveaways, and don't hesitate to ask me questions. The platform is designed to be intuitive and user-friendly.",
    keywords: ["new", "getting started", "beginner", "first time", "how to start", "welcome", "tutorial"],
    category: "getting_started"
  },
  {
    question: "Do I need to create an account to use KOOCAO?",
    answer: "You can browse deals without an account, but creating a free account unlocks all features: save deals to My Deals, enter exclusive giveaways, customize preferences, and get personalized deal recommendations. It takes just seconds to sign up with email, Google, Apple, or Facebook!",
    keywords: ["account", "sign up", "register", "free account", "do i need", "required", "create account"],
    category: "getting_started"
  }
];

// Enhanced keyword matching with better logic
function findBestMatch(userMessage: string): typeof faqData[0] | null {
  const message = userMessage.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  // First, check for exact phrase matches (higher priority)
  for (const faq of faqData) {
    for (const keyword of faq.keywords) {
      if (keyword.length > 3 && message.includes(keyword)) {
        const phraseScore = keyword.length * 2; // Longer phrases get higher scores
        if (phraseScore > bestScore) {
          bestScore = phraseScore;
          bestMatch = faq;
        }
      }
    }
  }
  
  // If no good phrase match, check individual words
  if (bestScore < 6) {
    for (const faq of faqData) {
      let wordScore = 0;
      const messageWords = message.split(/\s+/);
      
      for (const keyword of faq.keywords) {
        if (keyword.length <= 3 || !message.includes(keyword)) {
          // Check if any message word matches this keyword
          for (const word of messageWords) {
            if (word === keyword || (word.length > 3 && keyword.length > 3 && (word.includes(keyword) || keyword.includes(word)))) {
              wordScore += 1;
            }
          }
        }
      }
      
      if (wordScore > bestScore && wordScore > 0) {
        bestScore = wordScore;
        bestMatch = faq;
      }
    }
  }
  
  return bestMatch;
}

// Fallback responses for common question patterns
function getFallbackResponse(userMessage: string): string | null {
  const message = userMessage.toLowerCase();
  
  // Navigation and features
  if (message.includes('navigate') || message.includes('sections') || message.includes('menu') || message.includes('pages')) {
    return "You can navigate KOOCAO using the main menu: Home (swipeable deals), My Deals (saved deals), Profile (account), Preferences (settings), Giveaways (contests), Share Leaderboard (rankings), Contact (support), and more. Each section has unique features to enhance your experience!";
  }
  
  // Giveaways related
  if (message.includes('giveaway') || message.includes('contest') || message.includes('prize') || message.includes('win')) {
    return "Check out our Giveaways section for exclusive contests and prizes! We regularly run giveaways for trading-related prizes like funded challenges, tools, and educational resources. You'll need a free account to enter giveaways - it only takes seconds to sign up!";
  }
  
  // Profile/account related
  if (message.includes('profile') || message.includes('account info') || message.includes('edit account')) {
    return "Your Profile section contains your account information, join date, activity stats, and logout option. You can also customize your experience in the Preferences section with notification settings and category preferences. Create a free account to access these features!";
  }
  
  // Sign up / account creation
  if (message.includes('sign up') || message.includes('create account') || message.includes('register') || message.includes('join')) {
    return "Creating a KOOCAO account is completely free! Just click 'Sign In' in the menu and you can sign up with your email, Google, Apple, or Facebook. With an account, you can save deals, enter giveaways, and customize your preferences. No credit card required!";
  }
  
  // Trading-related but not covered
  if (message.includes('trade') || message.includes('trading')) {
    return "I can help you find deals on prop trading challenges and broker bonuses, but I don't provide trading advice or education. KOOCAO focuses on finding you the best discounts from legitimate prop firms and brokers. What specific deals are you looking for?";
  }
  
  // Account/funding related
  if (message.includes('funded') || message.includes('funding') || message.includes('account')) {
    return "KOOCAO doesn't provide funded accounts directly - we're a deal aggregator that finds discounts on prop firm challenges that can lead to funding. We help you save money on evaluation fees from companies like FTMO, TopStep, and others who do provide funding.";
  }
  
  // Support/help requests
  if (message.includes('help') || message.includes('support') || message.includes('contact')) {
    return "I'm here to help! I can answer questions about how KOOCAO works, our deal categories, saving deals, giveaways, navigation, and more. For account-specific issues or complex problems, I'd recommend talking to one of our human agents using the 'Talk to Agent' button.";
  }
  
  return null;
}



interface ChatSupportProps {
  user: UserType | null;
  onLoginRequired: () => void;
}



export function ChatSupport({ user, onLoginRequired }: ChatSupportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isBotMode, setIsBotMode] = useState(true); // Start with bot mode
  const [showTalkToAgent, setShowTalkToAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { conversations, createConversation, addMessage, requestHumanAgent } = useChatContext();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  // Load conversation when chat opens (works for both authenticated and guest users)
  useEffect(() => {
    if (isOpen && !conversation) {
      const userId = user?.id || 'guest';
      const userName = user?.name || 'Guest';
      const userEmail = user?.email || 'guest@koocao.com';
      
      // Check if user already has a conversation
      const userConversation = conversations.find(conv => conv.userId === userId);
      if (userConversation) {
        setConversation(userConversation);
        // Check if conversation is with human agent
        const hasHumanMessages = userConversation.messages.some(msg => 
          msg.senderType === 'admin' && msg.senderName !== 'KOOCAO Bot' && msg.senderName !== 'KOOCAO System'
        );
        setIsBotMode(!hasHumanMessages); // Switch to agent mode if human has responded
      } else {
        // Create new conversation starting with bot welcome
        const welcomeMessage: ChatMessage = {
          id: `msg-welcome-${Date.now()}`,
          conversationId: `conv-${Date.now()}`,
          senderId: 'bot-1',
          senderType: 'admin',
          senderName: 'KOOCAO Bot',
          message: user 
            ? `Hi ${userName}! 👋 I'm the KOOCAO support bot. I can help answer common questions about deals, categories, and how our platform works. What would you like to know?`
            : `Hi there! 👋 I'm the KOOCAO support bot. I can help answer questions about deals, categories, and how our platform works. Feel free to ask me anything, and if you'd like to save deals or enter giveaways, I can help you get started with a free account!`,
          timestamp: new Date().toISOString(),
          isRead: false
        };

        const newConversation = createConversation(userId, userName, userEmail, welcomeMessage);
        setConversation(newConversation);
      }
    }
  }, [isOpen, user, conversation, conversations, createConversation]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleTalkToAgent = () => {
    if (!conversation) return;

    // If user is not logged in, suggest login for better support
    if (!user) {
      toast.info('For personalized support, consider creating a free account. Meanwhile, I\'ll connect you with an agent!');
    }

    setShowTalkToAgent(false);
    
    const userId = user?.id || 'guest';
    const userName = user?.name || 'Guest User';
    
    // Request human agent through context - this will notify admins
    requestHumanAgent(conversation.id, userId, userName);
    
    // Add user message indicating they want to talk to an agent
    const requestMessage: ChatMessage = {
      id: `msg-request-${Date.now()}`,
      conversationId: conversation.id,
      senderId: userId,
      senderType: 'user',
      senderName: userName,
      message: 'I would like to speak with a human agent please.',
      timestamp: new Date().toISOString(),
      isRead: false
    };

    addMessage(conversation.id, requestMessage);
    
    // Update local conversation state
    setConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, requestMessage],
        lastMessage: requestMessage.message,
        lastMessageAt: requestMessage.timestamp,
        status: 'pending',
        priority: 'high'
      };
    });

    toast.success('Request sent! An agent will be with you shortly.');
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !conversation) return;

    const userId = user?.id || 'guest';
    const userName = user?.name || 'Guest User';

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: userId,
      senderType: 'user',
      senderName: userName,
      message: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Add message through context so admin panel can see it
    addMessage(conversation.id, newMessage);
    
    // Update local conversation state
    setConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: newMessage.message,
        lastMessageAt: newMessage.timestamp
      };
    });

    const userMessage = currentMessage.trim();
    setCurrentMessage('');

    if (isBotMode) {
      // Bot response logic
      setShowTalkToAgent(true); // Always show "Talk to Agent" after user messages
      
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          
          // Try to find a matching FAQ answer
          const faqMatch = findBestMatch(userMessage);
          const fallbackResponse = getFallbackResponse(userMessage);
          let botResponse = '';
          
          if (faqMatch) {
            // Add context based on the category and user status
            let contextualNote = '';
            if (faqMatch.category === 'misconception') {
              contextualNote = '\n\n❗ *This is a common misconception I wanted to clear up!*';
            } else if (faqMatch.category === 'trust') {
              contextualNote = '\n\n✅ *Security and trust are important to us.*';
            } else if (faqMatch.category === 'pricing') {
              contextualNote = '\n\n💰 *No hidden costs or surprises.*';
            } else if (!user) {
              contextualNote = '\n\n💡 *Want to save deals and access all features? Creating a free account takes just seconds!*';
            } else {
              contextualNote = '\n\n💡 *This answer is from our FAQ. Need more specific help?*';
            }
            
            botResponse = `${faqMatch.answer}${contextualNote}`;
          } else if (fallbackResponse) {
            const guestNote = !user ? '\n\n🚀 *Create a free account to unlock all KOOCAO features!*' : '\n\n💡 *This is a common question category I can help with.*';
            botResponse = fallbackResponse + guestNote;
          } else {
            const helpSuggestion = !user 
              ? '*For personalized help, consider creating a free account or speaking with one of our human agents.*'
              : '*For personalized help with your specific situation, I\'d recommend speaking with one of our human agents.*';
            botResponse = `I understand you're asking about "${userMessage}". I'm still learning and might not have the perfect answer for that specific question.\n\n💡 ${helpSuggestion}`;
          }

          const botReply: ChatMessage = {
            id: `msg-bot-${Date.now()}`,
            conversationId: conversation.id,
            senderId: 'bot-1',
            senderType: 'admin',
            senderName: 'KOOCAO Bot',
            message: botResponse,
            timestamp: new Date().toISOString(),
            isRead: false
          };

          // Add bot reply through context
          addMessage(conversation.id, botReply);
          
          // Update local conversation state
          setConversation(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, botReply],
              lastMessage: botReply.message,
              lastMessageAt: botReply.timestamp
            };
          });
        }, 1500);
      }, 800);
    } else {
      // Human agent mode
      toast.success('Message sent! Our team will respond shortly.');

      // Simulate human agent typing response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const adminResponse: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            conversationId: conversation.id,
            senderId: 'admin-1',
            senderType: 'admin',
            senderName: 'KOOCAO Support',
            message: "Thanks for your message! I'll help you with that right away. Let me check the details for you.",
            timestamp: new Date().toISOString(),
            isRead: false
          };

          // Add admin response through context
          addMessage(conversation.id, adminResponse);
          
          // Update local conversation state
          setConversation(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, adminResponse],
              lastMessage: adminResponse.message,
              lastMessageAt: adminResponse.timestamp
            };
          });
        }, 2000);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleOpenChat}
          size="lg"
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-0"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        
        {/* Notification indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">1</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${isMinimized ? 'w-80 h-auto' : 'w-80 h-[500px]'} transition-all duration-300 shadow-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col`}>
        
        {/* ALWAYS VISIBLE BLUE HEADER WITH CLOSE BUTTON */}
        <div className={`bg-blue-500 text-white flex items-center justify-between shrink-0 ${isMinimized ? 'p-3 min-h-[60px]' : 'p-4 min-h-[72px]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              {isBotMode ? <Bot className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold">
                {isBotMode ? 'KOOCAO Bot' : 'KOOCAO Support'}
              </h3>
              <p className="text-sm text-blue-100">
                {isBotMode ? 'AI Assistant' : 'Human Agent'}
              </p>
            </div>
          </div>
          
          {/* NORMAL WHITE CLOSE BUTTON */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors shrink-0 ml-4"
            type="button"
            title="Close Chat"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Minimize/Expand toggle */}
        {!isMinimized && (
          <div className="bg-blue-400 px-4 py-2 shrink-0">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-sm text-white hover:text-blue-100 underline"
            >
              ▼ Minimize Chat
            </button>
          </div>
        )}
        
        {/* MINIMIZED STATE - Click anywhere to expand */}
        {isMinimized && (
          <div 
            onClick={() => setIsMinimized(false)}
            className="bg-gradient-to-r from-blue-400 to-blue-500 px-4 py-3 shrink-0 cursor-pointer hover:from-blue-500 hover:to-blue-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Chat Minimized</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm">Click to expand</span>
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">▲</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 h-64">
              <div className="p-4 space-y-4">
                {conversation?.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      AI Assistant Ready
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Ask me anything about KOOCAO deals, categories, or how the platform works
                    </p>
                  </div>
                ) : (
                  <>
                    {conversation?.messages.map((message, index) => {
                      const showDate = index === 0 || 
                        formatDate(message.timestamp) !== formatDate(conversation.messages[index - 1].timestamp);
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <Badge variant="secondary" className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {formatDate(message.timestamp)}
                              </Badge>
                            </div>
                          )}
                          
                          <div className={`flex gap-3 ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {message.senderType === 'admin' && (
                              <Avatar className="w-6 h-6 bg-blue-500 flex-shrink-0">
                                <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                                  {message.senderName === 'KOOCAO Bot' ? 
                                    <Bot className="w-3 h-3 text-white" /> : 
                                    <User className="w-3 h-3 text-white" />
                                  }
                                </div>
                              </Avatar>
                            )}
                            
                            <div className={`max-w-[70%] ${message.senderType === 'user' ? 'order-1' : ''}`}>
                              <div
                                className={`px-3 py-2 rounded-2xl text-sm ${
                                  message.senderType === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-md'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'
                                }`}
                              >
                                {message.message}
                              </div>
                              <div className={`text-xs text-slate-400 mt-1 flex items-center gap-1 ${
                                message.senderType === 'user' ? 'justify-end' : 'justify-start'
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
                        <Avatar className="w-6 h-6 bg-blue-500 flex-shrink-0">
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            {isBotMode ? <Bot className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-white" />}
                          </div>
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

                    {/* Talk to Agent Button */}
                    {showTalkToAgent && isBotMode && (
                      <div className="flex justify-center my-4">
                        <Button
                          onClick={handleTalkToAgent}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-4 py-2 text-xs shadow-lg"
                        >
                          <HelpCircle className="w-3 h-3 mr-2" />
                          Talk to Agent
                        </Button>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  size="sm"
                  className="rounded-full bg-blue-500 hover:bg-blue-500 text-white px-4 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-slate-400 mt-2 text-center">
                {isBotMode 
                  ? (user ? 'Ask me anything about KOOCAO!' : 'Ask me anything! Create a free account to save deals.') 
                  : 'We typically respond within a few minutes'
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}