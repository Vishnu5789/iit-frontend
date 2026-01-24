import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  SparklesIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

type Section = 'hero' | 'whoShouldEnroll' | 'whatYouWillLearn' | 'whyChooseUs' | 'faqs';

interface WhoShouldEnrollItem {
  title: string;
  description: string;
}

interface WhatYouWillLearnItem {
  point: string;
}

interface WhyChooseUsItem {
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface CoursePageConfig {
  heroTitle: string;
  heroDescription: string;
  whoShouldEnroll: WhoShouldEnrollItem[];
  whatYouWillLearn: WhatYouWillLearnItem[];
  whyChooseUs: WhyChooseUsItem[];
  faqs: FAQ[];
}

export default function ManageCoursePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('hero');
  
  const [formData, setFormData] = useState<CoursePageConfig>({
    heroTitle: '',
    heroDescription: '',
    whoShouldEnroll: [],
    whatYouWillLearn: [],
    whyChooseUs: [],
    faqs: []
  });

  useEffect(() => {
    fetchCoursePageConfig();
  }, []);

  const fetchCoursePageConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCoursePageConfig();
      if (response.success && response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching course page config:', error);
      toast.error('Failed to load course page configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await apiService.updateCoursePageConfig(formData);
      if (response.success) {
        toast.success('Course page configuration updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating course page config:', error);
      toast.error('Failed to update course page configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Hero Section Handlers
  const updateHeroTitle = (value: string) => {
    setFormData({ ...formData, heroTitle: value });
  };

  const updateHeroDescription = (value: string) => {
    setFormData({ ...formData, heroDescription: value });
  };

  // Who Should Enroll Handlers
  const addWhoShouldEnroll = () => {
    setFormData({
      ...formData,
      whoShouldEnroll: [...formData.whoShouldEnroll, { title: '', description: '' }]
    });
  };

  const updateWhoShouldEnroll = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...formData.whoShouldEnroll];
    updated[index][field] = value;
    setFormData({ ...formData, whoShouldEnroll: updated });
  };

  const removeWhoShouldEnroll = (index: number) => {
    const updated = formData.whoShouldEnroll.filter((_, i) => i !== index);
    setFormData({ ...formData, whoShouldEnroll: updated });
  };

  // What You Will Learn Handlers
  const addWhatYouWillLearn = () => {
    setFormData({
      ...formData,
      whatYouWillLearn: [...formData.whatYouWillLearn, { point: '' }]
    });
  };

  const updateWhatYouWillLearn = (index: number, value: string) => {
    const updated = [...formData.whatYouWillLearn];
    updated[index].point = value;
    setFormData({ ...formData, whatYouWillLearn: updated });
  };

  const removeWhatYouWillLearn = (index: number) => {
    const updated = formData.whatYouWillLearn.filter((_, i) => i !== index);
    setFormData({ ...formData, whatYouWillLearn: updated });
  };

  // Why Choose Us Handlers
  const addWhyChooseUs = () => {
    setFormData({
      ...formData,
      whyChooseUs: [...formData.whyChooseUs, { title: '', description: '' }]
    });
  };

  const updateWhyChooseUs = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...formData.whyChooseUs];
    updated[index][field] = value;
    setFormData({ ...formData, whyChooseUs: updated });
  };

  const removeWhyChooseUs = (index: number) => {
    const updated = formData.whyChooseUs.filter((_, i) => i !== index);
    setFormData({ ...formData, whyChooseUs: updated });
  };

  // FAQs Handlers
  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: '', answer: '' }]
    });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...formData.faqs];
    updated[index][field] = value;
    setFormData({ ...formData, faqs: updated });
  };

  const removeFAQ = (index: number) => {
    const updated = formData.faqs.filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: updated });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark/60">Loading course page configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-dark/60 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-dark">Course Page Content</h1>
              <p className="text-dark/60 mt-1">Manage the main course page sections and content</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection('hero')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'hero'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-dark/60 hover:text-dark'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              Hero Section
            </button>
            <button
              onClick={() => setActiveSection('whoShouldEnroll')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'whoShouldEnroll'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-dark/60 hover:text-dark'
              }`}
            >
              <UserGroupIcon className="h-5 w-5" />
              Who Should Enroll
            </button>
            <button
              onClick={() => setActiveSection('whatYouWillLearn')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'whatYouWillLearn'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-dark/60 hover:text-dark'
              }`}
            >
              <AcademicCapIcon className="h-5 w-5" />
              What You'll Learn
            </button>
            <button
              onClick={() => setActiveSection('whyChooseUs')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'whyChooseUs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-dark/60 hover:text-dark'
              }`}
            >
              <SparklesIcon className="h-5 w-5" />
              Why Choose Us
            </button>
            <button
              onClick={() => setActiveSection('faqs')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'faqs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-dark/60 hover:text-dark'
              }`}
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
              FAQs
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Hero Section */}
          {activeSection === 'hero' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => updateHeroTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter hero title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Hero Description
                </label>
                <textarea
                  value={formData.heroDescription}
                  onChange={(e) => updateHeroDescription(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter hero description..."
                />
              </div>
            </div>
          )}

          {/* Who Should Enroll Section */}
          {activeSection === 'whoShouldEnroll' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-dark">Who Should Enroll Items</h3>
                <button
                  onClick={addWhoShouldEnroll}
                  className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Item
                </button>
              </div>
              {formData.whoShouldEnroll.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-dark/60">Item {index + 1}</span>
                    <button
                      onClick={() => removeWhoShouldEnroll(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateWhoShouldEnroll(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Engineering Students"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateWhoShouldEnroll(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
              ))}
              {formData.whoShouldEnroll.length === 0 && (
                <p className="text-center text-dark/60 py-8">
                  No items added yet. Click "Add Item" to get started.
                </p>
              )}
            </div>
          )}

          {/* What You Will Learn Section */}
          {activeSection === 'whatYouWillLearn' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-dark">Learning Points</h3>
                <button
                  onClick={addWhatYouWillLearn}
                  className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Point
                </button>
              </div>
              {formData.whatYouWillLearn.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-dark mb-2">
                        Point {index + 1}
                      </label>
                      <input
                        type="text"
                        value={item.point}
                        onChange={(e) => updateWhatYouWillLearn(index, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter learning point..."
                      />
                    </div>
                    <button
                      onClick={() => removeWhatYouWillLearn(index)}
                      className="text-red-500 hover:text-red-700 transition-colors mt-8"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.whatYouWillLearn.length === 0 && (
                <p className="text-center text-dark/60 py-8">
                  No learning points added yet. Click "Add Point" to get started.
                </p>
              )}
            </div>
          )}

          {/* Why Choose Us Section */}
          {activeSection === 'whyChooseUs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-dark">Why Choose Us Items</h3>
                <button
                  onClick={addWhyChooseUs}
                  className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Item
                </button>
              </div>
              {formData.whyChooseUs.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-dark/60">Item {index + 1}</span>
                    <button
                      onClick={() => removeWhyChooseUs(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateWhyChooseUs(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Industry-Experienced Instructors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateWhyChooseUs(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter description..."
                    />
                  </div>
                </div>
              ))}
              {formData.whyChooseUs.length === 0 && (
                <p className="text-center text-dark/60 py-8">
                  No items added yet. Click "Add Item" to get started.
                </p>
              )}
            </div>
          )}

          {/* FAQs Section */}
          {activeSection === 'faqs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-dark">Frequently Asked Questions</h3>
                <button
                  onClick={addFAQ}
                  className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add FAQ
                </button>
              </div>
              {formData.faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-dark/60">FAQ {index + 1}</span>
                    <button
                      onClick={() => removeFAQ(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter question..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Answer</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter answer..."
                    />
                  </div>
                </div>
              ))}
              {formData.faqs.length === 0 && (
                <p className="text-center text-dark/60 py-8">
                  No FAQs added yet. Click "Add FAQ" to get started.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
