// src/services/chapterService.ts

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

const ChapterService = {
  /**
   * Get all chapters with progress
   */
  async getChapters() {
    const response = await apiRequest('/chapters');
    
    // Your API returns: { success: true, chapters: [...] }
    const chapters = response.chapters || response.data || response;
    
    // Map to match Dashboard's expected format
    return chapters.map((chapter: any) => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      chapter_number: chapter.chapter_number,
      progress_percentage: chapter.progress_percentage || 0,
      status: chapter.status || 'not_started',
      slides_count: chapter.slides_count || 0,
      completed_slides: chapter.completed_slides || 0,
      is_premium: chapter.is_premium || false,
    }));
  },

  /**
   * Get single chapter with slides
   */
  async getChapter(chapterId: number) {
    const response = await apiRequest(`/chapters/${chapterId}`);
    
    // Response format: { success: true, chapter: {...} }
    return response.chapter || response.data || response;
  },

  /**
   * Get all slides for a chapter
   */
  async getChapterSlides(chapterId: number) {
    const response = await apiRequest(`/chapters/${chapterId}/slides`);
    
    // Response format: varies based on SlideController
    return response.slides || response.data || response;
  },

  /**
   * Get user's overall progress
   */
  async getUserProgress() {
    const response = await apiRequest('/user/progress');
    
    // Your API returns: { success: true, statistics: {...}, chapter_progress: [...] }
    const stats = response.statistics || response.data || response;
    
    return {
      total_chapters: stats.total_chapters || 0,
      completed_chapters: stats.completed_chapters || 0,
      total_slides: stats.total_slides || 0,
      completed_slides: stats.completed_slides || 0,
      overall_progress: stats.overall_progress || 0,
    };
  },

  /**
   * Start a chapter (mark as started)
   */
  async startChapter(chapterId: number) {
    return apiRequest(`/chapters/${chapterId}/start`, {
      method: 'POST',
    });
  },

  /**
   * Mark chapter as completed
   */
  async completeChapter(chapterId: number) {
    return apiRequest(`/chapters/${chapterId}/complete`, {
      method: 'POST',
    });
  },

  /**
   * Mark slide as viewed
   */
  async markSlideViewed(slideId: number) {
    return apiRequest(`/slides/${slideId}/view`, {
      method: 'POST',
    });
  },

  /**
   * Mark slide as completed
   */
  async markSlideCompleted(slideId: number) {
    return apiRequest(`/slides/${slideId}/complete`, {
      method: 'POST',
    });
  },

  /**
   * Get next slide
   */
  async getNextSlide(slideId: number) {
    const response = await apiRequest(`/slides/${slideId}/next`);
    return response.data || response;
  },

  /**
   * Get previous slide
   */
  async getPreviousSlide(slideId: number) {
    const response = await apiRequest(`/slides/${slideId}/previous`);
    return response.data || response;
  },
};

export default ChapterService;