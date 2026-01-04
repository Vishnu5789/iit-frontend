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
  ClockIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

interface Admission {
  _id: string;
  name: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  education: string;
  experience?: string;
  aadharCardNumber: string;
  courseApplied: string;
  contactNumber: string;
  email: string;
  nationality: string;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  adminNotes?: string;
  createdAt: string;
}

export default function ManageAdmissions() {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    checkAdminAccess();
    fetchAdmissions();
  }, [statusFilter]);

  const checkAdminAccess = () => {
    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  };

  const fetchAdmissions = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAdmissions({ status: statusFilter });
      if (response.success) {
        setAdmissions(response.data);
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error('Failed to load admissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAdmission = async (admission: Admission) => {
    setSelectedAdmission(admission);
    setAdminNotes(admission.adminNotes || '');
    if (admission.status === 'pending') {
      try {
        await apiService.updateAdmissionStatus(admission._id, { status: 'under_review' });
        fetchAdmissions();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedAdmission) return;

    try {
      const response = await apiService.updateAdmissionStatus(selectedAdmission._id, { 
        status, 
        adminNotes 
      });
      if (response.success) {
        toast.success('Status updated successfully!');
        fetchAdmissions();
        setSelectedAdmission(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteAdmission = async (admissionId: string, admissionName: string) => {
    if (!confirm(`Are you sure you want to delete admission from "${admissionName}"?`)) return;

    try {
      const response = await apiService.deleteAdmission(admissionId);
      if (response.success) {
        toast.success('Admission deleted successfully!');
        fetchAdmissions();
        if (selectedAdmission?._id === admissionId) {
          setSelectedAdmission(null);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete admission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5" />;
      case 'under_review':
        return <ClockIcon className="w-5 h-5" />;
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
          <h1 className="text-3xl font-bold text-dark mb-6">Manage Admissions</h1>

          {/* Status Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-12 text-medium">No admissions found</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Admissions List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-bold text-dark">Admission Requests ({admissions.length})</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {admissions.map((admission) => (
                    <div
                      key={admission._id}
                      onClick={() => handleViewAdmission(admission)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAdmission?._id === admission._id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-dark">{admission.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(admission.status)}`}>
                          {getStatusIcon(admission.status)}
                          {admission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-medium mb-1">Course: {admission.courseApplied}</p>
                      <p className="text-sm text-medium mb-1">
                        <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                        {admission.email}
                      </p>
                      <p className="text-sm text-medium">
                        <PhoneIcon className="w-4 h-4 inline mr-1" />
                        {admission.contactNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(admission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admission Details */}
              <div className="lg:col-span-2">
                {selectedAdmission ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-dark">Admission Details</h2>
                      <button
                        onClick={() => handleDeleteAdmission(selectedAdmission._id, selectedAdmission.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                        <p className="text-dark font-semibold">{selectedAdmission.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Father Name</label>
                        <p className="text-dark">{selectedAdmission.fatherName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                        <p className="text-dark">{new Date(selectedAdmission.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                        <p className="text-dark capitalize">{selectedAdmission.gender}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                        <p className="text-dark">{selectedAdmission.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Education / Branch</label>
                        <p className="text-dark">{selectedAdmission.education}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Experience</label>
                        <p className="text-dark">{selectedAdmission.experience || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Aadhar Card Number</label>
                        <p className="text-dark">{selectedAdmission.aadharCardNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Course Applied</label>
                        <p className="text-dark font-semibold">{selectedAdmission.courseApplied}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                        <p className="text-dark">
                          <a href={`tel:${selectedAdmission.contactNumber}`} className="text-primary hover:underline">
                            {selectedAdmission.contactNumber}
                          </a>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-dark">
                          <a href={`mailto:${selectedAdmission.email}`} className="text-primary hover:underline">
                            {selectedAdmission.email}
                          </a>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Nationality</label>
                        <p className="text-dark">{selectedAdmission.nationality}</p>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <label className="block text-sm font-medium text-dark mb-2">Admin Notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                        placeholder="Add notes about this admission..."
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateStatus('accepted')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('under_review')}
                          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Under Review
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('rejected')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-medium">
                    Select an admission to view details
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

