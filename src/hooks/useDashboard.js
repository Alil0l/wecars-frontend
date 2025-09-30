import { useFrappeGetDocList, useFrappeGetDocCount } from 'frappe-react-sdk';
import { useUserContext } from '../contexts/UserContext';

export const useDashboard = () => {
  const { currUser } = useUserContext();

  // Get user's submissions
  const { 
    data: submissions, 
    error: submissionsError, 
    isValidating: submissionsLoading, 
    mutate: refreshSubmissions 
  } = useFrappeGetDocList(
    'WC Car Submission',
    {
      filters: [['customer_email', '=', currUser?.email || '']],
      fields: [
        'name', 'submission_id', 'status', 'make', 'model', 'trim', 
        'manufacturing_year', 'mileage', 'auto_valuation', 'manual_valuation', 
        'final_offer', 'creation', 'modified'
      ],
      orderBy: {
        field: 'creation',
        order: 'desc'
      }
    }
  );

  // Get submission counts by status
  const { data: draftCount } = useFrappeGetDocCount(
    'WC Car Submission',
    [['customer_email', '=', currUser?.email || ''], ['status', '=', 'Draft']]
  );

  const { data: pendingReviewCount } = useFrappeGetDocCount(
    'WC Car Submission',
    [['customer_email', '=', currUser?.email || ''], ['status', '=', 'Pending Review']]
  );

  const { data: reviewedCount } = useFrappeGetDocCount(
    'WC Car Submission',
    [['customer_email', '=', currUser?.email || ''], ['status', '=', 'Reviewed']]
  );

  const { data: valuedCount } = useFrappeGetDocCount(
    'WC Car Submission',
    [['customer_email', '=', currUser?.email || ''], ['status', 'in', ['Valued Automatically', 'Valued Manually']]]
  );

  const { data: finalOfferCount } = useFrappeGetDocCount(
    'WC Car Submission',
    [['customer_email', '=', currUser?.email || ''], ['status', '=', 'Final Offer Made']]
  );

  const { data: completedCount } = useFrappeGetDocCount(
    'WC Car Submission',
    [['customer_email', '=', currUser?.email || ''], ['status', 'in', ['Purchased (Inventory)', 'Sold']]]
  );

  const statusCounts = {
    draft: draftCount || 0,
    pendingReview: pendingReviewCount || 0,
    reviewed: reviewedCount || 0,
    valued: valuedCount || 0,
    finalOffer: finalOfferCount || 0,
    completed: completedCount || 0
  };

  return {
    submissions: submissions || [],
    submissionsLoading,
    submissionsError,
    refreshSubmissions,
    statusCounts
  };
};
