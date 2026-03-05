import { Facebook, Github, Instagram, TwitterIcon, Mail, CheckCircle, AlertCircle, Film, MapPin, Phone, Clock, Shield } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { subscribeService } from "../services/api/subscribe";
import cinemaLogo from "../assets/cinerwandaLogo.png";

function Footer() {
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeError, setSubscribeError] = useState('');
  
  useEffect(() => {
    setUserIsLoggedIn(!!(user && user.token));
  }, [user]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeLoading(true);
    setSubscribeMessage('');
    setSubscribeError('');

    try {
      await subscribeService.subscribeCinemaRwa({
        email: subscribeEmail,
        preferences: {
          newMovies: true,
          promotions: true,
          weeklyDigest: true,
        },
      });
      setSubscribeMessage('✓ Successfully subscribed!');
      setSubscribeEmail('');
      setTimeout(() => setSubscribeMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Subscription failed';
      setSubscribeError(errorMsg);
      setTimeout(() => setSubscribeError(''), 3000);
    } finally {
      setSubscribeLoading(false);
    }
  };

  if (userIsLoggedIn && ["filmmaker", "admin"].includes(user?.role)) {
    return null;
  }

  const cinemaLocations = [
    { name: "GATENGA", city: "Kigali / Gatenga" },
    { name: "OKG MUSIC OFFICE", city: "Kigali / Niboye" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-1">
            <img src={cinemaLogo} alt="CinemaRwa" className="w-32 h-16 object-contain mb-3" />
            <p className="text-gray-400 text-sm mb-3">
              Rwanda's premier movie platform.
            </p>
            <div className="flex gap-2">
              <a href="https://github.com/Franklin-pro/" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/g_wayne_1/" className="bg-gray-800 hover:bg-pink-600 p-2 rounded-full">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://x.com/franklinpro21" className="bg-gray-800 hover:bg-blue-400 p-2 rounded-full">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" className="bg-gray-800 hover:bg-blue-700 p-2 rounded-full">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-md mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {['Movies', 'Showtimes', 'Cinemas', 'Coming Soon'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-white font-semibold text-md mb-3 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Cinemas
            </h3>
            <ul className="space-y-2 text-sm">
              {cinemaLocations.map((cinema) => (
                <li key={cinema.name}>
                  <p className="font-medium">{cinema.name}</p>
                  <p className="text-xs text-gray-500">{cinema.city}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h3 className="text-white font-semibold text-md mb-3">Updates</h3>
            <form onSubmit={handleSubscribe} className="mb-3">
              <input
                type="email"
                placeholder="Email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
              />
              
              {subscribeMessage && (
                <div className="flex items-center gap-1 text-green-400 text-xs mb-2">
                  <CheckCircle className="w-3 h-3" />
                  <span>{subscribeMessage}</span>
                </div>
              )}
              
              <button 
                type="submit"
                disabled={subscribeLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded-lg font-medium"
              >
                {subscribeLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-blue-400" />
                <span>+250 783 446 449</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>Sat-Sun: 8AM-2PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
            <p className="text-gray-500">
              © {new Date().getFullYear()} CinemaRwa
            </p>
            <div className="flex items-center gap-4">
              <a href="/privacy-policy" className="hover:text-blue-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Privacy
              </a>
              <a href="/terms" className="hover:text-blue-400">Terms</a>
            </div>
          </div>
          
          <div className="text-center mt-3 text-xs text-gray-600">
            Developed by{" "}
            <a href="https://franklindevloper.netlify.app/" className="text-blue-400 hover:text-blue-300">
              Franklin Developer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;