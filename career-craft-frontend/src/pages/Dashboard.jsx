// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  FileText,
  MessageCircle,
  BookOpen,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  AlertTriangle,
  User,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';
import useCareerStore from '../store/careerStore';
import api from '../services/api';

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activities, setActivities] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    resumes: 0,
    roadmaps: 0,
    skillGaps: 0,
    interviews: 0
  });
  
  const { user } = useAuthStore();
  const {
    careerGoal,
    profileCompletion,
    weeklyProgress,
    resumeStatus,
    interviewsCompleted,
    coursesInProgress,
    getOverallProgress,
    getCareerInsights
  } = useCareerStore();
  
  const navigate = useNavigate();
  const overallProgress = getOverallProgress();
  const insights = getCareerInsights();

  // Fetch user activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const response = await api.get('/user/activities?limit=10');
        console.log('Activities API response:', response.data);
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          setActivities(response.data.data);
          console.log('Loaded activities from backend:', response.data.data);
        } else {
          console.log('No activities found in backend, will use defaults');
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  // Fetch portfolio statistics
  useEffect(() => {
    const fetchPortfolioStats = async () => {
      try {
        const [resumesRes, roadmapsRes, skillGapsRes, interviewsRes] = await Promise.all([
          api.get('/resume/user-resumes').catch(() => ({ data: { data: [] } })),
          api.get('/roadmap/user/history').catch(() => ({ data: { data: [] } })),
          api.get('/skillgap/history').catch(() => ({ data: { data: [] } })),
          api.get('/interview/history').catch(() => ({ data: { data: [] } }))
        ]);

        setPortfolioStats({
          resumes: resumesRes.data?.data?.length || 0,
          roadmaps: roadmapsRes.data?.data?.length || 0,
          skillGaps: skillGapsRes.data?.data?.length || 0,
          interviews: interviewsRes.data?.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching portfolio stats:', error);
      }
    };

    fetchPortfolioStats();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
        setShowMobileSidebar(false);
      } else {
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const quickActions = [
    {
      title: 'Build Resume',
      description: 'Create or improve your resume with AI',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/resume'),
      enabled: true
    },
    {
      title: 'Analyze Skills',
      description: 'Identify gaps in your skillset',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/skill-gap'),
      enabled: true
    },
    {
      title: 'Practice Interview',
      description: 'Mock interviews with AI feedback',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/interview'),
      enabled: true
    },
    {
      title: 'Career Roadmap',
      description: 'Get your personalized career path',
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/roadmap'),
      enabled: true
    },
    {
      title: 'Portfolio',
      description: 'Showcase your projects and achievements',
      icon: User,
      color: 'from-pink-500 to-pink-600',
      action: () => navigate('/portfolio'),
      enabled: true
    },
    {
      title: 'Progress Tracker',
      description: 'Track your weekly learning progress',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      action: () => navigate('/progress'),
      enabled: true
    }
  ];

  const stats = [
    {
      title: 'Resumes',
      value: portfolioStats.resumes,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      showArrow: true,
      changeType: 'positive'
    },
    {
      title: 'Roadmaps',
      value: portfolioStats.roadmaps,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: 'Try this',
      changeType: 'neutral'
    },
    {
      title: 'Skill Gaps',
      value: portfolioStats.skillGaps,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'skill',
      showArrow: true,
      changeType: 'neutral'
    },
    {
      title: 'Interviews',
      value: portfolioStats.interviews,
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'progress',
      showArrow: true,
      changeType: 'neutral'
    }
  ];

  // Activity icon mapping
  const getActivityIcon = (action) => {
    const iconMap = {
      'Skills gap analysis': Target,
      'Resume Building': FileText,
      'Interview simulation': MessageCircle,
      'Career roadmaps': BookOpen,
      'Portfolio update': User,
      'Progress tracking': BarChart3
    };
    return iconMap[action] || Target;
  };

  // Format time ago
  const getTimeAgo = (date, status) => {
    if (status === 'pending' || !date) return 'pending';
    
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  // Use real activities from backend (no fallback needed)
  // Group by action and show only the latest for each action type
  const groupedActivities = activities.reduce((acc, activity) => {
    const existing = acc.find(a => a.action === activity.action);
    
    if (!existing) {
      acc.push(activity);
    } else {
      // Keep the one with latest status (completed > pending)
      // Or if same status, keep the latest one by date
      const existingDate = new Date(existing.updatedAt || existing.createdAt);
      const currentDate = new Date(activity.updatedAt || activity.createdAt);
      
      if (activity.status === 'completed' && existing.status === 'pending') {
        // Replace pending with completed
        const index = acc.indexOf(existing);
        acc[index] = activity;
      } else if (activity.status === existing.status && currentDate > existingDate) {
        // Same status, keep latest
        const index = acc.indexOf(existing);
        acc[index] = activity;
      }
    }
    
    return acc;
  }, []);
  
  const displayedActivities = showAllActivities ? groupedActivities : groupedActivities.slice(0, 2);

  const upcomingTasks = [
    {
      task: 'Complete React certifications',
      deadline: 'pending',
      priority: 'high'
    },
    {
      task: 'Update LinkedIn profile',
      deadline: 'pending',
      priority: 'medium'
    },
    {
      task: 'Practice system design interview',
      deadline: 'pending',
      priority: 'low'
    }
  ];

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
      <main
        className={`
          pt-16 sm:pt-20 transition-all duration-300 min-h-screen
          ${isMobile ? 'pl-0 pr-0' : isSidebarCollapsed ? 'pl-16' : 'pl-64'}
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                  Welcome, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-300 mt-1">
                  {careerGoal 
                    ? `Working towards: ${careerGoal.targetRole || 'Your career goal'}`
                    : "Let's set up your career goals to get started"
                  }
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-xl px-4 py-2.5 border border-white/10 backdrop-blur-md shadow-lg">
                  <p className="text-base font-bold text-white tracking-tight">Dashboard</p>
                </div>
              </div>
            </div>

            {/* Career Insights */}
            {insights.length > 0 && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="w-full">
                    <h3 className="font-medium text-white mb-3">Quick Recommendations</h3>
                    <div className="space-y-2">
                      {insights.map((insight, index) => (
                        <p key={index} className="text-sm text-gray-300">
                          • {insight.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {insights.length === 0 && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white mb-3">Quick Recommendations</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        • Start by building your professional resume using our AI-powered Resume Builder
                      </p>
                      <p className="text-sm text-gray-300">
                        • Identify your skill gaps with our comprehensive Skill Gap Analysis tool
                      </p>
                      <p className="text-sm text-gray-300">
                        • Practice mock interviews to boost your confidence and performance
                      </p>
                      <p className="text-sm text-gray-300">
                        • Get a personalized career roadmap tailored to your goals and experience
                      </p>
                      <p className="text-sm text-gray-300">
                        • Track your progress and achievements in your Portfolio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                      stat.changeType === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : stat.changeType === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {stat.change}
                    {stat.showArrow && <ArrowUpRight className="w-3 h-3" />}
                  </span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-[#A8B2D1]">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Quick Actions & Recent Activity */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      disabled={!action.enabled}
                      className={`
                        p-4 rounded-xl text-left transition-all duration-200 group
                        ${action.enabled 
                          ? 'bg-gradient-to-r ' + action.color + ' hover:shadow-lg hover:scale-105 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <action.icon className="w-6 h-6" />
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className={`text-sm ${action.enabled ? 'text-white/90' : 'text-gray-500'}`}>
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-[#1E293B] rounded-xl shadow-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Do your Activities</h2>
                  {groupedActivities.length > 2 && (
                    <button 
                      onClick={() => setShowAllActivities(!showAllActivities)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      {showAllActivities ? 'Show Less' : 'View All'}
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {displayedActivities.length > 0 ? (
                    displayedActivities.map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.action);
                      const isPending = activity.status === 'pending';
                      
                      return (
                        <div 
                          key={activity._id} 
                          className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                            isPending 
                              ? 'bg-[#2D3748] border border-yellow-600/50 hover:bg-[#374151] hover:border-yellow-500'
                              : 'bg-[#2D3748] border border-gray-600 hover:bg-[#374151] hover:border-blue-500'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            isPending 
                              ? 'bg-yellow-500/20 group-hover:bg-yellow-500/30'
                              : 'bg-green-500/20 group-hover:bg-green-500/30'
                          }`}>
                            <ActivityIcon className={`w-5 h-5 ${isPending ? 'text-yellow-400' : 'text-green-400'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold group-hover:text-blue-300 transition-colors">{activity.action}</p>
                            <p className={`text-sm transition-colors ${
                              isPending 
                                ? 'text-yellow-400 group-hover:text-yellow-300'
                                : 'text-gray-400 group-hover:text-blue-400'
                            }`}>
                              {getTimeAgo(activity.updatedAt, activity.status)}
                            </p>
                          </div>
                          {isPending ? (
                            <Clock className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      Loading activities...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Widgets */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Upcoming Tasks</h3>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer group">
                      <div className={`
                        w-2 h-2 rounded-full mt-2 flex-shrink-0
                        ${task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                      `} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{task.task}</p>
                        <p className="text-xs text-[#A8B2D1] group-hover:text-blue-300 transition-colors">{task.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-center text-blue-400 hover:text-blue-300 text-sm font-medium py-2 rounded-lg hover:bg-blue-900/20 transition-colors">
                  View Tasks
                </button>
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-white">Learning Curve</h3>
                    <p className="text-xs text-[#A8B2D1] mt-1">Days/Month</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                
                {/* SVG Chart */}
                <div className="relative h-32">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(168, 178, 209, 0.1)" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(168, 178, 209, 0.1)" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(168, 178, 209, 0.1)" strokeWidth="0.5" />
                    
                    {/* Gradient for area fill */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 0}} />
                      </linearGradient>
                    </defs>
                    
                    {/* Area under curve */}
                    <path
                      d="M 0,70 Q 25,45 50,50 T 100,35 Q 125,40 150,45 T 200,55 Q 225,65 250,60 T 300,40 L 300,100 L 0,100 Z"
                      fill="url(#chartGradient)"
                    />
                    
                    {/* Main curve line */}
                    <path
                      d="M 0,70 Q 25,45 50,50 T 100,35 Q 125,40 150,45 T 200,55 Q 225,65 250,60 T 300,40"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    
                    {/* Glowing dots on curve */}
                    <circle cx="100" cy="35" r="3" fill="#3B82F6" opacity="0.8">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="55" r="3" fill="#3B82F6" opacity="0.8">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl border border-yellow-700/30 p-6">
                <div className="text-center">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-2">Achievement Unlocked!</h3>
                  <p className="text-sm text-[#A8B2D1] mb-3">
                    You've Started your first week of career development
                  </p>
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium">
                    Here's Your Badge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;