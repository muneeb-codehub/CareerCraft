import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileText, Sparkles, Download, Eye, Copy, CheckCircle2, 
  AlertCircle, Loader, ArrowLeft, User, Briefcase, GraduationCap, 
  Award, Plus, X, Calendar, MapPin, Phone, Mail, 
  Star, Target, Zap, TrendingUp, History, Clock, Trash2
} from 'lucide-react';
import * as resumeApi from '../services/resumeApi.js';
import { deleteResume } from '../services/deleteApi';

// Button Component
const Button = ({ children, variant = 'primary', size = 'md', disabled = false, loading = false, className = '', onClick, type = 'button', style = {} }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg',
    secondary: 'bg-gray-700/50 hover:bg-gray-600/50 text-white border-2 border-gray-600/50',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
      {children}
    </button>
  );
};

// Form Input Component
const FormInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  required = false, 
  error,
  className = '',
  rows = null
}) => {
  const InputComponent = rows ? 'textarea' : 'input';
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && !rows && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <InputComponent
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            Icon && !rows ? 'pl-10' : ''
          } ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
        />
        
        {Icon && rows && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Tab Component
const TabButton = ({ active, onClick, children, icon: Icon, count }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center px-6 py-4 font-semibold rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
    }`}
  >
    {Icon && <Icon className="w-5 h-5 mr-2" />}
    {children}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// ATS Score Display Component
const ATSScoreDisplay = ({ score }) => {
  if (!score) return null;
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };
  
  const getScoreLabel = (score) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    return 'NEEDS WORK';
  };
  
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  
  return (
    <div className={`p-6 rounded-2xl border-2 mb-6 ${
      color === 'green' ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-600/50' :
      color === 'yellow' ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-600/50' :
      'bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-600/50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full mr-4 ${
            color === 'green' ? 'bg-green-500' :
            color === 'yellow' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            <div className="w-full h-full rounded-full bg-white/30 animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{score}/100</h3>
            <p className="text-sm text-[#A8B2D1]">ATS Compatibility Score</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm ${
          color === 'green' ? 'bg-green-500/30 text-green-300 border border-green-500/50' :
          color === 'yellow' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' :
          'bg-red-500/30 text-red-300 border border-red-500/50'
        }`}>
          {label}
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div 
            className={`h-4 rounded-full transition-all duration-1000 ${
              color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-600' :
              color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
              'bg-gradient-to-r from-red-400 to-red-600'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{score}%</span>
        </div>
      </div>
    </div>
  );
};

// Resume Preview Component
const ResumePreview = ({ content, aiSuggestions, isEnhanced }) => {
  if (!content) {
    return (
      <div className="h-96 flex items-center justify-center rounded-2xl border-2 border-dashed" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', borderColor: 'rgba(255, 255, 255, 0.06)'}}>
        <div className="text-center p-8">
          <FileText className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h3 className="text-xl font-bold mb-3 text-white">Resume Preview</h3>
          <p className="text-[#A8B2D1] mb-2">Your generated resume will appear here</p>
          <p className="text-sm text-[#A8B2D1]">Upload a file or fill the form to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ATS Score */}
      {aiSuggestions?.atsScore && (
        <ATSScoreDisplay score={aiSuggestions.atsScore} />
      )}

      {/* Resume Content */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-white font-sans leading-relaxed">
            {content}
          </pre>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions && (
        <div className="space-y-6">
          {/* Keywords */}
          {aiSuggestions.keywords && aiSuggestions.keywords.length > 0 && (
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-600/50 rounded-2xl p-6">
              <h4 className="font-bold text-purple-300 mb-4 flex items-center text-lg">
                <Target className="w-6 h-6 mr-3" />
                Recommended Keywords
              </h4>
              <div className="flex flex-wrap gap-3">
                {aiSuggestions.keywords.map((keyword, index) => (
                  <span key={index} className="px-4 py-2 bg-purple-500/30 text-purple-200 text-sm font-semibold rounded-full border border-purple-500/50 hover:bg-purple-500/40 transition-colors">
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="mt-4 p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <p className="text-purple-200 text-sm flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tip: Incorporate these keywords naturally throughout your resume content
                </p>
              </div>
            </div>
          )}

          {/* Improvements */}
          {aiSuggestions.improvements && aiSuggestions.improvements.length > 0 && (
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-700/30 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-5 flex items-center text-lg">
                <TrendingUp className="w-6 h-6 mr-3" />
                AI Improvement Suggestions
              </h4>
              <div className="space-y-4">
                {aiSuggestions.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', borderColor: 'rgba(168, 85, 247, 0.3)'}}>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-[#A8B2D1] leading-relaxed">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formatting */}
          {aiSuggestions.formatting && aiSuggestions.formatting.length > 0 && (
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-700/30 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-5 flex items-center text-lg">
                <Zap className="w-6 h-6 mr-3" />
                Formatting Guidelines
              </h4>
              <div className="space-y-4">
                {aiSuggestions.formatting.map((tip, index) => (
                  <div key={index} className="flex items-start p-4 rounded-xl border shadow-sm" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', borderColor: 'rgba(34, 197, 94, 0.3)'}}>
                    <CheckCircle2 className="w-6 h-6 text-green-400 mr-4 mt-0.5 flex-shrink-0" />
                    <p className="text-[#A8B2D1] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'form'
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeTitle, setResumeTitle] = useState('');
  const [targetRole, setTargetRole] = useState('softwareEngineer');
  const [currentResume, setCurrentResume] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  
  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [exporting, setExporting] = useState({ pdf: false, docx: false });
  
  // Messages
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Load user's resume history
  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await resumeApi.getUserResumes();
      setHistoryData(response.data?.resumes || []);
    } catch (err) {
      console.error('Failed to load resume history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete resume handler
  const handleDeleteResume = async (resumeId, e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteResume(resumeId);
      setSuccessMessage('Resume deleted successfully');
      await loadHistory(); // Reload history
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setErrors({ general: 'Failed to delete resume. Please try again.' });
    }
  };

  // Form data for resume builder - LinkedIn and Additional Info removed
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      jobTitle: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      skills: []
    },
    education: [{
      degree: '',
      institution: '',
      year: '',
      details: ''
    }],
    experience: [{
      title: '',
      company: '',
      duration: '',
      details: ''
    }],
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');

  const targetRoles = [
    { value: 'softwareEngineer', label: 'Software Engineer' },
    { value: 'dataScientist', label: 'Data Scientist' },
    { value: 'productManager', label: 'Product Manager' },
    { value: 'marketingManager', label: 'Marketing Manager' },
    { value: 'salesRepresentative', label: 'Sales Representative' },
    { value: 'businessAnalyst', label: 'Business Analyst' },
    { value: 'designer', label: 'Designer' },
    { value: 'fullStackDeveloper', label: 'Full Stack Developer' },
    { value: 'other', label: 'Other' }
  ];

  // Utility functions
  const showError = (message) => {
    setErrors({ general: message });
    setTimeout(() => setErrors({}), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PDF or DOCX files only.');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload files smaller than 10MB.');
    }
    
    return true;
  };

  // File handling
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      setSelectedFile(file);
      setResumeTitle(file.name.replace(/\.[^/.]+$/, ''));
      setErrors({});
    } catch (error) {
      showError(error.message);
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        validateFile(file);
        setSelectedFile(file);
        setResumeTitle(file.name.replace(/\.[^/.]+$/, ''));
        setErrors({});
      } catch (error) {
        showError(error.message);
      }
    }
  };

  // Form handling
  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    } else if (section === 'personalInfo') {
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', details: '' }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', details: '' }]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.personalInfo.skills.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            skills: [...prev.personalInfo.skills, skillInput.trim()]
          }
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        skills: prev.personalInfo.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  // API calls
  const handleFileUpload = async () => {
    if (!resumeTitle.trim()) {
      showError('Please enter a resume title');
      return;
    }

    if (!selectedFile) {
      showError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await resumeApi.createOrUploadResume({
        file: selectedFile,
        title: resumeTitle.trim()
      });

      if (result.success) {
        setCurrentResume(result.data.resume);
        showSuccess('Resume uploaded and processed successfully!');
        
        // Reload history to show new resume
        loadHistory();
        
        // Clear form
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload resume';
      
      if (errorMessage.includes('corrupted') || errorMessage.includes('XRef') || errorMessage.includes('bad')) {
        showError('Unable to read the PDF file. The file may be corrupted or password-protected. Please try:\n• Using a different PDF file\n• Converting to DOCX format\n• Saving your PDF with "Save As" to fix any corruption');
      } else if (errorMessage.includes('empty')) {
        showError('The uploaded file appears to be empty or contains no text. Please check the file and try again.');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    // Validate Resume Title
    if (!resumeTitle.trim()) {
      showError('Please enter a resume title');
      return;
    }

    // Validate Personal Information - All fields required
    if (!formData.personalInfo.name.trim()) {
      showError('Please enter your full name');
      return;
    }

    if (!formData.personalInfo.jobTitle.trim()) {
      showError('Please enter your job title');
      return;
    }

    if (!formData.personalInfo.email.trim()) {
      showError('Please enter your email address');
      return;
    }

    if (!formData.personalInfo.phone.trim()) {
      showError('Please enter your phone number');
      return;
    }

    if (!formData.personalInfo.dateOfBirth) {
      showError('Please enter your date of birth');
      return;
    }

    if (!formData.personalInfo.address.trim()) {
      showError('Please enter your address');
      return;
    }

    // Validate Skills
    if (!formData.personalInfo.skills || formData.personalInfo.skills.length === 0) {
      showError('Please add at least one skill');
      return;
    }

    // Validate Education - At least one with all required fields filled
    if (!formData.education || formData.education.length === 0) {
      showError('Please add at least one education entry');
      return;
    }

    const hasValidEducation = formData.education.some(
      edu => edu.degree.trim() && edu.institution.trim() && edu.year.trim()
    );
    if (!hasValidEducation) {
      showError('Please fill in all required education fields (degree, institution, year)');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await resumeApi.createOrUploadResume({
        title: resumeTitle.trim(),
        resumeInfo: formData
      });

      if (result.success) {
        setCurrentResume(result.data.resume);
        showSuccess('Resume created successfully!');
        
        // Reload history to show new resume
        loadHistory();
      }
    } catch (error) {
      showError(error.message || 'Failed to create resume');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceResume = async () => {
    if (!currentResume) {
      showError('Please create or upload a resume first');
      return;
    }

    setEnhancing(true);
    setErrors({});

    try {
      const result = await resumeApi.enhanceResume(currentResume._id, targetRole);
      
      if (result.success) {
        setAiSuggestions(result.data.suggestions);
        setCurrentResume(prev => ({
          ...prev,
          status: 'enhanced',
          aiSuggestions: result.data.suggestions
        }));
        showSuccess('Resume enhanced successfully! Check the AI suggestions below.');
      }
    } catch (error) {
      showError(error.message || 'Failed to enhance resume');
    } finally {
      setEnhancing(false);
    }
  };

  const handleExportResume = async (format) => {
    if (!currentResume) {
      showError('Please create or upload a resume first');
      return;
    }

    setExporting(prev => ({ ...prev, [format]: true }));

    try {
      const blob = await resumeApi.exportResume(currentResume._id, format);
      
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentResume.title}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess(`Resume exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      showError(error.message || `Failed to export resume as ${format}`);
    } finally {
      setExporting(prev => ({ ...prev, [format]: false }));
    }
  };

  const copyToClipboard = async () => {
    if (!currentResume?.content) {
      showError('No resume content to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(currentResume.content);
      showSuccess('Resume content copied to clipboard!');
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const resetForm = () => {
    setCurrentResume(null);
    setResumeTitle('');
    setSelectedFile(null);
    setAiSuggestions(null);
    setErrors({});
    setSuccessMessage('');
    setFormData({
      personalInfo: {
        name: '',
        jobTitle: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        skills: []
      },
      education: [{
        degree: '',
        institution: '',
        year: '',
        details: ''
      }],
      experience: [{
        title: '',
        company: '',
        duration: '',
        details: ''
      }],
      skills: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <button 
              onClick={() => window.history.back()}
              className="mr-4 p-3 text-[#C7CCE6] hover:text-white hover:bg-[#1A223B] rounded-xl transition-all duration-200 shadow-md border border-[#2D335A]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-5xl font-bold text-white">
              Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Builder</span>
            </h1>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="ml-4 flex items-center gap-2 px-4 py-3 text-[#C7CCE6] hover:text-white hover:bg-[#1A223B] rounded-xl transition-all duration-200 shadow-md border border-[#2D335A] font-semibold"
              style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}}
            >
              <History className="w-5 h-5" />
              {showHistory ? 'Hide History' : 'View Past Resumes'}
            </button>
          </div>
          <p className="text-xl text-[#A8B2D1] max-w-3xl mx-auto leading-relaxed">
            Create, enhance, and optimize your resume with AI-powered suggestions. 
            Upload existing files or build from scratch with our professional templates.
          </p>
        </div>

        {/* History View */}
        {showHistory && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="rounded-2xl shadow-2xl p-8" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-600" />
                Your Resume History
              </h2>
              
              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : historyData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historyData.map((resume) => (
                    <div
                      key={resume._id}
                      className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border-2 border-blue-700/30 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        setCurrentResume(resume);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg mb-1">
                            {resume.title || 'Untitled Resume'}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-[#A8B2D1]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(resume.createdAt).toLocaleDateString()}
                            </span>
                            {resume.aiSuggestions?.atsScore && (
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                ATS: {resume.aiSuggestions.atsScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            resume.status === 'enhanced' ? 'bg-green-900/40 text-green-300' :
                            resume.status === 'draft' ? 'bg-yellow-900/40 text-yellow-300' :
                            'bg-blue-900/40 text-blue-300'
                          }`}>
                            {resume.status}
                          </span>
                          <button
                            onClick={(e) => handleDeleteResume(resume._id, e)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete resume"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#A8B2D1] line-clamp-2">
                        {resume.content?.substring(0, 150)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No resumes yet. Create your first resume!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {errors.general && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <span className="text-red-800 font-semibold">{errors.general}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
              <span className="text-green-800 font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Input */}
          <div className="space-y-8">
            {/* Input Mode Tabs */}
            <div className="flex space-x-4">
              <TabButton
                active={activeTab === 'upload'}
                onClick={() => setActiveTab('upload')}
                icon={Upload}
              >
                Upload File
              </TabButton>
              <TabButton
                active={activeTab === 'form'}
                onClick={() => setActiveTab('form')}
                icon={FileText}
              >
                Build from Scratch
              </TabButton>
            </div>

            {/* Input Panel */}
            <div className="rounded-2xl shadow-2xl p-8" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
              {/* File Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  {/* Resume Title & Target Role - Only for Upload Tab */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <FormInput
                      label="Resume Title"
                      name="resumeTitle"
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      placeholder="My Professional Resume"
                      icon={FileText}
                      required
                    />
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white">
                        Target Role <span className="text-[#A8B2D1]">(for AI enhancement)</span>
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        {targetRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div 
                    className="border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer"
                    style={{
                      borderColor: 'rgba(138, 111, 255, 0.4)',
                      backgroundColor: 'rgba(26, 34, 59, 0.4)'
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <div className="flex flex-col items-center">
                      <Upload className="w-16 h-16 text-blue-400 mb-6" />
                      <h3 className="text-xl font-bold text-white mb-3">
                        Choose a file or drag & drop
                      </h3>
                      <p className="text-[#A8B2D1] mb-6 text-lg">
                        PDF or DOCX files only • Max 10MB
                      </p>
                      <div className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg">
                        Browse Files
                      </div>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="flex items-center p-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-2 border-blue-700/30 rounded-2xl shadow-lg">
                      <FileText className="w-10 h-10 text-blue-400 mr-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate text-lg">{selectedFile.name}</p>
                        <p className="text-blue-300">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type.split('/')[1].toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-blue-600 hover:text-blue-800 text-2xl font-bold ml-4 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <Button
                    onClick={handleFileUpload}
                    loading={loading}
                    disabled={!selectedFile || !resumeTitle.trim()}
                    className="w-full py-4"
                    size="lg"
                  >
                    {loading ? 'Processing File...' : 'Upload & Extract Text'}
                  </Button>
                </div>
              )}

              {/* Form Builder Tab - LinkedIn field removed */}
              {activeTab === 'form' && (
                <div className="space-y-8">
                  {/* Resume Title Field */}
                  <FormInput
                    label="Resume Title"
                    name="resumeTitle"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    placeholder="My Professional Resume"
                    icon={FileText}
                    required
                  />

                  {/* Personal Information */}
                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-6 rounded-2xl border border-blue-700/30">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <User className="w-6 h-6 mr-3" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Full Name"
                        name="name"
                        value={formData.personalInfo.name}
                        onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                        placeholder="Enter your full name"
                        icon={User}
                        required
                      />
                      
                      <FormInput
                        label="Job Title / Professional Title"
                        name="jobTitle"
                        value={formData.personalInfo.jobTitle}
                        onChange={(e) => handleInputChange('personalInfo', 'jobTitle', e.target.value)}
                        placeholder="e.g., Software Engineer"
                        icon={Briefcase}
                        required
                      />
                      
                      <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.personalInfo.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        placeholder="your.email@example.com"
                        icon={Mail}
                        required
                      />
                      
                      <FormInput
                        label="Phone Number"
                        name="phone"
                        value={formData.personalInfo.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        placeholder="+92 300 1234567"
                        icon={Phone}
                        required
                      />
                      
                      <FormInput
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.personalInfo.dateOfBirth}
                        onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                        icon={Calendar}
                        required
                      />
                      
                      <FormInput
                        label="Address"
                        name="address"
                        value={formData.personalInfo.address}
                        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                        placeholder="Your complete address"
                        icon={MapPin}
                        required
                      />
                      
                      {/* LinkedIn field removed - Skills now spans 2 columns */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-semibold text-white">
                          Skills
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={addSkill}
                          placeholder="Enter a skill and press Enter"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500">Press Enter to add skills</p>
                        
                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.personalInfo.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-2xl border border-green-700/30">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <GraduationCap className="w-6 h-6 mr-3" />
                        Education
                      </h3>
                      <Button
                        onClick={addEducation}
                        variant="outline"
                        size="sm"
                        className="border-green-400 text-green-700 hover:bg-green-100"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                    
                    {formData.education.map((edu, index) => (
                      <div key={index} className="bg-white rounded-xl border border-green-200 mb-4 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-white">Education {index + 1}</h4>
                          {formData.education.length > 1 && (
                            <button
                              onClick={() => removeEducation(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <FormInput
                            label="Degree/Course"
                            value={edu.degree}
                            onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                            placeholder="e.g., Bachelor of Computer Science"
                            required
                          />
                          
                          <FormInput
                            label="Institution"
                            value={edu.institution}
                            onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                            placeholder="University/College name"
                            required
                          />
                          
                          <FormInput
                            label="Year"
                            value={edu.year}
                            onChange={(e) => handleInputChange('education', 'year', e.target.value, index)}
                            placeholder="2023"
                            required
                          />
                        </div>
                        
                        <FormInput
                          label="Additional Details (Optional)"
                          value={edu.details}
                          onChange={(e) => handleInputChange('education', 'details', e.target.value, index)}
                          placeholder="GPA, achievements, relevant coursework..."
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Work Experience */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-2xl border border-purple-700/30">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <Briefcase className="w-6 h-6 mr-3" />
                        Work Experience <span className="text-sm text-[#A8B2D1] ml-2">(Optional - If Any)</span>
                      </h3>
                      <Button
                        onClick={addExperience}
                        variant="outline"
                        size="sm"
                        className="border-purple-400 text-purple-700 hover:bg-purple-100"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                    
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="bg-white rounded-xl border border-purple-200 mb-4 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-white">Experience {index + 1}</h4>
                          {formData.experience.length > 1 && (
                            <button
                              onClick={() => removeExperience(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <FormInput
                            label="Job Title"
                            value={exp.title}
                            onChange={(e) => handleInputChange('experience', 'title', e.target.value, index)}
                            placeholder="e.g., Frontend Developer"
                          />
                          
                          <FormInput
                            label="Company"
                            value={exp.company}
                            onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                            placeholder="Company name"
                          />
                          
                          <FormInput
                            label="Duration"
                            value={exp.duration}
                            onChange={(e) => handleInputChange('experience', 'duration', e.target.value, index)}
                            placeholder="e.g., Jan 2020 - Dec 2022"
                          />
                        </div>
                        
                        <FormInput
                          label="Responsibilities/Achievements"
                          value={exp.details}
                          onChange={(e) => handleInputChange('experience', 'details', e.target.value, index)}
                          placeholder="Describe your key responsibilities or achievements..."
                          rows={4}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleFormSubmit}
                    loading={loading}
                    disabled={
                      !resumeTitle.trim() || 
                      !formData.personalInfo.name.trim() || 
                      !formData.personalInfo.jobTitle.trim() || 
                      !formData.personalInfo.email.trim() ||
                      !formData.personalInfo.phone.trim() ||
                      !formData.personalInfo.dateOfBirth ||
                      !formData.personalInfo.address.trim() ||
                      !formData.personalInfo.skills || 
                      formData.personalInfo.skills.length === 0
                    }
                    className="w-full py-4"
                    size="lg"
                  >
                    {loading ? 'Creating Resume...' : 'Generate Resume with AI'}
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons - Moved Outside to show after resume is generated */}
            {currentResume && (
              <div className="rounded-2xl shadow-2xl p-8 space-y-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                  {/* AI Enhancement */}
                  <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-700/30">
                    <h3 className="font-bold text-white mb-4 flex items-center text-lg">
                      <Sparkles className="w-6 h-6 mr-3" />
                      AI Enhancement
                    </h3>
                    <p className="text-[#A8B2D1] mb-4">
                      Get personalized suggestions to improve your resume's ATS score and overall quality.
                    </p>
                    <Button
                      onClick={handleEnhanceResume}
                      loading={enhancing}
                      className="w-full"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {enhancing ? 'Analyzing Resume...' : 'Enhance with AI'}
                    </Button>
                  </div>

                  {/* Export Options */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-6 rounded-2xl border-2 border-purple-600/50">
                    <h3 className="font-bold text-white mb-4 flex items-center text-lg">
                      <Download className="w-6 h-6 mr-3 text-purple-400" />
                      Export Options
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Button
                        onClick={() => handleExportResume('pdf')}
                        loading={exporting.pdf}
                        variant="secondary"
                        className="w-full"
                        style={{ color: 'white' }}
                      >
                        {exporting.pdf ? 'Exporting...' : 'Export PDF'}
                      </Button>
                      <Button
                        onClick={() => handleExportResume('docx')}
                        loading={exporting.docx}
                        variant="secondary"
                        className="w-full"
                        style={{ color: 'white' }}
                      >
                        {exporting.docx ? 'Exporting...' : 'Export DOCX'}
                      </Button>
                      <Button
                        onClick={copyToClipboard}
                        variant="secondary"
                        className="w-full"
                        style={{ color: 'white' }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <Button
                    onClick={resetForm}
                    variant="ghost"
                    className="w-full border-2 border-gray-600/50 hover:bg-gray-700/30 text-gray-300 hover:text-white"
                  >
                    Start Over
                  </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <Eye className="w-8 h-8 mr-3" />
                Resume Preview
              </h2>
              {currentResume?.status === 'enhanced' && (
                <div className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full text-sm font-bold shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Enhanced
                </div>
              )}
            </div>

            <div className="rounded-2xl shadow-2xl p-6 min-h-96 max-h-screen overflow-y-auto" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
              <ResumePreview 
                content={currentResume?.content}
                aiSuggestions={aiSuggestions}
                isEnhanced={currentResume?.status === 'enhanced'}
              />
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {(loading || enhancing) && (
          <div className="fixed bottom-6 right-6 rounded-2xl shadow-2xl px-6 py-4 flex items-center z-50" style={{backgroundColor: 'rgba(26, 34, 59, 0.9)', border: '2px solid rgba(168, 85, 247, 0.5)'}}>
            <Loader className="w-6 h-6 mr-3 animate-spin text-purple-400" />
            <span className="font-semibold text-white">
              {loading ? 'Processing your resume...' : 'AI is analyzing your resume...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;