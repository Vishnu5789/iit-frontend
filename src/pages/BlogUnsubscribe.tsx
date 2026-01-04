import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export default function BlogUnsubscribe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
      setError('Email parameter is missing');
      setIsProcessing(false);
      return;
    }

    handleUnsubscribe(email, token || '');
  }, [searchParams]);

  const handleUnsubscribe = async (email: string, token: string) => {
    try {
      setIsProcessing(true);
      const response = await apiService.unsubscribeFromBlog(email, token);
      
      if (response.success) {
        setSuccess(true);
        toast.success('Successfully unsubscribed from newsletter');
      } else {
        setError(response.message || 'Failed to unsubscribe');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to unsubscribe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        {isProcessing ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-medium">Processing unsubscribe request...</p>
          </div>
        ) : success ? (
          <div>
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-dark mb-4">Unsubscribed Successfully</h2>
            <p className="text-medium mb-6">
              You have been unsubscribed from our newsletter. We're sorry to see you go!
            </p>
            <button
              onClick={() => navigate('/blog')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Blog
            </button>
          </div>
        ) : (
          <div>
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-dark mb-4">Unsubscribe Failed</h2>
            <p className="text-medium mb-6">{error || 'An error occurred while processing your request.'}</p>
            <button
              onClick={() => navigate('/blog')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Blog
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

