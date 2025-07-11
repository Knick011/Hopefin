import AsyncStorage from '@react-native-async-storage/async-storage';

interface Question {
  id: number;
  category: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  level?: 'easy' | 'medium' | 'hard';
}

class QuizService {
  private questions: Question[] = [];
  private categories: string[] = [];
  private usedQuestionIds: Set<number> = new Set();
  private STORAGE_KEY = 'brainbites_used_questions';
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load used questions from storage
      await this.loadUsedQuestions();
      
      // Load questions from your assets
      // For now, using hardcoded questions
      this.loadDefaultQuestions();
      
      // Extract categories
      this.extractCategories();
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing QuizService:', error);
      throw error;
    }
  }

  private loadDefaultQuestions(): void {
    // Default questions - replace with actual loading from assets
    this.questions = [
      // Fun Facts Category
      {
        id: 1,
        category: 'funfacts',
        question: 'What is the only mammal that can fly?',
        options: {
          A: 'Flying squirrel',
          B: 'Bat',
          C: 'Sugar glider',
          D: 'Flying lemur',
        },
        correctAnswer: 'B',
        explanation: 'Bats are the only mammals capable of true flight. Flying squirrels and sugar gliders can only glide.',
        level: 'easy',
      },
      {
        id: 2,
        category: 'funfacts',
        question: 'How many hearts does an octopus have?',
        options: {
          A: 'One',
          B: 'Two',
          C: 'Three',
          D: 'Four',
        },
        correctAnswer: 'C',
        explanation: 'An octopus has three hearts! Two pump blood to the gills, and one pumps blood to the rest of the body.',
        level: 'medium',
      },
      {
        id: 3,
        category: 'funfacts',
        question: 'What is the strongest muscle in the human body?',
        options: {
          A: 'Bicep',
          B: 'Heart',
          C: 'Tongue',
          D: 'Jaw muscle',
        },
        correctAnswer: 'D',
        explanation: 'The masseter (jaw muscle) is the strongest muscle based on its weight. It can close teeth with a force of 200 pounds!',
        level: 'medium',
      },
      
      // Psychology Category
      {
        id: 4,
        category: 'psychology',
        question: 'What percentage of communication is non-verbal?',
        options: {
          A: '55%',
          B: '65%',
          C: '75%',
          D: '93%',
        },
        correctAnswer: 'D',
        explanation: 'Studies suggest that 93% of communication is non-verbal - 55% body language and 38% tone of voice.',
        level: 'medium',
      },
      {
        id: 5,
        category: 'psychology',
        question: 'How long does it take to form a habit on average?',
        options: {
          A: '21 days',
          B: '30 days',
          C: '66 days',
          D: '90 days',
        },
        correctAnswer: 'C',
        explanation: 'Research shows it takes an average of 66 days to form a habit, though it can range from 18 to 254 days.',
        level: 'easy',
      },
      {
        id: 6,
        category: 'psychology',
        question: 'What is the "Dunning-Kruger Effect"?',
        options: {
          A: 'Fear of public speaking',
          B: 'Overestimating one\'s abilities',
          C: 'Memory loss with age',
          D: 'Social anxiety disorder',
        },
        correctAnswer: 'B',
        explanation: 'The Dunning-Kruger Effect is when people with limited knowledge overestimate their competence.',
        level: 'hard',
      },
      
      // Science Category
      {
        id: 7,
        category: 'science',
        question: 'What is the speed of light in a vacuum?',
        options: {
          A: '186,282 miles per second',
          B: '299,792 kilometers per second',
          C: 'Both A and B',
          D: 'Neither A nor B',
        },
        correctAnswer: 'C',
        explanation: 'Light travels at approximately 186,282 miles per second or 299,792 kilometers per second in a vacuum.',
        level: 'medium',
      },
      {
        id: 8,
        category: 'science',
        question: 'What is the most abundant gas in Earth\'s atmosphere?',
        options: {
          A: 'Oxygen',
          B: 'Carbon dioxide',
          C: 'Nitrogen',
          D: 'Hydrogen',
        },
        correctAnswer: 'C',
        explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere, while oxygen comprises about 21%.',
        level: 'easy',
      },
      
      // History Category
      {
        id: 9,
        category: 'history',
        question: 'In which year did World War II end?',
        options: {
          A: '1943',
          B: '1944',
          C: '1945',
          D: '1946',
        },
        correctAnswer: 'C',
        explanation: 'World War II ended in 1945 with the surrender of Germany in May and Japan in August.',
        level: 'easy',
      },
      {
        id: 10,
        category: 'history',
        question: 'Who was the first person to walk on the moon?',
        options: {
          A: 'Buzz Aldrin',
          B: 'Neil Armstrong',
          C: 'Yuri Gagarin',
          D: 'John Glenn',
        },
        correctAnswer: 'B',
        explanation: 'Neil Armstrong was the first person to walk on the moon on July 20, 1969, during the Apollo 11 mission.',
        level: 'easy',
      },
    ];
  }

  private extractCategories(): void {
    const categorySet = new Set(this.questions.map(q => q.category));
    this.categories = Array.from(categorySet);
  }

  private async loadUsedQuestions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        this.usedQuestionIds = new Set(ids);
      }
    } catch (error) {
      console.error('Error loading used questions:', error);
    }
  }

  private async saveUsedQuestions(): Promise<void> {
    try {
      const ids = Array.from(this.usedQuestionIds);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving used questions:', error);
    }
  }

  async getRandomQuestion(category?: string, difficulty?: string): Promise<Question | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Filter questions
    let availableQuestions = this.questions.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (category && category !== 'all') {
      availableQuestions = availableQuestions.filter(q => q.category === category);
    }
    
    if (difficulty && difficulty !== 'mixed') {
      availableQuestions = availableQuestions.filter(q => q.level === difficulty);
    }

    // If no questions available, reset used questions
    if (availableQuestions.length === 0) {
      await this.resetUsedQuestions();
      availableQuestions = this.questions.filter(q => {
        if (category && category !== 'all') {
          return q.category === category;
        }
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
    await this.saveUsedQuestions();

    return question;
  }

  async resetUsedQuestions(): Promise<void> {
    this.usedQuestionIds.clear();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  getCategories(): string[] {
    return [...this.categories];
  }

  getQuestionCount(category?: string): number {
    if (!category || category === 'all') {
      return this.questions.length;
    }
    return this.questions.filter(q => q.category === category).length;
  }

  getUsedQuestionCount(): number {
    return this.usedQuestionIds.size;
  }
}

export default new QuizService();