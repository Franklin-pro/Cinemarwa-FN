import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  FileText, 
  Mail, 
  Phone, 
  CreditCard, 
  Smartphone,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Globe,
  Calendar,
  Database,
  Users,
  Server,
  Download,
  Trash2
} from 'lucide-react';

function PrivacyPolicy() {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const policySections = [
    {
      id: 'intro',
      title: 'Introduction',
      icon: <FileText size={20} />,
      content: `Welcome to CinemaRwa's Privacy Policy. This document outlines how we collect, use, protect, and share your personal information when you use our movie ticketing platform. We are committed to protecting your privacy and ensuring the security of your personal data in compliance with Rwanda's Data Protection Law No. 058/2021.`
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      icon: <Database size={20} />,
      content: `We collect the following types of information:
      
• Personal Information: Name, email address, phone number, date of birth
• Payment Information: Mobile Money numbers (MTN & Airtel), card details (securely encrypted)
• Booking Information: Movie preferences, seat selections, viewing history
• Device Information: IP address, browser type, device identifiers
• Location Data: Approximate location for cinema recommendations
• Cookies: Session data, preferences, login information

We collect this information when you:
- Create an account
- Book tickets
- Contact customer support
- Subscribe to newsletters
- Participate in surveys or promotions`
    },
    {
      id: 'data-use',
      title: 'How We Use Your Information',
      icon: <UserCheck size={20} />,
      content: `Your information helps us provide and improve our services:

• Process ticket bookings and payments
• Send booking confirmations and updates
• Personalize your movie recommendations
• Improve our website and mobile app
• Send promotional offers (with your consent)
• Comply with legal requirements
• Prevent fraud and ensure security
• Analyze usage patterns for service improvement

We process your data based on:
1. Contractual necessity (to provide our services)
2. Your consent (for marketing communications)
3. Legal obligations (tax and regulatory compliance)
4. Legitimate interests (service improvements)`
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing',
      icon: <Users size={20} />,
      content: `We may share your information with:

• Cinemas in Rwanda: For ticket validation and seating
• Payment Processors: To complete transactions (Mobile Money, banks)
• Service Providers: Email services, cloud hosting, analytics
• Legal Authorities: When required by Rwandan law
• Business Partners: With your consent for special offers

We never sell your personal information to third parties.`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock size={20} />,
      content: `We implement robust security measures:

• Encryption: All sensitive data is encrypted in transit and at rest
• Access Controls: Strict access limitations for staff
• Regular Audits: Security assessments and penetration testing
• Employee Training: Privacy and security awareness programs
• Incident Response: Protocols for data breach situations

Our security practices comply with ISO 27001 standards and Rwanda's data protection regulations.`
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: <Calendar size={20} />,
      content: `We retain your personal data only as long as necessary:

• Account Information: While account is active + 2 years after inactivity
• Transaction Records: 7 years for tax and accounting purposes
• Marketing Preferences: Until consent is withdrawn
• Support Interactions: 3 years for service improvement

You can request data deletion at any time, subject to legal requirements.`
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: <Shield size={20} />,
      content: `Under Rwanda's Data Protection Law, you have the right to:

• Access your personal data
• Correct inaccurate information
• Delete your data (right to be forgotten)
• Restrict processing
• Data portability
• Object to processing
• Withdraw consent at any time

To exercise these rights, contact our Data Protection Officer at dpo@cinemarwa.rw`
    },
    {
      id: 'cookies',
      title: 'Cookies & Tracking',
      icon: <Server size={20} />,
      content: `We use cookies and similar technologies:

• Essential Cookies: Required for website functionality
• Preference Cookies: Remember your settings
• Analytics Cookies: Understand how you use our services
• Marketing Cookies: Show relevant advertisements

You can control cookies through your browser settings. Disabling essential cookies may affect service functionality.`
    },
    {
      id: 'children',
      title: "Children's Privacy",
      icon: <AlertCircle size={20} />,
      content: `Our services are not directed to children under 16. We do not knowingly collect personal information from children. If we discover we have collected information from a child, we will delete it immediately.

Parents or guardians can contact us to review, update, or delete any information about their child.`
    },
    {
      id: 'changes',
      title: 'Policy Updates',
      icon: <Globe size={20} />,
      content: `We may update this policy periodically. Significant changes will be communicated via:

• Email notification
• Website announcement
• In-app notifications

The "Last Updated" date at the top indicates when changes were made. Continued use of our services constitutes acceptance of updated policies.`
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: <Mail size={20} />,
      content: `For privacy-related inquiries:

Data Protection Officer: dpo@cinemarwa.rw
General Support: privacy@cinemarwa.rw
Phone: +250 788 654 321

Physical Address:
CinemaRwa Privacy Office
Kigali Heights, 4th Floor
KG 7 Avenue
Kigali, Rwanda

Office Hours: Monday-Friday, 9:00 AM - 5:00 PM`
    }
  ];

  const dataCollectionPoints = [
    {
      icon: <UserCheck size={24} />,
      title: 'Account Creation',
      items: ['Name', 'Email', 'Phone Number', 'Date of Birth']
    },
    {
      icon: <CreditCard size={24} />,
      title: 'Payment Processing',
      items: ['Mobile Money Number', 'Card Details', 'Transaction History']
    },
    {
      icon: <Smartphone size={24} />,
      title: 'App Usage',
      items: ['Device Information', 'Location Data', 'App Preferences']
    },
    {
      icon: <Calendar size={24} />,
      title: 'Booking History',
      items: ['Movie Preferences', 'Seat Selections', 'Cinema Locations']
    }
  ];

  const complianceStandards = [
    { name: 'Rwanda Data Protection Law', status: 'Compliant' },
    { name: 'GDPR Alignment', status: 'Compliant' },
    { name: 'PCI DSS', status: 'Level 1 Certified' },
    { name: 'ISO 27001', status: 'Certified' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl mb-6">
                  <Shield size={32} className="text-blue-400" />
                </div>
                <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  Privacy Policy
                </h1>
                <p className="text-xl text-gray-300">
                  Protecting your privacy in Rwanda's digital cinema experience
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="font-semibold">Last Updated</span>
                </div>
                <p className="text-2xl font-bold mb-1">March 15, 2024</p>
                <p className="text-sm text-gray-300">Version 3.1 • Effective immediately</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 -mt-8 relative z-20">
        {/* Quick Overview */}
        <section className="mb-12 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
            <Eye size={28} className="text-blue-600" />
            Privacy at a Glance
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataCollectionPoints.map((point, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    {point.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{point.title}</h3>
                </div>
                <ul className="space-y-2">
                  {point.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Our Compliance Standards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">{standard.name}</span>
                  <CheckCircle size={22} className="text-green-500" />
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-semibold inline-block ${
                  standard.status.includes('Certified') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {standard.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Policy Sections */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Complete Privacy Policy</h2>
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-xl">
              {policySections.length} Sections • Read time: 10 minutes
            </div>
          </div>

          <div className="space-y-3">
            {policySections.map((section) => (
              <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <button
                  className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors group"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      {section.icon}
                    </div>
                    <h3 className="text-lg font-bold text-left text-gray-900 group-hover:text-blue-600 transition-colors">{section.title}</h3>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors ${expandedSections[section.id] ? 'bg-blue-100' : ''}`}>
                    {expandedSections[section.id] ? 
                      <ChevronUp size={20} className="text-blue-600" /> : 
                      <ChevronDown size={20} className="text-gray-600 group-hover:text-blue-600" />
                    }
                  </div>
                </button>
                {expandedSections[section.id] && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="pl-4 border-l-2 border-blue-200 pt-4">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Consent Management */}
        <section className="mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Manage Your Preferences</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
                <Mail size={22} className="text-blue-600" />
                Marketing Communications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">Email Newsletters</span>
                  <button className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                    Subscribed
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">SMS Updates</span>
                  <button className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm">
                    Unsubscribed
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">Push Notifications</span>
                  <button className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                    Enabled
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
                <Eye size={22} className="text-blue-600" />
                Data Sharing Options
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">Personalized Recommendations</span>
                  <button className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">Share with Cinema Partners</span>
                  <button className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">Analytics & Research</span>
                  <button className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                    Enabled
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Quick Privacy Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <button className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <Trash2 size={26} className="text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Request Data Deletion</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">Submit a request to delete your personal data permanently</p>
            </button>
            
            <button className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Download size={26} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Download Your Data</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">Get a complete copy of all data we have about you</p>
            </button>
            
            <button className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Phone size={26} className="text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Contact DPO</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">Direct line to our Data Protection Officer</p>
            </button>
          </div>
        </section>

        {/* Important Notice */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={26} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Important Notice</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                This privacy policy applies to all CinemaRwa services in Rwanda. By using our platform, 
                you consent to our data practices as described here. We regularly update this policy 
                to comply with evolving Rwandan data protection regulations.
              </p>
              <p className="text-sm text-gray-600">
                For questions about specific data practices, contact our Data Protection Officer at 
                <span className="font-semibold text-blue-600"> dpo@cinemarwa.rw</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={24} className="text-blue-400" />
                <h3 className="font-bold text-lg">CinemaRwa</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Rwanda's premier online movie ticketing platform
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Movies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cinemas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Protection</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>+250 788 654 321</li>
                <li>dpo@cinemarwa.rw</li>
                <li>Kigali Heights, 4th Floor</li>
                <li>Kigali, Rwanda</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CinemaRwa. All rights reserved. Protected by Rwanda Data Protection Law No. 058/2021</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PrivacyPolicy;