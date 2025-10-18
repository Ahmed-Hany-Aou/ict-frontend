import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, TrendingUp, Play } from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  progress: number;
  slidesCount: number;
  quizCount: number;
}

interface Progress {
  totalChapters: number;
  completedChapters: number;
  totalSlides: number;
  viewedSlides: number;
  totalQuizzes: number;
  completedQuizzes: number;
  overallProgress: number;
}

// Mock data for demonstration
const mockChapters: Chapter[] = [
  {
    id: 1,
    title: 'Introduction to ICT',
    description: 'Learn the basics of Information and Communication Technology',
    icon: '💻',
    completed: false,
    progress: 60,
    slidesCount: 15,
    quizCount: 3
  },
  {
    id: 2,
    title: 'Computer Hardware',
    description: 'Understanding computer components and architecture',
    icon: '🖥️',
    completed: false,
    progress: 30,
    slidesCount: 20,
    quizCount: 4
  },
  {
    id: 3,
    title: 'Software Fundamentals',
    description: 'Operating systems, applications, and software types',
    icon: '⚙️',
    completed: true,
    progress: 100,
    slidesCount: 18,
    quizCount: 5
  },
  {
    id: 4,
    title: 'Networks & Internet',
    description: 'How computers communicate and share data',
    icon: '🌐',
    completed: false,
    progress: 0,
    slidesCount: 22,
    quizCount: 6
  },
  {
    id: 5,
    title: 'Cybersecurity Basics',
    description: 'Protecting data and understanding online threats',
    icon: '🔒',
    completed: false,
    progress: 0,
    slidesCount: 16,
    quizCount: 4
  },
  {
    id: 6,
    title: 'Digital Media',
    description: 'Working with images, audio, and video files',
    icon: '🎨',
    completed: false,
    progress: 0,
    slidesCount: 14,
    quizCount: 3
  }
];

const mockProgress: Progress = {
  totalChapters: 6,
  completedChapters: 1,
  totalSlides: 105,
  viewedSlides: 42,
  totalQuizzes: 25,
  completedQuizzes: 8,
  overallProgress: 32
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock user data
  const user = { name: 'ana1234567', email: 'ahmed.hany.boshra.2001@gmail.com' };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setChapters(mockChapters);
      setProgress(mockProgress);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLogout = () => {
    alert('Logout clicked! In your app, this will call: await logout(); window.location.href = "/auth";');
  };

const handleChapterClick = (chapterId: number) => {
  navigate(`/chapter/${chapterId}`);
};

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #4a90e2',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontSize: '1.2rem', color: '#23395d', fontWeight: 600 }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 1rem',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ color: '#23395d', margin: 0, marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 700 }}>
            📚 ICT Interactive
          </h1>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '1.1rem' }}>
            Welcome back, <strong style={{ color: '#23395d' }}>{user.name}</strong>!
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.3s',
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Progress Section */}
      {progress && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          marginBottom: '2rem',
          borderLeft: '5px solid #4a90e2'
        }}>
          <h2 style={{ 
            color: '#23395d', 
            marginTop: 0, 
            marginBottom: '1.5rem',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 700
          }}>
            <TrendingUp size={24} /> Your Learning Progress
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#4a90e2', marginBottom: '0.5rem' }}>
                {progress.completedChapters}/{progress.totalChapters}
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.95rem', fontWeight: 600 }}>Chapters Completed</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#28a745', marginBottom: '0.5rem' }}>
                {progress.completedQuizzes}/{progress.totalQuizzes}
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.95rem', fontWeight: 600 }}>Quizzes Completed</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#6f42c1', marginBottom: '0.5rem' }}>
                {progress.overallProgress}%
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.95rem', fontWeight: 600 }}>Overall Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          color: '#23395d', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1.5rem'
        }}>
          <BookOpen size={28} /> Available Chapters
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {chapters.map(chapter => (
            <div
              key={chapter.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                el.style.transform = 'translateY(-5px)';
                el.style.borderColor = '#4a90e2';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'transparent';
              }}
              onClick={() => handleChapterClick(chapter.id)}
            >
              {chapter.completed && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#28a745',
                  color: 'white',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  ✓ COMPLETED
                </div>
              )}
              
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {chapter.icon}
              </div>
              <h3 style={{ 
                color: '#23395d', 
                marginTop: 0, 
                marginBottom: '0.5rem', 
                fontSize: '1.25rem',
                fontWeight: 700
              }}>
                {chapter.title}
              </h3>
              <p style={{ 
                color: '#6c757d', 
                fontSize: '0.95rem', 
                margin: '0.5rem 0 1rem 0', 
                minHeight: '3rem',
                lineHeight: '1.5'
              }}>
                {chapter.description}
              </p>
              
              {/* Progress Bar */}
              <div style={{ margin: '1rem 0' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#6c757d'
                }}>
                  <span>Progress</span>
                  <span style={{ color: '#4a90e2' }}>{chapter.progress}%</span>
                </div>
                <div style={{
                  height: '10px',
                  background: '#e0e0e0',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${chapter.progress}%`,
                    background: 'linear-gradient(90deg, #4a90e2, #23395d)',
                    transition: 'width 0.3s',
                    borderRadius: '5px'
                  }} />
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                color: '#6c757d', 
                fontSize: '0.9rem',
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: 600 }}>📖 {chapter.slidesCount} slides</span>
                <span style={{ fontWeight: 600 }}>❓ {chapter.quizCount} quizzes</span>
              </div>

              <button 
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: chapter.progress > 0 
                    ? 'linear-gradient(135deg, #28a745, #20c997)' 
                    : 'linear-gradient(135deg, #4a90e2, #23395d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Play size={18} />
                {chapter.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto 0',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '0.9rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        💡 <strong>Note:</strong> This is a preview with mock data. Copy this code to your Dashboard.tsx file!
      </div>
    </div>
  );
}