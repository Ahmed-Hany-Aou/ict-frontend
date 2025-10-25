import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, TrendingUp, Play, FileQuestion } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChapterService from '../services/chapterService';

interface Chapter {
  id: number;
  title: string;
  description: string;
  chapter_number: number;
  progress_percentage: number;
  status: string;
  slides_count: number;
  completed_slides: number;
  is_premium: boolean;
}

interface Progress {
  total_chapters: number;
  completed_chapters: number;
  total_slides: number;
  completed_slides: number;
  overall_progress: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [chaptersData, progressData] = await Promise.all([
        ChapterService.getChapters(),
        ChapterService.getUserProgress(),
      ]);

      setChapters(chaptersData);
      setProgress(progressData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleChapterClick = (chapterId: number) => {
   // navigate(`/dashboard/chapter/${chapterId}`);
    navigate(`/chapter/${chapterId}/slides`);
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

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Error</h2>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={loadDashboardData}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Map icon emojis based on chapter number
  const getChapterIcon = (chapterNumber: number) => {
    const icons: { [key: number]: string } = {
      1: '💻',
      2: '🖥️',
      3: '⚙️',
      4: '🌐',
      5: '🔒',
      6: '🎨',
    };
    return icons[chapterNumber] || '📚';
  };

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
            Welcome back, <strong style={{ color: '#23395d' }}>{user?.name || 'Student'}</strong>!
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
                {progress.completed_chapters}/{progress.total_chapters}
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
                {progress.completed_slides}/{progress.total_slides}
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.95rem', fontWeight: 600 }}>Slides Completed</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#6f42c1', marginBottom: '0.5rem' }}>
                {progress.overall_progress}%
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
              onClick={() => handleChapterClick(chapter.id)}
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
            >
              {chapter.status === 'completed' && (
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
                {getChapterIcon(chapter.chapter_number)}
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
                  <span style={{ color: '#4a90e2' }}>{chapter.progress_percentage}%</span>
                </div>
                <div style={{
                  height: '10px',
                  background: '#e0e0e0',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${chapter.progress_percentage}%`,
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
                <span style={{ fontWeight: 600 }}>📖 {chapter.slides_count} slides</span>
                <span style={{ fontWeight: 600 }}>✓ {chapter.completed_slides} done</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    background: chapter.progress_percentage > 0
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
                    e.stopPropagation();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChapterClick(chapter.id);
                  }}
                >
                  <Play size={18} />
                  {chapter.progress_percentage > 0 ? 'Continue' : 'Start'}
                </button>

                <button
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #f39c12, #e67e22)',
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
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.4)';
                    e.stopPropagation();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chapter/${chapter.id}/quiz`);
                  }}
                >
                  <FileQuestion size={18} />
                  Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;