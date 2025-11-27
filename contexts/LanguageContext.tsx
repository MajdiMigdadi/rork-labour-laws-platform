import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';

const LANGUAGE_KEY = '@app_language';

export type Language = 'en' | 'ar';

export interface Translations {
  laws: string;
  qa: string;
  admin: string;
  profile: string;
  search: string;
  searchLaws: string;
  all: string;
  lawsFound: string;
  law: string;
  noLawsFound: string;
  tryAdjustingFilters: string;
  updated: string;
  countries: string;
  users: string;
  accuracy: string;
  manageCountries: string;
  manageLaws: string;
  manageUsers: string;
  manageCategories: string;
  add: string;
  edit: string;
  delete: string;
  cancel: string;
  save: string;
  addCountry: string;
  editCountry: string;
  deleteCountry: string;
  addLaw: string;
  editLaw: string;
  deleteLaw: string;
  addCategory: string;
  editCategory: string;
  deleteCategory: string;
  countryName: string;
  countryCode: string;
  countryFlag: string;
  categoryName: string;
  categoryIcon: string;
  lawTitle: string;
  lawDescription: string;
  lawContent: string;
  effectiveDate: string;
  source: string;
  category: string;
  categories: string;
  country: string;
  askQuestion: string;
  questions: string;
  answers: string;
  votes: string;
  resolved: string;
  unresolved: string;
  viewDetails: string;
  login: string;
  logout: string;
  register: string;
  email: string;
  password: string;
  name: string;
  level: string;
  reputation: string;
  beginner: string;
  intermediate: string;
  expert: string;
  adminRole: string;
  userRole: string;
  accessDenied: string;
  needAdminPrivileges: string;
  success: string;
  error: string;
  areYouSure: string;
  deleteConfirm: string;
}

const translations: Record<Language, Translations> = {
  en: {
    laws: 'Laws',
    qa: 'Q&A',
    admin: 'Admin',
    profile: 'Profile',
    search: 'Search',
    searchLaws: 'Search laws...',
    all: 'All',
    lawsFound: 'laws found',
    law: 'law',
    noLawsFound: 'No laws found',
    tryAdjustingFilters: 'Try adjusting your filters',
    updated: 'Updated',
    countries: 'Countries',
    users: 'Users',
    accuracy: 'Accuracy',
    manageCountries: 'Manage Countries',
    manageLaws: 'Manage Laws',
    manageUsers: 'Manage Users',
    manageCategories: 'Manage Categories',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    addCountry: 'Add Country',
    editCountry: 'Edit Country',
    deleteCountry: 'Delete Country',
    addLaw: 'Add Law',
    editLaw: 'Edit Law',
    deleteLaw: 'Delete Law',
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    deleteCategory: 'Delete Category',
    countryName: 'Country Name',
    countryCode: 'Country Code',
    countryFlag: 'Country Flag',
    categoryName: 'Category Name',
    categoryIcon: 'Category Icon',
    lawTitle: 'Law Title',
    lawDescription: 'Description',
    lawContent: 'Content',
    effectiveDate: 'Effective Date',
    source: 'Source',
    category: 'Category',
    categories: 'Categories',
    country: 'Country',
    askQuestion: 'Ask Question',
    questions: 'Questions',
    answers: 'Answers',
    votes: 'Votes',
    resolved: 'Resolved',
    unresolved: 'Unresolved',
    viewDetails: 'View Details',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    level: 'Level',
    reputation: 'Reputation',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    expert: 'Expert',
    adminRole: 'Admin',
    userRole: 'User',
    accessDenied: 'Access Denied',
    needAdminPrivileges: 'You need administrator privileges to access this area.',
    success: 'Success',
    error: 'Error',
    areYouSure: 'Are you sure?',
    deleteConfirm: 'This action cannot be undone.',
  },
  ar: {
    laws: 'القوانين',
    qa: 'أسئلة وأجوبة',
    admin: 'الإدارة',
    profile: 'الملف الشخصي',
    search: 'بحث',
    searchLaws: 'ابحث عن القوانين...',
    all: 'الكل',
    lawsFound: 'قانون',
    law: 'قانون',
    noLawsFound: 'لم يتم العثور على قوانين',
    tryAdjustingFilters: 'حاول تعديل الفلاتر',
    updated: 'تم التحديث',
    countries: 'الدول',
    users: 'المستخدمون',
    accuracy: 'الدقة',
    manageCountries: 'إدارة الدول',
    manageLaws: 'إدارة القوانين',
    manageUsers: 'إدارة المستخدمين',
    manageCategories: 'إدارة الفئات',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    cancel: 'إلغاء',
    save: 'حفظ',
    addCountry: 'إضافة دولة',
    editCountry: 'تعديل دولة',
    deleteCountry: 'حذف دولة',
    addLaw: 'إضافة قانون',
    editLaw: 'تعديل قانون',
    deleteLaw: 'حذف قانون',
    addCategory: 'إضافة فئة',
    editCategory: 'تعديل فئة',
    deleteCategory: 'حذف فئة',
    countryName: 'اسم الدولة',
    countryCode: 'رمز الدولة',
    countryFlag: 'علم الدولة',
    categoryName: 'اسم الفئة',
    categoryIcon: 'رمز الفئة',
    lawTitle: 'عنوان القانون',
    lawDescription: 'الوصف',
    lawContent: 'المحتوى',
    effectiveDate: 'تاريخ السريان',
    source: 'المصدر',
    category: 'الفئة',
    categories: 'الفئات',
    country: 'الدولة',
    askQuestion: 'اطرح سؤال',
    questions: 'الأسئلة',
    answers: 'الأجوبة',
    votes: 'الأصوات',
    resolved: 'تم الحل',
    unresolved: 'لم يتم الحل',
    viewDetails: 'عرض التفاصيل',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    level: 'المستوى',
    reputation: 'السمعة',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    expert: 'خبير',
    adminRole: 'مدير',
    userRole: 'مستخدم',
    accessDenied: 'تم رفض الوصول',
    needAdminPrivileges: 'تحتاج إلى صلاحيات المدير للوصول إلى هذه المنطقة.',
    success: 'نجاح',
    error: 'خطأ',
    areYouSure: 'هل أنت متأكد؟',
    deleteConfirm: 'لا يمكن التراجع عن هذا الإجراء.',
  },
};

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      console.log('Loading language from AsyncStorage:', stored || 'No data');
      
      if (stored) {
        if (typeof stored !== 'string' || (stored !== 'en' && stored !== 'ar')) {
          console.error('Invalid language value, resetting to default:', stored);
          await AsyncStorage.removeItem(LANGUAGE_KEY);
          setLanguage('en');
          setIsRTL(false);
          return;
        }
        
        setLanguage(stored);
        const shouldBeRTL = stored === 'ar';
        setIsRTL(shouldBeRTL);
        
        if (Platform.OS !== 'web' && I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.allowRTL(shouldBeRTL);
          I18nManager.forceRTL(shouldBeRTL);
        }
      }
    } catch (error) {
      console.error('Failed to load language:', error);
      setLanguage('en');
      setIsRTL(false);
    }
  };

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      setLanguage(newLanguage);
      const shouldBeRTL = newLanguage === 'ar';
      setIsRTL(shouldBeRTL);
      
      if (Platform.OS !== 'web') {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const t = translations[language];

  return {
    language,
    isRTL,
    changeLanguage,
    t,
  };
});
