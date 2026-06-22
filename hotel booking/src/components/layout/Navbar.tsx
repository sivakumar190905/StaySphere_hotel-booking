import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Logo } from '../common/Logo';
import { Heart, User, Shield, Briefcase, Menu, X, Calendar, ChevronDown, Bell, LogOut, Globe, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { favorites, setCurrentRole, isAuthenticated, currentUser, logout, notifications, markNotificationsRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Dropdown States
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = React.useState(false);

  // Selector choices
  const [selectedLang, setSelectedLang] = React.useState('EN');
  const [selectedCurr, setSelectedCurr] = React.useState('INR');

  // Refs for click outside
  const profileRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const langRef = React.useRef<HTMLDivElement>(null);
  const currRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (currRef.current && !currRef.current.contains(target)) {
        setCurrDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Hotels', href: '#hotels' },
    { label: 'Destinations', href: '#destinations' },
    { label: 'Deals', href: '#deals' },
  ];

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.substring(1);
      if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/${href}`);
      }
    } else {
      navigate(href);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 h-[72px] backdrop-blur-[10px] bg-white/95 border-b border-[#E2E8F0] shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo & Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center" onClick={() => setCurrentRole('guest')}>
              <Logo size={32} showText={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className={`text-sm font-bold transition-colors py-2 relative group ${
                    link.href === '/' && isActive('/') ? 'text-[#2563EB]' : 'text-slate-500 hover:text-[#2563EB]'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-[#2563EB] transition-all duration-300 ${
                    link.href === '/' && isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Spotlight Search Trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-slate-500 font-bold text-xs transition-all cursor-pointer bg-transparent"
            >
              <Search size={14} className="text-slate-400" />
              <span>Search</span>
              <kbd className="text-[10px] bg-slate-100 px-1 rounded border font-mono">⌘K</kbd>
            </button>

            {/* Language Selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer border-none bg-transparent"
              >
                <Globe size={15} />
                <span>{selectedLang}</span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl py-1.5 border border-slate-100 z-50 text-xs font-bold text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                  {['EN', 'HI', 'TA', 'KA'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      {lang === 'EN' ? 'English (EN)' : lang === 'HI' ? 'Hindi (HI)' : lang === 'TA' ? 'Tamil (TA)' : 'Kannada (KA)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div ref={currRef} className="relative">
              <button
                onClick={() => setCurrDropdownOpen(!currDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer border-none bg-transparent"
              >
                <span className="font-extrabold text-[13px]">₹</span>
                <span>{selectedCurr}</span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>
              {currDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl py-1.5 border border-slate-100 z-50 text-xs font-bold text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                  {['INR', 'USD', 'EUR', 'GBP'].map(curr => (
                    <button
                      key={curr}
                      onClick={() => {
                        setSelectedCurr(curr);
                        setCurrDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      {curr === 'INR' ? 'Rupees (₹)' : curr === 'USD' ? 'Dollars ($)' : curr === 'EUR' ? 'Euros (€)' : 'Pounds (£)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              to="/dashboard"
              state={{ activeTab: 'favorites' }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-red-500 hover:bg-red-50/50 transition-all relative"
            >
              <Heart size={16} className={favorites.length > 0 ? 'fill-red-500 text-red-500' : 'text-slate-455'} />
              <span className="text-xs font-bold hidden lg:inline">Wishlist</span>
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 lg:static lg:ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black leading-none text-white bg-red-500 rounded-full">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-650 hover:text-[#2563EB] hover:bg-slate-50 transition-all relative border-none bg-transparent cursor-pointer"
              >
                <Bell size={16} className="text-slate-450" />
                <span className="text-xs font-bold hidden lg:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 lg:static lg:ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-[#2563EB] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-3 border border-slate-100 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-extrabold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markNotificationsRead}
                        className="text-[10px] font-extrabold text-[#2563EB] hover:text-blue-600 bg-transparent border-none cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 text-left ${
                            !n.read ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-xs text-slate-800">{n.title}</p>
                            <span className="text-[9px] text-slate-400 font-bold shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown or Sign In Button */}
            {isAuthenticated && currentUser ? (
              <div ref={profileRef} className="relative pl-3 border-l border-slate-200">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border-none bg-transparent animate-fade-in"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User Profile"
                    className="w-8 h-8 rounded-full object-cover border border-slate-205"
                  />
                  <span className="text-slate-800 text-sm font-extrabold hidden lg:inline">{currentUser.firstName}</span>
                  <ChevronDown size={14} className={`text-slate-450 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 border border-slate-100 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-extrabold text-slate-800 text-sm">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {currentUser.role === 'STAFF' ? 'Staff Workspace' : currentUser.role === 'PARTNER' ? 'Partner Portal' : currentUser.role === 'ADMIN' ? 'Admin Console' : 'Customer'}
                      </p>
                    </div>
                    {currentUser.role === 'PARTNER' && (
                      <button
                        onClick={() => {
                          navigate('/partner');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-xs font-bold text-[#2563EB] flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                      >
                        <Briefcase size={14} className="text-[#2563EB]" />
                        <span>Partner Cockpit</span>
                      </button>
                    )}
                    {currentUser.role === 'STAFF' && (
                      <button
                        onClick={() => {
                          navigate('/staff');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-xs font-bold text-[#2563EB] flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                      >
                        <Calendar size={14} className="text-[#2563EB]" />
                        <span>Operations Desk</span>
                      </button>
                    )}
                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-55 text-xs font-bold text-[#2563EB] flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                      >
                        <Shield size={14} className="text-[#2563EB]" />
                        <span>Admin Console</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>My Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard', { state: { activeTab: 'bookings' } });
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <Calendar size={14} className="text-slate-400" />
                      <span>My Bookings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard', { state: { activeTab: 'favorites' } });
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <Heart size={14} className="text-slate-400" />
                      <span>Wishlist</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-bold text-red-655 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-750 hover:bg-slate-105 focus:outline-none border-none bg-transparent cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Main Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  handleNavLinkClick(e, link.href);
                  setMobileMenuOpen(false);
                }}
                className="block px-3 py-2.5 rounded-xl text-sm font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile User Profile or Sign In */}
          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated && currentUser ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Mobile Profile"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="text-left">
                    <p className="font-extrabold text-slate-800 text-sm">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {currentUser.role === 'STAFF' ? 'Staff Workspace' : currentUser.role === 'PARTNER' ? 'Partner Portal' : currentUser.role === 'ADMIN' ? 'Admin Console' : 'Customer'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  {currentUser.role === 'PARTNER' && (
                    <Link
                      to="/partner"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-50 transition-all"
                    >
                      <Briefcase size={14} />
                      <span>Partner Cockpit</span>
                    </Link>
                  )}
                  {currentUser.role === 'STAFF' && (
                    <Link
                      to="/staff"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-50 transition-all"
                    >
                      <Calendar size={14} />
                      <span>Operations Desk</span>
                    </Link>
                  )}
                  {currentUser.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-50 transition-all"
                    >
                      <Shield size={14} />
                      <span>Admin Console</span>
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
                  >
                    <User size={14} className="text-slate-450" />
                    <span>My Dashboard</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    state={{ activeTab: 'favorites' }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart size={14} className={favorites.length > 0 ? 'fill-red-500 text-red-500' : 'text-slate-450'} />
                      <span>Wishlist</span>
                    </div>
                    {favorites.length > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-650 hover:bg-red-50 transition-all bg-transparent border-none text-left cursor-pointer"
                  >
                    <LogOut size={14} className="text-slate-450" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-3 py-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 text-center"
                >
                  Sign In to StaySphere
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
