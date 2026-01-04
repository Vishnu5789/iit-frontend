import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

interface WebinarRegistration {
  _id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  currentEducation: string;
  interestAreas: string[];
  status: 'registered' | 'attended' | 'absent';
  emailSent: boolean;
  emailSentAt?: string;
  adminNotes?: string;
  createdAt: string;
}

export default function ManageWebinarRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<WebinarRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<WebinarRegistration | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    checkAdminAccess();
    fetchRegistrations();
  }, [statusFilter, emailFilter]);

  const checkAdminAccess = () => {
    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  };

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getWebinarRegistrations({ 
        status: statusFilter || undefined,
        page: 1,
        limit: 100
      });
      if (response.success) {
        let data = response.data;
        
        // Filter by email sent status if filter is set
        if (emailFilter === 'sent') {
          data = data.filter((reg: WebinarRegistration) => reg.emailSent);
        } else if (emailFilter === 'not_sent') {
          data = data.filter((reg: WebinarRegistration) => !reg.emailSent);
        }
        
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching webinar registrations:', error);
      toast.error('Failed to load webinar registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRegistration = (registration: WebinarRegistration) => {
    setSelectedRegistration(registration);
    setAdminNotes(registration.adminNotes || '');
  };

  const handleResendEmail = async (registrationId: string) => {
    if (!confirm('Are you sure you want to resend the invitation email?')) return;

    try {
      setIsResending(true);
      const response = await apiService.resendWebinarEmail(registrationId);
      
      if (response.success) {
        toast.success('Invitation email sent successfully!');
        fetchRegistrations();
        // Update selected registration if it's the one we just resent
        if (selectedRegistration?._id === registrationId) {
          setSelectedRegistration(response.data);
        }
      } else {
        toast.error(response.message || 'Failed to send email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRegistration) return;

    try {
      const response = await apiService.updateWebinarStatus(selectedRegistration._id, { 
        status, 
        adminNotes 
      });
      if (response.success) {
        toast.success('Status updated successfully!');
        fetchRegistrations();
        setSelectedRegistration(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteRegistration = async (registrationId: string, registrationName: string) => {
    if (!confirm(`Are you sure you want to delete registration from "${registrationName}"?`)) return;

    try {
      const response = await apiService.deleteWebinarRegistration(registrationId);
      if (response.success) {
        toast.success('Registration deleted successfully!');
        fetchRegistrations();
        if (selectedRegistration?._id === registrationId) {
          setSelectedRegistration(null);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete registration');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attended':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'absent':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
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
          <h1 className="text-3xl font-bold text-dark mb-6">Webinar Registrations</h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="registered">Registered</option>
                <option value="attended">Attended</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Filter by Email Status</label>
              <select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                <option value="sent">Email Sent</option>
                <option value="not_sent">Email Not Sent</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-medium">No registrations found</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Registrations List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-bold text-dark">Registrations ({registrations.length})</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {registrations.map((registration) => (
                    <div
                      key={registration._id}
                      onClick={() => handleViewRegistration(registration)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRegistration?._id === registration._id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-dark">{registration.fullName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(registration.status)}`}>
                          {getStatusIcon(registration.status)}
                          {registration.status}
                        </span>
                      </div>
                      <p className="text-sm text-medium mb-1">
                        <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                        {registration.email}
                      </p>
                      <p className="text-sm text-medium mb-2">
                        <PhoneIcon className="w-4 h-4 inline mr-1" />
                        {registration.contactNumber}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {registration.emailSent ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircleIcon className="w-4 h-4" />
                              Email Sent
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <XCircleIcon className="w-4 h-4" />
                              Email Not Sent
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Details */}
              <div className="lg:col-span-2">
                {selectedRegistration ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-dark">Registration Details</h2>
                      <button
                        onClick={() => handleDeleteRegistration(selectedRegistration._id, selectedRegistration.fullName)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="text-dark font-semibold">{selectedRegistration.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-dark">
                          <a href={`mailto:${selectedRegistration.email}`} className="text-primary hover:underline">
                            {selectedRegistration.email}
                          </a>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                        <p className="text-dark">
                          <a href={`tel:${selectedRegistration.contactNumber}`} className="text-primary hover:underline">
                            {selectedRegistration.contactNumber}
                          </a>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Current Education / Profession</label>
                        <p className="text-dark">{selectedRegistration.currentEducation}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Interest Areas</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedRegistration.interestAreas.map((area, index) => (
                            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email Status</label>
                        {selectedRegistration.emailSent ? (
                          <div>
                            <span className="text-green-600 font-semibold flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5" />
                              Email Sent
                            </span>
                            {selectedRegistration.emailSentAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Sent on: {new Date(selectedRegistration.emailSentAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-red-600 font-semibold flex items-center gap-2">
                            <XCircleIcon className="w-5 h-5" />
                            Email Not Sent
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Registration Date</label>
                        <p className="text-dark">{new Date(selectedRegistration.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <div className="mb-4">
                        {!selectedRegistration.emailSent && (
                          <button
                            onClick={() => handleResendEmail(selectedRegistration._id)}
                            disabled={isResending}
                            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 mb-4"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            {isResending ? 'Sending...' : 'Send Invitation Email'}
                          </button>
                        )}
                        {selectedRegistration.emailSent && (
                          <button
                            onClick={() => handleResendEmail(selectedRegistration._id)}
                            disabled={isResending}
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 mb-4"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            {isResending ? 'Resending...' : 'Resend Invitation Email'}
                          </button>
                        )}
                      </div>

                      <label className="block text-sm font-medium text-dark mb-2">Admin Notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                        placeholder="Add notes about this registration..."
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateStatus('attended')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark as Attended
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('absent')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Mark as Absent
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-medium">
                    Select a registration to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

