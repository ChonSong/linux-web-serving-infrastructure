import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Send,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Star,
  User,
  Building,
  Briefcase,
  DollarSign,
  Target,
  MessageSquare,
  ExternalLink,
  Copy,
  Loader2
} from 'lucide-react';
import { PERSONAL_INFO } from '../content';
import {
  PROJECT_TYPES,
  BUDGET_RANGES,
  TIMELINE_RANGES,
  MEETING_TYPES,
  CONTACT_METHODS,
  FAQ_ITEMS,
  OFFICE_HOURS,
  CONTACT_PREFERENCES,
  URGENCY_LEVELS
} from '../constants';
import {
  ContactFormData,
  FormValidation,
  ContactFormSubmission,
  FAQItem,
  ProjectType,
  BudgetRange,
  TimelineRange
} from '../types';

const ContactPage: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: PROJECT_TYPES[0],
    budget: BUDGET_RANGES[0],
    timeline: TIMELINE_RANGES[0],
    projectDescription: '',
    howDidYouHear: '',
    attachment: undefined,
    contactPreference: CONTACT_PREFERENCES[0],
    urgencyLevel: URGENCY_LEVELS[0]
  });

  // Form validation state
  const [validation, setValidation] = useState<FormValidation>({
    isValid: false,
    errors: {},
    touched: {}
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // UI state
  const [expandedFAQ, setExpandedFAQ] = useState<string[]>([]);
  const [selectedMeetingType, setSelectedMeetingType] = useState(MEETING_TYPES[0]);
  const [copiedMethod, setCopiedMethod] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Intersection Observer for animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formRef, formInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [scheduleRef, scheduleInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [contactRef, contactInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [faqRef, faqInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedData = localStorage.getItem('contactFormDraft');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error loading saved form:', error);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save form data
  useEffect(() => {
    const timer = setTimeout(() => {
      const dataToSave = { ...formData };
      delete dataToSave.attachment; // Don't save files to localStorage
      localStorage.setItem('contactFormDraft', JSON.stringify(dataToSave));
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 2000);

    setAutoSaveStatus('saving');
    return () => clearTimeout(timer);
  }, [formData]);

  // Form validation
  const validateForm = useCallback((data: ContactFormData): FormValidation => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
    if (!data.phone.trim()) errors.phone = 'Phone is required';
    if (!data.projectDescription.trim()) errors.projectDescription = 'Project description is required';
    else if (data.projectDescription.length < 50) errors.projectDescription = 'Please provide more details (at least 50 characters)';
    if (!data.howDidYouHear.trim()) errors.howDidYouHear = 'Please let us know how you found us';

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      touched: {}
    };
  }, []);

  // Handle form field changes
  const handleInputChange = useCallback((field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (validation.touched[field]) {
      const newValidation = validateForm({ ...formData, [field]: value });
      setValidation(prev => ({ ...prev, ...newValidation }));
    }
  }, [formData, validation.touched, validateForm]);

  // Handle field blur for validation
  const handleFieldBlur = useCallback((field: keyof ContactFormData) => {
    setValidation(prev => ({ ...prev, touched: { ...prev.touched, [field]: true } }));
    const newValidation = validateForm(formData);
    setValidation(prev => ({ ...prev, errors: newValidation.errors }));
  }, [formData, validateForm]);

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }

      setFormData(prev => ({ ...prev, attachment: file }));

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  }, []);

  // Remove uploaded file
  const removeFile = useCallback(() => {
    setFormData(prev => ({ ...prev, attachment: undefined }));
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const formValidation = validateForm(formData);
    setValidation(formValidation);

    if (!formValidation.isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would send this to your backend
      const submission: ContactFormSubmission = {
        id: Date.now().toString(),
        formData: formData,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      console.log('Form submitted:', submission);

      setIsSubmitted(true);
      localStorage.removeItem('contactFormDraft');

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          projectType: PROJECT_TYPES[0],
          budget: BUDGET_RANGES[0],
          timeline: TIMELINE_RANGES[0],
          projectDescription: '',
          howDidYouHear: '',
          attachment: undefined,
          contactPreference: CONTACT_PREFERENCES[0],
          urgencyLevel: URGENCY_LEVELS[0]
        });
      }, 3000);

    } catch (error) {
      setSubmissionError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  // FAQ toggle handler
  const toggleFAQ = useCallback((id: string) => {
    setExpandedFAQ(prev =>
      prev.includes(id)
        ? prev.filter(faqId => faqId !== id)
        : [...prev, id]
    );
  }, []);

  // Copy contact method
  const copyContactMethod = useCallback(async (method: { value: string, label: string }) => {
    try {
      await navigator.clipboard.writeText(method.value);
      setCopiedMethod(method.value);
      setTimeout(() => setCopiedMethod(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  // Get timezone
  const getTimezone = useCallback(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  // Response time estimate based on urgency
  const getResponseTimeEstimate = useCallback((urgency: { responseTime: string }) => {
    return urgency.responseTime;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 20 }}
        animate={heroInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-20 px-4"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={heroInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Let's collaborate on your next project. I'm here to bring your ideas to life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <Mail className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-300 text-sm">{PERSONAL_INFO.email}</p>
              <p className="text-xs text-gray-400 mt-1">Response: {getResponseTimeEstimate(formData.urgencyLevel)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <Phone className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-gray-300 text-sm">{PERSONAL_INFO.phone}</p>
              <p className="text-xs text-gray-400 mt-1">Available: {OFFICE_HOURS.filter(h => h.available).length} days/week</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-gray-300 text-sm">{PERSONAL_INFO.location}</p>
              <p className="text-xs text-gray-400 mt-1">Timezone: {getTimezone()}</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Form Section */}
      <motion.section
        ref={formRef}
        initial={{ opacity: 0, y: 20 }}
        animate={formInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-20 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Project Inquiry Form</h2>
            <p className="text-gray-300 text-lg">Tell me about your project and I'll get back to you within {getResponseTimeEstimate(formData.urgencyLevel)}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={formInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8"
          >
            {/* Auto-save indicator */}
            <div className="flex justify-end mb-4">
              <AnimatePresence mode="wait">
                {autoSaveStatus === 'saving' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-yellow-400 flex items-center gap-2"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Auto-saving...
                  </motion.div>
                )}
                {autoSaveStatus === 'saved' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-400 flex items-center gap-2"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Draft saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      validation.errors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="John Doe"
                  />
                  {validation.errors.name && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      validation.errors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="john@example.com"
                  />
                  {validation.errors.email && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleFieldBlur('phone')}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      validation.errors.phone ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {validation.errors.phone && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Building className="inline w-4 h-4 mr-1" />
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              {/* Project Details */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Briefcase className="inline w-4 h-4 mr-1" />
                  Project Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PROJECT_TYPES.map((type) => (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('projectType', type)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.projectType.id === type.id
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{type.name}</h4>
                          <p className="text-xs text-gray-400">{type.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Budget and Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Budget Range *
                  </label>
                  <select
                    value={formData.budget.id}
                    onChange={(e) => handleInputChange('budget', BUDGET_RANGES.find(b => b.id === e.target.value)!)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {BUDGET_RANGES.map((budget) => (
                      <option key={budget.id} value={budget.id} className="bg-slate-800">
                        {budget.range} - {budget.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Timeline *
                  </label>
                  <select
                    value={formData.timeline.id}
                    onChange={(e) => handleInputChange('timeline', TIMELINE_RANGES.find(t => t.id === e.target.value)!)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {TIMELINE_RANGES.map((timeline) => (
                      <option key={timeline.id} value={timeline.id} className="bg-slate-800">
                        {timeline.duration} - {timeline.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MessageSquare className="inline w-4 h-4 mr-1" />
                  Project Description *
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  onBlur={() => handleFieldBlur('projectDescription')}
                  rows={6}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                    validation.errors.projectDescription ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Please describe your project in detail. What are the main goals? Who is the target audience? Any specific features or requirements?"
                />
                <div className="flex justify-between mt-1">
                  {validation.errors.projectDescription && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.projectDescription}
                    </p>
                  )}
                  <span className="text-xs text-gray-400">
                    {formData.projectDescription.length} / 500 characters
                  </span>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  Project Brief (Optional)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  {formData.attachment ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Upload className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm">{formData.attachment.name}</p>
                            <p className="text-xs text-gray-400">
                              {(formData.attachment.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                      {uploadProgress < 100 && (
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.zip"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        Choose File
                      </button>
                      <p className="text-xs text-gray-400 mt-2">
                        PDF, DOC, DOCX, TXT, ZIP (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Preference *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTACT_PREFERENCES.map((pref) => (
                      <motion.button
                        key={pref.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange('contactPreference', pref)}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                          formData.contactPreference.id === pref.id
                            ? 'bg-green-500/20 border-green-500'
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <span>{pref.icon}</span>
                        <span className="text-sm font-medium">{pref.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Target className="inline w-4 h-4 mr-1" />
                    Urgency Level *
                  </label>
                  <select
                    value={formData.urgencyLevel.id}
                    onChange={(e) => handleInputChange('urgencyLevel', URGENCY_LEVELS.find(u => u.id === e.target.value)!)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {URGENCY_LEVELS.map((urgency) => (
                      <option key={urgency.id} value={urgency.id} className="bg-slate-800">
                        {urgency.label} - {urgency.responseTime}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* How did you hear about us */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  How did you hear about me? *
                </label>
                <input
                  type="text"
                  value={formData.howDidYouHear}
                  onChange={(e) => handleInputChange('howDidYouHear', e.target.value)}
                  onBlur={() => handleFieldBlur('howDidYouHear')}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    validation.errors.howDidYouHear ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Google search, LinkedIn, referral, etc."
                />
                {validation.errors.howDidYouHear && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validation.errors.howDidYouHear}
                  </p>
                )}
              </div>

              {/* Submission */}
              <div className="pt-6 border-t border-white/10">
                {submissionError && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {submissionError}
                    </p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Project Inquiry
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-green-500/20 border border-green-500/30 rounded-lg text-center"
                    >
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                      <p className="text-gray-300">
                        Thank you for your inquiry. I'll get back to you within {getResponseTimeEstimate(formData.urgencyLevel)}.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.section>

      {/* Scheduling Section */}
      <motion.section
        ref={scheduleRef}
        initial={{ opacity: 0, y: 20 }}
        animate={scheduleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Schedule a Meeting</h2>
            <p className="text-gray-300 text-lg">Book a consultation to discuss your project in detail</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Meeting Types */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={scheduleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-semibold mb-6">Choose Meeting Type</h3>
              {MEETING_TYPES.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={scheduleInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  onClick={() => setSelectedMeetingType(meeting)}
                  className={`p-6 rounded-lg border cursor-pointer transition-all ${
                    selectedMeetingType.id === meeting.id
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{meeting.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1">{meeting.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{meeting.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Online / In-person
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open('https://calendly.com/seanosullivan', '_blank')}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Schedule {selectedMeetingType.name}
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Office Hours */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={scheduleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8"
            >
              <h3 className="text-2xl font-semibold mb-6">Office Hours</h3>
              <div className="space-y-3 mb-8">
                {OFFICE_HOURS.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: 20 }}
                    animate={scheduleInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.05 * index }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      day.available
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-gray-500/10 border border-gray-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        day.available ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium">{day.day}</span>
                    </div>
                    <span className={`text-sm ${
                      day.available ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {day.hours}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="font-semibold mb-3">Response Times</h4>
                <div className="space-y-2">
                  {URGENCY_LEVELS.map((urgency, index) => (
                    <motion.div
                      key={urgency.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={scheduleInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.05 * index }}
                      className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{urgency.label}</p>
                        <p className="text-xs text-gray-400">{urgency.description}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-400">
                        {urgency.responseTime}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Methods Section */}
      <motion.section
        ref={contactRef}
        initial={{ opacity: 0, y: 20 }}
        animate={contactInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Alternative Contact Methods</h2>
            <p className="text-gray-300 text-lg">Connect with me through your preferred platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTACT_METHODS.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={contactInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`bg-white/5 backdrop-blur-md rounded-xl border ${
                  method.primary ? 'border-blue-500/50' : 'border-white/10'
                } p-6 group cursor-pointer relative overflow-hidden`}
                onClick={() => copyContactMethod(method)}
              >
                {method.primary && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                    method.primary ? 'bg-blue-500/20' : 'bg-white/10'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{method.label}</h3>
                    <p className="text-xs text-gray-400">
                      {method.primary ? 'Primary Contact' : 'Alternative'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3 break-all">
                  {method.type === 'email' || method.type === 'phone' ? method.value : method.label}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {copiedMethod === method.value ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Click to copy</span>
                    </>
                  )}
                  {(method.type === 'linkedin' || method.type === 'github' || method.type === 'calendly') && (
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  )}
                </div>

                {method.primary && (
                  <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        ref={faqRef}
        initial={{ opacity: 0, y: 20 }}
        animate={faqInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-20 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-300 text-lg">Everything you need to know about working together</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={faqInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.05 * index }}
                className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
              >
                <motion.button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: expandedFAQ.includes(faq.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {expandedFAQ.includes(faq.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-0">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={faqInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl border border-white/20 p-12"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={faqInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's discuss how I can help bring your vision to life with cutting-edge technology and exceptional design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open('https://calendly.com/seanosullivan', '_blank')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Schedule Free Consultation
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`mailto:${PERSONAL_INFO.email}`}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Mail className="w-5 h-5" />
                Send Email
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ContactPage;