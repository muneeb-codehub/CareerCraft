import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  X,
  Loader,
  History,
  Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';
import useCareerStore from '../store/careerStore';
import api from '../services/api';
import { deleteSkillGap } from '../services/deleteApi';

// Reusable Components
const Button = ({ children, variant = 'primary', disabled = false, loading = false, className = '', onClick, type = 'button' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 ${variants[variant]} ${className}`}
    >
      {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
      {children}
    </button>
  );
};

const FormInput = ({ label, type = 'text', name, value, onChange, placeholder, icon: Icon, required = false, error }) => {
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
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
      </div>
      
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

const SkillGapAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { careerGoal, updateSkillAnalysis } = useCareerStore();
  
  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    currentRole: careerGoal?.currentRole || '',
    experience: '',
    skills: [],
    targetRole: careerGoal?.targetRole || ''
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Results State
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Load skill gap history
  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/skillgap/history');
      setHistoryData(response.data?.data || []);
    } catch (error) {
      console.error('Error loading skill gap history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete skill gap handler
  const handleDeleteSkillGap = async (analysisId, e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!window.confirm('Are you sure you want to delete this skill gap analysis? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSkillGap(analysisId);
      await loadHistory(); // Reload history
    } catch (error) {
      console.error('Failed to delete skill gap analysis:', error);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Popular roles for suggestions
  const popularRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst',
    'Data Scientist', 'Project Manager', 'UI/UX Designer', 'DevOps Engineer',
    'Mobile Developer', 'Software Engineer', 'Marketing Manager', 'Digital Marketing Specialist'
  ];

  // Handle form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const skill = skillInput.trim();
      if (!formData.skills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skill]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentRole.trim()) {
      newErrors.currentRole = 'Current role is required';
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    } else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
      newErrors.experience = 'Please enter a valid number of years';
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = 'Please add at least one skill';
    }
    
    if (!formData.targetRole.trim()) {
      newErrors.targetRole = 'Target role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Call backend API for skill gap analysis
      const response = await api.post('/skillgap/analyze', {
        currentProfile: {
          currentRole: formData.currentRole,
          experience: formData.experience,
          skills: formData.skills
        },
        targetRole: formData.targetRole
      });
      
      console.log('Backend Response:', response.data);
      
      if (response.data.success) {
        const backendAnalysis = response.data.data;
        setAnalysisResults(backendAnalysis);
        
        // Update career store
        updateSkillAnalysis(
          backendAnalysis.analysis?.missingSkills || [],
          formData.skills
        );
        
        setShowResults(true);
      }
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to analyze skills. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'nice-to-have':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isMobile ? !showMobileSidebar : isSidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        onClose={() => setShowMobileSidebar(false)}
      />

      {/* Main Content */}
      <main className={`pt-20 transition-all duration-300 ${isMobile ? 'pl-0' : isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Skill Gap Analysis & Job Suggestions
                </h1>
                <p className="text-gray-600">
                  Identify missing skills and discover new career opportunities
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  {showHistory ? 'Hide History' : 'View Past Analyses'}
                </Button>
                {showResults && (
                  <Button
                    onClick={resetAnalysis}
                    variant="secondary"
                    className="hidden sm:flex"
                  >
                    New Analysis
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* History View */}
          {showHistory && (
            <div className="mb-8">
              <div className="rounded-2xl shadow-sm p-8" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <History className="w-6 h-6 text-green-600" />
                  Your Skill Gap Analysis History
                </h2>
                
                {loadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 text-green-600 animate-spin" />
                  </div>
                ) : historyData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {historyData.map((analysis) => (
                      <div
                        key={analysis._id}
                        className="p-6 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl border-2 border-green-700/30 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          setAnalysisResults(analysis);
                          setShowResults(true);
                          setShowHistory(false);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1">
                              {analysis.targetRole || 'Target Role Analysis'}
                            </h3>
                            <p className="text-sm text-[#A8B2D1] mb-2">
                              Current: {analysis.currentProfile?.currentRole || 'Not specified'}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-[#A8B2D1]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                              {analysis.analysis?.missingSkills && (
                                <span className="px-2 py-1 bg-red-900/40 text-red-300 rounded-full text-xs font-semibold">
                                  {analysis.analysis.missingSkills.length} gaps
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteSkillGap(analysis._id, e)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete analysis"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {analysis.currentProfile?.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {analysis.currentProfile.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-green-900/40 text-green-300 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                            {analysis.currentProfile.skills.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-700/40 text-gray-300 rounded-full text-xs">
                                +{analysis.currentProfile.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No skill gap analyses yet. Create your first analysis!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!showResults ? (
            /* Analysis Form */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Let's Analyze Your Skills
                  </h2>
                  <p className="text-[#A8B2D1]">
                    Tell us about your current profile to get personalized career insights
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Role */}
                    <FormInput
                      label="Current Role"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleInputChange}
                      placeholder="e.g., Frontend Developer, Marketing Specialist, etc.."
                      icon={Briefcase}
                      required
                      error={errors.currentRole}
                    />

                    {/* Experience */}
                    <FormInput
                      label="Years of Experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., 2"
                      icon={Calendar}
                      required
                      error={errors.experience}
                    />
                  </div>

                  {/* Current Skills */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Current Skills <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                      placeholder="Type a skill and press Enter (e.g., JavaScript, Python, React)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500">Press Enter to add each skill</p>
                    
                    {errors.skills && <p className="text-sm text-red-600">{errors.skills}</p>}
                    
                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Role */}
                  <FormInput
                    label="Target Role"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleInputChange}
                    placeholder="e.g., Backend Developer, Project Manager, Data Scientist"
                    icon={Target}
                    required
                    error={errors.targetRole}
                  />

                  {/* Popular Roles Suggestions */}
                  <div className="space-y-2">
                    <p className="text-sm text-[#A8B2D1]">Popular target roles or any you want:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularRoles.slice(0, 8).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, targetRole: role }))}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    {errors.submit && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{errors.submit}</p>
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Analyzing Skills...' : 'Analyze My Skills'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Results Display - FIXED DATA ACCESS */
            <div className="space-y-8">
              {/* Analysis Overview */}
              <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                  <Button onClick={resetAnalysis} variant="secondary" className="sm:hidden">
                    New Analysis
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-900/30 rounded-xl border border-blue-700/30">
                    <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-400">
                      {analysisResults?.currentProfile?.skills?.length || formData.skills.length}
                    </div>
                    <div className="text-sm text-[#A8B2D1]">Current Skills</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-900/30 rounded-xl border border-red-700/30">
                    <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">
                      {analysisResults?.analysis?.missingSkills?.length || 0}
                    </div>
                    <div className="text-sm text-[#A8B2D1]">Missing Skills</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-900/30 rounded-xl border border-orange-700/30">
                    <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-400">
                      {analysisResults?.overallTimeEstimate?.averageWeeks || 0}
                    </div>
                    <div className="text-sm text-[#A8B2D1]">Weeks to Target</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Missing Skills - FIXED DATA PATH */}
                <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    Missing Skills
                  </h3>
                  <div className="space-y-3">
                    {analysisResults?.analysis?.missingSkills?.length > 0 ? (
                      analysisResults.analysis.missingSkills.map((skill, index) => (
                        <div key={index} className="p-4 rounded-xl" style={{backgroundColor: 'rgba(26, 34, 59, 0.4)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white">{skill.skill}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(skill.priority)}`}>
                              {skill.priority}
                            </span>
                          </div>
                          <p className="text-sm text-[#A8B2D1]">{skill.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No missing skills identified.</p>
                    )}
                  </div>
                </div>

                {/* Improvement Areas - FIXED DATA PATH */}
                <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                    Areas to Improve
                  </h3>
                  <div className="space-y-3">
                    {analysisResults?.analysis?.improvementAreas?.length > 0 ? (
                      analysisResults.analysis.improvementAreas.map((area, index) => (
                        <div key={index} className="p-4 rounded-xl" style={{backgroundColor: 'rgba(26, 34, 59, 0.4)', border: '1px solid rgba(59, 130, 246, 0.3)'}}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{area.skill}</h4>
                            <div className="text-sm text-blue-400">
                              {area.currentLevel} → {area.requiredLevel}
                            </div>
                          </div>
                          <p className="text-sm text-[#A8B2D1]">{area.recommendations}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#A8B2D1] text-center py-4">No improvement areas identified.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Estimate Section */}
              <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-5 h-5 text-orange-500 mr-2" />
                  Time Estimate to Reach Target Role
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl border border-green-700/30">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {analysisResults?.overallTimeEstimate?.minimumWeeks || 0}
                    </div>
                    <div className="text-sm text-[#A8B2D1]">Minimum Weeks</div>
                    <div className="text-xs text-[#A8B2D1] mt-1">(Fast track)</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/30">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {analysisResults?.overallTimeEstimate?.averageWeeks || 0}
                    </div>
                    <div className="text-sm text-[#A8B2D1]">Average Weeks</div>
                    <div className="text-xs text-[#A8B2D1] mt-1">(Recommended)</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-xl border border-orange-700/30">
                    <div className="text-3xl font-bold text-orange-400 mb-2">
                      {analysisResults?.overallTimeEstimate?.maximumWeeks || 0}
                    </div>
                    <div className="text-sm text-[#A8B2D1]">Maximum Weeks</div>
                    <div className="text-xs text-[#A8B2D1] mt-1">(At your pace)</div>
                  </div>
                </div>
                
                {/* Visual Timeline Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Timeline Progress Visualization</span>
                    <span className="text-sm font-medium text-blue-600">
                      {analysisResults?.overallTimeEstimate?.averageWeeks || 0} weeks ≈ {Math.ceil((analysisResults?.overallTimeEstimate?.averageWeeks || 0) / 4)} months
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${(analysisResults?.overallTimeEstimate?.minimumWeeks / analysisResults?.overallTimeEstimate?.maximumWeeks) * 100}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full opacity-70"
                      style={{ 
                        left: `${(analysisResults?.overallTimeEstimate?.minimumWeeks / analysisResults?.overallTimeEstimate?.maximumWeeks) * 100}%`,
                        width: `${((analysisResults?.overallTimeEstimate?.maximumWeeks - analysisResults?.overallTimeEstimate?.minimumWeeks) / analysisResults?.overallTimeEstimate?.maximumWeeks) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Start</span>
                    <span>Target Achieved</span>
                  </div>
                </div>
              </div>

              {/* Learning Path - FIXED DATA PATH */}
              <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 text-green-500 mr-2" />
                  Recommended Learning Path
                </h3>
                <div className="space-y-4">
                  {analysisResults?.analysis?.learningPath?.length > 0 ? (
                    analysisResults.analysis.learningPath.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-xl" style={{backgroundColor: 'rgba(26, 34, 59, 0.4)', border: '1px solid rgba(34, 197, 94, 0.3)'}}>
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{item.skill}</h4>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.priority === 'high' ? 'bg-red-900/40 text-red-300' :
                                item.priority === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                                'bg-gray-700/40 text-gray-300'
                              }`}>
                                {item.priority} priority
                              </span>
                              <span className="text-sm text-[#A8B2D1]">
                                {item.estimatedTimeInWeeks} weeks
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {item.resources?.map((resource, resourceIndex) => (
                              <p key={resourceIndex} className="text-sm text-[#A8B2D1]">
                                • {resource}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#A8B2D1] text-center py-4">No learning path available.</p>
                  )}
                </div>
              </div>



              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/resume')}
                  className="flex-1 sm:flex-initial"
                >
                  Improve Resume
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={() => navigate('/courses')}
                  variant="secondary"
                  className="flex-1 sm:flex-initial"
                >
                  Find Courses
                  <BookOpen className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={() => navigate('/interview')}
                  variant="secondary"
                  className="flex-1 sm:flex-initial"
                >
                  Practice Interview
                  <Target className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SkillGapAnalysis;