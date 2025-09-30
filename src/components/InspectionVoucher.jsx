import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';

export default function InspectionVoucher({ submissionId, inspectionDate, location }) {
  const { t } = useTranslation();
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    // Generate QR code for the inspection voucher
    generateQRCode();
  }, [submissionId]);

  const generateQRCode = async () => {
    try {
      // In a real implementation, you would generate a QR code
      // For now, we'll create a placeholder
      const qrData = {
        submission_id: submissionId,
        type: 'inspection_voucher',
        timestamp: new Date().toISOString()
      };
      
      // This would typically use a QR code library like qrcode.js
      // For now, we'll just set a placeholder
      setQrCode('data:image/png;base64,placeholder');
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const printVoucher = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 print:shadow-none print:border-0">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('inspectionVoucher') || 'Inspection Voucher'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('freeVehicleInspection') || 'Free Vehicle Inspection'}
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold mb-4">{t('inspectionDetails') || 'Inspection Details'}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon name="location" size={20} />
                <div>
                  <p className="font-medium">{t('location') || 'Location'}</p>
                  <p className="text-blue-100">{location || 'WeCars Inspection Center, Dubai'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Icon name="clock" size={20} />
                <div>
                  <p className="font-medium">{t('duration') || 'Duration'}</p>
                  <p className="text-blue-100">1-2 hours</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Icon name="calendar" size={20} />
                <div>
                  <p className="font-medium">{t('validity') || 'Validity'}</p>
                  <p className="text-blue-100">30 days from issue</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center mx-auto">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-300 rounded mb-2 mx-auto flex items-center justify-center">
                      <span className="text-gray-500 text-xs">QR Code</span>
                    </div>
                    <p className="text-xs text-gray-500">Show at inspection center</p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              {t('showQRCode') || 'Show this QR code at our inspection center'}
            </p>
            <button
              onClick={printVoucher}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              {t('printVoucher') || 'Print Voucher'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="warning" size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              {t('importantNotes') || 'Important Notes'}
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• {t('bringValidID') || 'Bring a valid Emirates ID'}</li>
              <li>• {t('bringVehicleDocuments') || 'Bring all vehicle documents'}</li>
              <li>• {t('arriveOnTime') || 'Arrive 15 minutes before your appointment'}</li>
              <li>• {t('voucherExpires') || 'This voucher expires 30 days from issue date'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('voucherTerms') || 'This voucher is non-transferable and subject to terms and conditions'}
        </p>
      </div>
    </div>
  );
}
