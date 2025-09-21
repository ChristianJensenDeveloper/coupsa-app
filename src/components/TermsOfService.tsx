import { Button } from "./ui/button";
import { ArrowLeft, ExternalLink, Shield, FileText, Users, CreditCard } from "lucide-react";

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
            <FileText className="w-5 h-5" />
            <span className="text-sm">Legal Document</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-2xl shadow-black/10 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Terms of Service
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
                <Users className="w-6 h-6 text-blue-500" />
                1. Introduction
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Welcome to COOPUNG! These Terms of Service ("Terms") govern your use of the COOPUNG platform, 
                website, and mobile application (collectively, the "Service") operated by COOPUNG ("we," "us," or "our").
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any 
                part of these terms, then you may not access the Service.
              </p>
            </section>

            {/* Description of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                COOPUNG is a deal discovery platform that helps users find discounts, promotions, and special offers 
                from prop trading firms, brokers, and related financial service providers. Our service includes:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Curated deals and discounts from verified trading firms</li>
                <li>Deal saving and organization tools</li>
                <li>Notifications about new deals and promotions</li>
                <li>User account management and preferences</li>
                <li>Giveaways and special promotions</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                To access certain features of our Service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            {/* Affiliate Relationships */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-blue-500" />
                4. Affiliate Relationships & Commissions
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <strong>Important Disclosure:</strong> COOPUNG operates as an affiliate marketing platform. We may 
                receive commissions or other compensation when you click on deals or sign up with our partner companies.
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>We maintain affiliate relationships with trading firms and brokers featured on our platform</li>
                <li>We may earn a commission if you sign up or make a purchase through our affiliate links</li>
                <li>These relationships do not influence the deals we feature or our recommendations</li>
                <li>We strive to present deals transparently and fairly regardless of commission structures</li>
                <li>You will not be charged additional fees for using our affiliate links</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. User Conduct</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Share false, misleading, or fraudulent information</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated tools to access the Service without permission</li>
                <li>Abuse or exploit deals in a way that violates partner terms</li>
                <li>Create multiple accounts to circumvent deal limitations</li>
              </ul>
            </section>

            {/* Deal Terms & Third Parties */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Deal Terms & Third-Party Services</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <strong>Important:</strong> COOPUNG acts as an intermediary between users and deal providers. 
                We do not directly provide trading services or financial products.
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>Each deal is subject to the terms and conditions of the providing company</li>
                <li>We are not responsible for the fulfillment, quality, or validity of third-party offers</li>
                <li>Deal availability, terms, and expiration dates may change without notice</li>
                <li>You must comply with all terms set by the deal provider</li>
                <li>Any disputes regarding deals should be resolved directly with the provider</li>
                <li>We make no guarantees about the accuracy of deal information</li>
              </ul>
            </section>

            {/* Financial Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-500" />
                7. Financial Disclaimers
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                <strong>Trading Risk Warning:</strong> Trading in financial markets involves substantial risk of loss 
                and is not suitable for all investors.
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 mb-4 space-y-2">
                <li>COOPUNG does not provide financial, investment, or trading advice</li>
                <li>We do not endorse or recommend any specific trading firms or strategies</li>
                <li>Past performance does not guarantee future results</li>
                <li>You should consider your financial situation and seek independent advice before trading</li>
                <li>All trading involves risk, and you could lose more than your initial investment</li>
                <li>We are not responsible for any trading losses incurred by users</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by COOPUNG and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            {/* Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Privacy</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
                of the Service, to understand our practices.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimers</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST 
                EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                IN NO EVENT SHALL COOPUNG BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
                PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for any reason, including breach of these Terms.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes. 
                Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mt-4">
                <ul className="text-slate-700 dark:text-slate-300 space-y-2">
                  <li><strong>Email:</strong> legal@coopung.com</li>
                  <li><strong>Support:</strong> support@coopung.com</li>
                  <li><strong>Website:</strong> https://coopung.com</li>
                </ul>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}