// import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useUserContext } from '../contexts/UserContext';
import {useEffect, useState} from 'react';

export const useDashboard = () => {
  const { currUser, userCustomerProfile } = useUserContext();
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);

  useEffect(() => {
    async function getSubmissions() {
      if(!userCustomerProfile || submissionsLoading) return;
      try {
        setSubmissionsLoading(true);
        setSubmissionsError(null);
      const response = await fetch('/api/resource/WC Car Valuation?fields="*"&filters=[["customer_profile", "=", "' + userCustomerProfile?.name + '"]]', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${localStorage.getItem('wecars_api_key')}:${localStorage.getItem('wecars_api_secret')}`
        }
      });
      const data = await response.json();
      if(submissions.length !== data.data.length) {
        setSubmissions(data.data || []);
      }
      } catch (error) {
        setSubmissionsError(error);
      } finally {
        setSubmissionsLoading(false);
      }
    }
    
    getSubmissions();
  }, [userCustomerProfile]);

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

