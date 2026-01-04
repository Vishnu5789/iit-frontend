import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  AcademicCapIcon,
  CalendarIcon,
  VideoCameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface Course {
  _id: string;
  title: string;
}

export default function Admissions() {
  // Webinar config state
  const [webinarConfig, setWebinarConfig] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Admission form state
  const [admissionFormData, setAdmissionFormData] = useState({
    name: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    education: '',
    experience: '',
    aadharCardNumber: '',
    courseApplied: '',
    contactNumber: '',
    email: '',
    nationality: 'Indian'
  });
  const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);
  const [admissionSubmitted, setAdmissionSubmitted] = useState(false);

  // Webinar form state
  const [webinarFormData, setWebinarFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    currentEducation: '',
    interestAreas: [] as string[]
  });
  const [isSubmittingWebinar, setIsSubmittingWebinar] = useState(false);
  const [webinarSubmitted, setWebinarSubmitted] = useState(false);

  // Fetch webinar config and courses on component mount
  useEffect(() => {
    fetchWebinarConfig();
    fetchCourses();
  }, []);

  const fetchWebinarConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const response = await apiService.getWebinarConfig();
      if (response.success) {
        setWebinarConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching webinar config:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCoursesTitlesOnly();
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Handle admission form field changes
  const handleAdmissionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAdmissionFormData({
      ...admissionFormData,
      [e.target.name]: e.target.value
    });
  };

  // Handle webinar form field changes
  const handleWebinarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setWebinarFormData({
      ...webinarFormData,
      [e.target.name]: e.target.value
    });
  };

  // Handle interest areas checkbox change
  const handleInterestAreaChange = (area: string) => {
    setWebinarFormData(prev => {
      const currentAreas = prev.interestAreas;
      if (currentAreas.includes(area)) {
        return {
          ...prev,
          interestAreas: currentAreas.filter(a => a !== area)
        };
      } else {
        return {
          ...prev,
          interestAreas: [...currentAreas, area]
        };
      }
    });
  };

  // Validate admission form
  const validateAdmissionForm = (): boolean => {
    const requiredFields = ['name', 'fatherName', 'dateOfBirth', 'gender', 'address', 'education', 'aadharCardNumber', 'courseApplied', 'contactNumber', 'email', 'nationality'];
    
    for (const field of requiredFields) {
      if (!admissionFormData[field as keyof typeof admissionFormData]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Validate Aadhar card number (12 digits)
    if (!/^\d{12}$/.test(admissionFormData.aadharCardNumber)) {
      toast.error('Aadhar card number must be exactly 12 digits');
      return false;
    }

    // Validate contact number (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(admissionFormData.contactNumber)) {
      toast.error('Please provide a valid 10-digit contact number');
      return false;
    }

    // Validate email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(admissionFormData.email)) {
      toast.error('Please provide a valid email address');
      return false;
    }

    return true;
  };

  // Validate webinar form
  const validateWebinarForm = (): boolean => {
    if (!webinarFormData.fullName || !webinarFormData.email || !webinarFormData.contactNumber || !webinarFormData.currentEducation) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (webinarFormData.interestAreas.length === 0) {
      toast.error('Please select at least one interest area');
      return false;
    }

    // Validate contact number
    if (!/^[6-9]\d{9}$/.test(webinarFormData.contactNumber)) {
      toast.error('Please provide a valid 10-digit contact number');
      return false;
    }

    // Validate email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(webinarFormData.email)) {
      toast.error('Please provide a valid email address');
      return false;
    }

    return true;
  };

  // Handle admission form submission
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAdmissionForm()) {
      return;
    }

    try {
      setIsSubmittingAdmission(true);
      const response = await apiService.submitAdmission(admissionFormData);
      
      if (response.success) {
        toast.success(response.message || 'Admission form submitted successfully! We will contact you soon.');
        setAdmissionSubmitted(true);
        // Reset form
        setAdmissionFormData({
          name: '',
          fatherName: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          education: '',
          experience: '',
          aadharCardNumber: '',
          courseApplied: '',
          contactNumber: '',
          email: '',
          nationality: 'Indian'
        });
      } else {
        toast.error(response.message || 'Failed to submit admission form');
      }
    } catch (error: any) {
      console.error('Admission submission error:', error);
      toast.error(error.message || 'Failed to submit admission form. Please try again.');
    } finally {
      setIsSubmittingAdmission(false);
    }
  };

  // Handle webinar form submission
  const handleWebinarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWebinarForm()) {
      return;
    }

    try {
      setIsSubmittingWebinar(true);
      const response = await apiService.submitWebinarRegistration(webinarFormData);
      
      if (response.success) {
        toast.success(response.message || 'Webinar registration successful! We will send you the Zoom link via email.');
        setWebinarSubmitted(true);
        // Reset form
        setWebinarFormData({
          fullName: '',
          email: '',
          contactNumber: '',
          currentEducation: '',
          interestAreas: []
        });
      } else {
        toast.error(response.message || 'Failed to register for webinar');
      }
    } catch (error: any) {
      console.error('Webinar registration error:', error);
      toast.error(error.message || 'Failed to register for webinar. Please try again.');
    } finally {
      setIsSubmittingWebinar(false);
    }
  };

  return (
    <div className="pt-16 md:pt-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Admissions
          </h1>
          <p className="text-lg text-medium max-w-3xl mx-auto">
            Take the first step towards your design engineering career. Apply for admission or join our exclusive webinar.
          </p>
        </div>

        <div className="space-y-16">
          {/* Admission Form Section */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <AcademicCapIcon className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-dark">Admission Form</h2>
            </div>

            {admissionSubmitted ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-dark mb-2">Thank You!</h3>
                <p className="text-medium mb-6">Your admission form has been submitted successfully. We will contact you soon.</p>
                <button
                  onClick={() => setAdmissionSubmitted(false)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Submit Another Form
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdmissionSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={admissionFormData.name}
                      onChange={handleAdmissionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Father Name */}
                  <div>
                    <label htmlFor="fatherName" className="block text-sm font-medium text-dark mb-2">
                      Father Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fatherName"
                      name="fatherName"
                      value={admissionFormData.fatherName}
                      onChange={handleAdmissionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Father's full name"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-dark mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={admissionFormData.dateOfBirth}
                      onChange={handleAdmissionChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-dark mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={admissionFormData.gender}
                      onChange={handleAdmissionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-dark mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={admissionFormData.address}
                      onChange={handleAdmissionChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your complete address"
                    />
                  </div>

                  {/* Education / Branch */}
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-dark mb-2">
                      Education / Branch <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="education"
                      name="education"
                      value={admissionFormData.education}
                      onChange={handleAdmissionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., B.Tech Mechanical Engineering"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-dark mb-2">
                      Experience
                    </label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={admissionFormData.experience}
                      onChange={handleAdmissionChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 2 years in CAD design"
                    />
                  </div>

                  {/* Aadhar Card Number */}
                  <div>
                    <label htmlFor="aadharCardNumber" className="block text-sm font-medium text-dark mb-2">
                      Aadhar Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="aadharCardNumber"
                      name="aadharCardNumber"
                      value={admissionFormData.aadharCardNumber}
                      onChange={handleAdmissionChange}
                      required
                      maxLength={12}
                      pattern="[0-9]{12}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="12-digit Aadhar number"
                    />
                  </div>

                  {/* Course Applied */}
                  <div>
                    <label htmlFor="courseApplied" className="block text-sm font-medium text-dark mb-2">
                      Course Applied <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="courseApplied"
                      name="courseApplied"
                      value={admissionFormData.courseApplied}
                      onChange={handleAdmissionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course.title}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-dark mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={admissionFormData.contactNumber}
                      onChange={handleAdmissionChange}
                      required
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={admissionFormData.email}
                      onChange={handleAdmissionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-dark mb-2">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nationality"
                      name="nationality"
                      value={admissionFormData.nationality}
                      onChange={handleAdmissionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Indian"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingAdmission}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmittingAdmission ? 'Submitting...' : 'Submit Admission Form'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Webinar Registration Section */}
          {!isLoadingConfig && webinarConfig?.isActive !== false && (
            <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <VideoCameraIcon className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold text-dark">{webinarConfig?.heading || 'Dive into the Future of Design Engineering!'}</h2>
                  <p className="text-medium mt-2">{webinarConfig?.subheading || 'Join Isaac Institute of Technology for an exclusive live webinar.'}</p>
                </div>
              </div>

              {/* Webinar Description */}
              <div className="bg-white rounded-lg p-6 mb-8">
                <p className="text-medium mb-4">
                  {webinarConfig?.description || 'Discover the exciting world of design engineering and explore cutting-edge trends that are shaping the future of manufacturing and product development. This webinar is designed for students, professionals, and anyone interested in advancing their career in engineering design.'}
                </p>
                
                {webinarConfig?.highlights && webinarConfig.highlights.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="font-bold text-dark text-lg">Webinar Highlights:</h3>
                    <ul className="space-y-2 text-medium">
                      {webinarConfig.highlights.map((highlight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-semibold text-dark">Date & Time</p>
                      <p className="text-medium">{webinarConfig?.date || 'Saturday, 25th October 2025'}</p>
                      <p className="text-medium">{webinarConfig?.time || '11:00 AM – 12:30 PM (IST)'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <VideoCameraIcon className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-semibold text-dark">Platform</p>
                      <p className="text-medium">{webinarConfig?.platform || 'Live on Zoom'}</p>
                      <p className="text-sm text-medium">{webinarConfig?.platformNote || '(Link shared after email registration)'}</p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Webinar Registration Form */}
            {webinarSubmitted ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-dark mb-2">Registration Successful!</h3>
                <p className="text-medium mb-6">We will send you the Zoom link via email. See you at the webinar!</p>
                <button
                  onClick={() => setWebinarSubmitted(false)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Register Another Person
                </button>
              </div>
            ) : (
              <form onSubmit={handleWebinarSubmit} className="bg-white rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="webinarFullName" className="block text-sm font-medium text-dark mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="webinarFullName"
                      name="fullName"
                      value={webinarFormData.fullName}
                      onChange={handleWebinarChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="webinarEmail" className="block text-sm font-medium text-dark mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="webinarEmail"
                      name="email"
                      value={webinarFormData.email}
                      onChange={handleWebinarChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label htmlFor="webinarContactNumber" className="block text-sm font-medium text-dark mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="webinarContactNumber"
                      name="contactNumber"
                      value={webinarFormData.contactNumber}
                      onChange={handleWebinarChange}
                      required
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  {/* Current Education / Profession */}
                  <div>
                    <label htmlFor="currentEducation" className="block text-sm font-medium text-dark mb-2">
                      Current Education / Profession <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="currentEducation"
                      name="currentEducation"
                      value={webinarFormData.currentEducation}
                      onChange={handleWebinarChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., B.Tech Student, Mechanical Engineer"
                    />
                  </div>
                </div>

                {/* Interest Areas */}
                {webinarConfig?.interestAreas && webinarConfig.interestAreas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-3">
                      Interest Areas <span className="text-red-500">*</span> (Select at least one)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {webinarConfig.interestAreas.map((area: string) => (
                        <label
                          key={area}
                          className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={webinarFormData.interestAreas.includes(area)}
                            onChange={() => handleInterestAreaChange(area)}
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-medium">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingWebinar}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmittingWebinar ? 'Registering...' : 'Register for Webinar'}
                  </button>
                </div>
              </form>
            )}
          </section>
          )}
        </div>
      </div>
    </div>
  );
}

