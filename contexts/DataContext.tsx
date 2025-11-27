import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Country, Law, Question, Answer, LawCategory } from '@/types';
import { mockCountries, mockLaws, mockQuestions, mockAnswers, mockCategories, mockUsers } from '@/mocks/data';

const COUNTRIES_KEY = '@data_countries';
const LAWS_KEY = '@data_laws';
const QUESTIONS_KEY = '@data_questions';
const ANSWERS_KEY = '@data_answers';
const CATEGORIES_KEY = '@data_categories';

export const [DataProvider, useData] = createContextHook(() => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [laws, setLaws] = useState<Law[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [categories, setCategories] = useState<LawCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedCountries, storedLaws, storedQuestions, storedAnswers, storedCategories] = await Promise.all([
        AsyncStorage.getItem(COUNTRIES_KEY),
        AsyncStorage.getItem(LAWS_KEY),
        AsyncStorage.getItem(QUESTIONS_KEY),
        AsyncStorage.getItem(ANSWERS_KEY),
        AsyncStorage.getItem(CATEGORIES_KEY),
      ]);

      const parseOrDefault = (stored: string | null, defaultData: any, key: string) => {
        if (!stored) return defaultData;
        try {
          return JSON.parse(stored);
        } catch (parseError) {
          console.error(`Failed to parse ${key}, using defaults:`, parseError);
          AsyncStorage.removeItem(key);
          return defaultData;
        }
      };

      setCountries(parseOrDefault(storedCountries, mockCountries, COUNTRIES_KEY));
      setLaws(parseOrDefault(storedLaws, mockLaws, LAWS_KEY));
      setQuestions(parseOrDefault(storedQuestions, mockQuestions, QUESTIONS_KEY));
      setAnswers(parseOrDefault(storedAnswers, mockAnswers, ANSWERS_KEY));
      setCategories(parseOrDefault(storedCategories, mockCategories, CATEGORIES_KEY));
    } catch (error) {
      console.error('Failed to load data:', error);
      setCountries(mockCountries);
      setLaws(mockLaws);
      setQuestions(mockQuestions);
      setAnswers(mockAnswers);
      setCategories(mockCategories);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCountries = async (newCountries: Country[]) => {
    try {
      await AsyncStorage.setItem(COUNTRIES_KEY, JSON.stringify(newCountries));
      setCountries(newCountries);
    } catch (error) {
      console.error('Failed to save countries:', error);
    }
  };

  const saveLaws = async (newLaws: Law[]) => {
    try {
      await AsyncStorage.setItem(LAWS_KEY, JSON.stringify(newLaws));
      setLaws(newLaws);
    } catch (error) {
      console.error('Failed to save laws:', error);
    }
  };

  const saveQuestions = async (newQuestions: Question[]) => {
    try {
      await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(newQuestions));
      setQuestions(newQuestions);
    } catch (error) {
      console.error('Failed to save questions:', error);
    }
  };

  const saveAnswers = async (newAnswers: Answer[]) => {
    try {
      await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(newAnswers));
      setAnswers(newAnswers);
    } catch (error) {
      console.error('Failed to save answers:', error);
    }
  };

  const saveCategories = async (newCategories: LawCategory[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  };

  const addCountry = useCallback(async (country: Omit<Country, 'id' | 'lawCount'>) => {
    const newCountry: Country = {
      ...country,
      id: Date.now().toString(),
      lawCount: 0,
    };
    const updated = [...countries, newCountry];
    await saveCountries(updated);
    return newCountry;
  }, [countries]);

  const updateCountry = useCallback(async (id: string, updates: Partial<Country>) => {
    const updated = countries.map(c => c.id === id ? { ...c, ...updates } : c);
    await saveCountries(updated);
  }, [countries]);

  const deleteCountry = useCallback(async (id: string) => {
    const updated = countries.filter(c => c.id !== id);
    await saveCountries(updated);
    const updatedLaws = laws.filter(l => l.countryId !== id);
    await saveLaws(updatedLaws);
  }, [countries, laws]);

  const addLaw = useCallback(async (law: Omit<Law, 'id'>) => {
    const newLaw: Law = {
      ...law,
      id: Date.now().toString(),
    };
    const updated = [...laws, newLaw];
    await saveLaws(updated);
    
    const updatedCountries = countries.map(c => 
      c.id === law.countryId ? { ...c, lawCount: c.lawCount + 1 } : c
    );
    await saveCountries(updatedCountries);
    
    return newLaw;
  }, [laws, countries]);

  const updateLaw = useCallback(async (id: string, updates: Partial<Law>) => {
    const updated = laws.map(l => l.id === id ? { ...l, ...updates } : l);
    await saveLaws(updated);
  }, [laws]);

  const deleteLaw = useCallback(async (id: string) => {
    const law = laws.find(l => l.id === id);
    const updated = laws.filter(l => l.id !== id);
    await saveLaws(updated);
    
    if (law) {
      const updatedCountries = countries.map(c => 
        c.id === law.countryId ? { ...c, lawCount: Math.max(0, c.lawCount - 1) } : c
      );
      await saveCountries(updatedCountries);
    }
  }, [laws, countries]);

  const addQuestion = useCallback(async (question: Omit<Question, 'id' | 'votes' | 'answerCount' | 'createdAt' | 'isResolved'>) => {
    const newQuestion: Question = {
      ...question,
      id: Date.now().toString(),
      votes: 0,
      answerCount: 0,
      createdAt: new Date().toISOString(),
      isResolved: false,
    };
    const updated = [...questions, newQuestion];
    await saveQuestions(updated);
    return newQuestion;
  }, [questions]);

  const updateQuestion = useCallback(async (id: string, updates: Partial<Question>) => {
    const updated = questions.map(q => q.id === id ? { ...q, ...updates } : q);
    await saveQuestions(updated);
  }, [questions]);

  const voteQuestion = useCallback(async (id: string, increment: number) => {
    const updated = questions.map(q => 
      q.id === id ? { ...q, votes: q.votes + increment } : q
    );
    await saveQuestions(updated);
  }, [questions]);

  const addAnswer = useCallback(async (answer: Omit<Answer, 'id' | 'votes' | 'createdAt' | 'isAccepted'>, notifyQuestionAuthor?: (questionTitle: string, answerUserName: string, questionId: string) => Promise<void>) => {
    const newAnswer: Answer = {
      ...answer,
      id: Date.now().toString(),
      votes: 0,
      createdAt: new Date().toISOString(),
      isAccepted: false,
    };
    const updated = [...answers, newAnswer];
    await saveAnswers(updated);
    
    const updatedQuestions = questions.map(q => 
      q.id === answer.questionId ? { ...q, answerCount: q.answerCount + 1 } : q
    );
    await saveQuestions(updatedQuestions);
    
    if (notifyQuestionAuthor) {
      const question = questions.find(q => q.id === answer.questionId);
      const answerUser = mockUsers.find(u => u.id === answer.userId);
      if (question && answerUser && question.userId !== answer.userId) {
        await notifyQuestionAuthor(question.title, answerUser.name, question.id);
      }
    }
    
    return newAnswer;
  }, [answers, questions]);

  const voteAnswer = useCallback(async (id: string, increment: number) => {
    const updated = answers.map(a => 
      a.id === id ? { ...a, votes: a.votes + increment } : a
    );
    await saveAnswers(updated);
  }, [answers]);

  const acceptAnswer = useCallback(async (questionId: string, answerId: string, notifyAnswerAuthor?: (questionTitle: string, questionId: string) => Promise<void>) => {
    const updatedAnswers = answers.map(a => ({
      ...a,
      isAccepted: a.questionId === questionId ? a.id === answerId : a.isAccepted,
    }));
    await saveAnswers(updatedAnswers);
    
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, isResolved: true } : q
    );
    await saveQuestions(updatedQuestions);
    
    if (notifyAnswerAuthor) {
      const question = questions.find(q => q.id === questionId);
      const answer = answers.find(a => a.id === answerId);
      if (question && answer && question.userId !== answer.userId) {
        await notifyAnswerAuthor(question.title, questionId);
      }
    }
  }, [answers, questions]);

  const addCategory = useCallback(async (category: Omit<LawCategory, 'id'>) => {
    const newCategory: LawCategory = {
      ...category,
      id: Date.now().toString(),
    };
    const updated = [...categories, newCategory];
    await saveCategories(updated);
    return newCategory;
  }, [categories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<LawCategory>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
    await saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    await saveCategories(updated);
  }, [categories]);

  return {
    countries,
    laws,
    questions,
    answers,
    categories,
    isLoading,
    addCountry,
    updateCountry,
    deleteCountry,
    addLaw,
    updateLaw,
    deleteLaw,
    addQuestion,
    updateQuestion,
    voteQuestion,
    addAnswer,
    voteAnswer,
    acceptAnswer,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
