// src/services/chapterService.ts
import api from './api'; // Import the global axios api client

const ChapterService = {
  /**
   * Get all chapters with progress
   */
  async getChapters() {
    // Use api.get() which returns { data: ... }
    const response = await api.get('/chapters');
    
    // Your API returns: { success: true, chapters: [...] }
    const chapters = response.data.chapters || response.data.data || response.data;
    
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
    const response = await api.get(`/chapters/${chapterId}`);
    
    // Response format: { success: true, chapter: {...} }
    return response.data.chapter || response.data.data || response.data;
  },

  /**
   * Get all slides for a chapter
   */
  async getChapterSlides(chapterId: number) {
    const response = await api.get(`/chapters/${chapterId}/slides`);
    
    // Response format: varies based on SlideController
    return response.data.slides || response.data.data || response.data;
  },

  /**
   * Get user's overall progress
   */
  async getUserProgress() {
    const response = await api.get('/user/progress');
    
    // Your API returns: { success: true, statistics: {...}, chapter_progress: [...] }
    const stats = response.data.statistics || response.data.data || response.data;
    
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
    const response = await api.post(`/chapters/${chapterId}/start`);
    return response.data;
  },

  /**
   * Mark chapter as completed
   */
  async completeChapter(chapterId: number) {
    const response = await api.post(`/chapters/${chapterId}/complete`);
    return response.data;
  },

  /**
   * Mark slide as viewed
   */
  async markSlideViewed(slideId: number) {
    const response = await api.post(`/slides/${slideId}/view`);
    return response.data;
  },

  /**
   * Mark slide as completed
   */
  async markSlideCompleted(slideId: number) {
    const response = await api.post(`/slides/${slideId}/complete`);
    return response.data;
  },

  /**
   * Get next slide
   */
  async getNextSlide(slideId: number) {
    const response = await api.get(`/slides/${slideId}/next`);
    return response.data.data || response.data;
  },

  /**
   * Get previous slide
   */
  async getPreviousSlide(slideId: number) {
    const response = await api.get(`/slides/${slideId}/previous`);
    return response.data.data || response.data;
  },
};

export default ChapterService;