import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Country, Law, Question, Answer, LawCategory } from '@/types';
import { mockCountries, mockLaws, mockQuestions, mockAnswers, mockCategories, mockUsers } from '@/mocks/data';
import { API_CONFIG } from '@/services/api';

const COUNTRIES_KEY = '@data_countries';
const LAWS_KEY = '@data_laws';
const QUESTIONS_KEY = '@data_questions';
const ANSWERS_KEY = '@data_answers';
const CATEGORIES_KEY = '@data_categories';

const API_BASE_URL = API_CONFIG.API_URL;

// Helper to make API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (!API_CONFIG.USE_REAL_API) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      console.error(`API error ${response.status}:`, await response.text());
      return null;
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
}

// Transform API country to app format (snake_case to camelCase)
function transformCountry(apiCountry: any): Country {
  return {
    id: String(apiCountry.id),
    name: apiCountry.name,
    nameAr: apiCountry.name_ar || apiCountry.nameAr || '',
    code: apiCountry.code,
    flag: apiCountry.flag,
    description: apiCountry.description || '',
    descriptionAr: apiCountry.description_ar || apiCountry.descriptionAr || '',
    lawCount: apiCountry.law_count || apiCountry.lawCount || 0,
  };
}

// Transform API law to app format
function transformLaw(apiLaw: any): Law {
  return {
    id: String(apiLaw.id),
    title: apiLaw.title,
    titleAr: apiLaw.title_ar || apiLaw.titleAr || '',
    content: apiLaw.content,
    contentAr: apiLaw.content_ar || apiLaw.contentAr || '',
    countryId: String(apiLaw.country_id || apiLaw.countryId),
    categoryId: String(apiLaw.category_id || apiLaw.categoryId),
    source: apiLaw.source || '',
    lastUpdated: apiLaw.last_updated || apiLaw.lastUpdated || apiLaw.updated_at || '',
  };
}

// Transform API category to app format
function transformCategory(apiCategory: any): LawCategory {
  return {
    id: String(apiCategory.id),
    name: apiCategory.name,
    nameAr: apiCategory.name_ar || apiCategory.nameAr || '',
    icon: apiCategory.icon || 'FileText',
    color: apiCategory.color || '#6366F1',
  };
}

// Transform API question to app format
function transformQuestion(apiQuestion: any): Question {
  return {
    id: String(apiQuestion.id),
    title: apiQuestion.title,
    content: apiQuestion.content,
    userId: String(apiQuestion.user_id || apiQuestion.userId),
    countryId: String(apiQuestion.country_id || apiQuestion.countryId),
    tags: apiQuestion.tags || [],
    votes: apiQuestion.votes || 0,
    answerCount: apiQuestion.answer_count || apiQuestion.answerCount || 0,
    createdAt: apiQuestion.created_at || apiQuestion.createdAt || '',
    isResolved: apiQuestion.is_resolved || apiQuestion.isResolved || false,
  };
}

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
    setIsLoading(true);
    try {
      // Try to load from API first
      if (API_CONFIG.USE_REAL_API) {
        console.log('📡 Loading data from API...');
        const [apiCountries, apiLaws, apiQuestions, apiCategories] = await Promise.all([
          apiCall<any[]>('/countries'),
          apiCall<any[]>('/laws'),
          apiCall<any[]>('/questions'),
          apiCall<any[]>('/categories'),
        ]);

        let gotApiData = false;

        if (apiCountries && Array.isArray(apiCountries)) {
          const transformedCountries = apiCountries.map(transformCountry);
          console.log('✅ Countries loaded from API:', transformedCountries.length);
          setCountries(transformedCountries);
          await AsyncStorage.setItem(COUNTRIES_KEY, JSON.stringify(transformedCountries));
          gotApiData = true;
        }
        
        if (apiLaws && Array.isArray(apiLaws)) {
          const transformedLaws = apiLaws.map(transformLaw);
          console.log('✅ Laws loaded from API:', transformedLaws.length);
          setLaws(transformedLaws);
          await AsyncStorage.setItem(LAWS_KEY, JSON.stringify(transformedLaws));
          gotApiData = true;
        }
        
        if (apiQuestions && Array.isArray(apiQuestions)) {
          const transformedQuestions = apiQuestions.map(transformQuestion);
          console.log('✅ Questions loaded from API:', transformedQuestions.length);
          setQuestions(transformedQuestions);
          await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(transformedQuestions));
          gotApiData = true;
        }
        
        if (apiCategories && Array.isArray(apiCategories)) {
          const transformedCategories = apiCategories.map(transformCategory);
          console.log('✅ Categories loaded from API:', transformedCategories.length);
          setCategories(transformedCategories);
          await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(transformedCategories));
          gotApiData = true;
        }

        // If we got data from API, we're done
        if (gotApiData) {
          // Load answers from API or local storage - NO mock data
          const storedAnswers = await AsyncStorage.getItem(ANSWERS_KEY);
          if (storedAnswers) {
            setAnswers(JSON.parse(storedAnswers));
          } else {
            // Start with empty answers - no mock data
            setAnswers([]);
          }
          setIsLoading(false);
          return;
        }
      }

      // Fallback to local storage
      console.log('📦 Loading data from local storage...');
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

      setCountries(parseOrDefault(storedCountries, [], COUNTRIES_KEY));
      setLaws(parseOrDefault(storedLaws, [], LAWS_KEY));
      setQuestions(parseOrDefault(storedQuestions, [], QUESTIONS_KEY));
      setAnswers(parseOrDefault(storedAnswers, [], ANSWERS_KEY));
      setCategories(parseOrDefault(storedCategories, [], CATEGORIES_KEY));
    } catch (error) {
      console.error('Failed to load data:', error);
      setCountries([]);
      setLaws([]);
      setQuestions([]);
      setAnswers([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data from API
  const refreshData = useCallback(async () => {
    await loadData();
  }, []);

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
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      const apiResult = await apiCall<any>('/countries', {
        method: 'POST',
        body: JSON.stringify({
          name: country.name,
          name_ar: country.nameAr,
          code: country.code,
          flag: country.flag,
          description: country.description,
          description_ar: country.descriptionAr,
          law_count: 0,
        }),
      });
      
      if (apiResult) {
        const newCountry = transformCountry(apiResult);
        const updated = [...countries, newCountry];
        await saveCountries(updated);
        return newCountry;
      }
    }
    
    // Fallback to local
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
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/countries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    
    const updated = countries.map(c => c.id === id ? { ...c, ...updates } : c);
    await saveCountries(updated);
  }, [countries]);

  const deleteCountry = useCallback(async (id: string) => {
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/countries/${id}`, { method: 'DELETE' });
    }
    
    const updated = countries.filter(c => c.id !== id);
    await saveCountries(updated);
    const updatedLaws = laws.filter(l => l.countryId !== id);
    await saveLaws(updatedLaws);
  }, [countries, laws]);

  const addLaw = useCallback(async (law: Omit<Law, 'id'>) => {
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      const apiResult = await apiCall<any>('/laws', {
        method: 'POST',
        body: JSON.stringify({
          title: law.title,
          title_ar: law.titleAr,
          content: law.content,
          content_ar: law.contentAr,
          country_id: law.countryId,
          category_id: law.categoryId,
          source: law.source,
          last_updated: law.lastUpdated,
        }),
      });
      
      if (apiResult) {
        const newLaw = transformLaw(apiResult);
        const updated = [...laws, newLaw];
        await saveLaws(updated);
        
        const updatedCountries = countries.map(c => 
          c.id === law.countryId ? { ...c, lawCount: c.lawCount + 1 } : c
        );
        await saveCountries(updatedCountries);
        
        return newLaw;
      }
    }
    
    // Fallback to local
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
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/laws/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    
    const updated = laws.map(l => l.id === id ? { ...l, ...updates } : l);
    await saveLaws(updated);
  }, [laws]);

  const deleteLaw = useCallback(async (id: string) => {
    const law = laws.find(l => l.id === id);
    
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/laws/${id}`, { method: 'DELETE' });
    }
    
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
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      const apiResult = await apiCall<any>('/questions', {
        method: 'POST',
        body: JSON.stringify({
          title: question.title,
          content: question.content,
          user_id: question.userId,
          country_id: question.countryId,
          tags: question.tags,
        }),
      });
      
      if (apiResult) {
        const newQuestion = transformQuestion(apiResult);
        const updated = [...questions, newQuestion];
        await saveQuestions(updated);
        return newQuestion;
      }
    }
    
    // Fallback to local
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
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    
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
    // Try API first
    if (API_CONFIG.USE_REAL_API) {
      const apiResult = await apiCall<any>('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: category.name,
          name_ar: category.nameAr,
          icon: category.icon,
          color: category.color,
        }),
      });
      
      if (apiResult) {
        const newCategory = transformCategory(apiResult);
        const updated = [...categories, newCategory];
        await saveCategories(updated);
        return newCategory;
      }
    }
    
    // Fallback to local
    const newCategory: LawCategory = {
      ...category,
      id: Date.now().toString(),
    };
    const updated = [...categories, newCategory];
    await saveCategories(updated);
    return newCategory;
  }, [categories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<LawCategory>) => {
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    
    const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
    await saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/categories/${id}`, { method: 'DELETE' });
    }
    
    const updated = categories.filter(c => c.id !== id);
    await saveCategories(updated);
  }, [categories]);

  const deleteQuestion = useCallback(async (id: string) => {
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/questions/${id}`, { method: 'DELETE' });
    }
    
    // Delete the question
    const updatedQuestions = questions.filter(q => q.id !== id);
    await saveQuestions(updatedQuestions);
    
    // Also delete all answers for this question
    const updatedAnswers = answers.filter(a => a.questionId !== id);
    await saveAnswers(updatedAnswers);
  }, [questions, answers]);

  const deleteAnswer = useCallback(async (id: string) => {
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/answers/${id}`, { method: 'DELETE' });
    }
    
    const answer = answers.find(a => a.id === id);
    const updatedAnswers = answers.filter(a => a.id !== id);
    await saveAnswers(updatedAnswers);
    
    // Update question answer count
    if (answer) {
      const updatedQuestions = questions.map(q => 
        q.id === answer.questionId ? { ...q, answerCount: Math.max(0, q.answerCount - 1) } : q
      );
      await saveQuestions(updatedQuestions);
    }
  }, [answers, questions]);

  return {
    countries,
    laws,
    questions,
    answers,
    categories,
    isLoading,
    refreshData,
    addCountry,
    updateCountry,
    deleteCountry,
    addLaw,
    updateLaw,
    deleteLaw,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    voteQuestion,
    addAnswer,
    voteAnswer,
    acceptAnswer,
    deleteAnswer,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
