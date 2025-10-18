// src/services/chapterService.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
  joinDate: string;
}

class ChapterService {
  static async getChapters(token: string): Promise<Chapter[]> {
    try {
      const response = await fetch(`${API_URL}/api/chapters`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch chapters');

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }

  static async getProgress(token: string): Promise<Progress> {
    try {
      const response = await fetch(`${API_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch progress');

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  }
}

export default ChapterService;