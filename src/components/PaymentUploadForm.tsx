// src/components/PaymentUploadForm.tsx
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import PremiumService from '../services/premiumService';
import { usePremium } from '../context/PremiumContext';

interface PaymentUploadFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const PaymentUploadForm: React.FC<PaymentUploadFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const { refreshPremiumStatus } = usePremium();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    payment_reference: '',
    mobile_number: '', // Will hold the 10 digits AFTER +20
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState('');
  const [pendingPayment, setPendingPayment] = useState<any>(null);

  // Check for pending payment on component mount
  useEffect(() => {
    const checkPendingPayment = async () => {
      try {
        const response = await PremiumService.getPendingPayment();
        if (response.has_pending && response.pending_payment) {
          setPendingPayment(response.pending_payment);
        }
      } catch (err) {
        console.error('Error checking pending payment:', err);
      }
    };
    checkPendingPayment();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPG, JPEG, and PNG files are allowed');
        return;
      }
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --- CHANGED --- Mobile validation for 10 digits (after +20)
  const validateMobile = (number: string) => {
    // Regex: Must be 10 digits, starting with 1, then 0/1/2/5
    const tenDigitRegex = /^[1][0125][0-9]{8}$/;

    if (!number) {
      setMobileError('Mobile number is required.');
      return false;
    } else if (number.length !== 10) {
      setMobileError('Must be 10 digits (after the +20 prefix).');
      return false;
    } else if (!tenDigitRegex.test(number)) {
      setMobileError('Invalid number. Must start with 10, 11, 12, or 15.');
      return false;
    } else {
      setMobileError('');
      return true;
    }
  };

  // --- CHANGED --- Mobile handling for 10 digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 10) { // Enforce 10-digit limit
      setFormData({ ...formData, mobile_number: value });
      if (mobileError) {
        setMobileError('');
      }
    }
  };

  const handleBlur = () => {
    validateMobile(formData.mobile_number);
  };

  // --- CHANGED --- Reference number handling (numbers only)
  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
    setFormData({ ...formData, payment_reference: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- CHANGED --- Screenshot is now required
    if (!screenshot) {
      setError('Please upload a payment screenshot.');
      return;
    }

    if (!formData.payment_reference.trim()) {
      setError('Please enter payment reference');
      return;
    }

    if (!validateMobile(formData.mobile_number)) {
      return;
    }

    try {
      setLoading(true);
      
      // --- CHANGED --- Combine "+20" with the 10 digits
      const fullMobileNumber = '+20' + formData.mobile_number;

      await PremiumService.submitPayment({
        payment_reference: formData.payment_reference,
        mobile_number: fullMobileNumber,
        screenshot: screenshot, // Now it's guaranteed to be present
      });

      setSuccess(true);
      await refreshPremiumStatus();

      // Invalidate queries to refresh premium-related content
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      // --- NO CHANGE --- This part already works as you want.
      // It stays on the success screen until manually closed.
      onSuccess?.();
    } catch (err: any) {
      console.error('Payment submission error:', err);
      // Check for backend validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (errors.screenshot) {
          setError(errors.screenshot[0]);
        } else if (errors.mobile_number) {
          setError(errors.mobile_number[0]);
        } else if (errors.payment_reference) {
          setError(errors.payment_reference[0]);
        } else {
          setError(err.response?.data?.message || 'An error occurred.');
        }
      } else {
        setError('Failed to submit payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- PENDING PAYMENT SCREEN ---
  // Stays open until user clicks "Close"
  if (pendingPayment) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        )}
        <div className="mb-4">
          <AlertCircle size={64} className="text-yellow-500 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h3>
        <p className="text-gray-600 mb-4">
          You already have a pending payment submission.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
          <p className="text-sm"><strong>Reference:</strong> {pendingPayment.payment_reference}</p>
          {/* Amount is removed */}
          <p className="text-sm"><strong>Status:</strong> {pendingPayment.status}</p>
          <p className="text-sm"><strong>Submitted:</strong> {new Date(pendingPayment.created_at).toLocaleDateString()}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  // --- SUCCESS SCREEN ---
  // Stays open until user clicks "Close"
  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative">
        <div className="mb-4">
          <CheckCircle size={64} className="text-green-500 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Your payment is being reviewed by our admin team. You'll receive premium access once approved.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  // --- MAIN FORM ---
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      )}

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Premium</h2>
      <p className="text-gray-600 mb-6">
        Pay via Instapay, then submit your reference number below.
        <a 
          href="https://ipn.eg/S/ahmedhanycib/instapay/6sX1HW" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'green', textDecoration: 'none', display: 'block', marginTop: '4px' }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = 'blue';
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'green';
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Click here to pay to: <strong>ahmedhanycib</strong>
        </a>
       <strong> or scan the QR code below: </strong>
      <div className="flex justify-center mb-6">
        <img 
          src="/images/instapay/instapay-qr.jpeg"
          alt="Instapay QR Code" 
          className="w-100 h-100 object-contain"
        />
      </div>
      </p>
      
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payment Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="payment_reference">
            Instapay Reference Number *
          </label>
          <input
            type="text"
            inputMode="numeric" // Helps on mobile
            id="payment_reference"
            value={formData.payment_reference}
            onChange={handleReferenceChange}
            placeholder="Enter reference numbers only"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* --- CHANGED --- Mobile Number with +20 prefix --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="mobile_number">
            Your Mobile Number (Used in Instapay) *
          </label>
          <div className="relative mt-1">
            {/* The "+20" prefix */}
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 pointer-events-none">
              +20
            </span>
            {/* The Input: Note the pl-12 (padding-left) */}
            <input
              type="tel"
              id="mobile_number"
              value={formData.mobile_number} // This is just the 10 digits
              onChange={handleMobileChange}
              onBlur={handleBlur}
              placeholder="1012345678" // 10-digit placeholder
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent pl-12 ${ // pl-12 is key
                mobileError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
              maxLength={10} // Max 10 digits
            />
          </div>
          {mobileError && (
            <p className="text-red-600 text-sm mt-1">{mobileError}</p>
          )}
        </div>
        
        {/* Screenshot Upload */}
        <div>
          {/* --- CHANGED --- Label now says "Required" */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Screenshot *
          </label>
          <div className="mt-1">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Payment screenshot"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setScreenshot(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Submitting...
            </>
          ) : (
            <>
              <Upload size={20} />
              Submit Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentUploadForm;