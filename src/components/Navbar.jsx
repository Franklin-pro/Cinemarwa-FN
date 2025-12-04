import React, { useEffect, useState, useCallback } from "react";
import { Search, Menu, X, User, LogOut, Settings, BarChart3 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { searchMovies, searchBackendMovies } from "../services/api";
import { useMovies } from "../context/MovieContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchSource, setSearchSource] = useState("tmdb"); // 'tmdb' or 'backend'

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openMovieDetails } = useMovies();

  // Get user and token from Redux
  const { user, token } = useSelector((state) => state.auth);
  const isLoggedIn = !!token && !!user;

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsProfileOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsProfileOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsOpen(false);
  };

  const handleRegisterClick = () => {
    navigate("/register");
    setIsOpen(false);
  };

  const handleAdminPanelClick = () => {
    navigate("/dashboard/filmmaker");
    setIsProfileOpen(false);
  };

  const handleAdminDashboardClick = () => {
    navigate("/dashboard/admin");
    setIsProfileOpen(false);
  };

  // Navigation items
  const navItems = isLoggedIn
    ? [
        { id: "home", label: "Home" },
        { id: "trending", label: "Trending" },
        { id: "featured", label: "Featured" },
        { id: "all-movies", label: "All Movies" }
      ]
    : [
        { id: "home", label: "Home",path:"/" },
        { id: "topRated", label: "Top Rated" },
        { id: "trending", label: "Trending" },
        { id: "popular", label: "Popular" }
      ];

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  // Debounced search function
  const getSearchResults = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      let data;
      if (searchSource === "backend") {
        data = await searchBackendMovies(searchQuery);
      } else {
        data = await searchMovies(searchQuery);
      }
      setResults(data || []);
      setSearchError(data.length === 0 ? "No results found" : null);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to search movies");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchSource]);

  // Handle selecting a movie
  const handleMovieSelect = (movie) => {
    setQuery(movie.title);
    openMovieDetails(movie.id);
    setResults([]);
    setSearchError(null);
    setIsOpen(false);
    
    // Scroll to top to ensure movie details are visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getSearchResults(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, getSearchResults]);

  // Add sticky background when scrolling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // const clearSearch = () => {
  //   setQuery("");
  //   setResults([]);
  //   setSearchError(null);
  // };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-neutral-900 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 gap-2 py-3">
        {/* Logo */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-1 focus:outline-none"
        >
          <span className="text-blue-500 font-bold text-2xl">Cine</span>
          <span className="text-white font-bold text-2xl">Verse</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="relative text-white hover:text-blue-500 transition group focus:outline-none"
            >
              {item.label}
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </nav>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative w-60">
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-full text-sm bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-400"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400" />

            {isSearching && (
              <div className="absolute right-10 top-2.5">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {(query && (results.length > 0 || isSearching || searchError)) && (
            <div className="absolute mt-2 w-full bg-neutral-800 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-neutral-400 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                </div>
              ) : searchError ? (
                <div className="p-4 text-center text-blue-400 text-sm">
                  {searchError}
                </div>
              ) : results.length > 0 ? (
                <ul className="divide-y divide-neutral-700">
                  {results.slice(0, 8).map((movie) => (
                    <li
                      key={movie.id}
                      className="hover:bg-neutral-700 transition-colors"
                    >
                      <button
                        className="w-full text-left px-4 py-3 text-sm flex items-center space-x-3 focus:outline-none"
                        onClick={() => handleMovieSelect(movie)}
                      >
                        <img
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                              : "https://via.placeholder.com/92x138/333/fff?text=No+Image"
                          }
                          alt={movie.title}
                          className="w-8 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/92x138/333/fff?text=No+Image";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {movie.title}
                          </div>
                          {movie.release_date && (
                            <div className="text-neutral-400 text-xs">
                              {new Date(movie.release_date).getFullYear()}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-neutral-400 text-sm">
                  No movies found for "{query}"
                </div>
              )}
            </div>
          )}
            </div>

          {/* Search Source Toggle */}
          <div className="flex items-center bg-neutral-800 rounded-full px-3 py-2 gap-2">
            <button
              onClick={() => setSearchSource("tmdb")}
              className={`text-xs px-2 py-1 rounded transition ${
                searchSource === "tmdb"
                  ? "bg-blue-500 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Search using TMDB database"
            >
              TMDB
            </button>
            <div className="w-px h-4 bg-neutral-600"></div>
            <button
              onClick={() => setSearchSource("backend")}
              className={`text-xs px-2 py-1 rounded transition ${
                searchSource === "backend"
                  ? "bg-blue-500 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Search using backend database"
            >
              Database
            </button>
          </div>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition text-white focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-sm">{user?.name?.split(' ')[0] || "User"}</span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg z-50 border border-neutral-700">
                  <div className="p-3 border-b border-neutral-700">
                    <p className="text-sm text-white font-medium">{user?.name}</p>
                    <p className="text-xs text-neutral-400">{user?.email}</p>
                    <p className="text-xs text-blue-400 mt-1 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  {user?.role === 'filmmaker' && (
                    <button
                      onClick={handleAdminPanelClick}
                      className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none border-t border-neutral-700"
                    >
                      <Settings size={16} />
                      <span>My Dashboard</span>
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={handleAdminDashboardClick}
                      className="w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none border-t border-neutral-700"
                    >
                      <BarChart3 size={16} />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 text-sm text-white hover:text-blue-400 transition focus:outline-none"
              >
                Login
              </button>
              <button
                onClick={handleRegisterClick}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none"
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-neutral-900 border-t border-neutral-700">
          <nav className="flex flex-col space-y-2 px-4 py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-white hover:text-blue-500 transition py-2 text-left focus:outline-none"
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Search */}
            <div className="relative mt-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-full text-sm bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-400"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400" />

                {isSearching && (
                  <div className="absolute right-10 top-2.5">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Mobile Search Results */}
              {(query && (results.length > 0 || isSearching || searchError)) && (
                <div className="absolute mt-2 w-full bg-neutral-800 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-neutral-400 text-sm">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    </div>
                  ) : searchError ? (
                    <div className="p-4 text-center text-blue-400 text-sm">
                      {searchError}
                    </div>
                  ) : results.length > 0 ? (
                    <ul className="divide-y divide-neutral-700">
                      {results.slice(0, 5).map((movie) => (
                        <li
                          key={movie.id}
                          className="hover:bg-neutral-700 transition-colors"
                        >
                          <button
                            className="w-full text-left px-4 py-3 text-sm flex items-center space-x-3 focus:outline-none"
                            onClick={() => handleMovieSelect(movie)}
                          >
                            <img
                              src={
                                movie.poster_path
                                  ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                  : "https://via.placeholder.com/92x138/333/fff?text=No+Image"
                              }
                              alt={movie.title}
                              className="w-8 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium truncate">
                                {movie.title}
                              </div>
                              {movie.release_date && (
                                <div className="text-neutral-400 text-xs">
                                  {new Date(movie.release_date).getFullYear()}
                                </div>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-neutral-400 text-sm">
                      No movies found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t border-neutral-700 mt-4 pt-4">
              {isLoggedIn ? (
                <>
                  <div className="px-2 py-2 mb-3">
                    <p className="text-sm text-white font-medium">{user?.name}</p>
                    <p className="text-xs text-neutral-400">{user?.email}</p>
                    <p className="text-xs text-blue-400 mt-1 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  {user?.role === 'filmmaker' && (
                    <button
                      onClick={handleAdminPanelClick}
                      className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none"
                    >
                      <Settings size={16} />
                      <span>My Movies</span>
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={handleAdminDashboardClick}
                      className="w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none"
                    >
                      <BarChart3 size={16} />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-neutral-700 transition flex items-center space-x-2 focus:outline-none"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-700 transition focus:outline-none"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none mt-2"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;