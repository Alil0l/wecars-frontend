import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icons';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/frontend/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Large 404 Text */}
            <div className="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
              404
            </div>
            
            {/* Car Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Icon name="car" size={48} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('pageNotFound') || 'Page Not Found'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {t('pageNotFoundDescription') || "Sorry, we couldn't find the page you're looking for."}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('checkUrlOrGoHome') || 'The page might have been moved, deleted, or you entered the wrong URL.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Icon name="home" size={20} />
            <span>{t('goHome') || 'Go Home'}</span>
          </button>
          
          <button
            onClick={handleGoBack}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Icon name="arrow-left" size={20} />
            <span>{t('goBack') || 'Go Back'}</span>
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('needHelp') || 'Need help?'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
            <a 
              href="/frontend/contact" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('contactSupport') || 'Contact Support'}
            </a>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <a 
              href="/frontend/" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('browseCars') || 'Browse Cars'}
            </a>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <a 
              href="/frontend/valuation" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('carValuation') || 'Car Valuation'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
