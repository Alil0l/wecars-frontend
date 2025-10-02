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
    'WC Car Submission',
    {
      filters: [['submission_id', '=', submissionId]],
      fields: ['*'],
      limit: 1
    }
  );

  const submission = submissions?.[0];
  const loading = isValidating;

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
      'Offer Declined': 'bg-red-100 text-red-800'
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
      'Offer Declined': t('offerDeclined')
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
      'Offer Declined': <Icon name="error" size={20} className="text-red-600" />
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
              <p className="text-gray-600 dark:text-gray-400">{t('id') || 'ID'}: {submission.submission_id}</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('make') || 'Make'}</label>
              <p className="text-gray-900 dark:text-white">{submission.make || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('model') || 'Model'}</label>
              <p className="text-gray-900 dark:text-white">{submission.model || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('trim') || 'Trim'}</label>
              <p className="text-gray-900 dark:text-white">{submission.trim || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('year') || 'Year'}</label>
              <p className="text-gray-900 dark:text-white">{submission.manufacturing_year || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mileage') || 'Mileage'}</label>
              <p className="text-gray-900 dark:text-white">{submission.mileage ? `${submission.mileage.toLocaleString()} km` : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('transmission') || 'Transmission'}</label>
              <p className="text-gray-900 dark:text-white">{submission.transmission || 'N/A'}</p>
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
        {submission.status === 'Valued Manually' && (
          <div className="mb-6">
            <InspectionVoucher 
              submissionId={submission.submission_id}
              inspectionDate={submission.inspection_date}
              location="WeCars Inspection Center, Dubai"
            />
          </div>
        )}

        {/* Final Offer */}
        {submission.status === 'Final Offer Made' && (
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
            {submission.license_front_url && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-blue-600" />
                  <span className="text-gray-900 dark:text-white">{t('frontLicense') || 'License Front'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.license_front_url, 'license-front.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}

            {submission.license_back_url && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-blue-600" />
                  <span className="text-gray-900 dark:text-white">{t('backLicense') || 'License Back'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.license_back_url, 'license-back.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}

            {submission.license_pdf_url && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-red-600" />
                  <span className="text-gray-900 dark:text-white">{t('pdfLicense') || 'License PDF'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.license_pdf_url, 'license.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}

            {submission.inspection_report && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-green-600" />
                  <span className="text-gray-900 dark:text-white">{t('inspectionReport') || 'Inspection Report'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.inspection_report, 'inspection-report.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}

            {submission.signed_agreement && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-purple-600" />
                  <span className="text-gray-900 dark:text-white">{t('signedAgreement') || 'Signed Agreement'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.signed_agreement, 'agreement.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}

            {submission.payment_receipt && (
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="file" size={32} className="text-green-600" />
                  <span className="text-gray-900 dark:text-white">{t('paymentReceipt') || 'Payment Receipt'}</span>
                </div>
                <button
                  onClick={() => downloadDocument(submission.payment_receipt, 'receipt.pdf')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t('download') || 'Download'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
