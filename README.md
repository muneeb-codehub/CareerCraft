# 🚀 CareerCraft

**AI-Powered Career Development Platform**

CareerCraft is a comprehensive career development platform that leverages AI to help users build resumes, practice interviews, analyze skill gaps, and create personalized career roadmaps.

## ✨ Features

### 📄 Resume Builder
- Upload existing resumes (PDF/DOCX) or build from scratch
- AI-powered resume enhancement with ATS scoring
- Real-time suggestions for improvements
- Export to PDF/DOCX formats
- Resume history tracking

### 🎤 Interview Simulator
- AI-driven mock interviews tailored to job roles
- Multiple difficulty levels (Beginner, Intermediate, Advanced, Expert)
- Real-time answer evaluation with detailed feedback
- Performance tracking and history
- Comprehensive scoring on technical accuracy, communication, and more

### 📊 Skill Gap Analysis
- Identify gaps between current skills and target role
- AI-powered skill recommendations
- Learning resource suggestions
- Personalized action plans
- Progress tracking

### 🗺️ Career Roadmap Generator
- Customized career paths based on current skills
- Time-based milestone planning
- Resource recommendations for each phase
- Interactive progress tracking
- Multiple roadmap management

### 📈 Portfolio Dashboard
- Unified view of all career development activities
- Visual progress tracking with charts
- Quick access to all features
- Activity history

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Groq API** - AI capabilities (Llama 3.3 70B)
- **Multer** - File uploads
- **PDF-Parse** - PDF processing
- **Mammoth** - DOCX processing
- **PDFKit** - PDF generation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Groq API Key

### Backend Setup

```bash
cd CareerCraftBackend/server
npm install

# Create .env file with:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend Setup

```bash
cd career-craft-frontend
npm install

# Update API base URL in src/services/api.js if needed
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd CareerCraftBackend/server
npm start
```

### Start Frontend Development Server
```bash
cd career-craft-frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
CareerCraft/
├── career-craft-frontend/          # React frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   ├── store/                  # State management
│   │   └── utils/                  # Utility functions
│   └── public/                     # Static assets
│
├── CareerCraftBackend/
│   └── server/                     # Express backend
│       ├── controllers/            # Route controllers
│       ├── models/                 # Mongoose models
│       ├── routes/                 # API routes
│       ├── utils/                  # Utility functions
│       ├── middlewares/            # Custom middlewares
│       ├── config/                 # Configuration files
│       ├── uploads/                # File uploads
│       └── exports/                # Generated files
```

## 🔑 Key Features Details

### AI Integration
- Powered by Groq's Llama 3.3 70B model
- Context-aware responses
- Natural language processing
- JSON-based structured outputs

### Authentication
- JWT-based authentication
- Secure password hashing
- Protected routes
- Session management

### File Processing
- PDF text extraction
- DOCX parsing
- Resume generation
- Export functionality

## 🌟 Future Enhancements

- [ ] Real-time collaborative resume editing
- [ ] Video interview practice
- [ ] Job matching algorithm
- [ ] Social features (mentorship, networking)
- [ ] Mobile app
- [ ] LinkedIn integration
- [ ] Advanced analytics dashboard

## 👨‍💻 Developer

**Muneeb Arif**
- GitHub: [@muneeb-codehub](https://github.com/muneeb-codehub)
- Email: muneebarif226@gmail.com

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Groq for AI capabilities
- MongoDB for database
- All open-source libraries used in this project

---

**Built with ❤️ by Muneeb Arif**
