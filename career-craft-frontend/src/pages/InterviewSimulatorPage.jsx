import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  Loader,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Target,
  Clock,
  AlertCircle,
  ChevronRight,
  Bot,
  User,
  BarChart3,
  Sparkles,
  History,
  Calendar,
  Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { deleteInterview } from '../services/deleteApi';

const InterviewSimulatorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const chatEndRef = useRef(null);

  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Interview Flow State
  const [interviewStage, setInterviewStage] = useState('setup'); // setup, difficulty, interview, results
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Interview Data
  const [interviewSession, setInterviewSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [results, setResults] = useState(null);
  const [aiWarningShown, setAiWarningShown] = useState(false);

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Chat Messages for UI
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      content: '👋 Hello! I\'m your AI Interview Coach. I\'ll help you prepare for your dream job by conducting a realistic interview simulation.',
      timestamp: new Date()
    },
    {
      type: 'ai',
      content: 'Please enter your target job role to begin the interview.',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/interview/history');
      setHistoryData(response.data?.data || []);
    } catch (error) {
      console.error('Error loading interview history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete interview handler
  const handleDeleteInterview = async (interviewId, e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!window.confirm('Are you sure you want to delete this interview session? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteInterview(interviewId);
      await loadHistory(); // Reload history
    } catch (error) {
      console.error('Failed to delete interview:', error);
    }
  };

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
    // Auto-scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Generate Interview Questions
  const handleStartInterview = async () => {
    const trimmedRole = jobRole.trim();
    
    // Validation: Check if job role is meaningful
    if (!trimmedRole) {
      setError('Please enter a job role');
      return;
    }

    // Check if input is too short or not meaningful
    if (trimmedRole.length < 3) {
      setError('Please enter a valid job role');
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: '⚠️ Please enter a valid job role. For example: "Software Engineer", "Data Analyst", "Product Manager", etc.',
          timestamp: new Date()
        }
      ]);
      return;
    }

    // Check if it's just random characters
    const hasValidWords = /^[a-zA-Z\s]+$/.test(trimmedRole);
    if (!hasValidWords) {
      setError('Please enter a valid job role using letters only');
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: '⚠️ Please enter a proper job role using letters only. Examples: "Full Stack Developer", "Marketing Manager", "UI/UX Designer".',
          timestamp: new Date()
        }
      ]);
      return;
    }

    // Move to difficulty selection stage
    setInterviewStage('difficulty');
    setError('');

    setChatMessages(prev => [
      ...prev,
      {
        type: 'user',
        content: trimmedRole,
        timestamp: new Date()
      },
      {
        type: 'ai',
        content: `Perfect! Now, please select the difficulty level for your ${trimmedRole} interview:`,
        timestamp: new Date()
      }
    ]);
  };

  // Generate questions after difficulty selection
  const handleDifficultySelect = async (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setLoading(true);
    setError('');

    // Add user's difficulty choice to chat
    setChatMessages(prev => [
      ...prev,
      {
        type: 'user',
        content: `${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Level`,
        timestamp: new Date()
      },
      {
        type: 'ai',
        content: `Great choice! Generating ${selectedDifficulty} level questions for ${jobRole}...`,
        timestamp: new Date()
      }
    ]);

    try {
      const response = await api.post('/interview/generate', { 
        jobRole,
        difficulty: selectedDifficulty 
      });

      if (response.data.success) {
        setInterviewSession(response.data.data);
        setInterviewStage('interview');

        // Add AI messages
        setChatMessages(prev => [
          ...prev,
          {
            type: 'ai',
            content: `✅ Questions ready! I've prepared 5 interview questions at ${selectedDifficulty} level.`,
            timestamp: new Date()
          },
          {
            type: 'ai',
            content: `This interview consists of:\n• 2 Technical Questions\n• 2 Behavioral Questions\n• 1 Problem-Solving Scenario\n\nTake your time to answer each question thoughtfully.`,
            timestamp: new Date()
          }
        ]);

        // Show first question after a delay
        setTimeout(() => {
          showQuestion(0, response.data.data.questions);
        }, 1000);
      }
    } catch (err) {
      console.error('Error generating interview:', err);
      setError(err.response?.data?.message || 'Failed to generate interview. Please try again.');
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: '❌ Sorry, there was an error generating the interview. Please try again.',
          timestamp: new Date()
        }
      ]);
      setInterviewStage('setup');
    } finally {
      setLoading(false);
    }
  };

  // Show Question in Chat
  const showQuestion = (index, questions) => {
    const question = questions[index];
    const questionNumber = index + 1;

    // Estimate time based on category
    const timeEstimate = {
      'technical': '3-5 minutes',
      'behavioral': '2-3 minutes',
      'problem-solving': '5-7 minutes'
    };

    setChatMessages(prev => [
      ...prev,
      {
        type: 'ai',
        content: `**Question ${questionNumber} of 5**`,
        timestamp: new Date()
      },
      {
        type: 'ai',
        content: `📊 **Category:** ${question.category.charAt(0).toUpperCase() + question.category.slice(1)}\n⏱️ **Estimated Time:** ${timeEstimate[question.category] || '3-5 minutes'}`,
        timestamp: new Date()
      },
      {
        type: 'ai',
        content: question.question,
        timestamp: new Date()
      }
    ]);
  };

  // AI Detection Function
  const detectAIGeneratedAnswer = (answer) => {
    const text = answer.trim();
    
    // Indicators of AI-generated text
    const aiIndicators = {
      // Has emojis (common in AI responses)
      hasEmojis: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(text),
      
      // Perfect structured formatting with headers
      hasHeaders: /\n#{1,6}\s|(\n[A-Z][^.\n]{10,}\n)|🔹|➡|•/g.test(text),
      
      // Multiple bullet points or numbered lists in perfect format
      hasStructuredLists: (text.match(/\n-\s|\n•\s|\n\d\.\s|\n[A-Z]\)/g) || []).length >= 3,
      
      // Overly formal and academic phrases
      formalPhrases: /(Furthermore|Moreover|Additionally|In conclusion|To summarize|It is important to note|It should be noted|It's essential to|First and foremost)/gi.test(text),
      
      // Extremely long and detailed (500+ chars is suspicious for interview)
      tooDetailed: text.length > 500,
      
      // Perfect markdown formatting (bold, italic, code)
      hasMarkdown: /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g.test(text),
      
      // Multiple sections/paragraphs with perfect spacing
      perfectSections: (text.match(/\n\n/g) || []).length >= 2,
      
      // Starts with formal intro phrases
      formalIntro: /^(When considering|When choosing|In order to|To begin with|First of all)/i.test(text),
      
      // AI-specific phrases and patterns
      aiPhrases: /(As an AI|I don't have personal|I cannot|Let me explain|Allow me to|It's worth noting|Here are|Here's|Let's break|break it down|Key (considerations|factors|points)|In summary|To decide)/gi.test(text),
      
      // Has multiple "Use X when Y" patterns (very AI-like)
      hasPatterns: (text.match(/➡\s*Use|Use\s+\w+\s+when/gi) || []).length >= 2,
      
      // Perfect capitalization and grammar with complex sentences
      perfectGrammar: /^[A-Z].*[.!?]$/.test(text) && text.split('. ').length > 4 && text.length > 300
    };

    // Count indicators
    const indicatorCount = Object.values(aiIndicators).filter(Boolean).length;
    
    // If 4 or more indicators present, definitely AI-generated
    return indicatorCount >= 4;
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) {
      setError('Please enter your answer');
      return;
    }

    // Check for AI-generated content
    const isAIGenerated = detectAIGeneratedAnswer(currentAnswer);
    
    if (isAIGenerated && !aiWarningShown) {
      setError('⚠️ Warning: Your answer appears to be AI-generated. Please write in your own words. This is just a warning!');
      setAiWarningShown(true);
      
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: '⚠️ **Warning:** Your answer appears to be AI-generated or copied. Please provide your answer in your own words. Interview answers should reflect your personal knowledge and experience.\n\nThis is your only warning - next submission will be evaluated as-is.',
          timestamp: new Date()
        }
      ]);
      
      return;
    }

    const currentQuestion = interviewSession.questions[currentQuestionIndex];

    // Add user answer to chat
    setChatMessages(prev => [
      ...prev,
      {
        type: 'user',
        content: currentAnswer,
        timestamp: new Date()
      }
    ]);

    // Save answer
    const newAnswer = {
      questionId: currentQuestion._id,
      answer: currentAnswer
    };
    setUserAnswers(prev => [...prev, newAnswer]);
    setCurrentAnswer('');
    setError('');
    setAiWarningShown(false); // Reset for next question

    // Check if more questions remain
    if (currentQuestionIndex < interviewSession.questions.length - 1) {
      // Show next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: '✅ Answer recorded! Moving to the next question...',
          timestamp: new Date()
        }
      ]);

      setTimeout(() => {
        showQuestion(nextIndex, interviewSession.questions);
      }, 1000);
    } else {
      // All questions answered, show processing message
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: '🎉 You\'ve completed all questions! I\'m now evaluating your answers...',
          timestamp: new Date()
        }
      ]);

      // Submit all answers for evaluation
      setTimeout(() => {
        submitAllAnswers([...userAnswers, newAnswer]);
      }, 1500);
    }
  };

  // Submit All Answers for Evaluation
  const submitAllAnswers = async (answers) => {
    setLoading(true);

    try {
      const response = await api.post(`/interview/${interviewSession._id}/submit`, {
        answers
      });

      if (response.data.success) {
        setResults(response.data.data);
        setInterviewStage('results');

        // Show results in chat
        showResults(response.data.data);
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: '❌ Sorry, there was an error evaluating your answers. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Show Results in Chat
  const showResults = (resultsData) => {
    setChatMessages(prev => [
      ...prev,
      {
        type: 'ai',
        content: '📊 **Interview Evaluation Complete!**',
        timestamp: new Date()
      }
    ]);

    // Show each question's result
    resultsData.answers.forEach((answer, index) => {
      const question = interviewSession.questions.find(q => q._id === answer.questionId);
      
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            type: 'ai',
            content: `**Question ${index + 1}: ${question.question}**`,
            timestamp: new Date()
          },
          {
            type: 'ai',
            content: `**Your Answer:**\n${answer.answer}`,
            timestamp: new Date()
          },
          {
            type: 'ai',
            content: `**Ideal Answer:**\n${question.idealAnswer}`,
            timestamp: new Date()
          },
          {
            type: 'ai',
            content: `**Score:** ${answer.score}/100\n\n**Feedback:**\n${answer.feedback}`,
            timestamp: new Date()
          }
        ]);
      }, (index + 1) * 1000);
    });

    // Show overall score at the end
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: `🎯 **Overall Interview Score: ${resultsData.overallScore}/100**`,
          timestamp: new Date()
        },
        {
          type: 'ai',
          content: getScoreFeedback(resultsData.overallScore),
          timestamp: new Date()
        }
      ]);
    }, (resultsData.answers.length + 1) * 1000);
  };

  // Get Score Feedback Message
  const getScoreFeedback = (score) => {
    if (score >= 80) {
      return '🌟 Excellent performance! You demonstrated strong knowledge and communication skills. Keep up the great work!';
    } else if (score >= 60) {
      return '👍 Good job! You have a solid foundation. Focus on improving your technical depth and communication clarity.';
    } else if (score >= 40) {
      return '📚 You\'re on the right track, but there\'s room for improvement. Practice more and deepen your understanding of key concepts.';
    } else {
      return '💪 Don\'t be discouraged! This is a learning opportunity. Review the ideal answers, practice regularly, and you\'ll improve significantly.';
    }
  };

  // Reset Interview
  const handleResetInterview = () => {
    setInterviewStage('setup');
    setJobRole('');
    setDifficulty('');
    setInterviewSession(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCurrentAnswer('');
    setResults(null);
    setAiWarningShown(false);
    setChatMessages([
      {
        type: 'ai',
        content: '👋 Ready for another interview? Enter your target job role to begin!',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen">
      <Navbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      <Sidebar
        isCollapsed={isMobile ? !showMobileSidebar : isSidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        onClose={() => setShowMobileSidebar(false)}
      />

      <main className={`pt-20 transition-all duration-300 ${isMobile ? 'pl-0' : isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <MessageCircle className="w-8 h-8 mr-3 text-green-500" />
                  AI Interview Simulator
                </h1>
                <p className="text-[#A8B2D1]">
                  Practice your interview skills with AI-powered mock interviews
                </p>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 text-[#C7CCE6] hover:text-white hover:bg-[#1A223B] rounded-lg border border-[#2D335A] font-semibold flex items-center gap-2 transition-all"
                style={{backgroundColor: 'rgba(26, 34, 59, 0.6)'}}
              >
                <History className="w-5 h-5" />
                {showHistory ? 'Hide History' : 'View Past Interviews'}
              </button>
            </div>
          </div>

          {/* History View */}
          {showHistory && (
            <div className="mb-6">
              <div className="rounded-2xl shadow-sm p-8" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <History className="w-6 h-6 text-green-600" />
                  Your Interview History
                </h2>
                
                {loadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 text-green-600 animate-spin" />
                  </div>
                ) : historyData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {historyData.map((interview) => (
                      <div
                        key={interview._id}
                        className="p-6 bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-xl border-2 border-green-700/30 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          setResults(interview);
                          setInterviewStage('results');
                          setJobRole(interview.jobRole);
                          setDifficulty(interview.difficulty);
                          setShowHistory(false);
                          
                          // Update chat messages to show the loaded interview
                          setChatMessages([
                            {
                              type: 'ai',
                              content: '📋 Loading your previous interview results...',
                              timestamp: new Date()
                            },
                            {
                              type: 'ai',
                              content: `**Interview:** ${interview.jobRole}\n**Difficulty:** ${interview.difficulty}\n**Date:** ${new Date(interview.createdAt).toLocaleDateString()}\n\n✅ Interview results loaded successfully! Scroll down to see your detailed performance.`,
                              timestamp: new Date()
                            }
                          ]);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1">
                              {interview.jobRole}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-[#A8B2D1] mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(interview.createdAt).toLocaleDateString()}
                              </span>
                              {interview.difficulty && (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  interview.difficulty === 'easy' ? 'bg-green-900/40 text-green-300' :
                                  interview.difficulty === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                                  'bg-red-900/40 text-red-300'
                                }`}>
                                  {interview.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteInterview(interview._id, e)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete interview"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Questions:</span>
                            <span className="font-semibold text-gray-900">{interview.questions?.length || 5}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Overall Score:</span>
                            <span className="font-bold text-green-600">{interview.overallScore || 'N/A'}/100</span>
                          </div>
                          {interview.overallFeedback && (
                            <p className="text-sm text-[#A8B2D1] mt-2 line-clamp-2">
                              {interview.overallFeedback.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No interview history yet. Start your first mock interview!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Container */}
          <div className="rounded-2xl shadow-sm overflow-hidden" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Interview Coach</h3>
                    <p className="text-xs text-green-100">
                      {interviewStage === 'setup' && 'Ready to start'}
                      {interviewStage === 'difficulty' && 'Select difficulty'}
                      {interviewStage === 'interview' && `Question ${currentQuestionIndex + 1}/5`}
                      {interviewStage === 'results' && 'Interview Complete'}
                    </p>
                  </div>
                </div>
                {interviewStage === 'results' && (
                  <button
                    onClick={handleResetInterview}
                    className="px-4 py-2 bg-white text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    New Interview
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6" style={{backgroundColor: 'rgba(20, 26, 50, 0.4)'}}>
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'ai' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {message.type === 'ai' ? (
                          <Bot className="w-5 h-5 text-green-600" />
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.type === 'ai'
                            ? 'text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                        style={message.type === 'ai' ? {backgroundColor: 'rgba(26, 34, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)'} : {}}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.type === 'ai' ? 'text-[#A8B2D1]' : 'text-blue-100'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl" style={{backgroundColor: 'rgba(26, 34, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                        <div className="flex items-center space-x-2">
                          <Loader className="w-4 h-4 animate-spin text-green-400" />
                          <span className="text-sm text-[#A8B2D1]">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {interviewStage === 'setup' && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStartInterview()}
                    placeholder="Type your job role (e.g., Software Engineer, Data Analyst)..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    onClick={handleStartInterview}
                    disabled={loading || !jobRole.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Next</span>
                  </button>
                </div>
              )}

              {interviewStage === 'difficulty' && (
                <div className="space-y-3">
                  <p className="text-sm text-[#A8B2D1] text-center mb-4">Choose your interview difficulty level:</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleDifficultySelect('easy')}
                      disabled={loading}
                      className="p-4 bg-green-900/30 border-2 border-green-700/40 rounded-xl hover:bg-green-900/50 hover:border-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">😊</div>
                        <h4 className="font-semibold text-green-400">Easy</h4>
                        <p className="text-xs text-[#A8B2D1] mt-1">Basic concepts</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDifficultySelect('medium')}
                      disabled={loading}
                      className="p-4 bg-yellow-900/30 border-2 border-yellow-700/40 rounded-xl hover:bg-yellow-900/50 hover:border-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🤔</div>
                        <h4 className="font-semibold text-yellow-400">Medium</h4>
                        <p className="text-xs text-[#A8B2D1] mt-1">Intermediate level</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDifficultySelect('hard')}
                      disabled={loading}
                      className="p-4 bg-red-900/30 border-2 border-red-700/40 rounded-xl hover:bg-red-900/50 hover:border-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔥</div>
                        <h4 className="font-semibold text-red-400">Hard</h4>
                        <p className="text-xs text-[#A8B2D1] mt-1">Expert level</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {interviewStage === 'interview' && (
                <div className="flex space-x-2">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={3}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={loading || !currentAnswer.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}

              {interviewStage === 'results' && (
                <div className="text-center py-4">
                  <p className="text-[#A8B2D1] mb-3">Interview completed! Review your results above.</p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={handleResetInterview}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200"
                    >
                      Start New Interview
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Cards */}
          {interviewStage === 'setup' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-4">
                <Target className="w-8 h-8 text-blue-400 mb-2" />
                <h4 className="font-semibold text-white mb-1">Realistic Questions</h4>
                <p className="text-sm text-[#A8B2D1]">
                  Get industry-standard questions tailored to your role
                </p>
              </div>
              <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-4">
                <BarChart3 className="w-8 h-8 text-green-400 mb-2" />
                <h4 className="font-semibold text-white mb-1">AI Evaluation</h4>
                <p className="text-sm text-[#A8B2D1]">
                  Receive detailed feedback and scores for each answer
                </p>
              </div>
              <div className="bg-purple-900/30 border border-purple-700/30 rounded-xl p-4">
                <Award className="w-8 h-8 text-purple-400 mb-2" />
                <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                <p className="text-sm text-[#A8B2D1]">
                  Monitor your improvement over multiple interviews
                </p>
              </div>
            </div>
          )}

          {/* Results Display Section */}
          {interviewStage === 'results' && results && (
            <div className="mt-6 space-y-6">
              {/* Overall Performance Card */}
              <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Award className="w-6 h-6 text-green-500 mr-2" />
                  Interview Performance Summary
                </h2>
                
                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-900/30 rounded-xl border border-green-700/30">
                    <div className="text-3xl font-bold text-green-400">
                      {results.overallScore || (results.answers ? Math.round(results.answers.reduce((sum, ans) => sum + (ans.score || 0), 0) / results.answers.length) : 0)}/100
                    </div>
                    <div className="text-sm text-[#A8B2D1] mt-1">Overall Score</div>
                  </div>
                  <div className="text-center p-4 bg-blue-900/30 rounded-xl border border-blue-700/30">
                    <div className="text-3xl font-bold text-blue-400">{results.answers?.length || results.questions?.length || 5}</div>
                    <div className="text-sm text-[#A8B2D1] mt-1">Questions Answered</div>
                  </div>
                  <div className="text-center p-4 bg-purple-900/30 rounded-xl border border-purple-700/30">
                    <div className="text-3xl font-bold text-purple-400">{difficulty || results.difficulty || 'N/A'}</div>
                    <div className="text-sm text-[#A8B2D1] mt-1">Difficulty Level</div>
                  </div>
                </div>

                {/* Overall Feedback */}
                {results.overallFeedback && (
                  <div className="p-4 rounded-xl" style={{backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)'}}>
                    <h3 className="font-semibold text-white mb-2 flex items-center">
                      <Sparkles className="w-5 h-5 text-green-400 mr-2" />
                      AI Feedback
                    </h3>
                    <p className="text-[#A8B2D1] whitespace-pre-line">{results.overallFeedback}</p>
                  </div>
                )}
              </div>

              {/* Question-by-Question Breakdown */}
              {results.answers && results.answers.length > 0 && (
                <div className="rounded-2xl shadow-sm p-6" style={{backgroundColor: 'rgba(26, 34, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)'}}>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 text-blue-500 mr-2" />
                    Detailed Question Analysis
                  </h2>
                  
                  <div className="space-y-4">
                    {results.answers.map((answer, index) => {
                      const question = results.questions?.find(q => q._id === answer.questionId) || {};
                      return (
                        <div key={index} className="p-4 rounded-xl" style={{backgroundColor: 'rgba(26, 34, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-white flex-1 mr-4">
                              <span className="text-blue-400">Question {index + 1}:</span> {question.question || 'Question not available'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ${
                              (answer.score || 0) >= 80 ? 'bg-green-900/40 text-green-300' :
                              (answer.score || 0) >= 60 ? 'bg-yellow-900/40 text-yellow-300' :
                              'bg-red-900/40 text-red-300'
                            }`}>
                              {answer.score || 0}/100
                            </span>
                          </div>
                          
                          {answer.answer && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-blue-400 mb-1">Your Answer:</p>
                              <p className="text-sm text-[#A8B2D1] pl-4 border-l-2 border-blue-500">{answer.answer}</p>
                            </div>
                          )}
                          
                          {answer.feedback && (
                            <div>
                              <p className="text-sm font-medium text-green-400 mb-1">AI Evaluation:</p>
                              <p className="text-sm text-[#A8B2D1] pl-4 border-l-2 border-green-500 whitespace-pre-line">{answer.feedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewSimulatorPage;
