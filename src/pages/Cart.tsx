import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, ShoppingCartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface CartItem {
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail: {
      url: string;
    };
    duration: string;
    level: string;
    category: string;
  };
  price: number;
  discountPrice: number;
}

interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCart();
      if (response.success && response.data) {
        setCart(response.data);
        // If cart was automatically cleaned (enrolled courses removed), 
        // the backend already filtered them out, so cart is up to date
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (courseId: string) => {
    try {
      setRemovingItemId(courseId);
      const response = await apiService.removeFromCart(courseId);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to remove item from cart');
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleCheckout = () => {
    if (cart && cart.items.length > 0) {
      navigate('/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCartIcon className="h-10 w-10 text-primary" />
          Shopping Cart
        </h1>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-12 text-center">
            <ShoppingCartIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Start adding courses to your cart!</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-primary to-secondary text-white py-3 px-8 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              Browse Courses
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const finalPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
                const discount = item.discountPrice > 0
                  ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
                  : 0;

                return (
                  <div
                    key={item.course._id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-6">
                      {/* Thumbnail */}
                      {item.course.thumbnail?.url && (
                        <img
                          src={item.course.thumbnail.url}
                          alt={item.course.title}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/courses/${item.course._id}`)}
                        />
                      )}

                      {/* Course Info */}
                      <div className="flex-1">
                        <h3
                          className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/courses/${item.course._id}`)}
                        >
                          {item.course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.course.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                            {item.course.category}
                          </span>
                          <span>{item.course.level}</span>
                          <span>{item.course.duration}</span>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-right flex flex-col justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ₹{finalPrice.toLocaleString()}
                          </div>
                          {discount > 0 && (
                            <>
                              <div className="text-sm text-gray-400 line-through">
                                ₹{item.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                {discount}% OFF
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.course._id)}
                          disabled={removingItemId === item.course._id}
                          className="text-red-600 hover:text-red-800 flex items-center gap-2 justify-end mt-4 disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                          {removingItemId === item.course._id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/10 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
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

                {cart.finalPrice > 0 ? (
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                    <p className="text-green-700 font-semibold mb-2">Free Courses!</p>
                    <p className="text-sm text-green-600">These courses are free. Click "Enroll Now" on each course page to get started.</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/courses')}
                    className="w-full text-primary hover:underline text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

