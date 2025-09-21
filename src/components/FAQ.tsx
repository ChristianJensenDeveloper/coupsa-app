import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { HelpCircle, Mail, Search } from "lucide-react";

const faqData = [
  {
    question: "How does KOOCAO work?",
    answer: "KOOCAO is a deal aggregator that scans social media and websites for live prop firm and broker campaigns. We don't provide trading challenges or accounts ourselves - instead, we find active discount codes and limited-time offers from partner firms and forward you directly to their deals. Swipe left to dismiss offers, swipe right to save them to your collection.",
    category: "General"
  },
  {
    question: "Are the deals verified?",
    answer: "Yes! All deals are verified by our team before being added to the platform. Look for the verification badge on deal cards. We regularly check affiliate links and terms to ensure they're accurate and up-to-date.",
    category: "Deals"
  },
  {
    question: "How do I claim a saved deal?",
    answer: "Go to 'My Deals' from the menu, find your saved deal, and click 'Open Deal'. This will take you directly to the merchant's offer page with your promo code ready to use. You can also copy the promo code to your clipboard.",
    category: "Deals"
  },
  {
    question: "What are the different deal categories?",
    answer: "We have three main categories of deals we find for you: CFD Prop (discounts and offers on CFD prop trading challenges from firms like FTMO and MyForexFunds), Futures Prop (deals on futures prop trading evaluations from companies like TopStep and Apex), and Broker Bonuses (welcome bonuses, deposit bonuses, and special offers from retail brokers). KOOCAO doesn't provide challenges or accounts directly - we're a deal finder that connects you with verified offers from partner firms.",
    category: "Categories"
  },
  {
    question: "What is 'My Deals' and how do I use it?",
    answer: "My Deals is your personal collection of saved deals. When you swipe right on deals or click the save button, they're automatically added here. You can view all your active deals, expired deals, copy promo codes, and open deal pages directly. It's like your personal wallet for trading deals!",
    category: "Features"
  },
  {
    question: "How do I manage my profile and account settings?",
    answer: "Access your Profile from the main menu to view and edit your account information, including your name, email, join date, and account statistics. You can also log out from here. Your profile shows your deal activity and engagement with the platform.",
    category: "Account"
  },
  {
    question: "What are Preferences and how do I customize them?",
    answer: "In Preferences, you can customize your KOOCAO experience by setting your preferred deal categories, enabling push notifications for new deals, choosing your notification frequency, and setting up email preferences. This helps us show you more relevant deals.",
    category: "Features"
  },
  {
    question: "What are KOOCAO Giveaways?",
    answer: "Our Giveaways section features exclusive contests and prizes for KOOCAO users! We regularly run giveaways for trading-related prizes like funded account challenges, trading tools, educational resources, and more. Check this section frequently and enter the giveaways you're interested in.",
    category: "Giveaways"
  },
  {
    question: "How do I enter giveaways?",
    answer: "Visit the Giveaways section from the main menu, browse available contests, and click 'Enter Giveaway' on the ones you want to participate in. Some giveaways may have entry requirements or deadlines. Make sure you're logged in to enter giveaways.",
    category: "Giveaways"
  },
  {
    question: "What is the Share Leaderboard?",
    answer: "The Share Leaderboard tracks user engagement and sharing activity. Users earn points for sharing deals, referring friends, and participating in community activities. Top performers get special recognition and may qualify for exclusive rewards or early access to premium deals.",
    category: "Features"
  },
  {
    question: "How can I contact KOOCAO support?",
    answer: "You can reach us through multiple ways: Use the Contact page from the main menu to send us a message, use the floating chat widget for instant support, or email us directly at support@koocao.com. Our chat support includes both automated assistance and human agents.",
    category: "Support"
  },
  {
    question: "What is the difference between the chat bot and human agents?",
    answer: "Our automated chat bot can instantly answer common questions about deals, categories, and platform features. For complex issues, account problems, or personalized help, you can request to speak with a human agent who will provide detailed assistance. The bot will offer to connect you with an agent when needed.",
    category: "Support"
  },
  {
    question: "Can I get help through the chat support?",
    answer: "Absolutely! Click the blue chat icon in the bottom-right corner to start a conversation - no login required! You'll first chat with our automated assistant who can answer most questions instantly. If you need human help, just ask to speak with an agent and we'll connect you with our support team.",
    category: "Support"
  },
  {
    question: "Why do some deals expire?",
    answer: "Deals have expiration dates set by the merchants. We show countdown timers for active deals so you can act before they expire. Expired deals are moved to a separate section in 'My Deals' for your reference.",
    category: "Deals"
  },
  {
    question: "Can I filter deals by category?",
    answer: "Absolutely! Use the category filter buttons at the top of the main screen to focus on specific types of deals. You can also set your preferred categories in the Preferences section to customize your feed.",
    category: "Features"
  },
  {
    question: "Is KOOCAO free to use?",
    answer: "Yes, KOOCAO is completely free! We're a deal aggregator (not a prop firm or broker) that earns small affiliate commissions when you use our partner links to claim offers. This keeps the platform free while funding our system to scan more sources for better deals from actual trading firms.",
    category: "General"
  },
  {
    question: "How often are new deals added?",
    answer: "Our system scans social media campaigns 24/7, adding new deals as soon as companies post them. This means you see live offers before they become widely known. Enable notifications in Preferences to get instant alerts for new deals in your categories.",
    category: "General"
  },
  {
    question: "What if a deal doesn't work?",
    answer: "If you encounter any issues with a deal, please contact us immediately through the Contact page or chat support. We'll work with the merchant to resolve the issue and may be able to provide an alternative offer or solution.",
    category: "Support"
  },
  {
    question: "Can I suggest new merchants or deals?",
    answer: "Yes! We're always looking to expand our network. Use the Contact page to suggest new prop firms or brokers you'd like to see featured on KOOCAO, or message us through the chat support.",
    category: "General"
  },
  {
    question: "How do I navigate between different sections of KOOCAO?",
    answer: "Use the main menu (hamburger icon) at the top of the screen to navigate between sections: Home (main deals feed), My Deals (saved deals), Profile (account info), Preferences (settings), Giveaways (contests), Contact (support), and more. Each section has specific features to enhance your experience.",
    category: "Features"
  },
  {
    question: "What should I do if I'm new to KOOCAO?",
    answer: "Welcome! Start by browsing deals on the Home page using swipe gestures or buttons. Save interesting deals to My Deals, customize your experience in Preferences, check out available Giveaways, and don't hesitate to use our chat support if you have questions. The platform is designed to be intuitive and user-friendly.",
    category: "Getting Started"
  },
  {
    question: "Can I use KOOCAO on mobile devices?",
    answer: "Yes! KOOCAO is fully optimized for mobile devices with responsive design. The swipe interface works perfectly on touch screens, and all features are accessible on mobile browsers. We've designed everything to fit perfectly on modern smartphones including iPhone 16.",
    category: "Technical"
  }
];

const categories = ["All", "General", "Deals", "Features", "Account", "Giveaways", "Support", "Getting Started", "Technical"];

export function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter FAQ data based on selected category and search query
  const filteredFaqData = faqData.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Find answers to common questions about KOOCAO
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-muted-foreground">support@koocao.com</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Categories */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 rounded-xl ${
                selectedCategory === category 
                  ? "bg-blue-500 hover:bg-blue-500 text-white border-0" 
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
              {category !== "All" && (
                <span className="ml-1 text-xs opacity-70">
                  ({faqData.filter(faq => faq.category === category).length})
                </span>
              )}
            </Badge>
          ))}
        </div>
        {selectedCategory !== "All" && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            Showing {filteredFaqData.length} questions in "{selectedCategory}" category
          </p>
        )}
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {selectedCategory === "All" ? "All Questions" : `${selectedCategory} Questions`}
            </h3>
            <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400">
              {filteredFaqData.length}
            </Badge>
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Search results for "{searchQuery}"
            </p>
          )}
        </div>
        <div className="p-6">
          {filteredFaqData.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex-1 text-left">{faq.question}</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {faq.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">No questions found</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {searchQuery 
                  ? `No questions match "${searchQuery}". Try a different search term.`
                  : `No questions in the "${selectedCategory}" category.`
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }} 
                className="rounded-xl border-slate-200 dark:border-slate-700"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="text-center">
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Get in touch with our support team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.open('mailto:support@koocao.com', '_blank')}>
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}