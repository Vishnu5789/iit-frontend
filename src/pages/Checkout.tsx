import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, UserIcon, MapPinIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Cart {
  items: any[];
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    fetchCart();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCart();
      if (response.success && response.data) {
        if (response.data.items.length === 0) {
          navigate('/cart');
          return;
        }
        setCart(response.data);
        
        // Pre-fill user info
        const user = apiService.getUser();
        if (user) {
          setFormData(prev => ({
            ...prev,
            fullName: user.fullName || '',
            email: user.email || ''
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      navigate('/cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (!cart) return;

    try {
      setIsProcessing(true);

      // Create Razorpay order
      const orderResponse = await apiService.createRazorpayOrder(cart.finalPrice);
      
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error('Failed to create payment order');
      }

      const razorpayOrder = orderResponse.data;

      // Open Razorpay payment modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Isaac Institute of Technology',
        description: 'Course Purchase',
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              // Create order
              const orderData = {
                shippingAddress: formData,
                payment: {
                  method: 'razorpay',
                  status: 'completed',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                }
              };

              const createOrderResponse = await apiService.createOrder(orderData);
              
              if (createOrderResponse.success && createOrderResponse.data) {
                navigate(`/order-confirmation/${createOrderResponse.data._id}`);
              } else {
                throw new Error(createOrderResponse.message || 'Failed to create order');
              }
            }
          } catch (error: any) {
            console.error('Error processing payment:', error);
            if (error.message?.includes('already enrolled')) {
              alert('Some courses in your cart are already enrolled. Please check your cart and try again.');
              navigate('/cart');
            } else {
            alert('Payment verification failed. Please contact support.');
            }
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#0b5563'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + response.error.description);
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      alert(error.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserIcon className="h-6 w-6 text-primary" />
                Shipping Information
              </h2>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50`}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="Street address, P.O. box"
                  />
                  {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Apartment, suite, unit, building (optional)"
                  />
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="Mumbai"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="Maharashtra"
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="400001"
                    />
                    {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {cart && (
                <>
                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.course._id} className="flex gap-3">
                        {item.course.thumbnail?.url && (
                          <img
                            src={item.course.thumbnail.url}
                            alt={item.course.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{item.course.title}</p>
                          <p className="text-sm text-gray-500">
                            ₹{(item.discountPrice > 0 ? item.discountPrice : item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>₹{cart.totalPrice.toLocaleString()}</span>
                    </div>
                    {cart.totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{cart.totalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{cart.finalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full mt-6 bg-gradient-to-r from-primary to-secondary text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCardIcon className="h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </button>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Secure payment powered by Razorpay
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

