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
  
  // Create submission with documents
  const { call: createSubmission, loading: createLoading, error: createError, result: createResult, reset: resetCreate } = useFrappePostCall('wecars.submission.create_submission_with_documents');
  
  // Confirm vehicle data
  const { call: confirmVehicleData, loading: confirmLoading, error: confirmError, result: confirmResult, reset: resetConfirm } = useFrappePostCall('wecars.submission.confirm_and_update_vehicle_data');

  // Get submission status
  const { data: submissionStatus, error: statusError, mutate: refreshStatus } = useFrappeGetCall(
    'wecars.submission.get_submission_status',
    { submission_id: submissionId },
    submissionId ? `submission-status-${submissionId}` : null
  );

  // Initialize socket connection
  useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

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

  // Set up socket event listeners
  useEffect(() => {
    if (socket) {
      // Listen for submission processing events
      socket.on('submission_processing_started', handleProcessingStarted);
      socket.on('submission_extraction_completed', handleExtractionCompleted);
      socket.on('submission_extraction_failed', handleExtractionFailed);

      // Cleanup listeners on unmount
      return () => {
        socket.off('submission_processing_started', handleProcessingStarted);
        socket.off('submission_extraction_completed', handleExtractionCompleted);
        socket.off('submission_extraction_failed', handleExtractionFailed);
      };
    }
  }, [handleProcessingStarted, handleExtractionCompleted, handleExtractionFailed]);

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

  const createSubmissionWithDocuments = async (customerEmail, files) => {
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
        customer_email: customerEmail,
        ...uploadedFiles
      };
      
      await createSubmission(submissionData);
      
      if (createResult?.message?.success) {
        setSubmissionId(createResult.message.submission_id);
        toast.success('Documents uploaded successfully! Processing started...');
        return {
          success: true,
          submission_id: createResult.message.submission_id,
          message: createResult.message.message
        };
      } else {
        throw new Error(createResult?.message?.error || 'Failed to create submission');
      }
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  };

  const confirmAndUpdateVehicleData = async (submissionId, vehicleData, mileage) => {
    try {
      await confirmVehicleData({
        submission_id: submissionId,
        vehicle_data: vehicleData,
        mileage: parseInt(mileage)
      });
      
      if (confirmResult?.message?.success) {
        toast.success('Vehicle data confirmed successfully!');
        return {
          success: true,
          message: confirmResult.message.message
        };
      } else {
        throw new Error(confirmResult?.message?.error || 'Failed to confirm vehicle data');
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
    createSubmissionWithDocuments,
    confirmAndUpdateVehicleData,
    checkSubmissionStatus,
    createLoading,
    createError,
    confirmLoading,
    confirmError,
    
    // Reset
    resetSubmission
  };
};
