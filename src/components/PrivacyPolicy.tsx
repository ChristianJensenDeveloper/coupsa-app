import { Button } from "./ui/button";
import { ArrowLeft, Lock, Database, Eye, Shield, Cookie, Mail, Smartphone } from "lucide-react";

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Lock className="w-5 h-5" />
            <span className="text-sm">Privacy Document</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-2xl shadow-black/10 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Last updated: January 18, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-green-500" />
                1. Introduction
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                At COOPUNG, we are committed to protecting your privacy and ensuring the security of your personal 
                information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our platform.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                By using COOPUNG, you consent to the data practices described in this policy. If you do not agree 
                with our practices, please do not use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-green-500" />
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We collect information you voluntarily provide when you:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>Create an account (name, email address, phone number)</li>
                <li>Update your profile or preferences</li>
                <li>Contact our support team</li>
                <li>Participate in surveys, giveaways, or promotions</li>
                <li>Subscribe to notifications or marketing communications</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Information Automatically Collected</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                When you use our Service, we automatically collect:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>Device information (device type, operating system, browser type)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>IP address and general location information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Deal interactions and clicks</li>
                <li>App performance and crash data</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.3 Information from Third Parties</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We may receive information from:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Social media platforms when you log in through them</li>
                <li>Analytics and advertising partners</li>
                <li>Partner trading firms and brokers (with your consent)</li>
                <li>Public databases and data aggregators</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We use your information to:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Provide and Improve Our Service</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>Deliver personalized deal recommendations</li>
                <li>Process your saved deals and preferences</li>
                <li>Send you notifications about new deals and updates</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.2 Marketing and Communication</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>Send promotional emails about new deals (with your consent)</li>
                <li>Notify you about giveaways and special promotions</li>
                <li>Conduct surveys and market research</li>
                <li>Personalize marketing content based on your interests</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.3 Legal and Business Purposes</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Comply with legal obligations and regulations</li>
                <li>Protect our rights and prevent misuse of our Service</li>
                <li>Process affiliate commissions and partnerships</li>
                <li>Conduct business analytics and reporting</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold mb-3">4.1 With Your Consent</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>When you click on affiliate links, we share limited data to track conversions</li>
                <li>When you participate in partner promotions or giveaways</li>
                <li>When you explicitly authorize data sharing</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 With Service Providers</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>Analytics providers (Google Analytics, etc.)</li>
                <li>Email marketing services</li>
                <li>Cloud hosting and database providers</li>
                <li>Customer support platforms</li>
                <li>Payment processors (for premium features)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.3 Legal Requirements</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>To comply with laws, regulations, or legal processes</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with business transfers or mergers</li>
              </ul>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Cookie className="w-6 h-6 text-green-500" />
                5. Cookies and Tracking Technologies
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>

              <h3 className="text-xl font-semibold mb-3">5.1 Types of Cookies We Use</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Performance Cookies:</strong> Help us analyze how our Service is used</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver personalized advertisements</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.2 Managing Cookies</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                You can control cookies through your browser settings. However, disabling cookies may affect 
                the functionality of our Service.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-green-500" />
                6. Data Security
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee 
                absolute security of your information.
              </p>
            </section>

            {/* Your Rights and Choices */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-semibold mb-3">7.1 Account Information</h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>Access and update your profile information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Request correction of inaccurate information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500" />
                7.2 Communication Preferences
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-6 space-y-2">
                <li>Unsubscribe from marketing emails</li>
                <li>Disable push notifications</li>
                <li>Opt out of SMS notifications</li>
                <li>Manage WhatsApp communications</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">7.3 GDPR Rights (EU Users)</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                If you are located in the European Union, you have additional rights under GDPR:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Our Service is not intended for children under 18 years of age. We do not knowingly collect 
                personal information from children under 18. If you become aware that a child has provided 
                us with personal information, please contact us immediately.
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your country of 
                residence. We ensure appropriate safeguards are in place to protect your data during international 
                transfers, including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Adequacy decisions by relevant authorities</li>
                <li>Standard contractual clauses</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Data Retention</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Provide our Service and maintain your account</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our Service and conduct analytics</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                When you delete your account, we will delete or anonymize your personal information within 
                30 days, except where retention is required by law.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links and Services</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Our Service contains links to third-party websites and services (such as trading firms and brokers). 
                We are not responsible for the privacy practices of these third parties. We encourage you to read 
                their privacy policies before providing any information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Posting the updated policy on our platform</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice in our app</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Your continued use of our Service after changes become effective constitutes acceptance of 
                the updated Privacy Policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-green-500" />
                13. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or want to exercise your rights, please contact us:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mt-4">
                <ul className="text-slate-700 dark:text-slate-300 space-y-2">
                  <li><strong>Privacy Officer:</strong> privacy@coopung.com</li>
                  <li><strong>Support:</strong> support@coopung.com</li>
                  <li><strong>Data Protection:</strong> dpo@coopung.com</li>
                  <li><strong>Website:</strong> https://coopung.com/privacy</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Quick Privacy Actions
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  To quickly access your data, delete your account, or exercise your privacy rights, 
                  visit your account settings in the COOPUNG app or contact our support team.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}