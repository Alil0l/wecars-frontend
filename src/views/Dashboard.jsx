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
  
  // Use dashboard hook
  const { 
    submissions, 
    submissionsLoading: loading, 
    submissionsError, 
    refreshSubmissions,
    statusCounts 
  } = useDashboard();

  const quickActions = [
    {
      title: t('newCar') || 'Add New Car',
      description: t('addNewCarDescription') || 'Submit your vehicle for valuation',
      icon: <Icon name="car" size={32} className="text-white" />,
      action: () => navigate('/frontend/submission'),
      color: 'bg-blue-500'
    },
    {
      title: t('valuation') || 'Get Valuation',
      description: t('getValuationDescription') || 'Get instant car valuation',
      icon: <Icon name="dollar" size={32} className="text-white" />,
      action: () => navigate('/frontend/valuation'),
      color: 'bg-green-500'
    },
    {
      title: t('inspection') || 'Book Inspection',
      description: t('bookInspectionDescription') || 'Schedule vehicle inspection',
      icon: <Icon name="search" size={32} className="text-white" />,
      action: () => navigate('/frontend/inspection'),
      color: 'bg-purple-500'
    },
    {
      title: t('history') || 'View History',
      description: t('viewHistoryDescription') || 'View your submission history',
      icon: <Icon name="file" size={32} className="text-white" />,
      action: () => navigate('/frontend/history'),
      color: 'bg-orange-500'
    }
  ];

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
      'Offer Declined': <Icon name="error" size={16} className="text-red-600" />
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

  const filteredSubmissions = submissions.filter(submission => 
    submission.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.submission_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Quick Actions */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.h2 
            className="text-xl font-semibold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {t('quickActions') || 'Quick Actions'}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                onClick={action.action}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <motion.div 
                    className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                    whileHover={{ 
                      scale: 1.2,
                      rotate: 360,
                      transition: { duration: 0.6 }
                    }}
                  >
                    {action.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vehicle Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('yourVehicles') || 'Your Vehicles'}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
            </span>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="file" size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No vehicles found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Submit your first vehicle for valuation'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/frontend/submission')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Vehicle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.name}
                  onClick={() => navigate(`/frontend/submission/${submission.submission_id}`)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {submission.make} {submission.model} {submission.trim}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ID: {submission.submission_id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)} {submission.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Value:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getDisplayValue(submission)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Submitted:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(submission.creation).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      View Details →
                    </span>
                    {submission.status === 'Final Offer Made' && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        Action Required
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}