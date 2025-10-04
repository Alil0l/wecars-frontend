import { useState, useEffect, useCallback } from 'react';
import { useFrappePostCall, useFrappeFileUpload, useFrappeGetCall } from 'frappe-react-sdk';
import { toast } from 'react-toastify';
import { socket, initializeSocket, subscribeToSubmission, unsubscribeFromSubmission, disconnectSocket } from '../socket';

export const useSubmission = () => {
  const [submissionId, setSubmissionId] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [processingMessage, setProcessingMessage] = useState('');
  const [extractionError, setExtractionError] = useState(null);
  
  // File upload hook
  const { upload: uploadFile, loading: fileUploadLoading, progress, error: fileUploadError, isCompleted: fileUploadCompleted, reset: resetFileUpload } = useFrappeFileUpload();
  
  // Confirm vehicle data
  const { call: confirmVehicleData, loading: confirmLoading, error: confirmError, result: confirmResult, reset: resetConfirm } = useFrappePostCall('wecars.api.confirm_customer_data');

  // Authentication API calls
  const { call: sendAuthLink, loading: sendAuthLinkLoading } = useFrappePostCall('wecars.auth.send_auth_link');
  const { call: verifyToken, loading: verifyTokenLoading } = useFrappePostCall('wecars.auth.verify_token');
  
  // Customer API calls
  const { call: checkCustomer } = useFrappePostCall('wecars.api.check_customer');
  const { call: checkPendingValuation } = useFrappePostCall('wecars.api.check_pending_valuation');
  const { call: resumePendingValuation } = useFrappePostCall('wecars.api.resume_pending_valuation');
  const { call: discardPendingValuation } = useFrappePostCall('wecars.api.discard_pending_valuation');
  const { call: confirmCustomerData } = useFrappePostCall('wecars.api.confirm_customer_data');
  
  // Vehicle API calls
  const { call: createValuation, loading: createValuationLoading, error: createValuationError, result: createValuationResult, reset: resetCreateValuation } = useFrappePostCall('wecars.api.create_valuation');
  const { call: getTrimsForMake } = useFrappePostCall('wecars.api.get_trims_for_make');
  
  // Get submission status
  const { data: submissionStatus, error: statusError, mutate: refreshStatus } = useFrappeGetCall(
    'wecars.submission.get_submission_status',
    { submission_id: submissionId },
    submissionId ? `submission-status-${submissionId}` : null
  );
  // List
  const { call: getList, loading: getListLoading, error: getListError, result: getListResult, reset: resetGetList }
   = useFrappePostCall('wecars.api.get_trims_for_make');
  
  // Initialize socket connection
  useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []);
  
  const getListHook = async (make) => {
    try {
      const result = await getList(make);
      console.log('List:', result);
      return result;
    }
    catch (error) {
      console.error('Error getting list:', error);
      throw error;
    }
  };

  // Realtime event handlers
  const handleProcessingStarted = useCallback((data) => {
    console.log('Processing started:', data);
    setProcessingStatus('processing');
    setProcessingMessage(data.message || 'AI extraction in progress...');
    setExtractionError(null);
    toast.info(data.message || 'Processing started...');
  }, []);

  const handleExtractionCompleted = useCallback((data) => {
    console.log('Extraction completed:', data);
    setProcessingStatus('extraction_completed');
    setProcessingMessage(data.message || 'Data extraction completed');
    setExtractedData(data.data);
    setExtractionError(null);
    toast.success('Vehicle data extracted successfully!');
    
    // Refresh submission status to get latest data
    if (data.submission_id) {
      refreshStatus();
    }
  }, [refreshStatus]);

  const handleExtractionFailed = useCallback((data) => {
    console.log('Extraction failed:', data);
    setProcessingStatus('extraction_failed');
    setProcessingMessage(data.message || 'Data extraction failed');
    setExtractionError(data.error || 'Unknown error occurred');
    setExtractedData(null);
    toast.error(data.message || 'Failed to extract vehicle data');
  }, []);

  // NEW: Additional realtime event handlers
  const handleAutoValuationCompleted = useCallback((data) => {
    console.log('Auto valuation completed:', data);
    toast.success(`Auto valuation completed: AED ${data.amount?.toLocaleString()}`);
  }, []);

  const handleAutoValuationFailed = useCallback((data) => {
    console.log('Auto valuation failed:', data);
    toast.warning('Auto valuation failed. Manual valuation required.');
  }, []);

  const handleFinalOfferPresented = useCallback((data) => {
    console.log('Final offer presented:', data);
    toast.info(`Final offer: AED ${data.offer_amount?.toLocaleString()}`);
  }, []);

  const handleValuationStatusUpdated = useCallback((data) => {
    console.log('Valuation status updated:', data);
    // Handle status updates as needed
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (socket) {
      // Listen for submission processing events
      socket.on('submission_processing_started', handleProcessingStarted);
      socket.on('submission_extraction_completed', handleExtractionCompleted);
      socket.on('submission_extraction_failed', handleExtractionFailed);
      
      // NEW: Listen for additional valuation events
      socket.on('auto_valuation_completed', handleAutoValuationCompleted);
      socket.on('auto_valuation_failed', handleAutoValuationFailed);
      socket.on('final_offer_presented', handleFinalOfferPresented);
      socket.on('valuation_status_updated', handleValuationStatusUpdated);

      // Cleanup listeners on unmount
      return () => {
        socket.off('submission_processing_started', handleProcessingStarted);
        socket.off('submission_extraction_completed', handleExtractionCompleted);
        socket.off('submission_extraction_failed', handleExtractionFailed);
        socket.off('auto_valuation_completed', handleAutoValuationCompleted);
        socket.off('auto_valuation_failed', handleAutoValuationFailed);
        socket.off('final_offer_presented', handleFinalOfferPresented);
        socket.off('valuation_status_updated', handleValuationStatusUpdated);
      };
    }
  }, [
    handleProcessingStarted, 
    handleExtractionCompleted, 
    handleExtractionFailed,
    handleAutoValuationCompleted,
    handleAutoValuationFailed,
    handleFinalOfferPresented,
    handleValuationStatusUpdated
  ]);

  // Subscribe to submission document when submissionId changes
  useEffect(() => {
    if (submissionId) {
      subscribeToSubmission(submissionId);
      
      // Cleanup subscription when component unmounts or submissionId changes
      return () => {
        unsubscribeFromSubmission(submissionId);
      };
    }
  }, [submissionId]);

  const createValuationWithDocuments = async (customerProfile, files) => {
    try {
      // First upload all files
      const uploadedFiles = {};
      const uploadPromises = [];
      
      if (files.front) {
        uploadPromises.push(
          uploadFile(files.front, {
            isPrivate: true,
            doctype: 'WC Car Submission',
            fieldname: 'license_front_file'
          }).then(result => {
            uploadedFiles.license_front_file = result.file_url;
          })
        );
      }
      
      if (files.back) {
        uploadPromises.push(
          uploadFile(files.back, {
            isPrivate: true,
            doctype: 'WC Car Submission',
            fieldname: 'license_back_file'
          }).then(result => {
            uploadedFiles.license_back_file = result.file_url;
          })
        );
      }
      
      if (files.pdf) {
        uploadPromises.push(
          uploadFile(files.pdf, {
            isPrivate: true,
            doctype: 'WC Car Submission',
            fieldname: 'license_pdf_file'
          }).then(result => {
            uploadedFiles.license_pdf_file = result.file_url;
          })
        );
      }
      
      await Promise.all(uploadPromises);
      
      // Now create submission with uploaded file URLs
      const submissionData = {
        vin: 'temp',
        customer_profile: customerProfile,
        ...uploadedFiles
      };
      
      // await createSubmission(submissionData);
      const response = await createValuation(submissionData);

      if (response?.message?.success) {
        setSubmissionId(response.message.valuation_id);
        console.log('response', response.message.valuation_id);
        return {
          success: true,
          valuation_id: response.message.valuation_id,
          message: response.message.message
        };
      } else {
        throw new Error(response?.message?.error || 'Failed to create submission');
      }
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  };

  const confirmAndUpdateVehicleData = async (updated_fields,current_mileage) => {
    try {
      console.log('submissionId', submissionId);
      console.log('updated_fields', updated_fields);
      console.log('current_mileage', current_mileage);
      const response = await confirmVehicleData({
        valuation_id: submissionId,
        updated_fields: updated_fields,
        current_mileage: parseInt(current_mileage)
      });
      
      if (response?.message?.success) {
        toast.success('Vehicle data confirmed successfully!');
        return {
          success: true,
          message: response.message.message
        };
      } else {
        throw new Error(response?.message?.error || 'Failed to confirm vehicle data');
      }
    } catch (error) {
      console.error('Error confirming vehicle data:', error);
      throw error;
    }
  };

  const checkSubmissionStatus = async () => {
    if (submissionId) {
      await refreshStatus();
      return submissionStatus;
    }
    return null;
  };

  const confirmCustomerDataHook = async (data) => {
    try {
      const result = await confirmCustomerData(data); 
      console.log('Customer data confirmed:', result);
      return result;
    } catch (error) {
      console.error('Error confirming customer data:', error);
      throw error;
    }
  };

  const getTrimsForMakeHook = async (make) => {
    try {
      const result = await getTrimsForMake({
        make: make
      });
      console.log('Trims for make:', result);
      return result;
    }
    catch (error) {
      console.error('Error getting trims for make:', error);
      throw error;
    }
  };

  const checkCustomerHook = async (email) => {
    try {
      const result = await checkCustomer(email);
      return result;
    }
    catch (error) {
      console.error('Error checking customer:', error);
      throw error;
    }
  };
  
  const checkPendingValuationHook = async (customer_profile) => {
    try {
      const result = await checkPendingValuation(customer_profile);
      console.log('Pending valuation checked:', result);
      return result;
    }
    catch (error) {
      console.error('Error checking pending valuation:', error);
      throw error;
    }
  };

  const resumePendingValuationHook = async (valuation_id) => {
    try {
      const result = await resumePendingValuation(valuation_id);
      setSubmissionId(result.message.valuation_id);
      return result;
    }
    catch (error) {
      console.error('Error resuming pending valuation:', error);
      throw error;
    }
  };

  const discardPendingValuationHook = async (valuation_id) => {
    try {
      const result = await discardPendingValuation(valuation_id);
      console.log('Pending valuation discarded:', result);
      return result;
    }
    catch (error) {
      console.error('Error discarding pending valuation:', error);
      throw error;
    }
  };  

  const resetSubmission = () => {
    setSubmissionId(null);
    setExtractedData(null);
    setProcessingStatus(null);
    setProcessingMessage('');
    setExtractionError(null);
    resetFileUpload();
    resetCreate();
    resetConfirm();
    disconnectSocket();
  };

  return {
    // State
    submissionId,
    setSubmissionId,
    extractedData,
    setExtractedData,
    submissionStatus,
    
    // Realtime processing state
    processingStatus,
    processingMessage,
    extractionError,
    
    // File upload
    uploadFile,
    fileUploadLoading,
    progress,
    fileUploadError,
    fileUploadCompleted,
    resetFileUpload,
    
    // Submission operations
    createValuationWithDocuments,
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
    confirmCustomerDataHook ,
    
    // Vehicle API calls
    getTrimsForMakeHook,
    getListHook,
    
    // Reset
    resetSubmission
  };
};
