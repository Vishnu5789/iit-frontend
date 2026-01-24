import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, ClockIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  courses: Array<{
    course: {
      _id: string;
      title: string;
      thumbnail: {
        url: string;
      };
    };
    finalPrice: number;
  }>;
  finalPrice: number;
  status: string;
  createdAt: string;
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login', { state: { from: '/my-orders' } });
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrders();
      
      console.log('Orders API Response:', response); // Debug log
      
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBagIcon className="h-10 w-10 text-primary" />
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start learning by purchasing some courses!</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-primary/90 transition-all"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/order-confirmation/${order._id}`)}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Order #{order.orderNumber}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{order.finalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Courses in Order */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap gap-4">
                    {order.courses.map((item) => (
                      <div key={item.course._id} className="flex items-center gap-3">
                        {item.course.thumbnail?.url && (
                          <img
                            src={item.course.thumbnail.url}
                            alt={item.course.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm text-gray-900">{item.course.title}</p>
                          <p className="text-xs text-gray-500">₹{item.finalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {order.courses.length} course{order.courses.length > 1 ? 's' : ''} purchased
                  </p>
                  <button className="text-primary hover:underline text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

