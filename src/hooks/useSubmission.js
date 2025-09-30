import { useState } from 'react';
import { useFrappePostCall, useFrappeFileUpload, useFrappeGetCall } from 'frappe-react-sdk';
import { toast } from 'react-toastify';

export const useSubmission = () => {
  const [submissionId, setSubmissionId] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  
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
    resetFileUpload();
    resetCreate();
    resetConfirm();
  };

  return {
    // State
    submissionId,
    extractedData,
    setExtractedData,
    submissionStatus,
    
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
