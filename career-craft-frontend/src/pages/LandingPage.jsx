import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield,
  Zap,
  BarChart3,
  Smartphone,
  Lock,
  Headphones,
  FileText,
  Target,
  MessageCircle,
  Map,
  Briefcase,
  TrendingUp,
  Code,
  Cloud,
  Users,
  CheckCircle,
  ArrowRight,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Refined animation styles - Professional SaaS motion design
const floatingStyles = `
  /* Hero Orbit Animation - Premium SaaS Positioning */
  @keyframes orbit {
    0% { transform: rotate(0deg) translateX(185px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(185px) rotate(-360deg); }
  }
  
  /* Micro-interaction animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Orbit badges - Precisely balanced around central circle */
  .orbit-badge-1 {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -28px 0 0 -105px;
    animation: orbit 24s linear infinite;
  }
  
  .orbit-badge-2 {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -28px 0 0 -105px;
    animation: orbit 24s linear infinite;
    animation-delay: -8s;
  }
  
  .orbit-badge-3 {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -28px 0 0 -105px;
    animation: orbit 24s linear infinite;
    animation-delay: -16s;
  }
  
  /* Hover-only animations - NO idle motion */
  .card-hover {
    will-change: transform;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .card-hover:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
  }
  
  .button-hover {
    will-change: transform;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .button-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
  }
  
  .button-hover:active {
    transform: translateY(0px);
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs for GSAP animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const whyChooseRef = useRef(null);
  const testimonialsRef = useRef(null);

  const stats = [
    { value: '500+', label: 'Users Connected' },
    { value: '1M+', label: 'Careers Planned' },
    { value: '99.9%', label: 'Success Rate' }
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'AI-Powered Career Planning',
      description: 'Advanced machine learning algorithms for accurate career roadmap and predictions',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-Time Results',
      description: 'Get instant notifications and access to personalized career insights within minutes',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: 'Cloud Storage',
      description: 'Secure cloud-based storage for all your resumes, portfolios and career documents',
      gradient: 'from-pink-500 to-red-500'
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile Access',
      description: 'Access your career data anytime, anywhere from any device',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Privacy Compliant',
      description: 'Enterprise-grade security ensuring complete data privacy and protection',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support and technical assistance',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const services = [
    {
      icon: <FileText className="w-10 h-10" />,
      title: 'Resume Builder',
      description: 'Complete digital solution for creating professional resumes with AI-powered suggestions and ATS optimization',
      link: '/resume'
    },
    {
      icon: <Smartphone className="w-10 h-10" />,
      title: 'Skill Gap Analysis',
      description: 'Identify your skill gaps and get personalized learning recommendations',
      link: '/skill-gap'
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: 'Interview Simulator',
      description: 'Practice interviews with AI-powered mock interviews and get instant feedback',
      link: '/interview'
    },
    {
      icon: <Map className="w-10 h-10" />,
      title: 'Career Roadmap',
      description: 'Get personalized career roadmaps with milestones and learning resources',
      link: '/roadmap'
    },
    {
      icon: <Briefcase className="w-10 h-10" />,
      title: 'Portfolio Tracker',
      description: 'Track all your career progress, achievements and goals in one place',
      link: '/portfolio'
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: 'Progress Tracker',
      description: 'Monitor your career growth with detailed analytics and insights',
      link: '/progress'
    }
  ];

  const whyChoose = [
    {
      title: 'Innovation First',
      description: 'Cutting-edge AI technology and continuous product improvements',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Lightning Speed',
      description: 'Get results in minutes, not days, with our optimized systems',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Expert Support',
      description: 'Dedicated customer success team available 24/7 for assistance',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Affordable Pricing',
      description: 'Transparent pricing with flexible plans that scale with your needs',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Trusted Security',
      description: 'Bank-level encryption and compliance for data protection',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Proven Results',
      description: 'Trusted by 500+ users with 99.9% accuracy and satisfaction rate',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      content: 'CareerCraft helped me land my dream job! The resume builder and interview simulator were absolute game-changers.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager at Microsoft',
      content: 'The AI-powered career roadmap gave me crystal-clear direction. Best investment in my career growth!',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Data Analyst at Amazon',
      content: 'Amazing platform! The skill gap analysis helped me identify exactly what I needed to learn to level up.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'UX Designer at Figma',
      content: 'The portfolio builder showcased my work perfectly. Got 3x more interview calls after using CareerCraft!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Marketing Manager at Shopify',
      content: 'Incredibly intuitive and powerful. The career insights were spot-on and helped me negotiate a better offer.',
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // GSAP Scroll Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      
      // Hero Section - Initial Load Animation
      const heroTimeline = gsap.timeline();
      heroTimeline
        .from('.hero-heading', {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        })
        .from('.hero-subheading', {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'all'
        }, '-=0.4')
        .from('.hero-buttons', {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'all'
        }, '-=0.3')
        .from('.hero-stats', {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all'
        }, '-=0.2');
      
      // Features Section - Scroll Trigger with Stagger
      if (featuresRef.current) {
        const featureCards = featuresRef.current.querySelectorAll('.feature-card');
        
        gsap.from('.feature-heading', {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        });
        
        if (featureCards.length > 0) {
          gsap.from(featureCards, {
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            clearProps: 'all'
          });
        }
      }
      
      // About Section - Scroll Trigger
      if (aboutRef.current) {
        const aboutContent = aboutRef.current.querySelector('.about-content');
        const aboutVisual = aboutRef.current.querySelector('.about-visual');
        const missionCards = aboutRef.current.querySelectorAll('.about-mission-card');
        
        if (aboutContent) {
          gsap.from(aboutContent, {
            scrollTrigger: {
              trigger: aboutRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            x: -40,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'all'
          });
        }
        
        if (aboutVisual) {
          gsap.from(aboutVisual, {
            scrollTrigger: {
              trigger: aboutRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            x: 40,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'all'
          });
        }
        
        if (missionCards.length > 0) {
          gsap.from(missionCards, {
            scrollTrigger: {
              trigger: aboutRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            duration: 0.7,
            stagger: 0.2,
            ease: 'power3.out',
            clearProps: 'all'
          });
        }
      }
      
      // Services Section - Scroll Trigger with Stagger
      if (servicesRef.current) {
        const serviceCards = servicesRef.current.querySelectorAll('.service-card');
        
        gsap.from('.services-heading', {
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        });
        
        if (serviceCards.length > 0) {
          gsap.from(serviceCards, {
            scrollTrigger: {
              trigger: servicesRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'all'
          });
        }
      }
      
      // Why Choose Section - Scroll Trigger
      if (whyChooseRef.current) {
        const whyChooseCards = whyChooseRef.current.querySelectorAll('.why-choose-card');
        
        gsap.from('.why-choose-heading', {
          scrollTrigger: {
            trigger: whyChooseRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        });
        
        if (whyChooseCards.length > 0) {
          gsap.from(whyChooseCards, {
            scrollTrigger: {
              trigger: whyChooseRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'all'
          });
        }
      }
      
      // Testimonials Section - Scroll Trigger
      if (testimonialsRef.current) {
        gsap.from('.testimonials-heading', {
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        });
        
        const testimonialCard = testimonialsRef.current.querySelector('.testimonial-card');
        if (testimonialCard) {
          gsap.from(testimonialCard, {
            scrollTrigger: {
              trigger: testimonialsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'all'
          });
        }
      }
      
      // Subtle Parallax on Background Elements (Very Subtle)
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      parallaxElements.forEach((element) => {
        gsap.to(element, {
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          },
          y: -30,
          ease: 'none'
        });
      });
      
    });
    
    return () => ctx.revert(); // Cleanup
  }, []);

  const handleServiceClick = (link) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to explore and use our features!');
      navigate('/login');
    } else {
      navigate(link);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1729] via-[#1a1f3a] to-[#0F1729]">
      {/* Add floating animation styles */}
      <style>{floatingStyles}</style>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1729]/90 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">CareerCraft</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <button onClick={() => scrollToSection('home')} className="text-white hover:text-purple-400 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-white hover:text-purple-400 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('about')} className="text-white hover:text-purple-400 transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('services')} className="text-white hover:text-purple-400 transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-white hover:text-purple-400 transition-colors">
                Testimonials
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 lg:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm sm:text-base rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg touch-manipulation"
              >
                Login
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-white/10 pt-4">
              <button onClick={() => { scrollToSection('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Home
              </button>
              <button onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Features
              </button>
              <button onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                About
              </button>
              <button onClick={() => { scrollToSection('services'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Services
              </button>
              <button onClick={() => { scrollToSection('testimonials'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Testimonials
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" ref={heroRef} className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <h1 className="hero-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Welcome to
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  CareerCraft
                </span>
              </h1>
              <p className="hero-subheading text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0">
                Revolutionizing Career Growth with AI-Powered Tools. Seamless resume building, instant career insights, and intelligent planning for a successful tomorrow.
              </p>
              
              <div className="hero-buttons flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center md:justify-start">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg transition-all shadow-lg flex items-center gap-2 font-semibold button-hover"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="px-8 py-3 border-2 border-white/20 text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 font-semibold"
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="hero-stats">
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual - Hero Illustration with Precise Orbit */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                {/* Central Circle - Premium anchor point */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-52 h-52 bg-gradient-to-br from-purple-500/25 to-blue-500/25 rounded-full flex items-center justify-center backdrop-blur-2xl border-2 border-purple-400/30 shadow-2xl shadow-purple-500/25">
                    <div className="w-44 h-44 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full flex items-center justify-center border border-purple-400/20">
                      <Target className="w-20 h-20 text-white drop-shadow-2xl" />
                    </div>
                  </div>
                </div>

                {/* Orbiting Badges - Premium SaaS spacing */}
                <div className="orbit-badge-1">
                  <div className="px-5 py-3 bg-[#1a1f3a]/95 backdrop-blur-2xl rounded-2xl border border-blue-400/40 flex items-center gap-3 shadow-xl shadow-blue-500/25 hover:scale-105 hover:border-blue-400/60 transition-all duration-300">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-xl flex items-center justify-center border border-blue-400/30">
                      <Shield className="w-5 h-5 text-blue-300" />
                    </div>
                    <span className="text-sm font-semibold text-white whitespace-nowrap tracking-wide">Secure & Encrypted</span>
                  </div>
                </div>

                <div className="orbit-badge-2">
                  <div className="px-5 py-3 bg-[#1a1f3a]/95 backdrop-blur-2xl rounded-2xl border border-purple-400/40 flex items-center gap-3 shadow-xl shadow-purple-500/25 hover:scale-105 hover:border-purple-400/60 transition-all duration-300">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-xl flex items-center justify-center border border-purple-400/30">
                      <Zap className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="text-sm font-semibold text-white whitespace-nowrap tracking-wide">Lightning Fast</span>
                  </div>
                </div>

                <div className="orbit-badge-3">
                  <div className="px-5 py-3 bg-[#1a1f3a]/95 backdrop-blur-2xl rounded-2xl border border-emerald-400/40 flex items-center gap-3 shadow-xl shadow-emerald-500/25 hover:scale-105 hover:border-emerald-400/60 transition-all duration-300">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-xl flex items-center justify-center border border-emerald-400/30">
                      <BarChart3 className="w-5 h-5 text-emerald-300" />
                    </div>
                    <span className="text-sm font-semibold text-white whitespace-nowrap tracking-wide">Real-time Analytics</span>
                  </div>
                </div>

                {/* Premium background glow layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-blue-500/8 rounded-full blur-3xl -z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 px-6 bg-[#0F1729]/50">
        <div className="container mx-auto">
          <div className="feature-heading text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg">Experience the future of career management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card p-6 bg-gradient-to-br from-[#1a1f3a]/80 to-[#0F1729]/80 backdrop-blur-lg rounded-2xl border border-white/10 card-hover"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Visual - Simplified, no excessive motion */}
            <div className="about-visual relative parallax-bg">
              <div className="w-80 h-80 mx-auto relative">
                {/* Subtle background glow only */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute inset-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/30 flex items-center justify-center backdrop-blur-xl">
                  <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    <Target className="w-24 h-24 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="about-content">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">About CareerCraft</h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                CareerCraft is a cutting-edge career development platform that bridges the gap between ambition and achievement. Founded with a vision to democratize career growth, we leverage artificial intelligence and cloud computing to deliver faster, more accurate career planning services.
              </p>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Our mission is to empower professionals with intelligent tools that streamline workflows, reduce uncertainty, and improve career outcomes. We believe in making quality career guidance accessible to everyone, everywhere.
              </p>

              <div className="space-y-6">
                <div className="about-mission-card flex items-start gap-4 p-4 bg-[#1a1f3a]/50 rounded-xl border border-blue-500/30 card-hover">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                    <p className="text-gray-400">
                      Transform career development through innovative technology and AI-driven solutions
                    </p>
                  </div>
                </div>

                <div className="about-mission-card flex items-start gap-4 p-4 bg-[#1a1f3a]/50 rounded-xl border border-purple-500/30 card-hover">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
                    <p className="text-gray-400">
                      A world where quality career guidance is accessible, affordable, and intelligent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" ref={servicesRef} className="py-20 px-6 bg-[#0F1729]/50">
        <div className="container mx-auto">
          <div className="services-heading text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-gray-400 text-lg">Comprehensive solutions for modern career development</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => handleServiceClick(service.link)}
                className="service-card p-8 bg-gradient-to-br from-[#1a1f3a]/80 to-[#0F1729]/80 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer group card-hover"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:border-blue-500/60">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{service.description}</p>
                <button className="text-blue-400 text-sm flex items-center gap-2 group-hover:gap-3 transition-all duration-300 font-medium">
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section ref={whyChooseRef} className="py-20 px-6">
        <div className="container mx-auto">
          <div className="why-choose-heading text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose CareerCraft</h2>
            <p className="text-gray-400 text-lg">Leading the career development revolution</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyChoose.map((item, index) => (
              <div
                key={index}
                className="why-choose-card p-6 bg-gradient-to-br from-[#1a1f3a]/80 to-[#0F1729]/80 backdrop-blur-lg rounded-xl border border-white/10 flex items-start gap-4 card-hover"
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Premium Glamorous Design */}
      <section id="testimonials" ref={testimonialsRef} className="py-20 px-6 bg-[#0F1729]/50 overflow-hidden">
        <div className="container mx-auto">
          <div className="testimonials-heading text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-gray-400 text-lg">Join 500+ career-driven individuals who transformed their journey</p>
          </div>

          {/* Center-Focused Premium Slider */}
          <div className="max-w-6xl mx-auto relative">
            <div className="flex items-center justify-center gap-6">
              {testimonials.map((testimonial, index) => {
                const isActive = index === activeTestimonial;
                const isPrev = index === (activeTestimonial - 1 + testimonials.length) % testimonials.length;
                const isNext = index === (activeTestimonial + 1) % testimonials.length;
                const isVisible = isActive || isPrev || isNext;
                
                return (
                  <div
                    key={index}
                    className={`testimonial-card transition-all duration-700 ease-out ${
                      !isVisible ? 'hidden' : ''
                    } ${
                      isActive 
                        ? 'scale-100 opacity-100 z-20 w-full md:w-[500px]' 
                        : 'scale-90 opacity-40 blur-[2px] z-10 w-full md:w-[400px] hidden md:block'
                    }`}
                    style={{
                      transform: isActive 
                        ? 'translateX(0) scale(1)' 
                        : isPrev 
                          ? 'translateX(-20px) scale(0.9)' 
                          : 'translateX(20px) scale(0.9)',
                      willChange: 'transform, opacity'
                    }}
                  >
                    {/* Glassmorphism Card with Premium Styling */}
                    <div className={`relative p-8 rounded-3xl backdrop-blur-2xl transition-all duration-500 card-hover ${
                      isActive 
                        ? 'bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-purple-600/20 border-2 border-purple-400/50 shadow-2xl shadow-purple-500/25' 
                        : 'bg-[#1a1f3a]/60 border border-white/10'
                    }`}>
                      {/* Premium Glow Effect on Active Card */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl -z-10"></div>
                      )}
                      
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      
                      {/* Testimonial Content */}
                      <p className={`text-lg mb-8 leading-relaxed italic transition-colors ${
                        isActive ? 'text-gray-100' : 'text-gray-300'
                      }`}>
                        "{testimonial.content}"
                      </p>
                      
                      {/* User Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg transition-colors ${
                            isActive ? 'text-white' : 'text-gray-300'
                          }`}>
                            {testimonial.name}
                          </h4>
                          <p className="text-purple-400 text-sm font-medium">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Premium Navigation Dots */}
            <div className="flex justify-center gap-3 mt-12">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeTestimonial 
                      ? 'w-10 h-3 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/50' 
                      : 'w-3 h-3 bg-gray-600 hover:bg-gray-500 hover:scale-125'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join 500+ professionals already using CareerCraft to achieve faster, smarter career growth
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-gradient-to-r from-purple-700 to-blue-700 text-white rounded-lg shadow-xl font-bold text-lg flex items-center gap-2 mx-auto hover:from-purple-800 hover:to-blue-800 hover:scale-105 transition-all duration-300"
          >
            Get Started with CareerCraft <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#0F1729] border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CareerCraft</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Revolutionizing career growth with AI-powered solutions. Making quality career guidance accessible to everyone, everywhere.
              </p>
              <div className="flex gap-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a href="mailto:contact@careercraft.com" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('home')} className="block text-gray-400 hover:text-white transition-colors">
                  Home
                </button>
                <button onClick={() => scrollToSection('features')} className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </button>
                <button onClick={() => scrollToSection('services')} className="block text-gray-400 hover:text-white transition-colors">
                  Services
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="block text-gray-400 hover:text-white transition-colors">
                  Testimonials
                </button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold mb-4">Services</h3>
              <div className="space-y-2">
                <button onClick={() => handleServiceClick('/resume')} className="block text-gray-400 hover:text-white transition-colors">
                  Resume Builder
                </button>
                <button onClick={() => handleServiceClick('/skill-gap')} className="block text-gray-400 hover:text-white transition-colors">
                  Skill Gap Analysis
                </button>
                <button onClick={() => handleServiceClick('/interview')} className="block text-gray-400 hover:text-white transition-colors">
                  Interview Simulator
                </button>
                <button onClick={() => handleServiceClick('/roadmap')} className="block text-gray-400 hover:text-white transition-colors">
                  Career Roadmap
                </button>
                <button onClick={() => handleServiceClick('/portfolio')} className="block text-gray-400 hover:text-white transition-colors">
                  Portfolio Tracker
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-400 text-sm">Digital Genei, Pakistan</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">+92 345 754 6228</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">contact@MuneebCareerCraft.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>&copy; 2025 CareerCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
