import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { useSubmission } from '../hooks/useSubmission';
import { toast } from 'react-toastify';
import Icon from '../components/Icons';
import Logo from '../assets/w.svg';
import MakesJson from '../assets/wecars/data/makes.json';
import ModelsJson from '../assets/wecars/data/models.json';
import TrimsJson from '../assets/wecars/data/trims.json';
import { isValidUAEMobile, formatUAEMobile, isValidEmail  } from '../utils/validation';


export default function CarSubmission() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currUser, isLoggdedIn } = useUserContext();
  const { setIsLoading } = useAppContext();
  
  // Start at step 2 if user is logged in, otherwise start at step 1 (email check)
  const [currentStep, setCurrentStep] = useState(isLoggdedIn ? 2 : 1);
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
    back: null
  });

  // NEW: Updated workflow state
  const [email, setEmail] = useState(currUser?.email || '');
  const [userExists, setUserExists] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [pendingValuation, setPendingValuation] = useState(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [carVerified, setCarVerified] = useState(false);
  const [carRecord, setCarRecord] = useState(null);
  const [userData, setUserData] = useState({
    full_name: '',
    mobile_number: '',
    emirate: ''
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
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Use submission hook with all API calls
  const {
    // State
    submissionId,
    setSubmissionId,
    extractedData,
    setExtractedData,
    submissionStatus,
    processingStatus,
    processingMessage,
    extractionError,
    
    // File upload
    fileUploadLoading,
    progress,
    fileUploadError,
    
    // Submission operations
    confirmAndUpdateVehicleData,
    checkSubmissionStatus,
    createValuationLoading,
    createValuationError,
    confirmLoading,
    confirmError,
    
    // Authentication API calls
    sendAuthLink,
    sendAuthLinkLoading,
    verifyToken,
    verifyTokenLoading,
    
    // Customer API calls
    checkCustomerHook,
    checkPendingValuationHook,
    resumePendingValuationHook,
    discardPendingValuationHook,
    confirmCustomerDataHook,
    
    // Vehicle API calls
    createValuationWithDocuments,
    getTrimsForMakeHook,
    getListHook,
    // Reset
    resetSubmission,


  } = useSubmission();

  // make it key and value with the key first letter uppercase
  const transmissionOptions = [
    { key: 'Automatic', value: '[377] Automatic' },
    { key: 'Manual', value: '[378] Manual' },
  ];

  const vehicleCategories = [
    { key: 'Sedan', value: 'Sedan' },
    { key: 'SUV', value: 'SUV'   },
    { key: 'Hatchback', value: 'Hatchback' },
    { key: 'Coupe', value: 'Coupe' },
    { key: 'Convertible', value: 'Convertible' },
    { key: 'Truck', value: 'Truck' },
    { key: 'Van', value: 'Van' },
    { key: 'Other', value: 'Other' },
  ];




  // Load vehicle data on component mount
  useEffect(() => {
  async function getTrimList() {
    const response = await getListHook(formData.make);
    setAvailableTrims(response.message.trims);
  }
  getTrimList();

    loadVehicleData();
  }, []);

  // Handle logged-in user workflow - check for pending valuations
  useEffect(() => {
    if (isLoggdedIn && currUser?.email && currentStep === 2) {
      checkEmail(); // This will check for pending valuations using the logged-in user's email
    }
  }, [isLoggdedIn, currUser?.email, currentStep]);

  // Handle realtime processing status changes
  useEffect(() => {
    if (processingStatus === 'extraction_completed' && extractedData) {
      setCurrentStep(3);
    } else if (processingStatus === 'extraction_failed') {
      // Stay on step 2 to show error, don't go back to step 1 automatically
      // User can choose to retry or upload new documents
    }
  }, [processingStatus, extractedData]);

  // Auto-populate form with extracted data when available
  useEffect(() => {
    if (extractedData && Object.keys(extractedData).length > 0) {
      setFormData(prev => ({
        ...prev,
        vin: extractedData.vin || prev.vin,
        manufacturing_year: extractedData.manufacturing_year || prev.manufacturing_year,
        specs: extractedData.specs || prev.specs,
        vehicle_category: extractedData.vehicle_category || prev.vehicle_category,
        owner_name: extractedData.owner_name || prev.owner_name,
        transmission: extractedData.transmission || prev.transmission,
        trim_id: extractedData.trim_id || prev.trim_id,
        make: extractedData.make || prev.make,
        model: extractedData.model || prev.model,
        trim: extractedData.trim || prev.trim
      }));
    }
  }, [extractedData]);

  const loadVehicleData = async () => {
    try {
      setIsLoading(true);
      setMakes(MakesJson);
      
      // Load models
      setModels(ModelsJson);
      
      // Load trims
      setTrims(TrimsJson);
      
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
      trim.model.toLowerCase().includes(selectedModel.toLowerCase())
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

  // ============================================================================
  // NEW: Updated workflow functions
  // ============================================================================
  
  // Step 1: Check email and pending valuations
  const checkEmail = async () => {
    // Use logged-in user's email if available, otherwise use form email
    const emailToCheck = currUser?.email || email;
    
    if (!emailToCheck || !isValidEmail(emailToCheck)) {
      if (!isLoggdedIn) {
        toast.error('Please enter a valid email address');
        return;
      } else {
        toast.error('User email not found');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      // For logged-in users, skip auth link and go directly to customer check
      if (isLoggdedIn && currUser?.email) {
        setUserExists(true);
        setEmail(currUser.email);
        // Get customer profile for pending check
        const customerResponse = await checkCustomerHook({ email: currUser?.email });

        if (customerResponse.message.exists) {
          setCustomerProfile(customerResponse.message.customer);
          
          // Check for pending valuations
          const pendingCheck = await checkPendingValuationHook({ 
            customer_profile: customerResponse.message.customer.name 
          });

          if (pendingCheck.message && pendingCheck.message.has_pending) {
            // Found pending valuation - show modal
            setPendingValuation(pendingCheck.message);
            setShowPendingModal(true);
            
            toast.info(`Welcome back, ${customerResponse.message.customer.full_name}! You have a pending valuation.`);
          } else {
            // No pending, proceed to file upload
            setCurrentStep(2);
            toast.success(`Welcome back, ${customerResponse.message.customer.full_name}!`);
          }
        }
      } else {
        // For non-logged-in users, request auth link
        const response = await sendAuthLink({ email: emailToCheck.trim().toLowerCase() });

        if (response.message.success) {
          // Existing customer - check for pending valuations
          setUserExists(true);
          
          // Get customer profile for pending check
          const customerResponse = await checkCustomer({ email: emailToCheck.trim().toLowerCase() });

          if (customerResponse.message.exists) {
            setCustomerProfile(customerResponse.message.customer);
            
            // Check for pending valuations
            const pendingCheck = await checkPendingValuation({ 
              customer_profile: customerResponse.message.customer.name 
            });

            if (pendingCheck.message && pendingCheck.message.has_pending) {
              // Found pending valuation - show modal
              setPendingValuation(pendingCheck.message);
              setShowPendingModal(true);
              
              toast.info(`Welcome back, ${customerResponse.message.customer.full_name}! You have a pending valuation.`);
            } else {
              // No pending, proceed to file upload
              setCurrentStep(2);
              toast.success(`Welcome back, ${customerResponse.message.customer.full_name}!`);
            }
          }
        } else if (response.message.error === "User data required") {
          // New customer - show user data form
          setUserExists(false);
          setCurrentStep(1.5); // Go to new user form
        } else {
          toast.error(response.message.error || 'Failed to process email');
        }
      }
    } catch (err) {
      console.error('Check email error:', err);
      toast.error(err.message || 'Failed to check email');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1.5: Create new user
  const createNewUser = async (userData) => {
    try {
      setIsLoading(true);
      
      // Send auth link with user data for new customer
      const response = await sendAuthLink({
        email: email.trim().toLowerCase(),
        user_data: userData
      });

      if (response.message.success) {
        // Customer created, now verify token to get API credentials
        const verifyResponse = await verifyToken({
          token: response.message.otp, // Use the OTP as token
          email: email.trim().toLowerCase()
        });

        if (verifyResponse.message.success) {
          setCustomerProfile(verifyResponse.message.user);
          setCurrentStep(2); // Go straight to file upload (new customer = no pending valuations)
          toast.success('Customer profile created successfully!');
        } else {
          toast.error(verifyResponse.message.error || 'Failed to verify customer');
        }
      } else {
        toast.error(response.message.error || 'Failed to create customer');
      }
    } catch (err) {
      console.error('Create customer error:', err);
      toast.error(err.message || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit valuation
  const submitValuation = async () => {
    if (!uploadedFiles.front && !uploadedFiles.back) {
      toast.error('Please upload at least one document');
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the useSubmission hook's createSubmissionWithDocuments method
      const result = await createValuationWithDocuments(customerProfile.name, uploadedFiles);
      if (result.success) {
        setSubmissionId(result.valuation_id);
        setCurrentStep(3);
        toast.success('✅ Valuation submitted! AI processing...');
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit valuation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Confirm data (simplified for verified cars)
  const handleSimplifiedDataConfirm = async (mileage, warranty) => {
    try {
      setIsLoading(true);
      
      // Prepare full form data for submission
      const fullFormData = {
        ...formData,
        current_mileage: mileage,
        warranty: warranty,
        trim_id: formData.trim_id,
        manufacturing_year: formData.manufacturing_year,
        specs: formData.specs,
        transmission: formData.transmission,
        vin: formData.vin,
        vehicle_category: formData.vehicle_category,
        owner_name: formData.owner_name
      };
      
      const response = await confirmCustomerDataHook({
        valuation_id: submissionId,
        updated_fields: fullFormData,
        current_mileage: mileage
      });

      if (response.message && response.message.success) {
        setCurrentStep(4);
        toast.success('✅ Data confirmed! Valuation processing...');
      } else {
        throw new Error(response.message?.error || 'Confirmation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to confirm data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Confirm data (full for unverified cars)
  const confirmData = async (confirmedData) => {
    try {
      setIsLoading(true);
      
      const response = await confirmCustomerDataHook({
        valuation_id: submissionId,
        updated_fields: {
          trim_id: confirmedData.trim_id,
          manufacturing_year: confirmedData.manufacturing_year,
          specs: confirmedData.specs,
          transmission: confirmedData.transmission,
          warranty: confirmedData.warranty,
          vin: confirmedData.vin
        },
        current_mileage: confirmedData.current_mileage
      });

      if (response.message && response.message.success) {
        setCurrentStep(4);
        toast.success('✅ Data confirmed! Valuation processing...');
      } else {
        throw new Error(response.message?.error || 'Confirmation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to confirm data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Pending valuation handlers
  const handleResumePending = async () => {
    try {
      setIsLoading(true);
      setShowPendingModal(false);
      const response = await resumePendingValuationHook({ 
        valuation_id: pendingValuation.pending_valuation.valuation_id 
      });

      if (response.message && response.message.success) {
        setCarRecord(response.message.car_record);
        
        if (response.message.car_record.data_verified) {
          setCarVerified(true);
          setCurrentStep(3.5); // Simplified form
        } else {
          setCurrentStep(3); // Full data review
        }
        
        toast.success('✅ Resumed pending valuation!');
      } else {
        throw new Error(response.message?.error || 'Failed to resume valuation');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to resume valuation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardPending = async () => {
    try {
      setIsLoading(true);

      const response = await discardPendingValuationHook({ 
        valuation_id: pendingValuation.pending_valuation.valuation_id 
      });

      if (response.message && response.message.success) {
        setShowPendingModal(false);
        setPendingValuation(null);
        setCurrentStep(2); // Go to file upload step for new submission
        toast.success('✅ Previous valuation discarded. You can now create a new one.');
      } else {
        throw new Error(response.message?.error || 'Failed to discard valuation');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to discard valuation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitDocuments = async () => {
    try {
      setIsLoading(true);
      
      if (!currUser?.email) {
        toast.error(t('userEmailRequired'));
        return;
      }

      const result = await createValuationWithDocuments(currUser?.email, uploadedFiles);
      
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
      const result = await 
      confirmAndUpdateVehicleData(formData, formData.mileage);

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
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="mail" size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('startValuation') || 'Start Your Valuation'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t('enterEmailToStart') || 'Enter your email address to begin the valuation process'}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); checkEmail(); }} className="space-y-6">
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

            <button
              type="submit"
              disabled={!email || !isValidEmail(email) || setIsLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setIsLoading ? 'Checking...' : (t('continue') || 'Continue')}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderStep1_5 = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="user" size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('createAccount') || 'Create Your Account'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t('provideDetailsToContinue') || 'Please provide some details to continue'}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); createNewUser(userData); }} className="space-y-6">
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
                onChange={(e) => setUserData(prev => ({ ...prev, mobile_number: formatUAEMobile(e.target.value) }))}
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
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Dubai">Dubai</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('back') || 'Back'}
              </button>
              <button
                type="submit"
                disabled={setIsLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {setIsLoading ? 'Creating...' : (t('createAccount') || 'Create Account')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
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
              {/* Camera option - only show on mobile */}
              <div className="md:hidden">
                <button
                  onClick={startScanning}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Icon name="camera" size={24} />
                    {t('useCamera')}
                  </div>
                </button>

                {/* Toggle to upload options on mobile */}
                {!showUploadOptions && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowUploadOptions(true)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                    >
                      {t('or')} {t('uploadInstead')}
                    </button>
                  </div>
                )}
              </div>

              {/* Upload options - show on desktop or when toggled on mobile */}
                {/* Toggle to upload options on mobile */}
                {!showUploadOptions && (
                  <div className="text-center hidden md:block">
                    <button
                      onClick={() => setShowUploadOptions(true)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                    >
                      {t('or')} {t('uploadInstead')}
                    </button>
                  </div>
                )}
              {showUploadOptions && (
                <div className={`border-t border-gray-200 dark:border-gray-700 pt-6 ${showUploadOptions ? 'block' : 'hidden md:block'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('uploadInstead')}
                    </p>
                    {/* Only show close button on mobile when toggled */}
                    <div className="md:hidden">
                        <button
                          onClick={() => {setShowUploadOptions(false); setUploadedFiles({front: null, back: null})}}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Icon name="close" size={20} />
                        </button>
                    </div>
                  </div>
                      
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Front License Upload */}
                      <div className="flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-3">
                          <Icon name="upload" size={32} className="text-gray-400 mx-auto" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">{t('frontLicense')}</h3>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'front')}
                          className="hidden"
                          id="front-upload"
                        />
                        <label
                          htmlFor="front-upload"
                          className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          {uploadedFiles?.front?.name ? uploadedFiles?.front?.name : t('uploadImageOrPdfFile')}
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
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'back')}
                          className="hidden"
                          id="back-upload"
                        />
                        <label
                          htmlFor="back-upload"
                          className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          {uploadedFiles?.back?.name ? uploadedFiles?.back?.name : t('uploadImageOrPdfFile')}
                        </label>
                      </div>
                    </div>
                </div>
              )}
              </div>

            {/* Submit button - only show when files are uploaded */}
            {(uploadedFiles.front && uploadedFiles.back && showUploadOptions) && (
              <div className="mt-8 text-center">
                <button
                  onClick={submitValuation}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200"
                >
                  {t('submitDocuments')}
                </button>
              </div>
            )}
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


  const renderStep3 = () => {

    return (
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

          {/* Show extracted data summary if available */}
          {extractedData && Object.keys(extractedData).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Icon name="info" size={20} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                    {t('aiExtractedData')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {extractedData.make && (
                      <div className="text-blue-700 dark:text-blue-300">
                        <span className="font-medium">{t('make')}:</span> {extractedData.make}
                      </div>
                    )}
                    {extractedData.model && (
                      <div className="text-blue-700 dark:text-blue-300">
                        <span className="font-medium">{t('model')}:</span> {extractedData.model}
                      </div>
                    )}
                    {extractedData.manufacturing_year && (
                      <div className="text-blue-700 dark:text-blue-300">
                        <span className="font-medium">{t('year')}:</span> {extractedData.manufacturing_year}
                      </div>
                    )}
                    {extractedData.vin && (
                      <div className="text-blue-700 dark:text-blue-300">
                        <span className="font-medium">{t('vin')}:</span> {extractedData.vin}
                      </div>
                    )}
                    {extractedData.owner_name && (
                      <div className="text-blue-700 dark:text-blue-300">
                        <span className="font-medium">{t('ownerName')}:</span> {extractedData.owner_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {availableTrims.map((trim, index) => (
                <option key={`${trim.trim_id}-${index}`} value={trim.trim}>
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
                <option key={option.key} value={option.value}>
                  {option.key}
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
                <option key={category.key} value={category.value}>
                  {category.key}
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
  };

  const renderStep3_5 = () => {
    const [mileage, setMileage] = useState('');
    const [warranty, setWarranty] = useState('');

    const handleSubmit = () => {
      if (!mileage) {
        toast.error('Current mileage is required');
        return;
      }

      const mileageNum = parseInt(mileage);
      if (isNaN(mileageNum) || mileageNum < 0) {
        toast.error('Please enter a valid mileage');
        return;
      }

      handleSimplifiedDataConfirm(mileageNum, warranty);
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="check" size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('vehicleFound') || 'Vehicle Found in Database'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t('vehicleFoundDesc') || 'This vehicle has been verified before. We only need the current mileage and warranty status.'}
            </p>
          </div>

          {/* Show existing car data */}
          {carRecord && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                {t('vehicleDetails') || 'Vehicle Details (Verified)'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">VIN:</span>
                  <span className="ml-2 font-mono">{carRecord.vin || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Year:</span>
                  <span className="ml-2">{carRecord.manufacturing_year || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Make:</span>
                  <span className="ml-2">{carRecord.make || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Model:</span>
                  <span className="ml-2">{carRecord.model || 'N/A'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Trim:</span>
                  <span className="ml-2">{carRecord.trim || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('currentMileage') || 'Current Mileage (KM)'} *
              </label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 45000"
                required
                min="0"
              />
              {carRecord?.current_mileage && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Previous: {carRecord.current_mileage.toLocaleString()} KM
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('warrantyStatus') || 'Warranty Status'}
              </label>
              <select
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select warranty status...</option>
                <option value="[725] Yes">Yes - Under Warranty</option>
                <option value="[726, 727] No">No - No Warranty</option>
              </select>
              {carRecord?.warranty && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Previous: {carRecord.warranty}
                </p>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <Icon name="info" size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> All other vehicle details are already verified. 
                    You only need to provide the latest mileage and warranty status.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!mileage || setIsLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setIsLoading ? 'Confirming...' : (t('confirmContinue') || 'Confirm & Continue')}
            </button>
          </form>
        </div>
      </div>
    );
  };

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
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          {t('goToDashboard')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8 pt-24 w-full flex flex-col items-center">
      {/* Header - hidden on mobile */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="flex items-center flex-col-reverse py-4 md:flex-row justify-between gap-2 md:py-0 md:gap-12 md:h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <img src={Logo} alt="WeCars Logo" className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">{t('carSubmission')}</span>
            </div>
            
            {/* Steps bar */}
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
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon name="close" size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && !isLoggdedIn && renderStep1()}
        {currentStep === 1.5 && renderStep1_5()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 3.5 && renderStep3_5()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Pending Valuation Modal */}
      {showPendingModal && pendingValuation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
              <h3 className="text-xl font-bold">{t('resumeValuation') || 'Resume Valuation?'}</h3>
              <p className="text-blue-100 text-sm mt-1">{t('pendingValuationRequest') || 'You have a pending valuation request'}</p>
            </div>

            <div className="p-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Icon name="alert" size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>{t('incompleteSubmissionFound') || 'Incomplete Submission Found'} </strong><br />
                      {t('incompleteSubmissionDesc') || 'Your previous valuation request wasn\'t completed. Would you like to continue or start fresh?'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('pendingValuationDetails') || 'Pending Valuation Details:'}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('valuationId') || 'Valuation ID:'}</span>
                    <span className="font-mono font-medium">{pendingValuation.valuation_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('status') || 'Status:'}</span>
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs font-medium">
                      {pendingValuation.status}
                    </span>
                  </div>
                  {pendingValuation.car_data?.vin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('vin') || 'VIN:'}</span>
                      <span className="font-mono font-medium">{pendingValuation.car_data.vin}</span>
                    </div>
                  )}
                  {pendingValuation.car_data?.make && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('vehicle') || 'Vehicle:'}</span>
                      <span className="font-medium">{pendingValuation.car_data.make} {pendingValuation.car_data.model || ''}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDiscardPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('discardAndStartFresh') || 'Discard & Start Fresh'}
                </button>
                <button
                  onClick={handleResumePending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('resumeValuation') || 'Resume Valuation'}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowPendingModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm underline"
                >
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
