import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, DocumentTextIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface Order {
  _id: string;
  orderNumber: string;
  courses: Array<{
    course: {
      _id: string;
      title: string;
      description: string;
      thumbnail: {
        url: string;
      };
      videoFiles: any[];
      pdfFiles: any[];
    };
    finalPrice: number;
  }>;
  shippingAddress: any;
  payment: {
    status: string;
    paidAt: Date;
  };
  finalPrice: number;
  createdAt: Date;
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrder(id!);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        {/* Success Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8 mb-8 text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p className="text-lg font-semibold text-primary">
            Order Number: {order.orderNumber}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
          
          <div className="space-y-6">
            {order.courses.map((item) => (
              <div key={item.course._id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex gap-4">
                  {item.course.thumbnail?.url && (
                    <img
                      src={item.course.thumbnail.url}
                      alt={item.course.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.course.description}</p>
                    
                    <div className="flex gap-4 text-sm">
                      {item.course.videoFiles && item.course.videoFiles.length > 0 && (
                        <div className="flex items-center gap-1 text-primary">
                          <VideoCameraIcon className="h-4 w-4" />
                          <span>{item.course.videoFiles.length} videos</span>
                        </div>
                      )}
                      {item.course.pdfFiles && item.course.pdfFiles.length > 0 && (
                        <div className="flex items-center gap-1 text-primary">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>{item.course.pdfFiles.length} PDFs</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{item.finalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total Paid</span>
                <span>₹{order.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
          <div className="text-gray-700 space-y-1">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.email}</p>
            <p>{order.shippingAddress.phone}</p>
            <p className="mt-3">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/my-orders')}
            className="bg-gradient-to-r from-primary to-secondary text-white py-3 px-8 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="bg-white text-primary border-2 border-primary py-3 px-8 rounded-lg font-semibold hover:bg-primary/5 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

