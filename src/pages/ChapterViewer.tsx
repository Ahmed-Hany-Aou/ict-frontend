import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';



// Type Definitions
interface QuizQuestion {
  q: string;
  options: string[];
  answer: string;
}

interface SlideContent {
  title: string;
  subtitle?: string;
  footer?: string;
  definition?: string;
  examples?: string[];
  keyPoint?: string;
  cards?: Array<{ title: string; desc: string; example: string }>;
  table?: Array<{ type: string; desc: string; example: string }>;
  lifecycle?: Array<{ step: string; desc: string }>;
  data?: string;
  information?: string;
  knowledge?: string;
  questions?: (string | QuizQuestion)[];
  answers?: Array<{ q: string; a: string }>;
}

interface Slide {
  id: number;
  type: 'title' | 'content' | 'scenario' | 'quiz' | 'review' | 'answers';
  content: SlideContent;
}

// Chapter 1 Slide Data
const slides: Slide[] = [
  {
    id: 1,
    type: 'title',
    content: {
      title: 'Chapter 1',
      subtitle: 'Data, Information, and Knowledge',
      footer: 'ICT Curriculum\nGrade 10 - Egypt'
    }
  },
  {
    id: 2,
    type: 'content',
    content: {
      title: 'What is Data?',
      definition: 'Data are raw facts, figures, or symbols that have not yet been processed to give them meaning.',
      examples: [
        'A list of temperatures: 30, 32, 29',
        'Names in a class: Sara, Omar, Youssef',
        'Random numbers: 100, 3.14, 42'
      ]
    }
  },
  {
    id: 3,
    type: 'content',
    content: {
      title: 'What is Information?',
      definition: 'Information is data that has been processed or organized to have meaning and value.',
      examples: [
        '"Ahmed scored 23 marks in math."',
        '"The average temperature this week is 30°C."',
        'A table showing students\' names and their scores',
        'A weather report summarizing daily temperatures'
      ],
      keyPoint: 'Information = Data + Context + Meaning'
    }
  },
  {
    id: 4,
    type: 'content',
    content: {
      title: 'What is Knowledge?',
      definition: 'Knowledge is the understanding and awareness gained by using information to make decisions or solve problems.',
      examples: [
        'Knowing that studying regularly improves exam scores',
        'Realizing that high temperatures mean you should drink more water',
        'A teacher uses students\' scores to decide who needs extra help'
      ]
    }
  },
  {
    id: 5,
    type: 'content',
    content: {
      title: 'Characteristics of Information',
      cards: [
        { title: 'Persistence', desc: 'Hard to erase completely', example: 'A photo posted online' },
        { title: 'Reproducibility', desc: 'Can be copied and shared easily', example: 'Forwarding a message' },
        { title: 'Spreads Easily', desc: 'Can reach many people quickly', example: 'Viral news' }
      ]
    }
  },
  {
    id: 6,
    type: 'content',
    content: {
      title: 'Types of Information',
      table: [
        { type: 'Primary', desc: 'Direct from the original source', example: 'Survey results, eyewitness account' },
        { type: 'Secondary', desc: 'Processed or summarized from primary sources', example: 'News article, research report' }
      ]
    }
  },
  {
    id: 7,
    type: 'content',
    content: {
      title: 'Data Processing',
      definition: 'The act of converting data into information by organizing, sorting, or analyzing it.',
      examples: [
        'Calculating the average score from a list of marks',
        'Sorting names alphabetically',
        'Making a chart from survey results'
      ]
    }
  },
  {
    id: 8,
    type: 'content',
    content: {
      title: 'Information Lifecycle',
      lifecycle: [
        { step: '1. Data Collection', desc: 'Data is collected' },
        { step: '2. Processing', desc: 'Data is processed into information' },
        { step: '3. Knowledge', desc: 'Information is used to gain knowledge' }
      ]
    }
  },
  {
    id: 9,
    type: 'content',
    content: {
      title: 'Media',
      definition: 'Tools or methods used to express, transmit, and store information.',
      examples: [
        'Expression media: Text, images, sound, video',
        'Transmission media: TV, radio, Internet',
        'Recording media: Paper, USB drive, cloud storage'
      ]
    }
  },
  {
    id: 10,
    type: 'content',
    content: {
      title: 'Media Literacy',
      definition: 'The ability to understand, interpret, and evaluate information in different media.',
      examples: [
        'Reading a news article online and checking if it is true',
        'Sara sees a post on social media and asks her teacher to verify it'
      ]
    }
  },
  {
    id: 11,
    type: 'content',
    content: {
      title: 'Information Ethics',
      definition: 'Guidelines for responsible use and behavior with information online and offline.',
      examples: [
        'Respecting privacy (not sharing friends\' info without permission)',
        'Not copying others\' work (avoiding plagiarism)',
        'Not spreading rumors or fake news'
      ]
    }
  },
  {
    id: 12,
    type: 'content',
    content: {
      title: 'Digital Age Risks',
      definition: 'Dangers connected to technology use.',
      examples: [
        'Cyberbullying: Sending mean messages online',
        'Internet addiction: Spending too much time online',
        'Privacy issues: Accidentally sharing personal photos',
        'Identity theft: Someone uses your account without permission'
      ]
    }
  },
  {
    id: 13,
    type: 'scenario',
    content: {
      title: 'Real-World Example: Ahmed\'s Week',
      data: 'Ahmed records the daily temperature: 30°C, 32°C, 35°C, 33°C, 34°C, 36°C, 31°C',
      information: 'He calculates the weekly average: 33°C and identifies the hottest day: Saturday (36°C)',
      knowledge: 'He decides to go swimming on Saturday (the hottest day)'
    }
  },
  {
    id: 14,
    type: 'quiz',
    content: {
      title: 'Quick Quiz',
      questions: [
        'What is the difference between data and information?',
        'Give an example of knowledge from your daily life.',
        'What are the three characteristics of information in the digital age?'
      ]
    }
  },
  {
    id: 15,
    type: 'quiz',
    content: {
      title: 'Test Your Understanding',
      questions: [
        { q: 'Which is a type of transmission media?', options: ['Notebook', 'Radio', 'Pencil'], answer: 'Radio' },
        { q: 'What is media literacy?', options: ['Writing stories', 'Understanding and checking info', 'Playing games'], answer: 'Understanding and checking info' }
      ]
    }
  },
  {
    id: 16,
    type: 'review',
    content: {
      title: 'Comprehensive Review Questions',
      questions: [
        'Define data, information, and knowledge.',
        'What are the characteristics of information in the digital age?',
        'What is the difference between primary and secondary information?',
        'Give an example of data being processed into information.'
      ]
    }
  },
  {
    id: 17,
    type: 'answers',
    content: {
      title: 'Model Answers',
      answers: [
        { q: 'Definitions', a: 'Data: Raw facts | Information: Processed data | Knowledge: Understanding' },
        { q: 'Characteristics', a: 'Information is persistent, reproducible, and spreads easily' },
        { q: 'Types', a: 'Primary: Direct from source | Secondary: Summarized from primary' }
      ]
    }
  }
];

export default function ChapterViewer() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const totalSlides = slides.length;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
        setCurrentSlide(prev => prev + 1);
      } else if (e.key === 'Escape') {
        setShowSidebar(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, totalSlides]);

  const slide = slides[currentSlide];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Sidebar */}
      {showSidebar && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }} onClick={() => setShowSidebar(false)} />
          
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            background: 'linear-gradient(180deg, #23395d 0%, #1a2b47 100%)',
            color: 'white',
            padding: '80px 20px 30px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '2px 0 20px rgba(0,0,0,0.3)'
          }}>
            <button
              onClick={() => setShowSidebar(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>All Slides</h2>
            <div>
              {slides.map((s, index) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setCurrentSlide(index);
                    setShowSidebar(false);
                  }}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    background: currentSlide === index ? 'rgba(255,255,255,0.2)' : 'transparent',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = currentSlide === index ? 'rgba(255,255,255,0.2)' : 'transparent'}
                >
                  Slide {s.id}: {s.content.title}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1100,
          background: 'linear-gradient(135deg, #23395d, #17417a)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Menu size={24} />
      </button>

      {/* Presentation Container */}
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Slide Content */}
        <div style={{
          padding: '60px',
          minHeight: '600px',
          animation: 'fadeIn 0.5s'
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Title Slide */}
          {slide.type === 'title' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              minHeight: '480px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              margin: '-60px',
              padding: '60px'
            }}>
              <h1 style={{ fontSize: '3em', marginBottom: '20px', color: 'white' }}>{slide.content.title}</h1>
              <h1 style={{ fontSize: '3em', marginBottom: '20px', color: 'white' }}>{slide.content.subtitle}</h1>
              <p style={{ fontSize: '1.5em', marginTop: '30px', whiteSpace: 'pre-line' }}>{slide.content.footer}</p>
            </div>
          )}

          {/* Content Slide */}
          {slide.type === 'content' && (
            <>
              <h2 style={{ color: '#764ba2', fontSize: '2em', marginBottom: '25px', borderBottom: '3px solid #667eea', paddingBottom: '10px' }}>
                {slide.content.title}
              </h2>
              
              {slide.content.definition && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                  padding: '20px',
                  borderLeft: '5px solid #667eea',
                  borderRadius: '8px',
                  margin: '20px 0',
                  fontWeight: '500'
                }}>
                  <strong>Definition:</strong> {slide.content.definition}
                </div>
              )}

              {slide.content.examples && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  margin: '20px 0'
                }}>
                  <h3 style={{ color: '#667eea', fontSize: '1.5em', marginBottom: '10px' }}>Examples:</h3>
                  <ul style={{ marginLeft: '20px' }}>
                    {slide.content.examples.map((ex, i) => (
                      <li key={i} style={{ fontSize: '1.1em', lineHeight: '1.8', marginBottom: '10px' }}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {slide.content.keyPoint && (
                <div style={{
                  background: '#fff3cd',
                  padding: '20px',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <strong>Key Point:</strong> {slide.content.keyPoint}
                </div>
              )}

              {slide.content.cards && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  margin: '30px 0'
                }}>
                  {slide.content.cards.map((card, i) => (
                    <div key={i} style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '25px',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ color: 'white', marginBottom: '15px' }}>{card.title}</h3>
                      <p>{card.desc}</p>
                      <p style={{ fontSize: '0.9em', marginTop: '10px' }}><em>{card.example}</em></p>
                    </div>
                  ))}
                </div>
              )}

              {slide.content.lifecycle && (
                <div style={{ margin: '30px 0' }}>
                  {slide.content.lifecycle.map((step, i) => (
                    <div key={i} style={{
                      background: '#667eea',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      marginBottom: '15px'
                    }}>
                      <h3 style={{ color: 'white', margin: 0 }}>{step.step}</h3>
                      <p style={{ marginTop: '10px' }}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Scenario Slide */}
          {slide.type === 'scenario' && (
            <>
              <h2 style={{ color: '#764ba2', fontSize: '2em', marginBottom: '25px' }}>{slide.content.title}</h2>
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                padding: '25px',
                borderRadius: '10px',
                margin: '20px 0'
              }}>
                <div style={{ margin: '20px 0', padding: '20px', background: 'white', borderRadius: '8px' }}>
                  <h4 style={{ color: '#17a2b8', margin: '0 0 10px 0' }}>📊 Data:</h4>
                  <p>{slide.content.data}</p>
                </div>
                <div style={{ margin: '20px 0', padding: '20px', background: 'white', borderRadius: '8px' }}>
                  <h4 style={{ color: '#667eea', margin: '0 0 10px 0' }}>📈 Information:</h4>
                  <p>{slide.content.information}</p>
                </div>
                <div style={{ margin: '20px 0', padding: '20px', background: 'white', borderRadius: '8px' }}>
                  <h4 style={{ color: '#764ba2', margin: '0 0 10px 0' }}>💡 Knowledge:</h4>
                  <p>{slide.content.knowledge}</p>
                </div>
              </div>
            </>
          )}

          {/* Quiz Slide */}
          {(slide.type === 'quiz' || slide.type === 'review') && slide.content.questions && (
            <>
              <h2 style={{ color: '#764ba2', fontSize: '2em', marginBottom: '25px' }}>{slide.content.title}</h2>
              {slide.content.questions.map((q, i) => (
                <div key={i} style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '10px',
                  margin: '15px 0',
                  borderLeft: '5px solid #764ba2'
                }}>
                  <h3 style={{ marginBottom: '10px' }}>Question {i + 1}:</h3>
                  <p style={{ fontSize: '1.1em' }}>{typeof q === 'string' ? q : q.q}</p>
                  {typeof q !== 'string' && q.options && (
                    <div style={{ marginTop: '10px' }}>
                      {q.options.map((opt: string, j: number) => (
                        <div key={j} style={{ padding: '5px 0' }}>• {opt}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Answers Slide */}
          {slide.type === 'answers' && slide.content.answers && (
            <>
              <h2 style={{ color: '#764ba2', fontSize: '2em', marginBottom: '25px' }}>{slide.content.title}</h2>
              {slide.content.answers.map((answer, i) => (
                <div key={i} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  margin: '10px 0'
                }}>
                  <strong style={{ color: '#667eea' }}>{answer.q}:</strong> {answer.a}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 60px',
          background: '#f8f9fa',
          borderTop: '2px solid #ddd'
        }}>
          <button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            style={{
              background: currentSlide === 0 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              fontSize: '1em',
              borderRadius: '25px',
              cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1.1em' }}>
            {currentSlide + 1} / {totalSlides}
          </span>
          
          <button
            onClick={() => setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1))}
            disabled={currentSlide === totalSlides - 1}
            style={{
              background: currentSlide === totalSlides - 1 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              fontSize: '1em',
              borderRadius: '25px',
              cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}