import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../contexts/UserContext';
import Icon from './Icons';

// Custom hook for scroll direction detection
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY.current) > 10) {
        setScrollDirection(direction);
      }
      
      setIsAtTop(scrollY < 10);
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [scrollDirection]);

  return { scrollDirection, isAtTop };
};
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, languages, isRTL } = useLanguage();
  // const { user, logout } = useUserContext();
  const [user, setUser] = useState({
    first_name: 'John',
    email: 'john@example.com',
  });
  const logout = () => {
    setUser(null);
  };
  const { t } = useTranslation();
  const navigate = useNavigate();
  const langDropdownRef = useRef(null);
  
  // Use scroll direction hook
  const { scrollDirection, isAtTop } = useScrollDirection();
  
  // Determine if navbar should be visible
  const isNavbarVisible = scrollDirection === 'up' || isAtTop;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const menuItems = [
    // { name: t('dashboard'), to: '/frontend/dashboard' },
    { name: t('home'), to: '/frontend/' },
    { name: t('submission'), to: '/frontend/submission' },
    { name: t('valuation'), to: '/frontend/valuation' },
  ];

  return (
    <>
      {/* Spacer to maintain layout */}
      <div className={`transition-all duration-500 ease-out`} />
      
      {/* Navbar */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 m-4 mt-2 rounded-2xl
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
        border-b border-gray-200/50 dark:border-gray-700/50
        transition-all duration-500 ease-out
        ${isNavbarVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        ${isRTL ? 'rtl' : 'ltr'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/frontend/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              WeCars
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <span className="text-lg">
                  {languages.find(lang => lang.code === language)?.flag || '🌐'}
                </span>
                <span className="hidden sm:inline">
                  {languages.find(lang => lang.code === language)?.name || t('language')}
                </span>
                <Icon name="chevron-down" size={16} />
              </button>
              
              {isLangOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50`}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                        language === lang.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Icon name={theme === 'light' ? 'sun' : 'moon'} size={20} />
              {/* <span className="hidden sm:inline">
                {theme === 'light' ? t('light') : t('dark')}
              </span> */}
            </button>

            {/* User Menu - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.first_name ? user?.first_name[0] : user?.email[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-gray-700 dark:text-gray-300 text-sm">
                      {user?.first_name || user?.email}
                    </span>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {t('logout') || 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/frontend/login')}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {t('login') || 'Login'}
                  </button>
                  <button
                    onClick={() => navigate('/frontend/signup')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    {t('signup') || 'Sign Up'}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button - Show on screens below 1024px */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
            >
              <Icon name={isMenuOpen ? 'close' : 'menu'} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu - Show on screens below 1024px */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Authentication */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {user.first_name || user.email}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {t('logout') || 'Logout'}
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-3">
                    <button
                      onClick={() => {
                        navigate('/frontend/login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-md text-base font-medium transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      {t('login') || 'Login'}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/frontend/signup');
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      {t('signup') || 'Sign Up'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile Theme Toggle */}
              <div
              onClick={toggleTheme}
              className="flex items-center cursor-pointer justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  {theme === 'light' ? ' ☀️ ' + t('lightMode') : ' 🌙 ' + t('darkMode')}
                </span>
                <span
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
              </div>

              {/* Mobile Language Switcher */}
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('language')}</p>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                        language === lang.code 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
