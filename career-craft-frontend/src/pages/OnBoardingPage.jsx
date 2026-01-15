import React, { useState } from 'react';
import { User, Briefcase, Award, MapPin, Link, ArrowRight, CheckCircle } from 'lucide-react';

// Button Component
const Button = ({ children, variant = 'primary', disabled = false, loading = false, className = '', onClick, type = 'button' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 ${variants[variant]} ${className}`}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
      {children}
    </button>
  );
};

// FormInput Component
const FormInput = ({ label, type = 'text', name, value, onChange, placeholder, icon: Icon, required = false }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${Icon && 'pl-10'}`}
        />
      </div>
    </div>
  );
};

const OnboardingPage = () => {
  // Mock functions - Replace with actual store integration
  const setCareerGoal = (data) => console.log('Setting career goal:', data);
  const updateProfileCompletion = (percent) => console.log('Profile completion:', percent);
  const navigate = (path) => console.log('Navigating to:', path);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    targetRole: '',
    experienceLevel: '',
    keySkills: [],
    preferredIndustry: '',
    location: '',
    portfolioUrl: '',
    linkedinUrl: ''
  });

  const [skillInput, setSkillInput] = useState('');

  const experienceLevels = [
    { value: 'fresher', label: 'Fresher (0-1 years)' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid-level (3-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' }
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
    'Sales', 'Manufacturing', 'Retail', 'Consulting', 'Media',
    'Real Estate', 'Automotive', 'Food & Beverage', 'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.keySkills.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          keySkills: [...formData.keySkills, skillInput.trim()]
        });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      keySkills: formData.keySkills.filter(skill => skill !== skillToRemove)
    });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to career store
      setCareerGoal({
        targetRole: formData.targetRole,
        experienceLevel: formData.experienceLevel,
        targetIndustry: formData.preferredIndustry,
        keySkills: formData.keySkills,
        location: formData.location,
        portfolioUrl: formData.portfolioUrl,
        linkedinUrl: formData.linkedinUrl,
        timeframe: '6 months' // Default
      });

      // Update profile completion
      updateProfileCompletion(40); // Onboarding complete = 40%

      // Redirect to Resume Builder
      navigate('/resume');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.targetRole && formData.experienceLevel;
      case 2:
        return formData.keySkills.length > 0 && formData.preferredIndustry;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">CareerCraft</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's personalize your career journey. This quick setup will help us provide tailored recommendations.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center ${
                  step < 3 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Career Goals</span>
            <span className="text-sm text-gray-600">Skills & Industry</span>
            <span className="text-sm text-gray-600">Additional Info</span>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div>
              {/* Step 1: Basic Career Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Tell us about your career goals</h2>
                    <p className="text-gray-600">Basic information to get started</p>
                  </div>

                  <FormInput
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    icon={User}
                    required
                  />

                  <FormInput
                    label="Target Role / Position"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Marketing Manager, Data Analyst"
                    icon={Briefcase}
                    required
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select your experience level</option>
                      {experienceLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Skills & Industry */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Your skills and industry</h2>
                    <p className="text-gray-600">Help us understand your expertise</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Key Skills <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                      placeholder="Type a skill and press Enter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500">Press Enter to add skills</p>
                    
                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.keySkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Preferred Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="preferredIndustry"
                      value={formData.preferredIndustry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select your preferred industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Link className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Additional information</h2>
                    <p className="text-gray-600">Optional details to enhance your profile</p>
                  </div>

                  <FormInput
                    label="Location Preference"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, Remote, Islamabad"
                    icon={MapPin}
                  />

                  <FormInput
                    label="Portfolio URL"
                    name="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://your-portfolio.com"
                    icon={Link}
                  />

                  <FormInput
                    label="LinkedIn Profile"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    icon={Link}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!isStepValid()}
                  >
                    Complete Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default OnboardingPage;