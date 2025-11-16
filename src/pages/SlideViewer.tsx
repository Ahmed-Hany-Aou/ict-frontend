import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Home, Award, ChevronDown, Loader, PlayCircle, Calendar, Video, ExternalLink } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../services/api'
//import { Calendar, Video, ExternalLink } from 'lucide-react';

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
  const queryClient = useQueryClient();
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

  // Mutation for completing a slide
  const completeSlideMutation = useMutation({
    mutationFn: (slideId: number) => api.post(`/slides/${slideId}/complete`),
    onSuccess: () => {
      // Invalidate chapters and user progress to reflect updated progress
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
    onError: (err) => {
      console.log('Could not save slide progress:', err);
    }
  });

  // Mutation for completing a chapter
  const completeChapterMutation = useMutation({
    mutationFn: async (data: { slideId: number; chapterId: number }) => {
      await api.post(`/slides/${data.slideId}/complete`);
      return await api.post(`/chapters/${data.chapterId}/complete`);
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    }
  });

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

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      // Mark current slide as completed (with cache invalidation)
      completeSlideMutation.mutate(currentSlide.id);
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

      // Use mutation for chapter completion (with automatic cache invalidation)
      const response = await completeChapterMutation.mutateAsync({
        slideId: currentSlide.id,
        chapterId: chapterIdNumber
      });

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
  // --- NEW 3-STATE LOGIC ---
  
  // 1. Get all the dates
  const meetingDate = new Date(chapter.meeting_datetime);
  const now = new Date();
  
  // 2. Define the "live" window (1 hour, as you requested)
  const liveDuration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
  const meetingEndTime = new Date(meetingDate.getTime() + liveDuration);

  // 3. Determine the current state
  const isUpcoming = now < meetingDate;
  const isLive = now >= meetingDate && now < meetingEndTime;
  const isPast = now >= meetingEndTime; // "Expired"
  // -------------------------

  // Determine dynamic styles based on state
  let borderColor = 'border-gray-400';
  let headerBg = 'bg-gray-600';
  
  if (isUpcoming) {
    borderColor = 'border-green-500';
    headerBg = 'bg-green-600';
  } else if (isLive) {
    borderColor = 'border-red-500';
    headerBg = 'bg-red-600';
  }

  return (
    <div className={`meeting-container mt-6 rounded-lg overflow-hidden shadow-lg border-2 ${borderColor}`}>
      
      {/* 1. DYNAMIC HEADER */}
      <div className={`flex items-center gap-2 px-4 py-3 ${headerBg} text-white`}>
        {isLive && (
          // The "red point" you requested, with a pulse
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        )}
        <Calendar size={isLive ? 0 : 20} className={isLive ? 'w-0' : ''} /> {/* Hide calendar if live */}
        
        <span className="font-semibold">
          {isLive ? 'Session is LIVE' : isUpcoming ? 'Upcoming Live Session' : 'Past Session'}
        </span>
      </div>

      {/* 2. MEETING INFO (Unchanged) */}
      <div className="p-6 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <Video size={24} className="text-blue-600" />
          <div>
            <p className="font-semibold text-lg">Google Meet Session</p>
            <p className="text-gray-600">
              {/* This correctly shows the date in the user's local timezone */}
              {meetingDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-gray-600">
              {/* This correctly shows the time in the user's local timezone */}
              {meetingDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* 3. DYNAMIC ACTION BUTTON */}
        
        {/* State 1: Upcoming */}
        {isUpcoming && (
          <a
            href={chapter.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ExternalLink size={20} />
            Join Live Session
          </a>
        )}
        
        {/* State 2: Live */}
        {isLive && (
          <a
            href={chapter.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors animate-pulse"
          >
            <ExternalLink size={20} />
            Join LIVE Now
          </a>
        )}
        
        {/* State 3: Past (Expired) */}
        {isPast && (
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
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                <Home size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">Dashboard</span>
              </button>
              <span className="text-gray-400 hidden sm:inline">/</span>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <BookOpen size={18} className="text-blue-600 flex-shrink-0 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-semibold text-gray-800 truncate">{chapter?.title}</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Slide <strong>{currentSlideIndex + 1}</strong> of <strong>{slides.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div
          className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-12 min-h-[400px] sm:min-h-[500px] transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {renderSlideContent()}


        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6 sm:mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all order-2 sm:order-1 ${
              currentSlideIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
            }`}
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Previous</span>
          </button>

          {/* Slide Dots - Hidden on very small screens, scrollable on medium */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-2 justify-center order-1 sm:order-2 max-w-full">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => navigateToSlide(idx)}
                className={`flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex
                    ? 'bg-blue-500 w-6 sm:w-8'
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
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all order-3 ${
              currentSlideIndex === slides.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
            }`}
          >
            <span className="text-sm sm:text-base">Next</span>
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}