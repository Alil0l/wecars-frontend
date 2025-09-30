import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
 
import Icon from '../components/Icons';

export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useUserContext();
  const { setIsLoading } = useAppContext();
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: Profile, 3: Verification
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userData, setUserData] = useState({
    full_name: '',
    mobile_number: '',
    emirate: '',
    emirates_id: '',
    preferred_language: t('english'),
    preferred_contact_method: t('email')
  });
  const [otpLength, setOtpLength] = useState(6);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emirates = [
    t('abuDhabi'),
    t('dubai'), 
    t('sharjah'),
    t('ajman'),
    t('ummAlQuwain'),
    t('rasAlKhaimah'),
    t('fujairah')
  ];

  const languages = [
    t('english'),
    t('arabic'),
    t('hindi'),
    t('urdu'),
    t('french'),
    t('german'),
    t('spanish')
  ];

  const contactMethods = [
    t('email'),
    t('sms'),
    t('whatsapp'),
    t('phone')
  ];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      // const result = await callFrappeMethod('wecars.auth.send_auth_link', { 
      //   email: email 
      // });

      if (result.message.error && result.message.required_fields) {
        setCurrentStep(2);
      } else if (result.message.success) {
        setOtpLength(result.message.otp_length || 6);
        setCurrentStep(3);
        setSuccess('Authentication link sent to your email!');
      } else {
        setError(result.message.error || 'Failed to send authentication link');
      }
    } catch (error) {
      console.error('Error sending auth link:', error);
      setError('Failed to send authentication link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!userData.full_name || !userData.mobile_number || !userData.emirate || !userData.emirates_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      // const result = await callFrappeMethod('wecars.auth.send_auth_link', { 
      //   email: email,
      //   user_data: userData 
      // });

      if (result.message.success) {
        setOtpLength(result.message.otp_length || 6);
        setCurrentStep(3);
        setSuccess('Authentication link sent to your email!');
      } else {
        setError(result.message.error || 'Failed to send authentication link');
      }
    } catch (error) {
      console.error('Error sending auth link:', error);
      setError('Failed to send authentication link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode || otpCode.length !== otpLength) {
      setError(`Please enter a valid ${otpLength}-digit code`);
      return;
    }

    try {
      setIsLoading(true);
      // const result = await callFrappeMethod('wecars.auth.verify_token', { 
      //   token: otpCode,
      //   email: email 
      // });

      if (result.message.success) {
        handleSuccessfulAuth(result.message);
      } else {
        setError(result.message.error || 'Invalid or expired code');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulAuth = (response) => {
    const { api_key, api_secret, user } = response;
    
    // Store authentication data
    localStorage.setItem('wecars_api_key', api_key);
    localStorage.setItem('wecars_api_secret', api_secret);
    localStorage.setItem('wecars_user', JSON.stringify(user));
    
    // Update user context
    setUser(user);
    
    // Navigate to dashboard
    navigate('/frontend/dashboard');
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const renderStep1 = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('createAccount') || 'Create Your Account'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('signupDescription') || 'Join WeCars and start selling your car today'}
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('emailAddress') || 'Email Address'} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter your email address"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="error" size={20} className="text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="check" size={20} className="text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!email || !isValidEmail(email)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('createAccount') || 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
            <button
              onClick={() => navigate('/frontend/login')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {t('signIn') || 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="user" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('completeProfile') || 'Complete Your Profile'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('profileDescription') || 'Please provide some additional information to complete your profile'}
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('fullName') || 'Full Name'} *
            </label>
            <input
              type="text"
              value={userData.full_name}
              onChange={(e) => setUserData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('mobileNumber') || 'Mobile Number'} *
            </label>
            <input
              type="tel"
              value={userData.mobile_number}
              onChange={(e) => setUserData(prev => ({ ...prev, mobile_number: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="+971 50 123 4567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('emirate') || 'Emirate'} *
            </label>
            <select
              value={userData.emirate}
              onChange={(e) => setUserData(prev => ({ ...prev, emirate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Emirate</option>
              {emirates.map((emirate) => (
                <option key={emirate} value={emirate}>{emirate}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('emiratesId') || 'Emirates ID'} *
            </label>
            <input
              type="text"
              value={userData.emirates_id}
              onChange={(e) => setUserData(prev => ({ ...prev, emirates_id: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="784-1234-5678901-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('preferredLanguage') || 'Preferred Language'}
            </label>
            <select
              value={userData.preferred_language}
              onChange={(e) => setUserData(prev => ({ ...prev, preferred_language: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {languages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('preferredContactMethod') || 'Preferred Contact Method'}
            </label>
            <select
              value={userData.preferred_contact_method}
              onChange={(e) => setUserData(prev => ({ ...prev, preferred_contact_method: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {contactMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="error" size={20} className="text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('back') || 'Back'}
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              {t('continue') || 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('verifyCode') || 'Verify Your Code'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('verificationDescription') || `Enter the ${otpLength}-digit code sent to ${email}`}
          </p>
        </div>

        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('verificationCode') || 'Verification Code'} *
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, otpLength))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength={otpLength}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="error" size={20} className="text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!otpCode || otpCode.length !== otpLength}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('verifyCode') || 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('didntReceiveCode') || "Didn't receive the code?"}{' '}
            <button
              onClick={() => {
                setCurrentStep(1);
                setOtpCode('');
                setError('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {t('resendCode') || 'Resend Code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
}