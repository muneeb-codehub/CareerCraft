// src/pages/CareerRoadmapPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Target, Clock, BookOpen, ArrowRight, TrendingUp, CheckCircle, Circle, Award, Lightbulb, ExternalLink, Calendar, BarChart3, Briefcase, History, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { generateRoadmap, updateRoadmapProgress, getUserRoadmaps } from '../services/roadmapApi';
import { deleteRoadmap } from '../services/deleteApi';

const CareerRoadmapPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [currentSkills, setCurrentSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [targetCareer, setTargetCareer] = useState('');
  const [timeframe, setTimeframe] = useState('12');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Results state
  const [roadmapData, setRoadmapData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Load user's roadmap history
  const loadHistory = async () => {
    try {
      const response = await getUserRoadmaps();
      setHistoryData(response.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Delete roadmap handler
  const handleDeleteRoadmap = async (roadmapId, e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteRoadmap(roadmapId);
      await loadHistory(); // Reload history
    } catch (err) {
      console.error('Failed to delete roadmap:', err);
      setError('Failed to delete roadmap. Please try again.');
    }
  };

  // Handle skill chip addition
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmedSkill = skillInput.trim();
    
    if (trimmedSkill && !currentSkills.includes(trimmedSkill)) {
      setCurrentSkills([...currentSkills, trimmedSkill]);
      setSkillInput('');
    }
  };

  // Remove skill chip
  const handleRemoveSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter(skill => skill !== skillToRemove));
  };

  // Handle Enter key for skills
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(e);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (currentSkills.length === 0) {
      setError('Please add at least one current skill');
      return;
    }
    
    if (!targetCareer.trim()) {
      setError('Please enter your target career or interests');
      return;
    }

    setLoading(true);

    try {
      const response = await generateRoadmap({
        currentSkills,
        targetCareer: targetCareer.trim(),
        timeframe: parseInt(timeframe)
      });

      setRoadmapData(response);
      setShowResults(true);
      // Reload history to include new roadmap
      loadHistory();
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to form
  const handleStartNew = () => {
    setShowResults(false);
    setShowHistory(false);
    setCurrentSkills([]);
    setTargetCareer('');
    setTimeframe('12');
    setRoadmapData(null);
    setError('');
    // Reload history to show updated list
    loadHistory();
  };

  // Handle milestone status change
  const handleStatusChange = async (milestoneId, currentStatus) => {
    // Cycle through statuses: pending → in-progress → completed
    const statusCycle = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending'
    };
    
    const newStatus = statusCycle[currentStatus];
    
    try {
      const response = await updateRoadmapProgress(roadmapData.data._id, {
        milestoneUpdates: [{
          milestoneId,
          status: newStatus
        }]
      });
      
      // Update local state with new data
      setRoadmapData(response);
      // Reload history to reflect changes
      loadHistory();
    } catch (err) {
      console.error('Failed to update milestone status:', err);
    }
  };

  // Load existing roadmap from history
  const handleLoadRoadmap = (roadmap) => {
    setRoadmapData({ success: true, data: roadmap });
    setShowHistory(false);
    setShowResults(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/40 text-green-300 border-green-700/40';
      case 'in-progress':
        return 'bg-blue-900/40 text-blue-300 border-blue-700/40';
      default:
        return 'bg-gray-900/40 text-gray-300 border-gray-700/40';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  // Get resource type badge color
  const getResourceTypeBadge = (type) => {
    const colors = {
      'course': 'bg-blue-900/40 text-blue-300 border border-blue-700/40',
      'video': 'bg-red-900/40 text-red-300 border border-red-700/40',
      'article': 'bg-green-900/40 text-green-300 border border-green-700/40',
      'book': 'bg-purple-900/40 text-purple-300 border border-purple-700/40',
      'project': 'bg-orange-900/40 text-orange-300 border border-orange-700/40',
      'documentation': 'bg-gray-900/40 text-gray-300 border border-gray-700/40',
      'tutorial': 'bg-pink-900/40 text-pink-300 border border-pink-700/40'
    };
    return colors[type.toLowerCase()] || 'bg-gray-900/40 text-gray-300 border border-gray-700/40';
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      'high': 'bg-red-900/40 text-red-300 border-red-700/40',
      'medium': 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
      'low': 'bg-green-900/40 text-green-300 border-green-700/40'
    };
    return colors[priority.toLowerCase()] || 'bg-gray-900/40 text-gray-300 border-gray-700/40';
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {!showResults && !showHistory ? (
          /* INPUT FORM */
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-6 inline-flex items-center justify-center w-12 h-12 text-[#C7CCE6] hover:text-white hover:bg-[#1A223B] rounded-xl transition-colors border border-[#2D335A]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Career Roadmap Generator
              </h1>
              <p className="text-lg text-[#A8B2D1]">
                Get your personalized path to achieve your career goals
              </p>
              
              {/* View History Button */}
              {historyData.length > 0 && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/40 transition-colors border border-blue-700/40"
                >
                  <History className="w-5 h-5" />
                  View Past Roadmaps ({historyData.length})
                </button>
              )}
            </div>

            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-8 border border-[rgba(255,255,255,0.06)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Current Skills
                    </div>
                  </label>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="E.g., Python, JavaScript, React..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Skills chips */}
                  <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-[#1A223B] rounded-lg border border-[rgba(255,255,255,0.06)]">
                    {currentSkills.length === 0 ? (
                      <span className="text-[#A8B2D1] text-sm">No skills added yet</span>
                    ) : (
                      currentSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/40 text-purple-300 rounded-full text-sm font-medium border border-purple-700/40"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Target Career */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Target Career / Interests
                    </div>
                  </label>
                  <input
                    type="text"
                    value={targetCareer}
                    onChange={(e) => setTargetCareer(e.target.value)}
                    placeholder="E.g., Senior ML Engineer, Full Stack Developer..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Timeframe (Months)
                    </div>
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="8">8 Months</option>
                    <option value="12">12 Months (1 Year)</option>
                  </select>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Your Roadmap...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Generate Career Roadmap
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : showHistory ? (
          /* HISTORY VIEW */
          <div className="max-w-5xl mx-auto">
            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <History className="w-8 h-8 text-purple-400" />
                  Your Career Roadmaps
                </h1>
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-lg hover:bg-purple-900/40 transition-colors border border-purple-700/40"
                >
                  Forms
                </button>
              </div>

              {historyData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No roadmaps generated yet</p>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Generate Your First Roadmap
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {historyData.map((roadmap) => (
                    <div
                      key={roadmap._id}
                      style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}}
                      className="border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleLoadRoadmap(roadmap)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {roadmap.targetCareer}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-[#A8B2D1]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {roadmap.timeframe} months
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {roadmap.progress}% complete
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            roadmap.status === 'completed' 
                              ? 'bg-green-900/40 text-green-300 border-green-700/40' 
                              : roadmap.status === 'active'
                              ? 'bg-blue-900/40 text-blue-300 border-blue-700/40'
                              : 'bg-gray-900/40 text-gray-300 border-gray-700/40'
                          }`}>
                            {roadmap.status}
                          </div>
                          <button
                            onClick={(e) => handleDeleteRoadmap(roadmap._id, e)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete roadmap"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-[#C7CCE6] mb-2">Your Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {roadmap.currentSkills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-900/40 text-purple-300 text-xs rounded-full border border-purple-700/40"
                            >
                              {skill}
                            </span>
                          ))}
                          {roadmap.currentSkills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-900/40 text-gray-300 text-xs rounded-full border border-gray-700/40">
                              +{roadmap.currentSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-[#C7CCE6] mb-2">Milestones:</p>
                        <div className="space-y-2">
                          {roadmap.milestones.slice(0, 2).map((milestone, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {milestone.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : milestone.status === 'in-progress' ? (
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="text-[#A8B2D1] truncate">{milestone.title}</span>
                            </div>
                          ))}
                          {roadmap.milestones.length > 2 && (
                            <p className="text-xs text-[#A8B2D1] ml-6">
                              +{roadmap.milestones.length - 2} more milestones
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-[#A8B2D1]">
                        Created: {new Date(roadmap.createdAt).toLocaleDateString()}
                      </div>

                      <button className="mt-4 w-full bg-purple-900/40 text-purple-300 py-2 rounded-lg hover:bg-purple-900/50 transition-colors font-medium border border-purple-700/40">
                        View & Update
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : roadmapData && roadmapData.data ? (
          /* RESULTS VIEW */
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-xl p-8 mb-6 border border-[rgba(255,255,255,0.06)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {roadmapData.data.targetCareer}
                  </h1>
                  <p className="text-[#A8B2D1] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {roadmapData.data.timeframe} Month Roadmap
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-lg hover:bg-purple-900/40 transition-colors flex items-center gap-2 border border-purple-700/40"
                  >
                    <History className="w-4 h-4" />
                    View History
                  </button>
                  <button
                    onClick={handleStartNew}
                    className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/40 transition-colors flex items-center gap-2 border border-blue-700/40"
                  >
                    <Plus className="w-4 h-4" />
                    Generate New
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#C7CCE6]">Overall Progress</span>
                  <span className="text-sm font-bold text-purple-400">{roadmapData.data.progress || 0}%</span>
                </div>
                <div className="w-full bg-[#1A223B] rounded-full h-3 overflow-hidden border border-[rgba(255,255,255,0.06)]">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${roadmapData.data.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="space-y-6 mb-8">
              {roadmapData.data.milestones.map((milestone, index) => {
                // Calculate total hours for this milestone
                const totalHours = milestone.resources.reduce((sum, resource) => 
                  sum + (resource.estimatedTimeInHours || 0), 0
                );
                
                return (
                <div
                  key={index}
                  style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}}
                  className="rounded-2xl shadow-lg border border-[rgba(255,255,255,0.06)] overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Milestone Header */}
                  <div className="bg-gradient-to-r from-purple-600/40 to-blue-600/40 p-6 text-white border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold">#{index + 1}</span>
                          <h3 className="text-xl font-bold">{milestone.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-purple-100">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Months {milestone.timeframe.start} - {milestone.timeframe.end}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {totalHours} hours total
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStatusChange(milestone._id, milestone.status)}
                        className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${getStatusColor(milestone.status)} hover:opacity-80 transition-opacity cursor-pointer`}
                        title="Click to change status"
                      >
                        {getStatusIcon(milestone.status)}
                        <span className="text-sm font-medium capitalize">{milestone.status}</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Description */}
                    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <p className="text-[#A8B2D1] leading-relaxed">{milestone.description}</p>
                    </div>

                    {/* Required Skills */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#C7CCE6] mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        Required Skills ({milestone.requiredSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {milestone.requiredSkills.map((skillObj, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 bg-purple-900/30 border border-purple-700/40 rounded-lg hover:bg-purple-900/40 transition-colors"
                          >
                            <div className="text-sm font-medium text-purple-300">{skillObj.skill}</div>
                            <div className="text-xs text-purple-400 mt-0.5 capitalize">
                              {skillObj.proficiencyLevel} level
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#C7CCE6] mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        Learning Resources ({milestone.resources.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {milestone.resources.map((resource, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-[#1A223B] border border-[rgba(255,255,255,0.06)] rounded-lg hover:border-blue-500/40 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-white flex-1 pr-2">
                                {resource.title}
                              </h5>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${getResourceTypeBadge(resource.type)}`}>
                                {resource.type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityBadge(resource.priority)}`}>
                                {resource.priority} priority
                              </span>
                              {resource.estimatedTimeInHours && (
                                <span className="text-xs text-[#A8B2D1] flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3" />
                                  {resource.estimatedTimeInHours} hours
                                </span>
                              )}
                            </div>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full justify-center"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Resource Link
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Phase Summary */}
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/40 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#C7CCE6]">Phase Duration</p>
                          <p className="text-lg font-bold text-purple-400">
                            {milestone.timeframe.end - milestone.timeframe.start} Month{milestone.timeframe.end - milestone.timeframe.start > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#C7CCE6]">Estimated Time Investment</p>
                          <p className="text-lg font-bold text-blue-400">
                            {totalHours} Hours Total
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
            {/* Industry Insights */}
            {roadmapData.data.industryInsights && roadmapData.data.industryInsights.length > 0 && (
              <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="rounded-2xl shadow-lg p-8 border border-orange-700/40">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-orange-400" />
                  Industry Insights
                </h3>
                <div className="space-y-3">
                  {roadmapData.data.industryInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-orange-900/20 rounded-lg border border-orange-700/40"
                    >
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{insight.topic}</h4>
                        <p className="text-[#A8B2D1] leading-relaxed">{insight.description}</p>
                        {insight.relevance && (
                          <p className="text-sm text-orange-400 mt-2 italic">{insight.relevance}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}} className="max-w-3xl mx-auto rounded-2xl shadow-xl p-8 text-center border border-[rgba(255,255,255,0.06)]">
            <p className="text-[#A8B2D1]">No roadmap data available. Please try again.</p>
            <button
              onClick={handleStartNew}
              className="mt-4 px-6 py-3 bg-purple-900/40 text-purple-300 rounded-lg hover:bg-purple-900/50 transition-colors border border-purple-700/40"
            >
              Generate New Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerRoadmapPage;
