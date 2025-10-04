import { useState } from 'react';
import { useTranslation } from 'react-i18next';
 
import Icon from './Icons';

export default function FinalOfferCard({ submission, onUpdate }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const acceptOffer = async () => {
    try {
      setLoading(true);
      // const result = await callFrappeMethod('wecars.submission.accept_final_offer', {
      //   submission_id: submission.valuation_id,
      //   customer_decision: 'Accepted',
      //   customer_decision_notes: 'Customer accepted the offer via frontend'
      // });
      
      if (result.message.success) {
        onUpdate();
        alert('Offer accepted successfully!');
      } else {
        alert(result.message.error || 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer');
    } finally {
      setLoading(false);
    }
  };

  const rejectOffer = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for declining the offer');
      return;
    }

    try {
      setLoading(true);
      // const result = await callFrappeMethod('wecars.submission.decline_final_offer', {
      //   submission_id: submission.valuation_id,
      //   customer_decision: 'Declined',
      //   customer_decision_notes: rejectionReason
      // });
      
      if (result.message.success) {
        onUpdate();
        setShowRejectModal(false);
        setRejectionReason('');
        alert('Offer declined successfully!');
      } else {
        alert(result.message.error || 'Failed to decline offer');
      }
    } catch (error) {
      console.error('Error declining offer:', error);
      alert('Failed to decline offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{t('finalOffer') || 'Final Offer'}</h3>
            <p className="text-purple-100">
              {t('finalOfferDescription') || 'Our final price for your vehicle'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              AED {submission.final_offer?.toLocaleString()}
            </p>
            <p className="text-purple-100 text-sm">
              {submission.final_offer_date ? new Date(submission.final_offer_date).toLocaleDateString() : ''}
            </p>
          </div>
        </div>

        <div className="bg-white/20 rounded-lg p-4 mb-4">
          <h4 className="font-medium mb-2">{t('offerDetails') || 'Offer Details'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-purple-100">{t('carRecord') || 'Car Record'}:</p>
              <p className="font-medium">{submission.car_record || 'N/A'}</p>
            </div>
            <div>
              <p className="text-purple-100">{t('currentMileage') || 'Current Mileage'}:</p>
              <p className="font-medium">{submission.current_mileage?.toLocaleString()} km</p>
            </div>
            <div>
              <p className="text-purple-100">{t('submissionType') || 'Submission Type'}:</p>
              <p className="font-medium">{submission.submission_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-purple-100">{t('offeredBy') || 'Offered By'}:</p>
              <p className="font-medium">{submission.final_offer_by || 'WeCars Team'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={acceptOffer}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Icon name="check" size={20} />
                <span>{t('acceptOffer') || 'Accept Offer'}</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon name="close" size={20} />
            <span>{t('declineOffer') || 'Decline Offer'}</span>
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('declineOffer') || 'Decline Offer'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reasonForDeclining') || 'Reason for declining the offer'}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder={t('pleaseProvideReason') || 'Please provide a reason for declining the offer...'}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={rejectOffer}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  t('confirmDecline') || 'Confirm Decline'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
