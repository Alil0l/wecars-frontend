import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { toast } from 'react-toastify';
 
import InspectionVoucher from '../components/InspectionVoucher';
import FinalOfferCard from '../components/FinalOfferCard';
import Icon from '../components/Icons';

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Use frappe-react-sdk to fetch submission details
  const { data: submissions, error, isValidating, mutate } = useFrappeGetDocList(
    'WC Car Valuation',
    {
      filters: [['valuation_id', '=', submissionId]],
      fields: ['*'],
      limit: 1
    }
  );

  const submission = submissions?.[0];

  const loading = isValidating;

  /*
{
    "data": [
        {
            "name": "VAL251004010227",
            "owner": "aliwrker011@gmail.com",
            "creation": "2025-10-04 02:02:27.380184",
            "modified": "2025-10-04 09:37:29.287371",
            "modified_by": "Administrator",
            "docstatus": 0,
            "idx": 0,
            "naming_series": "VAL.YY.#####",
            "valuation_id": "VAL251004010227",
            "status": "Valuation In Progress",
            "workflow_status": "Pending Auto Valuation",
            "car_record": "CAR2500004",
            "customer_profile": "C2500008",
            "owner_record": null,
            "submission_type": "Online",
            "created_by_employee": null,
            "current_mileage": 1254,
            "current_condition_notes": null,
            "manual_valuation": 0.0,
            "manual_valuation_notes": null,
            "manual_valuation_date": null,
            "valuated_by": null,
            "auto_valuation": 0.0,
            "auto_valuation_notes": null,
            "auto_valuation_market_data": null,
            "auto_valuation_date": null,
            "final_offer": 0.0,
            "final_offer_notes": null,
            "final_offer_date": null,
            "final_offer_by": null,
            "customer_decision": "",
            "customer_decision_notes": null,
            "customer_decision_date": null,
            "rejection_reason": null,
            "rejected_by": null,
            "rejection_date": null,
            "linked_inspection": null,
            "payment_record": null,
            "created_at": "2025-10-04 01:02:27.382221",
            "updated_at": "2025-10-04 08:37:29.294142",
            "completed_at": null,
            "rejected_at": null
        }
    ]
}

*/ 
 

const getStatusColor = (status) => {
    const statusColors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending Review': 'bg-yellow-100 text-yellow-800',
      'Customer Reviewed': 'bg-blue-100 text-blue-800',
      'Valued Automatically': 'bg-green-100 text-green-800',
      'Valued Manually': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Pending Inspection': 'bg-orange-100 text-orange-800',
      'Inspected': 'bg-blue-100 text-blue-800',
      'Final Offer Made': 'bg-purple-100 text-purple-800',
      'Finalizing': 'bg-indigo-100 text-indigo-800',
      'Purchased (Inventory)': 'bg-green-100 text-green-800',
      'Sold': 'bg-green-100 text-green-800',
      'Offer Declined': 'bg-red-100 text-red-800',
      // New status values from updated API
      'Valuation In Progress': 'bg-blue-100 text-blue-800',
      'Pending Auto Valuation': 'bg-yellow-100 text-yellow-800',
      'Auto Valuation Complete': 'bg-green-100 text-green-800',
      'Manual Valuation Required': 'bg-orange-100 text-orange-800',
      'Valuation Complete': 'bg-green-100 text-green-800',
      'Offer Pending': 'bg-purple-100 text-purple-800',
      'Offer Accepted': 'bg-green-100 text-green-800',
      'Offer Rejected': 'bg-red-100 text-red-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusTranslation = (status) => {
    const statusTranslations = {
      'Draft': t('draft'),
      'Pending Review': t('pendingReview'),
      'Customer Reviewed': t('customerReviewed'),
      'Valued Automatically': t('valuedAutomatically'),
      'Valued Manually': t('valuedManually'),
      'Rejected': t('rejected'),
      'Pending Inspection': t('pendingInspection'),
      'Inspected': t('inspected'),
      'Final Offer Made': t('finalOfferMade'),
      'Finalizing': t('finalizing'),
      'Purchased (Inventory)': t('purchasedInventory'),
      'Sold': t('sold'),
      'Offer Declined': t('offerDeclined'),
      // New status values from updated API
      'Valuation In Progress': t('valuationInProgress') || 'Valuation In Progress',
      'Pending Auto Valuation': t('pendingAutoValuation') || 'Pending Auto Valuation',
      'Auto Valuation Complete': t('autoValuationComplete') || 'Auto Valuation Complete',
      'Manual Valuation Required': t('manualValuationRequired') || 'Manual Valuation Required',
      'Valuation Complete': t('valuationComplete') || 'Valuation Complete',
      'Offer Pending': t('offerPending') || 'Offer Pending',
      'Offer Accepted': t('offerAccepted') || 'Offer Accepted',
      'Offer Rejected': t('offerRejected') || 'Offer Rejected',
      'Completed': t('completed') || 'Completed',
      'Cancelled': t('cancelled') || 'Cancelled'
    };
    return statusTranslations[status] || status;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Draft': <Icon name="edit" size={20} className="text-gray-600" />,
      'Pending Review': <Icon name="clock" size={20} className="text-yellow-600" />,
      'Customer Reviewed': <Icon name="check" size={20} className="text-blue-600" />,
      'Valued Automatically': <Icon name="zap" size={20} className="text-green-600" />,
      'Valued Manually': <Icon name="user" size={20} className="text-green-600" />,
      'Rejected': <Icon name="error" size={20} className="text-red-600" />,
      'Pending Inspection': <Icon name="search" size={20} className="text-orange-600" />,
      'Inspected': <Icon name="check" size={20} className="text-blue-600" />,
      'Final Offer Made': <Icon name="dollar" size={20} className="text-purple-600" />,
      'Finalizing': <Icon name="zap" size={20} className="text-indigo-600" />,
      'Purchased (Inventory)': <Icon name="shield" size={20} className="text-green-600" />,
      'Sold': <Icon name="trending" size={20} className="text-green-600" />,
      'Offer Declined': <Icon name="error" size={20} className="text-red-600" />,
      // New status values from updated API
      'Valuation In Progress': <Icon name="clock" size={20} className="text-blue-600" />,
      'Pending Auto Valuation': <Icon name="zap" size={20} className="text-yellow-600" />,
      'Auto Valuation Complete': <Icon name="check" size={20} className="text-green-600" />,
      'Manual Valuation Required': <Icon name="user" size={20} className="text-orange-600" />,
      'Valuation Complete': <Icon name="check" size={20} className="text-green-600" />,
      'Offer Pending': <Icon name="dollar" size={20} className="text-purple-600" />,
      'Offer Accepted': <Icon name="check" size={20} className="text-green-600" />,
      'Offer Rejected': <Icon name="error" size={20} className="text-red-600" />,
      'Completed': <Icon name="check" size={20} className="text-green-600" />,
      'Cancelled': <Icon name="error" size={20} className="text-red-600" />
    };
    return statusIcons[status] || <Icon name="file" size={20} className="text-gray-600" />;
  };

  const downloadDocument = (url, filename) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} downloaded successfully!`);
    } else {
      toast.error('Document not available for download');
    }
  };

  const handleSubmissionUpdate = () => {
    mutate(); // Refresh data using SWR mutate
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingSubmissionDetails') || 'Loading submission details...'}</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('submissionNotFound') || 'Submission Not Found'}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('backToDashboard') || 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('submissionDetails') || 'Submission Details'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{t('id') || 'ID'}: {submission.valuation_id}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 flex items-center gap-2 mx-2 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                {getStatusIcon(submission.status)} {getStatusTranslation(submission.status)}
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('vehicleInformation') || 'Vehicle Information'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('carRecord') || 'Car Record'}</label>
              <p className="text-gray-900 dark:text-white">{submission.car_record || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customerProfile') || 'Customer Profile'}</label>
              <p className="text-gray-900 dark:text-white">{submission.customer_profile || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('submissionType') || 'Submission Type'}</label>
              <p className="text-gray-900 dark:text-white">{submission.submission_type || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('currentMileage') || 'Current Mileage'}</label>
              <p className="text-gray-900 dark:text-white">{submission.current_mileage ? `${submission.current_mileage.toLocaleString()} km` : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('workflowStatus') || 'Workflow Status'}</label>
              <p className="text-gray-900 dark:text-white">{submission.workflow_status || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('currentConditionNotes') || 'Condition Notes'}</label>
              <p className="text-gray-900 dark:text-white">{submission.current_condition_notes || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Valuation Information */}
        {(submission.auto_valuation || submission.manual_valuation || submission.final_offer) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('valuationInformation') || 'Valuation Information'}</h2>
            
            {submission.auto_valuation && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">{t('automatedValuation') || 'Automated Valuation'}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t('aiPoweredEstimate') || 'AI-powered estimate based on market data'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      AED {submission.auto_valuation.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {submission.auto_valuation_date ? new Date(submission.auto_valuation_date).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submission.manual_valuation && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100">{t('manualValuation') || 'Manual Valuation'}</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {t('professionalAssessment') || 'Professional assessment by our team'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      AED {submission.manual_valuation.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {submission.manual_valuation_date ? new Date(submission.manual_valuation_date).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submission.final_offer && (
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-purple-900 dark:text-purple-100">{t('finalOffer') || 'Final Offer'}</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {t('finalOfferDescription') || 'Our final price for your vehicle'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      AED {submission.final_offer.toLocaleString()}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {submission.final_offer_date ? new Date(submission.final_offer_date).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Inspection Voucher */}
        {submission.status === 'Manual Valuation Required' && (
          <div className="mb-6">
            <InspectionVoucher 
              submissionId={submission.valuation_id}
              inspectionDate={submission.linked_inspection}
              location="WeCars Inspection Center, Dubai"
            />
          </div>
        )}

        {/* Final Offer */}
        {(submission.status === 'Final Offer Made' || submission.status === 'Offer Pending') && (
          <div className="mb-6">
            <FinalOfferCard 
              submission={submission}
              onUpdate={handleSubmissionUpdate}
            />
          </div>
        )}

        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('documents') || 'Documents'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.linked_inspection && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-green-600" />
                  <span className="text-gray-900 dark:text-white">{t('inspectionRecord') || 'Inspection Record'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.linked_inspection, 'inspection-record.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}

            {submission.payment_record && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-green-600" />
                  <span className="text-gray-900 dark:text-white">{t('paymentRecord') || 'Payment Record'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.payment_record, 'payment-record.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}

            {/* Show message if no documents available */}
            {!submission.linked_inspection && !submission.payment_record && (
              <div className="col-span-2 text-center py-8">
                <Icon name="file" size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('noDocumentsAvailable') || 'No documents available for this submission'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
