import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useDashboard } from '../hooks/useDashboard';
 
import { motion } from 'framer-motion';
import Icon from '../components/Icons';

export default function Dashboard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { currUser } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  
  // Use dashboard hook
  const { 
    submissions, 
    submissionsLoading: loading, 
    // submissionsError, 
    // refreshSubmissions,
    // statusCounts 
  } = useDashboard();
  
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
      // New status values from the API
      'Valuation In Progress': 'bg-yellow-100 text-yellow-800',
      'Pending Manual Valuation': 'bg-orange-100 text-orange-800',
      'Auto Valuation Completed': 'bg-green-100 text-green-800',
      'Manual Valuation Completed': 'bg-green-100 text-green-800',
      'Final Offer Presented': 'bg-purple-100 text-purple-800',
      'Offer Accepted': 'bg-green-100 text-green-800',
      'Offer Declined': 'bg-red-100 text-red-800',
      'Valuation Rejected': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Draft': <Icon name="edit" size={16} className="text-gray-600" />,
      'Pending Review': <Icon name="clock" size={16} className="text-yellow-600" />,
      'Customer Reviewed': <Icon name="check" size={16} className="text-blue-600" />,
      'Valued Automatically': <Icon name="zap" size={16} className="text-green-600" />,
      'Valued Manually': <Icon name="user" size={16} className="text-green-600" />,
      'Rejected': <Icon name="error" size={16} className="text-red-600" />,
      'Pending Inspection': <Icon name="search" size={16} className="text-orange-600" />,
      'Inspected': <Icon name="check" size={16} className="text-blue-600" />,
      'Final Offer Made': <Icon name="dollar" size={16} className="text-purple-600" />,
      'Finalizing': <Icon name="zap" size={16} className="text-indigo-600" />,
      'Purchased (Inventory)': <Icon name="shield" size={16} className="text-green-600" />,
      'Sold': <Icon name="trending" size={16} className="text-green-600" />,
      // New status values from the API
      'Valuation In Progress': <Icon name="clock" size={16} className="text-yellow-600" />,
      'Pending Manual Valuation': <Icon name="user" size={16} className="text-orange-600" />,
      'Auto Valuation Completed': <Icon name="zap" size={16} className="text-green-600" />,
      'Manual Valuation Completed': <Icon name="user" size={16} className="text-green-600" />,
      'Final Offer Presented': <Icon name="dollar" size={16} className="text-purple-600" />,
      'Offer Accepted': <Icon name="check" size={16} className="text-green-600" />,
      'Offer Declined': <Icon name="error" size={16} className="text-red-600" />,
      'Valuation Rejected': <Icon name="error" size={16} className="text-red-600" />
    };
    return statusIcons[status] || <Icon name="file" size={16} className="text-gray-600" />;
  };

  const getDisplayValue = (submission) => {
    if (submission.final_offer) {
      return `AED ${submission.final_offer.toLocaleString()}`;
    } else if (submission.manual_valuation) {
      return `AED ${submission.manual_valuation.toLocaleString()}`;
    } else if (submission.auto_valuation) {
      return `AED ${submission.auto_valuation.toLocaleString()}`;
    }
    return 'Pending';
  };

  const getStatusInfo = (submission) => {
    const status = submission.status;
    const workflowStatus = submission.workflow_status;
    
    // Get car information - it might be in car_record or directly in submission
    const carInfo = submission.car_record || submission;
    const carDescription = carInfo.make && carInfo.model ? 
      `${carInfo.make} ${carInfo.model} ${carInfo.trim || ''}`.trim() : 
      'Vehicle Details';
    
    if (status === 'Valuation In Progress' || workflowStatus === 'Pending Manual Valuation') {
      return {
        type: 'pending',
        title: t('pendingManualValuation') || 'Pending Manual Valuation',
        description: carDescription,
        value: submission.auto_valuation ? `Auto Valuation: ${submission.auto_valuation.toLocaleString()} AED` : t('pendingValuation') || 'Pending Valuation',
        showView: true
      };
    }
    
    if (status === 'Pending Inspection' || workflowStatus === 'Pending Inspection') {
      return {
        type: 'inspection',
        title: t('pendingInspection') || 'Pending Inspection',
        description: carDescription,
        value: submission.auto_valuation ? `Your car could be worth ${submission.auto_valuation.toLocaleString()} AED` : t('estimatedValue') || 'Estimated Value',
        inspectionText: t('eligibleForFreeInspection') || 'You are eligible for a free car inspection',
        showView: true,
        showInspectionLocation: true
      };
    }
    
    if (status === 'Final Offer Presented' || workflowStatus === 'Final Offer Presented') {
      return {
        type: 'offer',
        title: t('manualValuationOffer') || 'Manual Valuation Offer',
        description: carDescription,
        value: submission.final_offer ? `We will buy your car at ${submission.final_offer.toLocaleString()} AED` : t('finalOffer') || 'Final Offer',
        showAccept: true,
        showReject: true,
        showMenu: true
      };
    }
    
    // Handle other new status values
    if (status === 'Auto Valuation Completed' || status === 'Manual Valuation Completed') {
      return {
        type: 'completed',
        title: t('valuationCompleted') || 'Valuation Completed',
        description: carDescription,
        value: getDisplayValue(submission),
        showView: true
      };
    }
    
    if (status === 'Offer Accepted') {
      return {
        type: 'accepted',
        title: t('offerAccepted') || 'Offer Accepted',
        description: carDescription,
        value: submission.final_offer ? `Final Offer: ${submission.final_offer.toLocaleString()} AED` : t('offerAccepted') || 'Offer Accepted',
        showView: true
      };
    }
    
    if (status === 'Offer Declined' || status === 'Valuation Rejected') {
      return {
        type: 'declined',
        title: t('offerDeclined') || 'Offer Declined',
        description: carDescription,
        value: t('offerDeclined') || 'Offer Declined',
        showView: true
      };
    }
    
    // Default card for other statuses
    return {
      type: 'default',
      title: status,
      description: carDescription,
      value: getDisplayValue(submission),
      showView: true
    };
  };

  const getAvailableDocuments = (submission) => {
    const documents = [];
    
    if (submission.inspection_report) {
      documents.push({
        name: t('inspectionReport') || 'Inspection Report',
        type: 'inspection',
        download: () => console.log('Download inspection report')
      });
    }
    
    if (submission.transfer_papers) {
      documents.push({
        name: t('transferPapers') || 'Transfer Papers',
        type: 'transfer',
        download: () => console.log('Download transfer papers')
      });
    }
    
    if (submission.invoice) {
      documents.push({
        name: t('invoice') || 'Invoice',
        type: 'invoice',
        download: () => console.log('Download invoice')
      });
    }
    
    return documents;
  };

  const filteredSubmissions = submissions.filter(submission => {
    const carInfo = submission.car_record || submission;
    return (
      carInfo.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carInfo.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.valuation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('welcomeBack') || 'Welcome Back'}, {currUser?.full_name || 'User'}!
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t('manageVehiclesDescription') || 'Manage your vehicle submissions and track their progress'}
          </motion.p>
        </motion.div>


        {/* Vehicle Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('yourVehicles') || 'Your Vehicles'}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {submissions.length} {submissions.length === 1 ? t('submission') : t('submissions')}
            </span>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingSubmissions') || 'Loading submissions...'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Show existing submissions */}
              {filteredSubmissions.map((submission, index) => {
                const statusInfo = getStatusInfo(submission);
                const documents = getAvailableDocuments(submission);
                
                return (
                  <motion.div
                    key={submission.name}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 min-h-[200px] flex flex-col"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Header with Status and Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 flex items-center gap-2   rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)} {statusInfo.title}
                      </span>
                      {statusInfo.showMenu && documents.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(showMenu === submission.valuation_id ? null : submission.valuation_id);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          >
                            <Icon name="more-vertical" size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          
                          {showMenu === submission.valuation_id && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                              {documents.map((doc, docIndex) => (
                                <button
                                  key={docIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    doc.download();
                                    setShowMenu(null);
                                  }}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                                >
                                  {doc.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Car Brand Logo */}
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                          {(submission.car_record?.make || submission.make)?.charAt(0) || 'C'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content - Flexible grow */}
                    <div className="flex-1 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {statusInfo.description}
                      </h3>
                      
                      {statusInfo.value && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {statusInfo.value}
                        </p>
                      )}
                      
                      {statusInfo.inspectionText && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {statusInfo.inspectionText}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="flex items-center gap-2 mt-auto">
                      {statusInfo.showView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/submission/${submission.valuation_id}`);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {t('view') || 'View'}
                        </button>
                      )}
                      
                      {statusInfo.showInspectionLocation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle inspection location
                            console.log('Get inspection location');
                          }}
                          className="px-4 py-2 bg-blue-800 text-white text-sm rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2"
                        >
                          <Icon name="map-pin" size={16} />
                          {t('getInspectionLocation') || 'Get Inspection Location'}
                        </button>
                      )}
                      
                      {statusInfo.showAccept && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle accept offer
                            console.log('Accept offer');
                          }}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          {t('accept') || 'Accept'}
                        </button>
                      )}
                      
                      {statusInfo.showReject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle reject offer
                            console.log('Reject offer');
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t('reject') || 'Reject'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
                            {/* Always show Add New Car card */}
                            <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 cursor-pointer transition-all duration-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/submission')}
              >
                <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Icon name="plus" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                    {t('valuateNewCar') || 'Valuate New Car'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {t('addNewCarDescription') || 'Submit your vehicle for valuation'}
                  </p>
                </div>
              </motion.div>

            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}