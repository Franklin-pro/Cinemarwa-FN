import { Facebook, Github, Instagram, TwitterIcon } from "lucide-react";
import React from "react";

function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <a href="" className="inline-block mb-6">
              <span className="text-blue-500 text-2xl font-bold">
                Cine<span className="text-white">Verse</span>
              </span>
            </a>
            <p className="mb-4 text-sm">
              cine verse is a movie website that provides users with a vast
              collection of movies and TV shows from around the world. With a
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
            <form action="" className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-full bg-neutral-800 border-neutral-700 text-white px-4 py-2 rounded-lg focus:outline focus:ring-2 text-sm"
                />
              </div>
              <button className="bg-blue-500 w-full hover:bg-blue-700 text-white py-2 rounded-lg transition-all text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t mt-3 pt-6 flex flex-col md:flex-row justify-between border-neutral-800">
          <p className="text-xs">
            &copy; {new Date().getFullYear()}
            CineVerse All right reserved. <br className="md:hidden" />
            <span className="hidden md:inline">.</span>
            Poweblue by{" "}
            <a href="https://franklindevloper.netlify.app/" target="_blank" className="text-blue-400 font-semibold hover:text-blue-300">
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
              help center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
