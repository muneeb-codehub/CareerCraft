import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  TrendingUp,
  Calendar,
  Award,
  Target,
  ArrowLeft,
  Loader,
  FileText,
  Brain,
  MessageCircle,
  Map,
  Briefcase,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressTrackerPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    loadChartData();
  }, [selectedYear]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/weekly-tracker/chart-data?year=${selectedYear}`);
      setChartData(response.data);
    } catch (error) {
      console.error('Error loading chart data:', error);
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

  // Line Chart Configuration
  const lineChartData = chartData ? {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Resume Progress',
        data: chartData.datasets[0]?.data || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Skill Gap Progress',
        data: chartData.datasets[1]?.data || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Interview Progress',
        data: chartData.datasets[2]?.data || [],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Roadmap Progress',
        data: chartData.datasets[3]?.data || [],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  } : null;

  // Bar Chart Configuration
  const barChartData = chartData ? {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Resume',
        data: chartData.datasets[0]?.data || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8
      },
      {
        label: 'Skill Gap',
        data: chartData.datasets[1]?.data || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8
      },
      {
        label: 'Interview',
        data: chartData.datasets[2]?.data || [],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderRadius: 8
      },
      {
        label: 'Roadmap',
        data: chartData.datasets[3]?.data || [],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 8
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#F5F6FF',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 34, 59, 0.95)',
        titleColor: '#F5F6FF',
        bodyColor: '#A8B2D1',
        borderColor: '#2D335A',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#A8B2D1',
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(45, 51, 90, 0.3)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#A8B2D1'
        },
        grid: {
          color: 'rgba(45, 51, 90, 0.3)',
          drawBorder: false
        }
      }
    }
  };

  // Calculate current week's average progress
  const getCurrentProgress = () => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return 0;
    
    const lastIndex = Math.max(0, (chartData.datasets[0]?.data?.length || 1) - 1);
    const sum = chartData.datasets.reduce((acc, dataset) => {
      return acc + (dataset.data?.[lastIndex] || 0);
    }, 0);
    
    return Math.round(sum / chartData.datasets.length);
  };

  const moduleStats = [
    {
      name: 'Resume Builder',
      icon: FileText,
      color: 'blue',
      progress: chartData?.datasets[0].data[chartData.datasets[0].data.length - 1] || 0
    },
    {
      name: 'Skill Gap Analysis',
      icon: Brain,
      color: 'green',
      progress: chartData?.datasets[1].data[chartData.datasets[1].data.length - 1] || 0
    },
    {
      name: 'Interview Practice',
      icon: MessageCircle,
      color: 'pink',
      progress: chartData?.datasets[2].data[chartData.datasets[2].data.length - 1] || 0
    },
    {
      name: 'Career Roadmap',
      icon: Map,
      color: 'purple',
      progress: chartData?.datasets[3].data[chartData.datasets[3].data.length - 1] || 0
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
        showMobileSidebar={showMobileSidebar}
        onToggle={toggleSidebar}
      />

      <main className={`pt-20 transition-all duration-300 ${isMobile ? 'pl-0' : isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-4 inline-flex items-center justify-center w-12 h-12 text-[#C7CCE6] hover:text-white hover:bg-[#1A223B] rounded-xl transition-colors border border-[#2D335A]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-indigo-500" />
                  Progress Tracker
                </h1>
                <p className="text-[#A8B2D1]">
                  Track your career development progress across all modules
                </p>
              </div>
              
              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
          ) : !chartData || chartData.labels.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Progress Data Yet</h3>
              <p className="text-[#A8B2D1]">
                Start working on your career modules to see your progress tracking here!
              </p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Overall Progress */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8" />
                    <span className="text-3xl font-bold">{getCurrentProgress()}%</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Overall Progress</h3>
                  <p className="text-indigo-100 text-sm">Average across all modules</p>
                </div>

                {/* Total Weeks Tracked */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <span className="text-3xl font-bold text-gray-900">{chartData.labels.length}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Weeks Tracked</h3>
                  <p className="text-gray-600 text-sm">In {selectedYear}</p>
                </div>

                {/* Total Tasks */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                    <span className="text-3xl font-bold text-gray-900">{chartData.totalTasks || 0}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Tasks Completed</h3>
                  <p className="text-gray-600 text-sm">Across all modules</p>
                </div>
              </div>

              {/* Module Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {moduleStats.map((module) => (
                  <div key={module.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className={`w-10 h-10 rounded-lg bg-${module.color}-100 flex items-center justify-center mb-3`}>
                      <module.icon className={`w-5 h-5 text-${module.color}-600`} />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-2">{module.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${module.color}-600 h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-white">{module.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-6">Progress Over Time</h2>
                <div className="h-96">
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Module Comparison</h2>
                <div className="h-96">
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgressTrackerPage;
