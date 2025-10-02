import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useUserContext } from '../contexts/UserContext';

export const useDashboard = () => {
  const { currUser } = useUserContext();
  // Get user's submissions
  const { 
    data: submissions, 
    error: submissionsError, 
    isValidating: submissionsLoading, 
    // mutate: refreshSubmissions 
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
    },
    "submissions",
    {
      // SWR Configuration Options
      revalidateOnMount: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline : false, 
      refreshWhenHidden : false,
      shouldRetryOnError: false,
      refreshInterval : 900000,
      dedupingInterval: 900000
    }
  );

  // Calculate status counts from the submissions data
  const statusCounts = {
    draft: submissions?.filter(sub => sub.status === 'Draft').length || 0,
    pendingReview: submissions?.filter(sub => sub.status === 'Pending Review').length || 0,
    reviewed: submissions?.filter(sub => sub.status === 'Reviewed').length || 0,
    valued: submissions?.filter(sub => ['Valued Automatically', 'Valued Manually'].includes(sub.status)).length || 0,
    finalOffer: submissions?.filter(sub => sub.status === 'Final Offer Made').length || 0,
    completed: submissions?.filter(sub => ['Purchased (Inventory)', 'Sold'].includes(sub.status)).length || 0
  };

  return {
    submissions: submissions || [],
    submissionsLoading,
    submissionsError,
    // refreshSubmissions,
    statusCounts
  };
};
