import { Facebook, Github, Instagram, TwitterIcon, Mail, CheckCircle, AlertCircle } from "lucide-react";
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
  
  // detect login state
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
      setSubscribeMessage('✓ Successfully subscribed to our newsletter!');
      setSubscribeEmail('');
      setTimeout(() => setSubscribeMessage(''), 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to subscribe';
      setSubscribeError(errorMsg);
      setTimeout(() => setSubscribeError(''), 5000);
    } finally {
      setSubscribeLoading(false);
    }
  };

  // 🔥 hide footer if user is filmmaker or admin
  if (userIsLoggedIn && ["filmmaker", "admin"].includes(user?.role)) {
    return null;
  }

  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <a href="" className="inline-block mb-6">
              <span className="text-blue-500 text-2xl font-bold">
                <img src={cinemaLogo} alt="logo" className=" w-32 h-16 object-cover" />
              </span>
            </a>
            <p className="mb-4 text-sm">
              cine verse is a movie website that provides users with a vast
              collection of movies and TV shows from Rwanda. With a
              user-friendly interface and powerful search functionality, users
              can easily find their favorite movies and discover new ones.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Franklin-pro/"
                className="text-neutral-500 hover:text-blue-500 transition-colors"
              >
                <Github className="w-7 h-7" />
              </a>
              <a
                href="https://www.instagram.com/g_wayne_1/"
                className="text-neutral-500 hover:text-blue-500 transition-colors"
              >
                <Instagram className="w-7 h-7" />
              </a>
              <a
                href="https://x.com/franklinpro21?t=m0lPOVUn8-X-4cSyrUUFlw&s=09"
                className="text-neutral-500 hover:text-blue-500 transition-colors"
              >
                <TwitterIcon className="w-7 h-7" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#trending"
                  className="hover:text-blue-500 transition-colors"
                >
                  Trending
                </a>
              </li>
              <li>
                <a
                  href="#toprated"
                  className="hover:text-blue-500 transition-colors"
                >
                  Top Rated
                </a>
              </li>
              <li>
                <a
                  href="#popular"
                  className="hover:text-blue-500 transition-colors"
                >
                  Popular
                </a>
              </li>
              <li>
                <a
                  href="#movies"
                  className="hover:text-blue-500 transition-colors"
                >
                  Movies
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#about"
                  className="hover:text-blue-500 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#contacts"
                  className="hover:text-blue-500 transition-colors"
                >
                  Contacts
                </a>
              </li>
              <li>
                <a
                  href="#blogs"
                  className="hover:text-blue-500 transition-colors"
                >
                  Blogs
                </a>
              </li>
              <li>
                <a
                  href="#fqa"
                  className="hover:text-blue-500 transition-colors"
                >
                  FQA
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-4">News Letter</h3>
            <p className="text-sm mb-4">
              Stay up to date with the latest movies and news
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {subscribeMessage && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {subscribeMessage}
                </div>
              )}
              {subscribeError && (
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {subscribeError}
                </div>
              )}
              <button 
                type="submit"
                disabled={subscribeLoading}
                className="bg-blue-500 w-full hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 text-white py-2 rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                {subscribeLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t mt-3 pt-6 flex flex-col md:flex-row justify-between border-neutral-800">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} CineVerse All right reserved.{" "}
            <br className="md:hidden" />
            <span className="hidden md:inline">.</span>
            Powered by{" "}
            <a
              href="https://franklindevloper.netlify.app/"
              target="_blank"
              className="text-blue-400 font-semibold hover:text-blue-300"
            >
              Franklin Developer
            </a>
          </p>

          <div className="flex space-x-4 mt-4 md:mt-0 text-xs">
            <a
              href="#privancy policy"
              className="hover:text-blue-400 transition-all"
            >
              Privacy Policy
            </a>
            <a
              href="term and services"
              className="hover:text-blue-400 transition-all"
            >
              Terms of Service
            </a>
            <a href="" className="hover:text-blue-400 transition-all">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;