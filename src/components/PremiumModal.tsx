// src/components/PremiumModal.tsx
import React, { useState, useEffect } from 'react';
import { Crown, Lock, X, CheckCircle, Clock } from 'lucide-react';
import PaymentUploadForm from './PaymentUploadForm';
import PremiumService from '../services/premiumService';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  title = 'Premium Content',
  description = 'This content is available for premium members only.',
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      checkPendingPayment();
    }
  }, [isOpen]);

  const checkPendingPayment = async () => {
    try {
      const response = await PremiumService.getPendingPayment();
      setHasPendingPayment(response.has_pending);
      setPendingPaymentData(response.pending_payment);
    } catch (error) {
      console.error('Failed to check pending payment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 ease-out animate-in zoom-in-95 fade-in-0">
        {showPaymentForm ? (
          <div className="p-6">
            <PaymentUploadForm
              onClose={() => {
                setShowPaymentForm(false);
                onClose();
              }}
              onSuccess={() => {
                checkPendingPayment();
                setShowPaymentForm(false);
              }}
            />
          </div>
        ) : hasPendingPayment ? (
          // Pending Payment State
          <div className="p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Clock size={32} className="text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Under Review
              </h2>
              <p className="text-gray-600">
                Your payment is being reviewed by our admin team
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reference Number</p>
                  <p className="font-semibold text-gray-900">
                    {pendingPaymentData?.payment_reference}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="font-semibold text-gray-900">
                    EGP {pendingPaymentData?.amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    <Clock size={14} />
                    Pending
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(pendingPaymentData?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Your payment is being reviewed. You'll receive premium access once approved.
                This usually takes 24-48 hours.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // Upgrade Prompt
          <div className="p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-4">
                <Crown size={32} className="text-yellow-900" fill="currentColor" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600 text-lg">{description}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Premium Benefits
              </h3>
              <ul className="space-y-3">
                {[
                  'Access to all premium chapters',
                  'Advanced learning materials',
                  'Priority support',
                  'Exclusive content updates',
                  '30 days of premium access',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Premium Access</p>
                  <p className="text-2xl font-bold text-gray-900">EGP 300</p>
                  <p className="text-xs text-gray-500">30 days access</p>
                </div>
                <Crown size={48} className="text-yellow-500" />
              </div>
            </div>

            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Crown size={24} />
              Upgrade to Premium
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Payment will be reviewed by admin within 24-48 hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumModal;
