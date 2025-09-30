import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import Icon from '../components/Icons';

export default function CarValuation() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    trim: '',
    year: '',
    registrationDate: '',
    licenseExpiry: '',
    ownerName: ''
  });

  const steps = [
    { number: 1, title: t('addVehicle'), description: t('scanRegistration') },
    { number: 2, title: t('vehicleInfo'), description: t('reviewVehicleInfo') },
    { number: 3, title: t('verifyEmail'), description: t('enterVerificationCode') },
    { number: 4, title: t('reviewConfirm'), description: t('reviewBeforeSubmit') }
  ];

  const renderStep1 = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="camera" size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('addVehicle')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('scanRegistration')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="camera" size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('scanRegistration')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('pointCameraAtRegistration')}</p>
        
        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2">
          <Icon name="camera" size={20} />
          <span>{t('startScanning')}</span>
        </button>
      </div>

      <div className="mt-6 flex justify-between">
        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <Icon name="upload" size={20} />
          <span>{t('uploadInstead')}</span>
        </button>
        
        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <Icon name="edit" size={20} />
          <span>{t('fillManually')}</span>
        </button>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <Icon name="arrow-left" size={20} />
          <span>{t('back')}</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('vehicleInfo')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('reviewVehicleInfo')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('vin')} *
            </label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({...formData, vin: e.target.value})}
              placeholder={t('enterVin')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('vinDescription')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('make')} *
            </label>
            <select
              value={formData.make}
              onChange={(e) => setFormData({...formData, make: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('selectMake')}</option>
              <option value="bmw">BMW</option>
              <option value="toyota">Toyota</option>
              <option value="honda">Honda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('model')} *
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('selectModel')}</option>
              <option value="x3">X3</option>
              <option value="camry">Camry</option>
              <option value="civic">Civic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('trim')} *
            </label>
            <select
              value={formData.trim}
              onChange={(e) => setFormData({...formData, trim: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('selectTrim')}</option>
              <option value="xdrive30i">X3 xDrive30i</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('trimDescription')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('manufacturingYear')} *
            </label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('registrationDate')} *
            </label>
            <input
              type="date"
              value={formData.registrationDate}
              onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('licenseExpiry')} *
            </label>
            <input
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('licenseExpiryDescription')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('ownerName')} *
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
              placeholder="Y"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <Icon name="arrow-left" size={20} />
          <span>{t('back')}</span>
        </button>
        
        <button 
          onClick={() => setCurrentStep(3)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <span>{t('continue')}</span>
          <Icon name="arrow-right" size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('verifyEmail')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('weveSentCode')}</p>
        <p className="text-blue-600 dark:text-blue-400 font-medium">zakhouryamen@gmail.com</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('verificationCode')}
          </label>
          <input
            type="text"
            placeholder="000000"
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
          />
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('resendCodeIn')} 56s</p>

        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2">
          <span>{t('verify')}</span>
          <Icon name="arrow-right" size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('reviewConfirm')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('reviewBeforeSubmit')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('personalInfo')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('name')}:</span>
              <span className="text-gray-900 dark:text-white">Yamen Zakhour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('email')}:</span>
              <span className="text-gray-900 dark:text-white">zakhouryamen@gmail.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('phone')}:</span>
              <span className="text-gray-900 dark:text-white">-</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('vehicleInfo')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('vin')}:</span>
              <span className="text-gray-900 dark:text-white">12345678910111213</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('make')}:</span>
              <span className="text-gray-900 dark:text-white">BMW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('model')}:</span>
              <span className="text-gray-900 dark:text-white">X3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('trim')}:</span>
              <span className="text-gray-900 dark:text-white">X3 xDrive30i</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('manufacturingYear')}:</span>
              <span className="text-gray-900 dark:text-white">2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('owner')}:</span>
              <span className="text-gray-900 dark:text-white">Y</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('registrationDate')}:</span>
              <span className="text-gray-900 dark:text-white">1997-10-05</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('licenseExpiry')}:</span>
              <span className="text-gray-900 dark:text-white">1998-10-04</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <Icon name="arrow-left" size={20} />
          <span>{t('back')}</span>
        </button>
        
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Icon name="check" size={20} />
          <span>{t('submitForValuation')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8 pt-24 w-full flex flex-col items-center">
      {/* Header */}
      <motion.div 
        className="bg-white dark:bg-gray-800 border-b rounded-lg border-gray-200 dark:border-gray-700 flex flex-col items-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-12 h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-white font-bold text-sm">W</span>
              </motion.div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Car Valuation
              </span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stepOf', { current: currentStep, total: 4 })}</span>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </div>
            </motion.div>
            
            <motion.button 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon name="close" size={24} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </motion.div>
      </motion.div>
    </div>
  );
}
