import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Home, Award, ChevronDown, Loader, PlayCircle, Calendar, Video, ExternalLink } from 'lucide-react';
import api from '../services/api'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// API Helper Functions

// Type Definitions
interface Chapter {
  id: number;
  title: string;
  description: string;
  chapter_number: number;
  video_url?: string | null;
  video_type?: 'none' | 'scheduled' | 'recorded';
  meeting_link?: string | null;
  meeting_datetime?: string | null;
  is_upcoming?: boolean;
}

interface Slide {
  id: number;
  chapter_id: number;
  slide_number: number;
  type: string;
  content: any;
  is_completed?: boolean;
}

export default function SlideViewer() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [showExplanations, setShowExplanations] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapterCompleted, setChapterCompleted] = useState(false);

  // Get chapter ID from URL parameters
  const { id } = useParams<{ id: string }>();
  console.log('Raw id from URL:', id);
  const chapterIdNumber = parseInt(id || '1', 10);
  console.log('Parsed chapterIdNumber:', chapterIdNumber);

  useEffect(() => {
    loadChapterData();
  }, [chapterIdNumber]);

// ... inside src/pages/SlideViewer.tsx

  const loadChapterData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch chapter info and slides
      const [chapterResponse, slidesResponse] = await Promise.all([
        api.get(`/chapters/${chapterIdNumber}`),
        api.get(`/chapters/${chapterIdNumber}/slides`)
      ]);

      console.log('Chapter Response:', chapterResponse);
      console.log('Slides Response:', slidesResponse);

      // ----------------------------------------------
      // 👇 FIX 1: SAFER DATA PARSING
      // ----------------------------------------------
      // This ensures 'chapterData' is an object or null, and 'slidesData' is an array.
      const chapterData = chapterResponse.data.chapter || chapterResponse.data.data || null;
      const slidesData = slidesResponse.data.slides || slidesResponse.data.data || [];

      setChapter(chapterData);
      setSlides(slidesData);

      // Track completed slides
      const completedSet = new Set<number>();
      // We already know slidesData is an array, so .forEach is safe
      slidesData.forEach((slide: Slide, index: number) => {
        if (slide.is_completed) {
          completedSet.add(index);
        }
      });
      setCompletedSlides(completedSet);

      setIsLoading(false); // This will now be reached!

    } catch (err: any) {
      console.error('Error loading chapter:', err);
      
      // ----------------------------------------------
      // 👇 FIX 2: SAFER CATCH BLOCK
      // ----------------------------------------------
      // This safely checks if it's an axios error before reading 'err.response'.
      if (err && err.response && err.response.status !== 401) {
          setError('Could not load chapter from database');
      } else if (!err.response) {
          // This catches the TypeError we had before
          setError('An error occurred while loading the data.');
      }
      // The 401 case is handled by the interceptor, so we don't need an 'else'.
      
      setIsLoading(false); // This will now run no matter what
    }
  };



  const currentSlide = slides[currentSlideIndex];
  const progress = slides.length > 0 
    ? Math.min(100, Math.round((completedSlides.size / slides.length) * 100))
    : 0;

  const navigateToSlide = useCallback((index: number) => {
    if (index === currentSlideIndex || !slides[index]) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex(index);
      setCompletedSlides(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });
      setSelectedAnswers({});
      setShowExplanations(new Set());
      setIsTransitioning(false);
    }, 300);
  }, [currentSlideIndex, slides]);

  const handleNext = async () => {
    if (currentSlideIndex < slides.length - 1) {
      // Try to mark current slide as completed
      try {
        await api.post(`/slides/${currentSlide.id}/complete`);
      } catch (err) {
        console.log('Could not save progress:', err);
      }
      navigateToSlide(currentSlideIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      navigateToSlide(currentSlideIndex - 1);
    }
  };

  const handleQuizAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    setShowExplanations(prev => {
      const newSet = new Set(prev);
      newSet.add(questionIndex);
      return newSet;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentSlideIndex > 0) {
        handlePrevious();
      } else if (event.key === 'ArrowRight' && currentSlideIndex < slides.length - 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentSlideIndex, slides.length]);

// ... inside src/pages/SlideViewer.tsx

  const handleCompleteChapter = async () => {
    // ...
    try {
      setChapterCompleted(true); 
      
      await api.post(`/slides/${currentSlide.id}/complete`);
      const response = await api.post(`/chapters/${chapterIdNumber}/complete`);
      
      console.log('Chapter completion response:', response.data);
      
      const allCompleted = new Set(slides.map((_, idx) => idx));
      setCompletedSlides(allCompleted);
      
      // ----------------------------------------------
      // 👇 REMOVE THIS LINE
      // ----------------------------------------------
      // alert('🎉 Congratulations! You have completed Chapter 1!');
      
      // Now this timer will start immediately
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err: any) {
      // ... (error handling)
    }
  };

const ChapterVideoSection: React.FC<{ chapter: Chapter | null }> = ({ chapter }) => {
  // No chapter or no video
  if (!chapter || chapter.video_type === 'none' || !chapter.video_type) {
    return null;
  }

  // Recorded Video
  if (chapter.video_type === 'recorded' && chapter.video_url) {
    return (
      <div className="video-container mt-6 rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2">
          <PlayCircle size={20} />
          <span className="font-semibold">Watch Recording</span>
        </div>
        <iframe
          src={chapter.video_url}
          className="w-full h-96"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  // Scheduled Meeting
  if (chapter.video_type === 'scheduled' && chapter.meeting_link && chapter.meeting_datetime) {
    const meetingDate = new Date(chapter.meeting_datetime);
    const isUpcoming = chapter.is_upcoming;

    return (
      <div className="meeting-container mt-6 rounded-lg overflow-hidden shadow-lg border-2 border-blue-500">
        <div className={`flex items-center gap-2 px-4 py-3 ${
          isUpcoming ? 'bg-green-600' : 'bg-gray-600'
        } text-white`}>
          <Calendar size={20} />
          <span className="font-semibold">
            {isUpcoming ? 'Upcoming Live Session' : 'Past Session'}
          </span>
        </div>

        <div className="p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Video size={24} className="text-blue-600" />
            <div>
              <p className="font-semibold text-lg">Google Meet Session</p>
              <p className="text-gray-600">
                {meetingDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-gray-600">
                {meetingDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {isUpcoming ? (
            <a
              href={chapter.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <ExternalLink size={20} />
              Join Live Session
            </a>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                📹 This session has ended. The recording will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
// ...
  const renderSlideContent = () => {
    if (!currentSlide) return <div>No slide data</div>;

    const { type, content } = currentSlide;
    
    // Map 'answers' type to 'completion' for rendering
    //const slideType = type === 'answers' ? 'completion' : type;
    const slideType = (type === 'answers' || type === 'completion') ? 'completion' : type;

    switch (slideType) {
      case 'title':
        return (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-6">
              <BookOpen size={40} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">{content.title}</h1>
            <h2 className="text-3xl font-semibold text-blue-600 mb-4">{content.subtitle}</h2>
            <p className="text-xl text-gray-600">{content.description || content.footer}</p>

            <ChapterVideoSection chapter={chapter} />
          </div>
        );

      case 'content':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{content.title}</h2>
            
            {content.definition && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
                <p className="text-lg text-gray-700 leading-relaxed">{content.definition}</p>
              </div>
            )}

            {content.keyPoint && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-6">
                <p className="text-lg font-semibold text-gray-800">{content.keyPoint}</p>
              </div>
            )}

            {content.points && (
              <ul className="space-y-4">
                {content.points.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-lg">
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={24} />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {content.examples && Array.isArray(content.examples) && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Examples:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.examples.map((example: string, idx: number) => (
                    <div key={idx} className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-gray-700">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.cards && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {content.cards.map((card: any, idx: number) => (
                  <div key={idx} className="bg-white border-2 border-blue-200 rounded-lg p-5">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">{card.title}</h3>
                    <p className="text-gray-700 mb-2">{card.desc}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Example:</strong> {card.example}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {content.table && (
              <div className="space-y-4 mt-6">
                {content.table.map((row: any, idx: number) => (
                  <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-5">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">{row.type}</h3>
                    <p className="text-gray-700 mb-2">{row.desc}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Example:</strong> {row.example}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {content.lifecycle && (
              <div className="space-y-4 mt-6">
                {content.lifecycle.map((step: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <h3 className="text-2xl font-bold mb-2">{step.step}</h3>
                    <p className="text-blue-100">{step.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {content.note && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong className="text-yellow-700">💡 Note:</strong> {content.note}
                </p>
              </div>
            )}
          </div>
        );

      case 'scenario':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{content.title}</h2>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>Scenario:</strong> {content.data || content.scenario}
              </p>
            </div>
            <div className="space-y-4">
              {content.breakdown && content.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-gray-700 text-lg">{item.content}</p>
                </div>
              ))}
              {content.information && (
                <div className="bg-white border-2 border-blue-200 rounded-lg p-5">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">Information</span>
                  <p className="text-gray-700 text-lg mt-3">{content.information}</p>
                </div>
              )}
              {content.knowledge && (
                <div className="bg-white border-2 border-green-200 rounded-lg p-5">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">Knowledge</span>
                  <p className="text-gray-700 text-lg mt-3">{content.knowledge}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{content.title}</h2>
            {content.questions && Array.isArray(content.questions) && typeof content.questions[0] === 'string' ? (
              // Simple text questions
              <div className="space-y-4">
                {content.questions.map((question: string, idx: number) => (
                  <div key={idx} className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-lg text-gray-800 font-semibold">{idx + 1}. {question}</p>
                  </div>
                ))}
              </div>
            ) : content.questions && content.questions[0]?.q ? (
              // Multiple choice questions
              content.questions.map((q: any, qIdx: number) => {
                const questionHasExplanation = showExplanations.has(qIdx);
                const selectedAnswerForQuestion = selectedAnswers[qIdx];

                return (
                  <div key={qIdx} className="mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg mb-4">
                      <p className="text-xl text-gray-800 font-semibold">{q.q}</p>
                    </div>
                    <div className="space-y-3">
                      {q.options.map((option: string, idx: number) => {
                        const isCorrect = option === q.answer;
                        const isSelected = selectedAnswerForQuestion === idx;
                        let bgColor = 'bg-white hover:bg-gray-50';
                        let borderColor = 'border-gray-300';

                        if (questionHasExplanation) {
                          if (isCorrect) {
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-500';
                          } else if (isSelected) {
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-500';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => !questionHasExplanation && handleQuizAnswer(qIdx, idx)}
                            disabled={questionHasExplanation}
                            className={`w-full text-left p-4 rounded-lg border-2 ${borderColor} ${bgColor} transition-all ${
                              !questionHasExplanation ? 'cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-gray-800 flex-1">{option}</span>
                              {questionHasExplanation && isCorrect && (
                                <CheckCircle className="text-green-500" size={24} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">Quiz content format not recognized</p>
            )}
          </div>
        );

      case 'review':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{content.title}</h2>
            <div className="space-y-4">
              {content.questions && content.questions.map((question: string, idx: number) => (
                <div key={idx} className="bg-white border-2 border-blue-200 rounded-lg p-5">
                  <div className="flex gap-4">
                    <span className="text-2xl font-bold text-blue-500">{idx + 1}.</span>
                    <p className="text-lg text-gray-700 flex-1">{question}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'completion':
      case 'answers':
        return (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6">
              <Award size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{content.title}</h1>
            {content.message && <p className="text-xl text-gray-600 mb-8">{content.message}</p>}
            <div className="bg-blue-50 rounded-lg p-6 max-w-lg mx-auto mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {content.answers ? 'Model Answers' : 'Next Steps'}:
              </h3>
              <ul className="space-y-3 text-left">
                {content.answers ? (
                  content.answers.map((item: any, idx: number) => (
                    <li key={idx} className="border-b border-gray-200 pb-3">
                      <p className="font-semibold text-gray-800">{item.q}</p>
                      <p className="text-gray-700 mt-1">{item.a}</p>
                    </li>
                  ))
                ) : content.nextSteps ? (
                  content.nextSteps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))
                ) : null}
              </ul>
            </div>
            {!chapterCompleted && (currentSlideIndex === slides.length - 1 || type === 'completion' || type === 'answers') && (
              <button
                onClick={handleCompleteChapter}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✓ Complete Chapter & Return to Dashboard
              </button>
            )}
            {chapterCompleted && (
              <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-700 font-semibold">
                  ✓ Chapter Completed! Redirecting to dashboard...
                </p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown slide type: {type}</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading chapter from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Make sure Laravel backend is running at: <br/>
            <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE_URL}</code>
          </p>
          <button
            onClick={loadChapterData}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No slides found for this chapter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home size={20} />
                <span className="font-medium">Dashboard</span>
              </button>
              <span className="text-gray-400">/</span>
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-800">{chapter?.title}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Slide <strong>{currentSlideIndex + 1}</strong> of <strong>{slides.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div
          className={`bg-white rounded-xl shadow-lg p-8 md:p-12 min-h-[500px] transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {renderSlideContent()}


        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentSlideIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => navigateToSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex
                    ? 'bg-blue-500 w-8'
                    : completedSlides.has(idx)
                    ? 'bg-green-400'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentSlideIndex === slides.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
            }`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}