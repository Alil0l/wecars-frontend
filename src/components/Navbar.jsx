import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../contexts/UserContext';
import { useDashboard } from '../hooks/useDashboard';
import Icon from './Icons';
import Logo from '../assets/w.svg';
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
  const { currUser: user, logout, isLoggdedIn } = useUserContext();
  const { submissions } = useDashboard();
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  
  // Use scroll direction hook
  const { scrollDirection, isAtTop } = useScrollDirection();
  
  // Determine if navbar should be visible
  const isNavbarVisible = scrollDirection === 'up' || isAtTop;
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLangOpen && !event.target.closest('[data-language-dropdown]')) {
        setIsLangOpen(false);
      }
    };

    if (isLangOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangOpen]);
  
  // Determine the appropriate action button
  const getActionButton = () => {
    if (!isLoggdedIn) {
      return {
        text: t('valueMyCar') || 'Value My Car',
        action: () => navigate('/submission'),
        className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200'
      };
    }
    
    // If logged in, check if user has cars
    const hasCars = submissions && submissions.length > 0;
    
    if (hasCars) {
      return {
        text: t('myCars') || 'My Cars',
        action: () => navigate('/dashboard'),
        className: 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors'
      };
    } else {
      return {
        text: t('valueMyCar') || 'Value My Car',
        action: () => navigate('/submission'),
        className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200'
      };
    }
  };
  
  const actionButton = getActionButton();



  const menuItems = [
    { name: t('home'), to: '/' },
    ...(isLoggdedIn ? [
      { name: t('dashboard'), to: '/dashboard' },
      { name: t('submission'), to: '/submission' },
      { name: t('valuation'), to: '/valuation' },
    ] : [])
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <img src={Logo} alt="WeCars Logo" className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              WeCars
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {menuItems.length > 1 &&menuItems.map((item) => (
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
          <div className="flex items-center gap-4">
            {/* Language Switcher - Desktop Only */}
            <div className="hidden lg:block relative" data-language-dropdown>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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

            {/* Theme Toggle - Desktop Only */}
            <div className="hidden lg:block">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Icon name={theme === 'light' ? 'sun' : 'moon'} size={20} />
              </button>
            </div>

            {/* Action Button - Desktop Only */}
            <div className="hidden lg:flex items-center gap-4">
              {isLoggdedIn && user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
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
                    onClick={actionButton.action}
                    className={actionButton.className}
                  >
                    {actionButton.text}
                  </button>
                  
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {t('logout') || 'Logout'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={actionButton.action}
                  className={actionButton.className}
                >
                  {actionButton.text}
                </button>
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

        {/* Mobile Menu - Compact Popover */}
        {isMenuOpen && (
          <div ref={menuRef} className={
`max-w-[80%] lg:hidden absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 ${isRTL ? 'left-4' : 'right-4'}`
          }
          >
            <div className="p-4">
              {/* Navigation Links */}
              { menuItems.length > 1 &&
              <div className="mb-4 flex flex-col gap-2 items-start justify-center">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              }
              
              {/* Language & Theme Controls */}
              <div className="mb-4">
                {/* Language Switcher */}
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{t('language')}</p>
                  <div className="flex gap-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                          language === lang.code 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span className="hidden sm:inline">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('theme')}</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    <Icon name={theme === 'light' ? 'sun' : 'moon'} size={16} />
                    <span className="text-xs">{theme === 'light' ? t('light') : t('dark')}</span>
                  </button>
                </div>
              </div>
              
              {/* Authentication */}
              <div className="pt-4">
                {isLoggdedIn && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium text-sm truncate">
                          {user.first_name || user.email}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        actionButton.action();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      {actionButton.text}
                    </button>
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      {t('logout') || 'Logout'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      actionButton.action();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    {actionButton.text}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
