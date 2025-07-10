// src/services/QuizService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '@/utils/constants';

// Default questions for initial release
const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Science',
    question: 'What is the chemical symbol for water?',
    options: { A: 'H2O', B: 'CO2', C: 'O2', D: 'NaCl' },
    correctAnswer: 'A',
    explanation: 'Water is composed of two hydrogen atoms and one oxygen atom - H2O',
    level: 'Easy'
  },
  {
    id: 2,
    category: 'Science',
    question: 'Which planet is known as the Red Planet?',
    options: { A: 'Venus', B: 'Mars', C: 'Jupiter', D: 'Saturn' },
    correctAnswer: 'B',
    explanation: 'Mars appears red due to iron oxide on its surface',
    level: 'Easy'
  },
  {
    id: 3,
    category: 'Math',
    question: 'What is 15% of 200?',
    options: { A: '20', B: '25', C: '30', D: '35' },
    correctAnswer: 'C',
    explanation: '15% of 200 = 0.15 × 200 = 30',
    level: 'Medium'
  },
  {
    id: 4,
    category: 'Math',
    question: 'What is the square root of 144?',
    options: { A: '10', B: '11', C: '12', D: '13' },
    correctAnswer: 'C',
    explanation: '√144 = 12 because 12 × 12 = 144',
    level: 'Medium'
  },
  {
    id: 5,
    category: 'History',
    question: 'In which year did World War II end?',
    options: { A: '1943', B: '1944', C: '1945', D: '1946' },
    correctAnswer: 'C',
    explanation: 'World War II ended in 1945 with the surrender of Japan',
    level: 'Easy'
  },
  {
    id: 6,
    category: 'Geography',
    question: 'What is the capital of France?',
    options: { A: 'London', B: 'Berlin', C: 'Madrid', D: 'Paris' },
    correctAnswer: 'D',
    explanation: 'Paris has been the capital of France since 987 AD',
    level: 'Easy'
  },
  {
    id: 7,
    category: 'Literature',
    question: 'Who wrote Romeo and Juliet?',
    options: { A: 'Charles Dickens', B: 'William Shakespeare', C: 'Mark Twain', D: 'Jane Austen' },
    correctAnswer: 'B',
    explanation: 'William Shakespeare wrote Romeo and Juliet around 1595',
    level: 'Easy'
  },
  {
    id: 8,
    category: 'Technology',
    question: 'What does CPU stand for?',
    options: { A: 'Computer Processing Unit', B: 'Central Processing Unit', C: 'Core Processing Unit', D: 'Computer Power Unit' },
    correctAnswer: 'B',
    explanation: 'CPU stands for Central Processing Unit - the brain of a computer',
    level: 'Easy'
  },
  {
    id: 9,
    category: 'Sports',
    question: 'How many players are on a basketball team?',
    options: { A: '4', B: '5', C: '6', D: '7' },
    correctAnswer: 'B',
    explanation: 'A basketball team has 5 players on the court at one time',
    level: 'Easy'
  },
  {
    id: 10,
    category: 'Music',
    question: 'How many strings does a standard guitar have?',
    options: { A: '4', B: '5', C: '6', D: '7' },
    correctAnswer: 'C',
    explanation: 'A standard guitar has 6 strings: E A D G B E',
    level: 'Easy'
  },
];

class QuizService {
  private questions: Question[] = [];
  private categories: string[] = [];
  private usedQuestionIds: Set<number> = new Set();
  private STORAGE_KEY = 'brainbites_used_questions';

  constructor() {
    this.questions = DEFAULT_QUESTIONS;
    this.extractCategories();
  }

  async initialize() {
    await this.loadUsedQuestions();
    // In a future update, load questions from a server or local CSV
  }

  private extractCategories() {
    const categorySet = new Set(this.questions.map(q => q.category));
    this.categories = Array.from(categorySet);
  }

  private async loadUsedQuestions() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.usedQuestionIds = new Set(parsed.usedIds || []);
      }
    } catch (error) {
      console.error('Error loading used questions:', error);
    }
  }

  private async saveUsedQuestions() {
    try {
      const data = {
        usedIds: Array.from(this.usedQuestionIds),
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving used questions:', error);
    }
  }

  async resetUsedQuestions() {
    this.usedQuestionIds.clear();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  getCategories(): string[] {
    return this.categories;
  }

  getRandomQuestion(category = 'All', difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed' = 'Mixed'): Question | null {
    // Filter questions based on criteria
    let availableQuestions = this.questions.filter(q => !this.usedQuestionIds.has(q.id));
    
    // Apply category filter
    if (category && category !== 'All') {
      availableQuestions = availableQuestions.filter(q => q.category === category);
    }
    
    // Apply difficulty filter
    if (difficulty && difficulty !== 'Mixed') {
      availableQuestions = availableQuestions.filter(q => q.level === difficulty);
    }
    
    // If no questions available, reset used questions
    if (availableQuestions.length === 0) {
      this.usedQuestionIds.clear();
      availableQuestions = this.questions.filter(q => {
        if (category && category !== 'All' && q.category !== category) return false;
        if (difficulty && difficulty !== 'Mixed' && q.level !== difficulty) return false;
        return true;
      });
    }
    
    if (availableQuestions.length === 0) {
      return null;
    }
    
    // Select random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    
    // Mark as used
    this.usedQuestionIds.add(question.id);
    this.saveUsedQuestions();
    
    return question;
  }

  getQuestionStats() {
    return {
      total: this.questions.length,
      used: this.usedQuestionIds.size,
      remaining: this.questions.length - this.usedQuestionIds.size,
      byCategory: this.getCategoryStats(),
      byDifficulty: this.getDifficultyStats(),
    };
  }

  private getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.questions.forEach(q => {
      stats[q.category] = (stats[q.category] || 0) + 1;
    });
    return stats;
  }

  private getDifficultyStats(): Record<string, number> {
    const stats: Record<string, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };
    this.questions.forEach(q => {
      stats[q.level]++;
    });
    return stats;
  }
}

export default new QuizService();