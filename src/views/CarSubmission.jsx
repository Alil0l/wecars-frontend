import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { useSubmission } from '../hooks/useSubmission';
import { toast } from 'react-toastify';
import Icon from '../components/Icons';

export default function CarSubmission() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currUser } = useUserContext();
  const { setIsLoading } = useAppContext();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    trim: '',
    mileage: '',
    vin: '',
    manufacturing_year: '',
    specs: '',
    vehicle_category: '',
    owner_name: '',
    transmission: '',
    trim_id: ''
  });
  const [availableModels, setAvailableModels] = useState([]);
  const [availableTrims, setAvailableTrims] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({
    front: null,
    back: null,
    pdf: null
  });

  // Use submission hook
  const {
    submissionId,
    extractedData,
    setExtractedData,
    submissionStatus,
    createSubmissionWithDocuments,
    confirmAndUpdateVehicleData,
    checkSubmissionStatus,
    createLoading,
    createError,
    confirmLoading,
    confirmError,
    fileUploadLoading,
    progress,
    fileUploadError,
    resetSubmission
  } = useSubmission();

  const transmissionOptions = [
    t('automatic'),
    t('manual'),
    t('cvt'),
    t('semiAutomatic')
  ];

  const vehicleCategories = [
    t('sedan'),
    t('suv'),
    t('hatchback'),
    t('coupe'),
    t('convertible'),
    t('truck'),
    t('van'),
    t('other')
  ];

  // Load vehicle data on component mount
  useEffect(() => {
    loadVehicleData();
  }, []);

  // Check submission status periodically
  useEffect(() => {
    if (submissionId && currentStep === 2) {
      const interval = setInterval(async () => {
        const status = await checkSubmissionStatus();
        if (status?.message) {
          const data = status.message;
          if (data.status === 'extraction_completed' && data.extracted_data) {
            setExtractedData(data.extracted_data);
            setCurrentStep(3);
            clearInterval(interval);
          } else if (data.status === 'extraction_failed') {
            setCurrentStep(1);
            toast.error(t('aiExtractionFailed'));
            clearInterval(interval);
          }
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [submissionId, currentStep, checkSubmissionStatus, t]);

  const loadVehicleData = async () => {
    try {
      setIsLoading(true);
      
      // Load makes
      const makesResponse = await fetch('@/assets/wecars/data/makes.json');
      const makesData = await makesResponse.json();
      setMakes(makesData);
      
      // Load models
      const modelsResponse = await fetch('@/assets/wecars/data/models.json');
      const modelsData = await modelsResponse.json();
      setModels(modelsData);
      
      // Load trims
      const trimsResponse = await fetch('@/assets/wecars/data/trims.json');
      const trimsData = await trimsResponse.json();
      setTrims(trimsData);
      
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file, type) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleMakeChange = (selectedMake) => {
    setFormData(prev => ({ ...prev, make: selectedMake, model: '', trim: '' }));
    
    const filteredModels = models.filter(model => 
      model.make.toLowerCase() === selectedMake.toLowerCase()
    );
    setAvailableModels(filteredModels);
    setAvailableTrims([]);
  };

  const handleModelChange = (selectedModel) => {
    setFormData(prev => ({ ...prev, model: selectedModel, trim: '', trim_id: '' }));
    
    const filteredTrims = trims.filter(trim => 
      trim.make.toLowerCase() === formData.make.toLowerCase() &&
      trim.model.toLowerCase() === selectedModel.toLowerCase()
    );
    setAvailableTrims(filteredTrims);
  };

  const handleTrimChange = (selectedTrim) => {
    const selectedTrimData = availableTrims.find(trim => trim.trim === selectedTrim);
    setFormData(prev => ({ 
      ...prev, 
      trim: selectedTrim,
      trim_id: selectedTrimData?.trim_id || '',
      make: selectedTrimData?.make || prev.make,
      model: selectedTrimData?.model || prev.model
    }));
  };

  const submitDocuments = async () => {
    try {
      setIsLoading(true);
      
      if (!currUser?.email) {
        toast.error(t('userEmailRequired'));
        return;
      }

      const result = await createSubmissionWithDocuments(currUser?.email, uploadedFiles);
      
      if (result.success) {
        setCurrentStep(2);
        // Start polling for status updates
        setTimeout(() => {
          checkSubmissionStatus();
        }, 1000);
      } else {
        toast.error(result.error || t('failedToSubmitDocuments'));
      }
    } catch (error) {
      console.error('Error submitting documents:', error);
      toast.error(error.message || t('failedToSubmitDocuments'));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmVehicleData = async () => {
    try {
      setIsLoading(true);
      
      const result = await confirmAndUpdateVehicleData(submissionId, formData, formData.mileage);

      if (result.success) {
        setCurrentStep(4);
        toast.success(t('vehicleDataConfirmed'));
      } else {
        toast.error(result.error || t('failedToConfirmVehicleData'));
      }
    } catch (error) {
      console.error('Error confirming vehicle data:', error);
      toast.error(error.message || t('failedToConfirmVehicleData'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="file" size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('uploadVehicleDocuments')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('uploadVehicleDocumentsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Front License */}
          <div className="flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <Icon name="upload" size={48} className="text-gray-400 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('frontLicense')}</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0], 'front')}
              className="hidden"
              id="front-upload"
            />
            <label
              htmlFor="front-upload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {uploadedFiles.front ? t('changeFile') : t('uploadImage')}
            </label>
            {uploadedFiles.front && (
              <p className="text-sm text-gray-500 mt-2">{uploadedFiles.front.name}</p>
            )}
          </div>

          {/* Back License */}
          <div className="flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <Icon name="upload" size={48} className="text-gray-400 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('backLicense')}</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0], 'back')}
              className="hidden"
              id="back-upload"
            />
            <label
              htmlFor="back-upload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {uploadedFiles.back ? t('changeFile') : t('uploadImage')}
            </label>
            {uploadedFiles.back && (
              <p className="text-sm text-gray-500 mt-2">{uploadedFiles.back.name}</p>
            )}
          </div>

          {/* PDF License */}
          <div className="flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <div className="mb-4">
              <Icon name="file" size={48} className="text-gray-400 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('pdfLicense')}</h3>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files[0], 'pdf')}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {uploadedFiles.pdf ? t('changeFile') : t('uploadPdf')}
            </label>
            {uploadedFiles.pdf && (
              <p className="text-sm text-gray-500 mt-2">{uploadedFiles.pdf.name}</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={submitDocuments}
            disabled={!uploadedFiles.front && !uploadedFiles.back && !uploadedFiles.pdf}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('submitDocuments')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('aiProcessingDocuments')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('aiProcessingDesc')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 dark:text-gray-300">{t('analyzingDocumentImages')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 dark:text-gray-300">{t('extractingVehicleData')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 dark:text-gray-300">{t('validatingInformation')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reviewExtractedData')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('reviewExtractedDataDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Make Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('make')} *
            </label>
            <select
              value={formData.make}
              onChange={(e) => handleMakeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('selectMake')}</option>
              {makes.map((make) => (
                <option key={make.slug} value={make.make}>
                  {make.make}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('model')} *
            </label>
            <select
              value={formData.model}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!formData.make}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">{t('selectModel')}</option>
              {availableModels.map((model) => (
                <option key={model.slug} value={model.model}>
                  {model.model}
                </option>
              ))}
            </select>
          </div>

          {/* Trim Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('trim')} *
            </label>
            <select
              value={formData.trim}
              onChange={(e) => handleTrimChange(e.target.value)}
              disabled={!formData.model}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">{t('selectTrim')}</option>
              {availableTrims.map((trim) => (
                <option key={trim.trim_id} value={trim.trim}>
                  {trim.trim}
                </option>
              ))}
            </select>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('mileage')} (km) *
            </label>
            <input
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder={t('enterMileage')}
            />
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('chassisNumber')}
            </label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder={t('enterVin')}
            />
          </div>

          {/* Manufacturing Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('manufacturingYear')}
            </label>
            <input
              type="number"
              value={formData.manufacturing_year}
              onChange={(e) => setFormData(prev => ({ ...prev, manufacturing_year: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder={t('enterYear')}
            />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('transmission')}
            </label>
            <select
              value={formData.transmission}
              onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('selectTransmission')}</option>
              {transmissionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('vehicleCategory')}
            </label>
            <select
              value={formData.vehicle_category}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicle_category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('selectCategory')}</option>
              {vehicleCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('back')}
          </button>
          <button
            onClick={confirmVehicleData}
            disabled={!formData.make || !formData.model || !formData.trim || !formData.trim_id || !formData.mileage}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('confirmSubmit')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('submissionSuccessful')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('submissionSuccessfulDesc')}
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('submissionId')}</p>
          <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">{submissionId}</p>
        </div>
        <button
          onClick={() => navigate('/frontend/dashboard')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          {t('goToDashboard')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8 pt-24 w-full flex flex-col items-center">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="flex items-center flex-col-reverse py-4 md:flex-row justify-between gap-2 md:py-0 md:gap-12 md:h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">{t('carSubmission')}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="mx-2 text-sm text-gray-600 dark:text-gray-400">
                {t('step')} { currentStep } { t('of') } { 4 }
                </span>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/frontend/dashboard')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon name="close" size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
}
