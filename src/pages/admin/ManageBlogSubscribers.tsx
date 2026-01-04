import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

interface BlogSubscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
  createdAt: string;
}

export default function ManageBlogSubscribers() {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState<BlogSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('true');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    checkAdminAccess();
    fetchSubscribers();
    fetchStats();
  }, [activeFilter]);

  const checkAdminAccess = () => {
    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  };

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getBlogSubscribers({ 
        isActive: activeFilter,
        page: 1,
        limit: 100
      });
      if (response.success) {
        setSubscribers(response.data);
      }
    } catch (error) {
      console.error('Error fetching blog subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getBlogSubscriberStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="pt-16 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-dark mb-6">Blog Subscribers</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Subscribers</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Active Subscribers</p>
              <p className="text-3xl font-bold text-green-900">{stats.active}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-1">Inactive Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-2">Filter by Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Subscribers</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12 text-medium">No subscribers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Subscribed Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-5 h-5 text-primary" />
                          <a 
                            href={`mailto:${subscriber.email}`} 
                            className="text-primary hover:underline"
                          >
                            {subscriber.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-medium">
                        {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {subscriber.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <CheckCircleIcon className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            <XCircleIcon className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

