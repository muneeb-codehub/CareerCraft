import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Target,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  MessageCircle,
  BookOpen,
  ChevronRight,
  Star,
  Trophy,
  Flag,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getDetailedPortfolio, updatePortfolioGoals } from '../services/portfolioApi';

const Portfolio = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    priority: 'medium',
    status: 'pending',
    progress: 0
  });

  const navigate = useNavigate();

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

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await getDetailedPortfolio();
      console.log('Portfolio API Response:', response);
      console.log('Response success:', response?.success);
      console.log('Response data:', response?.data);
      
      if (response && response.success && response.data) {
        setPortfolioData(response.data);
        console.log('Portfolio Data Set:', response.data);
        console.log('Resumes count:', response.data.resumes?.length);
        console.log('Roadmaps count:', response.data.roadmaps?.length);
        console.log('SkillGaps count:', response.data.skillGaps?.length);
        console.log('Interviews count:', response.data.interviews?.length);
      } else {
        console.error('Invalid response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      // Get current portfolio to get existing goals
      const currentPortfolio = portfolioData;
      const existingGoals = currentPortfolio?.goals || [];
      
      // Add new goal to existing goals
      const updatedGoals = [...existingGoals, newGoal];
      
      console.log('Adding goal:', newGoal);
      console.log('Updated goals array:', updatedGoals);
      
      const response = await updatePortfolioGoals(updatedGoals);
      console.log('Update response:', response);
      
      if (response.success) {
        await fetchPortfolioData();
        setShowAddGoal(false);
        setNewGoal({
          title: '',
          description: '',
          targetDate: '',
          priority: 'medium',
          status: 'pending',
          progress: 0
        });
      }
    } catch (error) {
      console.error('Failed to add goal:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to add goal: ${error.response?.data?.message || error.message || 'Please try again'}`);
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      const goals = portfolioData.goals || [];
      const updatedGoals = goals.map(g => 
        g._id === goalId ? { ...g, ...updates } : g
      );
      
      const response = await updatePortfolioGoals(updatedGoals);
      if (response.success) {
        await fetchPortfolioData();
        setEditingGoal(null);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const goals = portfolioData.goals || [];
      const updatedGoals = goals.filter(g => g._id !== goalId);
      
      const response = await updatePortfolioGoals(updatedGoals);
      if (response.success) {
        await fetchPortfolioData();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-900/40 text-green-300 border-green-700/40',
      'in-progress': 'bg-blue-900/40 text-blue-300 border-blue-700/40',
      'pending': 'bg-gray-900/40 text-gray-300 border-gray-700/40',
      'deferred': 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-900/40 text-red-300',
      'medium': 'bg-orange-900/40 text-orange-300',
      'low': 'bg-green-900/40 text-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'certification': Award,
      'project': Briefcase,
      'award': Trophy,
      'publication': FileText,
      'other': Star
    };
    return icons[category] || Star;
  };

  // Calculate stats from detailed portfolio data
  const totalResumes = portfolioData?.resumes?.length || 0;
  const totalRoadmaps = portfolioData?.roadmaps?.length || 0;
  const totalSkillGaps = portfolioData?.skillGaps?.length || 0;
  const totalInterviews = portfolioData?.interviews?.length || 0;
  const totalGoals = portfolioData?.goals?.length || 0;
  const completedGoals = portfolioData?.goals?.filter(g => g.status === 'completed').length || 0;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Debug stats
  console.log('Stats Calculated:', {
    totalResumes,
    totalRoadmaps,
    totalSkillGaps,
    totalInterviews,
    totalGoals,
    completedGoals,
    overallProgress
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          onClose={() => setShowMobileSidebar(false)}
        />
        <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="container mx-auto px-4 py-8 mt-16">
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#A8B2D1]">Loading your portfolio...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        onClose={() => setShowMobileSidebar(false)}
      />

      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="container mx-auto px-4 py-8 mt-16">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">My Portfolio</h1>
                <p className="text-[#A8B2D1]">Track your career progress and achievements</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="text-lg font-semibold">Overall Progress</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-[#A8B2D1] mb-1">Resumes</p>
              <p className="text-2xl font-bold text-white">{totalResumes}</p>
            </div>

            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-[#A8B2D1] mb-1">Roadmaps</p>
              <p className="text-2xl font-bold text-white">{totalRoadmaps}</p>
            </div>

            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-xl shadow-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-[#A8B2D1] mb-1">Skill Gaps</p>
              <p className="text-2xl font-bold text-white">{totalSkillGaps}</p>
            </div>

            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-xl shadow-lg p-4 border-l-4 border-pink-500">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-8 h-8 text-pink-600" />
              </div>
              <p className="text-sm text-[#A8B2D1] mb-1">Interviews</p>
              <p className="text-2xl font-bold text-white">{totalInterviews}</p>
            </div>

            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-xl shadow-lg p-4 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <Flag className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-sm text-[#A8B2D1] mb-1">Goals</p>
              <p className="text-2xl font-bold text-white">{completedGoals}/{totalGoals}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Work History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resumes */}
              <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-6 border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    My Resumes ({totalResumes})
                  </h2>
                  <button
                    onClick={() => navigate('/resume')}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {totalResumes > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {portfolioData.resumes.map((resume, idx) => (
                      <div
                        key={resume._id}
                        className="p-3 bg-blue-900/30 rounded-lg border border-blue-700/40 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate('/resume')}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm">{resume.title || `Resume ${idx + 1}`}</h3>
                            <div className="flex items-center gap-3 text-xs text-[#A8B2D1] mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(resume.updatedAt).toLocaleDateString()}
                              </span>
                              {resume.score && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  {resume.score}%
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resume.status)}`}>
                            {resume.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#A8B2D1]">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No resumes yet</p>
                    <button
                      onClick={() => navigate('/resume')}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Create Resume
                    </button>
                  </div>
                )}
              </div>

              {/* Active Roadmaps */}
              <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-6 border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    Active Roadmaps
                  </h2>
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {portfolioData?.roadmaps?.length > 0 ? (
                  <div className="space-y-4">
                    {portfolioData.roadmaps.map((roadmap) => (
                      <div
                        key={roadmap._id}
                        className="p-5 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-700/40 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate('/roadmap')}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-white text-lg">{roadmap.targetCareer}</h3>
                          <span className="text-purple-300 font-bold text-lg">{roadmap.progress || 0}%</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-700/40 rounded-full h-2.5 mb-3">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${roadmap.progress || 0}%` }}
                          />
                        </div>

                        {/* Milestones */}
                        <div className="space-y-2">
                          {roadmap.milestones?.slice(0, 3).map((milestone, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {milestone.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : milestone.status === 'in-progress' ? (
                                <Clock className="w-4 h-4 text-blue-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                              )}
                              <span className="text-[#A8B2D1]">{milestone.title}</span>
                            </div>
                          ))}
                          {roadmap.milestones?.length > 3 && (
                            <p className="text-xs text-[#A8B2D1] ml-6">
                              +{roadmap.milestones.length - 3} more milestones
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#A8B2D1]">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No active roadmaps. Create your career roadmap!</p>
                    <button
                      onClick={() => navigate('/roadmap')}
                      className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Create Roadmap
                    </button>
                  </div>
                )}
              </div>

              {/* Skill Gap Analysis History */}
              <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-6 border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-600" />
                    Skill Gap Analysis ({totalSkillGaps})
                  </h2>
                  <button
                    onClick={() => navigate('/skill-gap')}
                    className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {totalSkillGaps > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {portfolioData.skillGaps.map((skillGap, idx) => (
                      <div
                        key={skillGap._id || idx}
                        onClick={() => navigate('/skill-gap')}
                        className="p-3 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl border border-green-700/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm mb-1">
                              {skillGap.targetRole || `Analysis ${idx + 1}`}
                            </h3>
                            <p className="text-xs text-[#A8B2D1]">
                              {new Date(skillGap.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {skillGap.missingSkills && skillGap.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {skillGap.missingSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-900/40 text-red-300 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                            {skillGap.missingSkills.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-900/40 text-gray-300 rounded-full text-xs">
                                +{skillGap.missingSkills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        {skillGap.improvementAreas && skillGap.improvementAreas.length > 0 && (
                          <div className="text-xs text-[#A8B2D1]">
                            <span className="font-medium">Areas to improve: </span>
                            {skillGap.improvementAreas.slice(0, 2).join(', ')}
                            {skillGap.improvementAreas.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#A8B2D1]">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No skill gap analysis yet. Analyze your skills!</p>
                    <button
                      onClick={() => navigate('/skill-gap')}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Analyze Skills
                    </button>
                  </div>
                )}
              </div>

              {/* Interview History */}
              <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-6 border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-pink-600" />
                    Interview Practice ({totalInterviews})
                  </h2>
                  <button
                    onClick={() => navigate('/interview')}
                    className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {totalInterviews > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {portfolioData.interviews.map((interview, idx) => (
                      <div
                        key={interview._id || idx}
                        onClick={() => navigate('/interview')}
                        className="p-3 bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-xl border border-pink-700/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm mb-1">
                              {interview.jobRole || `Interview ${idx + 1}`}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[#A8B2D1]">
                              <span className={`px-2 py-0.5 rounded-full ${
                                interview.difficulty === 'easy' ? 'bg-green-900/40 text-green-300' :
                                interview.difficulty === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                                'bg-red-900/40 text-red-300'
                              }`}>
                                {interview.difficulty || 'Medium'}
                              </span>
                              <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {interview.questions && (
                          <div className="text-xs text-[#A8B2D1]">
                            <span className="font-medium">{interview.questions.length} questions</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#A8B2D1]">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No interview practice yet. Start practicing!</p>
                    <button
                      onClick={() => navigate('/interview')}
                      className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                      Practice Interview
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Goals */}
            <div className="lg:col-span-1">
              <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-6 border border-[rgba(255,255,255,0.06)] sticky top-20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Flag className="w-6 h-6 text-green-600" />
                    My Goals
                  </h2>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Add Goal Form */}
                {showAddGoal && (
                  <div className="mb-6 p-4 bg-green-900/30 rounded-xl border border-green-700/40">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">Add New Goal</h3>
                      <button
                        onClick={() => setShowAddGoal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Goal title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A223B] text-white border border-gray-700/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-[#A8B2D1]"
                      />
                      
                      <textarea
                        placeholder="Description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A223B] text-white border border-gray-700/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-[#A8B2D1]"
                        rows="2"
                      />
                      
                      <input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A223B] text-white border border-gray-700/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      
                      <select
                        value={newGoal.priority}
                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A223B] text-white border border-gray-700/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      
                      <button
                        onClick={handleAddGoal}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                      >
                        Add Goal
                      </button>
                    </div>
                  </div>
                )}

                {/* Goals List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {portfolioData?.goals?.length > 0 ? (
                    portfolioData.goals.map((goal) => (
                      <div
                        key={goal._id}
                        className="p-4 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl border border-green-700/40"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-[#A8B2D1] mb-2">{goal.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingGoal(goal)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal._id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(goal.status)}`}>
                              {goal.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                          </div>

                          {goal.targetDate && (
                            <p className="text-xs text-[#A8B2D1] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Target: {new Date(goal.targetDate).toLocaleDateString()}
                            </p>
                          )}

                          <div className="w-full bg-gray-700/40 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-right text-[#A8B2D1] font-medium">{goal.progress}%</p>
                        </div>

                        {/* Quick Status Update */}
                        <div className="mt-3 pt-3 border-t border-gray-700/40 flex gap-2">
                          <button
                            onClick={() => handleUpdateGoal(goal._id, { 
                              status: goal.status === 'completed' ? 'pending' : 'in-progress',
                              progress: goal.status === 'completed' ? 0 : 50
                            })}
                            className="flex-1 text-xs py-1.5 bg-blue-900/40 text-blue-300 rounded hover:bg-blue-900/50 border border-blue-700/40"
                          >
                            {goal.status === 'completed' ? 'Reopen' : 'In Progress'}
                          </button>
                          <button
                            onClick={() => handleUpdateGoal(goal._id, { 
                              status: 'completed',
                              progress: 100
                            })}
                            className="flex-1 text-xs py-1.5 bg-green-900/40 text-green-300 rounded hover:bg-green-900/50 border border-green-700/40"
                            disabled={goal.status === 'completed'}
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#A8B2D1]">
                      <Flag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">No goals yet. Add your first goal!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
