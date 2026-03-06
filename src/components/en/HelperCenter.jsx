import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  Ticket, 
  Film, 
  CreditCard, 
  Smartphone, 
  Globe, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Star,
  Clock,
  Calendar,
  User
} from 'lucide-react';

function HelperCenter() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'general', name: 'General', icon: <HelpCircle size={20} /> },
    { id: 'booking', name: 'Booking & Tickets', icon: <Ticket size={20} /> },
    { id: 'movies', name: 'Movies & Shows', icon: <Film size={20} /> },
    { id: 'payment', name: 'Payment', icon: <CreditCard size={20} /> },
    { id: 'account', name: 'Account', icon: <User size={20} /> },
    { id: 'mobile', name: 'Mobile App', icon: <Smartphone size={20} /> },
    { id: 'cinemas', name: 'Cinema Locations', icon: <Globe size={20} /> },
  ];

  const faqs = {
    general: [
      {
        id: 1,
        question: 'What is CinemaRwa?',
        answer: 'CinemaRwa is Rwanda\'s premier online movie ticketing platform, offering the latest local and international films across major cinemas in Kigali and other cities. We provide easy booking, secure payments, and up-to-date showtimes.'
      },
      {
        id: 2,
        question: 'How do I contact customer support?',
        answer: 'You can reach us through:\n• Phone: +250 788 123 456\n• Email: support@cinemarwa.rw\n• Live Chat: Available 8 AM - 10 PM daily\n• Twitter: @CinemaRwaHelp\n• Visit our office: Kigali Heights, 3rd Floor'
      },
      {
        id: 3,
        question: 'What are your operating hours?',
        answer: 'Our customer support is available:\n• Monday-Friday: 8:00 AM - 10:00 PM\n• Saturday-Sunday: 9:00 AM - 11:00 PM\n• Holidays: 10:00 AM - 8:00 PM'
      }
    ],
    booking: [
      {
        id: 4,
        question: 'How do I book tickets online?',
        answer: '1. Select your cinema and movie\n2. Choose showtime and seats\n3. Enter your details\n4. Make payment\n5. Receive e-ticket via email/SMS\n6. Show e-ticket at cinema entrance'
      },
      {
        id: 5,
        question: 'Can I cancel or refund my ticket?',
        answer: 'Cancellations are allowed up to 2 hours before showtime. Refunds are processed within 5-7 business days. Special events and premieres may have different cancellation policies.'
      },
      {
        id: 6,
        question: 'Do you offer group bookings?',
        answer: 'Yes! For groups of 10+ people, contact our group booking desk at groups@cinemarwa.rw or call +250 788 123 457 for special rates and reserved seating.'
      }
    ],
    movies: [
      {
        id: 7,
        question: 'Where can I find Rwandan movies?',
        answer: 'We have a dedicated "Made in Rwanda" section featuring local films. Check our monthly schedule for special screenings of Rwandan cinema with filmmaker Q&A sessions.'
      },
      {
        id: 8,
        question: 'Are movies shown in Kinyarwanda?',
        answer: 'Yes! Many international films include Kinyarwanda subtitles. Local films are primarily in Kinyarwanda. Look for the language icon when booking.'
      }
    ],
    payment: [
      {
        id: 9,
        question: 'What payment methods do you accept?',
        answer: 'We accept:\n• Mobile Money (MTN & Airtel)\n• Visa/Mastercard\n• Bank transfer\n• Cash at cinema\n• CinemaRwa Wallet'
      },
      {
        id: 10,
        question: 'Is my payment information secure?',
        answer: 'Absolutely! We use bank-level encryption and comply with PCI DSS standards. We never store your full card details on our servers.'
      }
    ],
    account: [
      {
        id: 11,
        question: 'How do I create an account?',
        answer: 'Click on "Sign Up" in the top right corner, enter your email, phone number, and create a password. You\'ll receive a verification code to activate your account.'
      },
      {
        id: 12,
        question: 'I forgot my password, what should I do?',
        answer: 'Click on "Forgot Password" on the login page, enter your email or phone number, and follow the instructions to reset your password.'
      }
    ],
    mobile: [
      {
        id: 13,
        question: 'Is there a mobile app available?',
        answer: 'Yes! Download the CinemaRwa app from Google Play Store or Apple App Store. Enjoy exclusive mobile-only deals and faster booking.'
      },
      {
        id: 14,
        question: 'Can I use my mobile ticket at the cinema?',
        answer: 'Yes! Simply show the QR code from your app or email at the entrance. Our staff will scan it for entry.'
      }
    ],
    cinemas: [
      {
        id: 15,
        question: 'Which cinemas are available?',
        answer: 'We partner with major cinemas across Rwanda including Kigali Heights Cinema, KCC Cinema, and Huye Cinema. Check the locations section for full details.'
      }
    ]
  };

  const cinemaLocations = [
    {
      name: 'Kigali Heights Cinema',
      address: 'Kigali Heights Shopping Center, Nyarutarama, Kigali',
      phone: '+250 788 100 001',
      features: ['IMAX', '4DX', 'Dolby Atmos', 'Food Court']
    },
    {
      name: 'KCC Cinema',
      address: 'Kigali City Center, Downtown Kigali',
      phone: '+250 788 100 002',
      features: ['3D', 'VIP Lounge', 'Family Section']
    },
    {
      name: 'Huye Cinema',
      address: 'University of Rwanda, Huye District',
      phone: '+250 788 100 003',
      features: ['Student Discounts', 'Local Films']
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = faqs[activeCategory]?.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Film size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Help Center
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Find answers to your questions and get support
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  className="w-full pl-14 pr-6 py-4 rounded-2xl text-gray-900 bg-white shadow-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 -mt-8 relative z-20">
        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Get instant help from our team</p>
            <button className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
              <Phone className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Call Us</h3>
            <p className="text-sm text-gray-600 mb-4">+250790019543</p>
            <button className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">
              Call Now
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Mail className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Email Us</h3>
            <p className="text-sm text-gray-600 mb-4">support@cinemarwa.rw</p>
            <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              Send Email
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Browse Topics</h2>
              <nav className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeCategory === category.id 
                        ? 'bg-purple-50 text-purple-700 font-medium shadow-sm' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">15 minutes</p>
                    <p className="text-xs text-gray-600">Avg. response time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star size={18} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">4.8/5</p>
                    <p className="text-xs text-gray-600">Customer satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* FAQs Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-gray-600">
                    {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'} found
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map(faq => (
                    <div key={faq.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <button
                        className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors group"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <h3 className="text-lg font-semibold text-left text-gray-900 group-hover:text-purple-600 transition-colors">{faq.question}</h3>
                        <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors ${expandedFaqs[faq.id] ? 'bg-purple-100' : ''}`}>
                          {expandedFaqs[faq.id] ? 
                            <ChevronUp size={18} className="text-purple-600" /> : 
                            <ChevronDown size={18} className="text-gray-600 group-hover:text-purple-600" />
                          }
                        </div>
                      </button>
                      {expandedFaqs[faq.id] && (
                        <div className="px-6 pb-6 pt-2">
                          <div className="pl-4 border-l-2 border-purple-200">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <HelpCircle size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No results found</p>
                    <p className="text-gray-600">No FAQs found matching "{searchQuery}"</p>
                    <p className="text-sm text-gray-500 mt-2">Try a different search term or browse categories</p>
                  </div>
                )}
              </div>
            </section>

            {/* Cinema Locations */}
            {activeCategory === 'cinemas' && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Cinema Locations</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {cinemaLocations.map((cinema, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl mb-1 text-gray-900">{cinema.name}</h3>
                          <p className="text-gray-600 text-sm">{cinema.address}</p>
                        </div>
                      </div>
                      <div className="mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Phone size={16} className="text-gray-600" />
                          </div>
                          <span>{cinema.phone}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cinema.features.map((feature, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contact Section */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 text-white">Still Need Help?</h2>
                <p className="text-gray-300">Our support team is ready to assist you</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold mb-2 text-white">Live Chat</h3>
                  <p className="text-sm text-gray-300 mb-4">Chat with our support team</p>
                  <button className="px-6 py-2.5 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-colors font-medium w-full">
                    Start Chat
                  </button>
                </div>

                <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Phone className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold mb-2 text-white">Call Us</h3>
                  <p className="text-sm text-gray-300 mb-4">+250790019543</p>
                  <button className="px-6 py-2.5 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-colors font-medium w-full">
                    Call Now
                  </button>
                </div>

                <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold mb-2 text-white">Email Us</h3>
                  <p className="text-sm text-gray-300 mb-4">support@cinemarwa.rw</p>
                  <button className="px-6 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-medium w-full">
                    Send Email
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Tips */}
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Pro Tip</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Book tickets on weekdays for better seat selection and check our "Twilight Shows" 
                    (6-8 PM) for 30% discounts on all movies!
                  </p>
                </div>
              </div>
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
                <Film size={24} />
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
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>+250 790 019 543</li>
                <li>support@cinemarwa.rw</li>
                <li>Kigali Heights, 3rd Floor</li>
                <li>Nyarutarama, Kigali</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CinemaRwa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HelperCenter;