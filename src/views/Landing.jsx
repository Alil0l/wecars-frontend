import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import Icon from '../components/Icons';
import Logo from '../assets/w.svg';
export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoggdedIn } = useUserContext();
  const { theme } = useTheme();
  const { isRTL } = useLanguage();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <Icon name="car" size={48} className="text-blue-600 dark:text-blue-400" />,
      title: t('instantValuation') || 'Instant Car Valuation',
      description: t('instantValuationDesc') || 'Get an instant AI-powered valuation of your car in minutes'
    },
    {
      icon: <Icon name="dollar" size={48} className="text-green-600 dark:text-green-400" />,
      title: t('bestPrice') || 'Best Price Guarantee',
      description: t('bestPriceDesc') || 'We offer competitive prices and guarantee the best deal'
    },
    {
      icon: <Icon name="search" size={48} className="text-purple-600 dark:text-purple-400" />,
      title: t('freeInspection') || 'Free Inspection',
      description: t('freeInspectionDesc') || 'Comprehensive free inspection by certified professionals'
    },
    {
      icon: <Icon name="zap" size={48} className="text-orange-600 dark:text-orange-400" />,
      title: t('quickProcess') || 'Quick & Easy Process',
      description: t('quickProcessDesc') || 'Sell your car in just a few simple steps'
    }
  ];

  const testimonials = [
    {
      name: 'Ahmed Al-Rashid',
      location: 'Dubai',
      rating: 5,
      text: t('testimonial1') || 'WeCars made selling my car incredibly easy. Got a great price and the process was so smooth!',
      car: '2020 BMW X5'
    },
    {
      name: 'Sarah Johnson',
      location: 'Abu Dhabi',
      rating: 5,
      text: t('testimonial2') || 'The free inspection was thorough and professional. I felt confident about the valuation.',
      car: '2019 Mercedes C-Class'
    },
    {
      name: 'Mohammed Hassan',
      location: 'Sharjah',
      rating: 5,
      text: t('testimonial3') || 'Best car buying experience in UAE. Quick, transparent, and fair pricing.',
      car: '2021 Toyota Camry'
    }
  ];

  const stats = [
    { number: '10,000+', label: t('carsSold') || 'Cars Sold' },
    { number: 'AED 500M+', label: t('totalValue') || 'Total Value' },
    { number: '98%', label: t('satisfaction') || 'Satisfaction Rate' },
    { number: '24/7', label: t('support') || 'Customer Support' }
  ];

  const steps = [
    {
      number: '1',
      title: t('uploadDocuments') || 'Upload Documents',
      description: t('uploadDocumentsDesc') || 'Upload your car license and documents'
    },
    {
      number: '2',
      title: t('getValuation') || 'Get Valuation',
      description: t('getValuationDesc') || 'Receive instant AI-powered valuation'
    },
    {
      number: '3',
      title: t('freeInspection') || 'Free Inspection',
      description: t('freeInspectionDesc') || 'Schedule a free professional inspection'
    },
    {
      number: '4',
      title: t('receivePayment') || 'Receive Payment',
      description: t('receivePaymentDesc') || 'Get paid quickly and securely'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white' 
          : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900'
      }`}>
        {/* Animated gradient overlay */}
        <div className={`absolute inset-0 animate-pulse ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-400/20'
            : 'bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-200/20'
        }`}></div>
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-bounce ${
            theme === 'dark' ? 'bg-gray-400/30' : 'bg-gray-600/30'
          }`}></div>
          <div className={`absolute top-1/3 right-1/3 w-1 h-1 rounded-full animate-ping ${
            theme === 'dark' ? 'bg-gray-300/40' : 'bg-gray-500/40'
          }`}></div>
          <div className={`absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full animate-pulse ${
            theme === 'dark' ? 'bg-gray-500/20' : 'bg-gray-400/20'
          }`}></div>
          <div className={`absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full animate-bounce ${
            theme === 'dark' ? 'bg-gray-400/30' : 'bg-gray-600/30'
          }`}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="text-center text-gray-900 dark:text-white">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {t('getYourCar') || 'Get Your Car\'s'} <span className="block text-purple-400">{t('trueValue') || 'True Value'}</span>
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('heroDescription') || 'Professional car valuations powered by AI technology. Get accurate market prices in 24 hours with optional expert inspections.'}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={() => navigate('/submission')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('startFreeValuation') || 'Start Free Valuation'}
                <span className="text-xl">→</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/how-it-works')}
                className="border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('howItWorks') || 'How It Works'}
              </motion.button>
            </motion.div>
            
            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-blue-400 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                >
                  10,000+
                </motion.div>
                <div className="text-gray-300 font-medium">
                  {t('carsValued') || 'Cars Valued'}
                </div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-blue-400 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                >
                  5,000+
                </motion.div>
                <div className="text-gray-300 font-medium">
                  {t('happyCustomers') || 'Happy Customers'}
                </div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-blue-400 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                >
                  24hrs
                </motion.div>
                <div className="text-gray-300 font-medium">
                  {t('averageValuationTime') || 'Average Valuation Time'}
                </div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-blue-400 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
                >
                  98%
                </motion.div>
                <div className="text-gray-300 font-medium">
                  {t('accuracyRate') || 'Accuracy Rate'}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('whyChooseWeCars') || 'Why Choose WeCars?'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('whyChooseDescription') || 'We combine cutting-edge AI technology with professional expertise to deliver the most accurate and reliable car valuations in the market.'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('howItWorks') || 'How It Works'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('howItWorksDesc') || 'Sell your car in 4 simple steps. It\'s that easy!'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('whatOurCustomersSay') || 'What Our Customers Say'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('testimonialsDesc') || 'Join thousands of satisfied customers who sold their cars with WeCars'}
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <motion.span 
                      key={i} 
                      className="text-yellow-400 text-2xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </motion.div>
                <motion.blockquote 
                  className="text-xl text-gray-700 dark:text-gray-300 mb-6 italic"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  "{testimonials[currentTestimonial].text}"
                </motion.blockquote>
                <motion.div 
                  className="flex items-center justify-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {testimonials[currentTestimonial].name[0]}
                  </motion.div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {testimonials[currentTestimonial].location} • {testimonials[currentTestimonial].car}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {t('readyToSell') || 'Ready to Sell Your Car?'}
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t('ctaDescription') || 'Get started today and receive your instant valuation in minutes. No obligations, completely free!'}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {isLoggdedIn ? (
              <motion.button
                onClick={() => navigate('/submission')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('startSelling') || 'Start Selling Now'}
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={() => navigate('/signup')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('getStarted') || 'Get Started Free'}
                </motion.button>
                <motion.button
                  onClick={() => navigate('/login')}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('login') || 'Login'}
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <img src={Logo} alt="WeCars Logo" className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl">WeCars</span>
              </div>
              <p className="text-gray-400">
                {t('footerDescription') || 'The fastest and most reliable way to sell your car in the UAE.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">{t('services') || 'Services'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t('carValuation') || 'Car Valuation'}</li>
                <li>{t('freeInspection') || 'Free Inspection'}</li>
                <li>{t('instantPayment') || 'Instant Payment'}</li>
                <li>{t('carBuying') || 'Car Buying'}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">{t('company') || 'Company'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t('aboutUs') || 'About Us'}</li>
                <li>{t('contact') || 'Contact'}</li>
                <li>{t('careers') || 'Careers'}</li>
                <li>{t('blog') || 'Blog'}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">{t('support') || 'Support'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t('helpCenter') || 'Help Center'}</li>
                <li>{t('faq') || 'FAQ'}</li>
                <li>{t('privacyPolicy') || 'Privacy Policy'}</li>
                <li>{t('termsOfService') || 'Terms of Service'}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WeCars. {t('allRightsReserved') || 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}