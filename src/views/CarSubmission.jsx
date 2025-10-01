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
  
  // Camera and scanning state
  const [scanningStep, setScanningStep] = useState('start'); // 'start', 'front', 'back', 'complete'
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState({
    front: null,
    back: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

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

  // Camera functionality
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setCameraPermission('granted');
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
      toast.error(t('cameraAccessDenied'));
      return false;
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = async (type) => {
    if (!cameraStream) return;
    
    setIsProcessing(true);
    try {
      const video = document.getElementById('camera-video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `${type}-license.jpg`, { type: 'image/jpeg' });
        
        setCapturedImages(prev => ({
          ...prev,
          [type]: URL.createObjectURL(blob)
        }));
        
        setUploadedFiles(prev => ({
          ...prev,
          [type]: file
        }));
        
        setIsProcessing(false);
        toast.success(t('imageProcessed'));
        
        // Move to next step
        if (type === 'front') {
          setScanningStep('back');
        } else {
          setScanningStep('complete');
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Error capturing photo:', error);
      setIsProcessing(false);
      toast.error(t('tryAgain'));
    }
  };

  const retakePhoto = (type) => {
    setCapturedImages(prev => ({
      ...prev,
      [type]: null
    }));
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }));
    setScanningStep(type);
  };

  const startScanning = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setScanningStep('front');
    }
  };

  const goToNextStep = () => {
    if (scanningStep === 'front') {
      setScanningStep('back');
    } else if (scanningStep === 'back') {
      setScanningStep('complete');
    }
  };

  const goToPreviousStep = () => {
    if (scanningStep === 'back') {
      setScanningStep('front');
    } else if (scanningStep === 'front') {
      setScanningStep('start');
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Validation helper functions
  const validateField = (name, value) => {
    const errors = [];
    
    switch (name) {
      case 'make':
      case 'model':
      case 'trim':
        if (!value || value.trim() === '') {
          errors.push(t('validation.required'));
        }
        break;
        
      case 'mileage':
        if (!value || value.trim() === '') {
          errors.push(t('validation.required'));
        } else if (isNaN(value) || parseFloat(value) < 0) {
          errors.push(t('validation.invalidMileage'));
        } else if (parseFloat(value) > 999999) {
          errors.push(t('validation.maxValue', { max: 999999 }));
        }
        break;
        
      case 'vin':
        if (value && value.length > 0 && value.length !== 17) {
          errors.push(t('validation.invalidVin'));
        }
        break;
        
      case 'manufacturing_year':
        if (value && value.length > 0) {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(year) || year < 1900 || year > currentYear + 1) {
            errors.push(t('validation.invalidYear'));
          }
        }
        break;
        
      case 'owner_name':
        if (value && value.length > 0 && value.length < 2) {
          errors.push(t('validation.minLength', { min: 2 }));
        }
        break;
        
      default:
        break;
    }
    
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Required fields
    const requiredFields = ['make', 'model', 'trim', 'mileage'];
    requiredFields.forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors[0];
        isValid = false;
      }
    });
    
    // Optional fields
    const optionalFields = ['vin', 'manufacturing_year', 'owner_name'];
    optionalFields.forEach(field => {
      if (formData[field] && formData[field].trim() !== '') {
        const fieldErrors = validateField(field, formData[field]);
        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors[0];
          isValid = false;
        }
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (name) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    const fieldErrors = validateField(name, formData[name]);
    if (fieldErrors.length > 0) {
      setValidationErrors(prev => ({ ...prev, [name]: fieldErrors[0] }));
    }
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
    // Validate form before submission
    if (!validateForm()) {
      toast.error(t('validation.required'));
      return;
    }
    
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

  const renderStep1 = () => {
    // Start scanning screen
    if (scanningStep === 'start') {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="camera" size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('startScanningLicense')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {t('scanLicenseDescription')}
              </p>
            </div>

            <div className="space-y-6">
              {/* Main CTA */}
              <button
                onClick={startScanning}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <Icon name="camera" size={24} />
                  {t('useCamera')}
                </div>
              </button>

              {/* Fallback options */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('or')} {t('uploadInstead')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front License Upload */}
                  <div className="flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    <div className="mb-3">
                      <Icon name="upload" size={32} className="text-gray-400 mx-auto" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">{t('frontLicense')}</h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'front')}
                      className="hidden"
                      id="front-upload"
                    />
                    <label
                      htmlFor="front-upload"
                      className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      {t('uploadImageFile')}
                    </label>
                  </div>

                  {/* Back License Upload */}
                  <div className="flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    <div className="mb-3">
                      <Icon name="upload" size={32} className="text-gray-400 mx-auto" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">{t('backLicense')}</h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'back')}
                      className="hidden"
                      id="back-upload"
                    />
                    <label
                      htmlFor="back-upload"
                      className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      {t('uploadImageFile')}
                    </label>
                  </div>
                </div>

                {/* PDF Upload */}
                <div className="mt-4">
                  <div className="flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    <div className="mb-3">
                      <Icon name="file" size={32} className="text-gray-400 mx-auto" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">{t('pdfLicense')}</h3>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'pdf')}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      {t('uploadPdfFile')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-8 text-center">
              <button
                onClick={submitDocuments}
                disabled={!uploadedFiles.front && !uploadedFiles.back && !uploadedFiles.pdf}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('submitDocuments')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Camera scanning screens
    if (scanningStep === 'front' || scanningStep === 'back') {
      const isFront = scanningStep === 'front';
      const capturedImage = capturedImages[isFront ? 'front' : 'back'];
      
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {isFront ? t('scanFrontLicense') : t('scanBackLicense')}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {t('positionDocument')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    stopCamera();
                    setScanningStep('start');
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Icon name="close" size={24} />
                </button>
              </div>
            </div>

            {/* Camera or captured image */}
            <div className="relative">
              {capturedImage ? (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt={isFront ? t('frontLicense') : t('backLicense')}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Icon name="check" size={48} className="mx-auto mb-2" />
                      <p className="font-semibold">
                        {isFront ? t('frontLicenseCaptured') : t('backLicenseCaptured')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <video
                    id="camera-video"
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                    ref={(video) => {
                      if (video && cameraStream) {
                        video.srcObject = cameraStream;
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white border-dashed rounded-lg w-48 h-32 flex items-center justify-center">
                      <p className="text-white text-sm text-center px-4">
                        {t('makeSureDocument')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-6">
              {capturedImage ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => retakePhoto(isFront ? 'front' : 'back')}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('retakePhoto')}
                  </button>
                  <button
                    onClick={goToNextStep}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    {t('nextStep')}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => capturePhoto(isFront ? 'front' : 'back')}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {t('processingImage')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Icon name="camera" size={20} />
                        {t('capturePhoto')}
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Fallback upload for current step */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {t('or')} {t('uploadInstead')}
                </p>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], isFront ? 'front' : 'back')}
                    className="hidden"
                    id={`${isFront ? 'front' : 'back'}-upload-fallback`}
                  />
                  <label
                    htmlFor={`${isFront ? 'front' : 'back'}-upload-fallback`}
                    className="flex-1 cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center text-sm"
                  >
                    {t('uploadImageFile')}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Complete scanning screen
    if (scanningStep === 'complete') {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="check" size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('scanningProgress')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('readyToSubmit')}
              </p>
            </div>

            {/* Progress summary */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="check" size={20} className="text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">{t('frontLicenseStep')}</span>
                </div>
                <span className="text-green-600 text-sm font-medium">{t('stepCompleted')}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="check" size={20} className="text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium">{t('backLicenseStep')}</span>
                </div>
                <span className="text-green-600 text-sm font-medium">{t('stepCompleted')}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setScanningStep('start')}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('previousStep')}
              </button>
              <button
                onClick={submitDocuments}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                {t('submitDocuments')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

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
              onBlur={() => handleFieldBlur('make')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                validationErrors.make ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">{t('selectMake')}</option>
              {makes.map((make) => (
                <option key={make.slug} value={make.make}>
                  {make.make}
                </option>
              ))}
            </select>
            {validationErrors.make && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.make}</p>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('model')} *
            </label>
            <select
              value={formData.model}
              onChange={(e) => handleModelChange(e.target.value)}
              onBlur={() => handleFieldBlur('model')}
              disabled={!formData.make}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 ${
                validationErrors.model ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">{t('selectModel')}</option>
              {availableModels.map((model) => (
                <option key={model.slug} value={model.model}>
                  {model.model}
                </option>
              ))}
            </select>
            {validationErrors.model && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.model}</p>
            )}
          </div>

          {/* Trim Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('trim')} *
            </label>
            <select
              value={formData.trim}
              onChange={(e) => handleTrimChange(e.target.value)}
              onBlur={() => handleFieldBlur('trim')}
              disabled={!formData.model}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 ${
                validationErrors.trim ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">{t('selectTrim')}</option>
              {availableTrims.map((trim) => (
                <option key={trim.trim_id} value={trim.trim}>
                  {trim.trim}
                </option>
              ))}
            </select>
            {validationErrors.trim && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.trim}</p>
            )}
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('mileage')} (km) *
            </label>
            <input
              type="number"
              value={formData.mileage}
              onChange={(e) => handleFieldChange('mileage', e.target.value)}
              onBlur={() => handleFieldBlur('mileage')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                validationErrors.mileage ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('enterMileage')}
            />
            {validationErrors.mileage && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.mileage}</p>
            )}
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('chassisNumber')}
            </label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => handleFieldChange('vin', e.target.value)}
              onBlur={() => handleFieldBlur('vin')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                validationErrors.vin ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('enterVin')}
              maxLength={17}
            />
            {validationErrors.vin && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.vin}</p>
            )}
          </div>

          {/* Manufacturing Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('manufacturingYear')}
            </label>
            <input
              type="number"
              value={formData.manufacturing_year}
              onChange={(e) => handleFieldChange('manufacturing_year', e.target.value)}
              onBlur={() => handleFieldBlur('manufacturing_year')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                validationErrors.manufacturing_year ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('enterYear')}
              min="1900"
              max={new Date().getFullYear() + 1}
            />
            {validationErrors.manufacturing_year && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.manufacturing_year}</p>
            )}
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('transmission')}
            </label>
            <select
              value={formData.transmission}
              onChange={(e) => handleFieldChange('transmission', e.target.value)}
              onBlur={() => handleFieldBlur('transmission')}
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
              onChange={(e) => handleFieldChange('vehicle_category', e.target.value)}
              onBlur={() => handleFieldBlur('vehicle_category')}
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
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <img src="w.svg" alt="WeCars Logo" className="w-5 h-5" />
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
