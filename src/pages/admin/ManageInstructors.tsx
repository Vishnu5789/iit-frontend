import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import FileUpload from '../../components/FileUpload';
import toast from 'react-hot-toast';

interface Instructor {
  _id: string;
  name: string;
  title: string;
  description: string;
  profileImage: {
    url: string;
    fileId: string;
  };
  email?: string;
  linkedin?: string;
  specialization?: string;
  yearsOfExperience?: number;
  previousCompanies?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  achievements?: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function ManageInstructors() {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    profileImage: { url: '', fileId: '' },
    email: '',
    linkedin: '',
    specialization: '',
    yearsOfExperience: 0,
    previousCompanies: [] as string[],
    education: [] as Array<{ degree: string; institution: string; year: string }>,
    achievements: [] as string[],
    order: 0,
    isActive: true
  });

  useEffect(() => {
    checkAdminAccess();
    fetchInstructors();
  }, []);

  const checkAdminAccess = () => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  };

  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching instructors...');
      const response = await apiService.getAllInstructorsAdmin();
      console.log('Instructors response:', response);
      if (response.success) {
        setInstructors(response.data);
        console.log('Instructors loaded:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching instructors:', error);
      toast.error('Failed to fetch instructors');
    } finally {
      setIsLoading(false);
      console.log('Loading complete');
    }
  };

  const openModal = (instructor?: Instructor) => {
    console.log('Opening modal', instructor ? 'for editing' : 'for new instructor');
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({
        name: instructor.name,
        title: instructor.title,
        description: instructor.description,
        profileImage: instructor.profileImage || { url: '', fileId: '' },
        email: instructor.email || '',
        linkedin: instructor.linkedin || '',
        specialization: instructor.specialization || '',
        yearsOfExperience: instructor.yearsOfExperience || 0,
        previousCompanies: instructor.previousCompanies || [],
        education: instructor.education || [],
        achievements: instructor.achievements || [],
        order: instructor.order,
        isActive: instructor.isActive
      });
    } else {
      setEditingInstructor(null);
      setFormData({
        name: '',
        title: '',
        description: '',
        profileImage: { url: '', fileId: '' },
        email: '',
        linkedin: '',
        specialization: '',
        yearsOfExperience: 0,
        previousCompanies: [],
        education: [],
        achievements: [],
        order: instructors.length,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInstructor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      let response;

      if (editingInstructor) {
        response = await apiService.updateInstructor(editingInstructor._id, formData);
      } else {
        response = await apiService.createInstructor(formData);
      }

      if (response.success) {
        toast.success(editingInstructor ? 'Instructor updated successfully' : 'Instructor created successfully');
        closeModal();
        fetchInstructors();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save instructor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) {
      return;
    }

    try {
      const response = await apiService.deleteInstructor(id);
      if (response.success) {
        toast.success('Instructor deleted successfully');
        fetchInstructors();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete instructor');
    }
  };

  const handleImageUpload = (fileData: { url: string; fileId: string; name: string }) => {
    setFormData({ ...formData, profileImage: { url: fileData.url, fileId: fileData.fileId } });
  };

  const addArrayItem = (field: 'previousCompanies' | 'achievements') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateArrayItem = (field: 'previousCompanies' | 'achievements', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const removeArrayItem = (field: 'previousCompanies' | 'achievements', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: '' }]
    });
  };

  const updateEducation = (index: number, field: 'degree' | 'institution' | 'year', value: string) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData({ ...formData, education: newEducation });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading instructors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Instructors</h1>
              <p className="text-gray-600 mt-2">Add and manage your team of instructors</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Add Instructor
            </button>
          </div>
        </div>

        {/* Instructors Grid */}
        {instructors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No instructors yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first instructor</p>
            <button
              onClick={() => openModal()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all"
            >
              Add Instructor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((instructor) => (
              <div key={instructor._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {instructor.profileImage?.url ? (
                        <img
                          src={instructor.profileImage.url}
                          alt={instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(instructor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(instructor._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{instructor.name}</h3>
                  <p className="text-primary text-sm font-semibold mb-3">{instructor.title}</p>
                  <p className="text-gray-600 text-sm line-clamp-3">{instructor.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      instructor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {instructor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {instructor.yearsOfExperience && (
                      <span className="text-xs text-gray-500">{instructor.yearsOfExperience}+ years exp</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 relative">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <FileUpload
                    label="Upload Profile Image"
                    accept="image/*"
                    folder="instructors"
                    onUploadComplete={handleImageUpload}
                    currentFile={formData.profileImage.url ? { url: formData.profileImage.url } : undefined}
                    onRemove={() => setFormData({ ...formData, profileImage: { url: '', fileId: '' } })}
                  />
                  {formData.profileImage.url && (
                    <div className="mt-4">
                      <img
                        src={formData.profileImage.url}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title/Position *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="e.g., Former SpaceX Stress Analyst"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="Brief bio and expertise"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g., CAD, CAE, PCB Design"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Previous Companies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Companies</label>
                  {formData.previousCompanies.map((company, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => updateArrayItem('previousCompanies', index, e.target.value)}
                        placeholder="Company name"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('previousCompanies', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('previousCompanies')}
                    className="text-primary hover:text-primary-dark text-sm font-semibold"
                  >
                    + Add Company
                  </button>
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  {formData.education.map((edu, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="Degree"
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="Institution"
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          placeholder="Year"
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-primary hover:text-primary-dark text-sm font-semibold"
                  >
                    + Add Education
                  </button>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                        placeholder="Achievement"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('achievements', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('achievements')}
                    className="text-primary hover:text-primary-dark text-sm font-semibold"
                  >
                    + Add Achievement
                  </button>
                </div>

                {/* Order and Active Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : (editingInstructor ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

