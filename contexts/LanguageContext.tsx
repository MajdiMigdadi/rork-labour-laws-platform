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
  fullName: string;
  createAccount: string;
  demoAccounts: string;
  accessLawsWorldwide: string;
  fillAllFields: string;
  authError: string;
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
  favorites: string;
  savedItems: string;
  noLawsSaved: string;
  noQuestionsSaved: string;
  bookmarkToSave: string;
  browseLaws: string;
  browseQuestions: string;
  home: string;
  contact: string;
  searchQuestions: string;
  total: string;
  solved: string;
  open: string;
  recent: string;
  popular: string;
  results: string;
  // Home page
  trustedByUsers: string;
  getStarted: string;
  exploreLaws: string;
  askAQuestion: string;
  exploreDatabase: string;
  getExpertHelp: string;
  available: string;
  access: string;
  whyChooseUs: string;
  everythingYouNeed: string;
  globalCoverage: string;
  globalCoverageDesc: string;
  expertCommunity: string;
  expertCommunityDesc: string;
  verifiedUpdated: string;
  verifiedUpdatedDesc: string;
  fastSearch: string;
  fastSearchDesc: string;
  howItWorks: string;
  getStartedSteps: string;
  stepSearch: string;
  stepSearchDesc: string;
  stepLearn: string;
  stepLearnDesc: string;
  stepAsk: string;
  stepAskDesc: string;
  readyToExplore: string;
  joinThousands: string;
  browseLawsNow: string;
  createFreeAccount: string;
  allRightsReserved: string;
  // Laws & Questions pages
  unanswered: string;
  noQuestionsFound: string;
  beFirstToAsk: string;
  tryAdjustingFilters: string;
  noLawsAvailable: string;
  // Contact page
  getInTouch: string;
  weLoveToHear: string;
  emailUsDirectly: string;
  orSendMessage: string;
  yourName: string;
  yourEmail: string;
  subject: string;
  whatsThisAbout: string;
  yourMessage: string;
  tellUsMore: string;
  sendMessage: string;
  // Profile page
  editProfile: string;
  updateInfo: string;
  theme: string;
  darkMode: string;
  lightMode: string;
  notifications: string;
  enabled: string;
  disabled: string;
  topContributors: string;
  memberSince: string;
  online: string;
  about: string;
  settings: string;
  badgesEarned: string;
  language: string;
  switchToLight: string;
  switchToDark: string;
  invalidCredentials: string;
  // Admin page
  dashboard: string;
  totalUsers: string;
  activeToday: string;
  pendingReview: string;
  // Notifications
  notificationsTitle: string;
  allCaughtUp: string;
  unread: string;
  markAllRead: string;
  clearAll: string;
  noNotifications: string;
  notificationsDesc: string;
  notificationSettings: string;
  enableNotifications: string;
  masterToggle: string;
  notificationTypes: string;
  newAnswers: string;
  newAnswersDesc: string;
  bestAnswer: string;
  bestAnswerDesc: string;
  lawUpdates: string;
  lawUpdatesDesc: string;
  announcements: string;
  announcementsDesc: string;
  achievements: string;
  achievementsDesc: string;
  preferences: string;
  sound: string;
  soundDesc: string;
  vibration: string;
  vibrationDesc: string;
  today: string;
  yesterday: string;
  thisWeek: string;
  earlier: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  // Onboarding
  skip: string;
  next: string;
  onboardingTitle1: string;
  onboardingDesc1: string;
  onboardingTitle2: string;
  onboardingDesc2: string;
  onboardingTitle3: string;
  onboardingDesc3: string;
  onboardingTitle4: string;
  onboardingDesc4: string;
  // Share
  share: string;
  shareLaw: string;
  shareQuestion: string;
  shareMore: string;
  copyLink: string;
  copied: string;
  // Search
  suggestions: string;
  recentSearches: string;
  popularSearches: string;
  // History
  readingHistory: string;
  noHistory: string;
  noHistoryDesc: string;
  clearHistory: string;
  clearHistoryConfirm: string;
  clear: string;
  view: string;
  views: string;
  item: string;
  items: string;
  justNow: string;
  ago: string;
  exploreLaws: string;
  viewAll: string;
  // Calculators
  calculatorTools: string;
  calculatorSubtitle: string;
  endOfServiceCalc: string;
  endOfServiceDesc: string;
  overtimeCalc: string;
  overtimeDesc: string;
  leaveCalc: string;
  leaveDesc: string;
  calculatorDisclaimer: string;
  fillDetails: string;
  basicSalary: string;
  years: string;
  months: string;
  separationType: string;
  resignation: string;
  termination: string;
  calculate: string;
  estimatedGratuity: string;
  currency: string;
  overtimeHours: string;
  overtimeType: string;
  normalDay: string;
  weekend: string;
  holiday: string;
  overtimePay: string;
  yearsOfService: string;
  unusedLeaveDays: string;
  annualEntitlement: string;
  leaveEncashment: string;
  days: string;
  hours: string;
  selectCountry: string;
  selectCountryDesc: string;
  selectCalculator: string;
  gccCountries: string;
  otherCountries: string;
  daysPerYear: string;
  extra: string;
  fullBenefits: string;
  mayReduce: string;
  estimated: string;
  endOfServiceBenefit: string;
  basedOn: string;
  laborLaw: string;
  hourlyRate: string;
  multiplier: string;
  dailyRate: string;
  // Settings
  settings: string;
  fontSize: string;
  small: string;
  medium: string;
  large: string;
  extraLarge: string;
  previewText: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  more: string;
  privacy: string;
  help: string;
  about: string;
  version: string;
  // Related Laws
  relatedLaws: string;
  read: string;
  // Ask Question
  askCommunity: string;
  getExpertAnswers: string;
  questionTitle: string;
  whatIsYourQuestion: string;
  details: string;
  provideContext: string;
  country: string;
  category: string;
  tagsOptional: string;
  addTag: string;
  add: string;
  tagsHint: string;
  postQuestion: string;
  errorEnterTitle: string;
  errorEnterDetails: string;
  errorSelectCountry: string;
  errorSelectCategory: string;
  errorMustLogin: string;
  successQuestionPosted: string;
  errorPostQuestion: string;
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
    fullName: 'Full Name',
    createAccount: 'Create Account',
    demoAccounts: 'Demo Accounts',
    accessLawsWorldwide: 'Access labour laws worldwide',
    fillAllFields: 'Please fill in all fields',
    authError: 'An error occurred. Please try again.',
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
    favorites: 'Favorites',
    savedItems: 'saved items',
    noLawsSaved: 'No Laws Saved',
    noQuestionsSaved: 'No Questions Saved',
    bookmarkToSave: 'Bookmark items to save them here',
    browseLaws: 'Browse Laws',
    browseQuestions: 'Browse Questions',
    home: 'Home',
    contact: 'Contact',
    searchQuestions: 'Search questions...',
    total: 'Total',
    solved: 'Solved',
    open: 'Open',
    recent: 'Recent',
    popular: 'Popular',
    results: 'Results',
    // Home page
    trustedByUsers: 'Trusted by 10,000+ users',
    getStarted: 'Get Started',
    exploreLaws: 'Explore Laws',
    askAQuestion: 'Ask a Question',
    exploreDatabase: 'Explore our database',
    getExpertHelp: 'Get expert help',
    available: 'available',
    access: 'Access',
    whyChooseUs: 'WHY CHOOSE US',
    everythingYouNeed: 'Everything you need to understand labour laws',
    globalCoverage: 'Global Coverage',
    globalCoverageDesc: 'Access comprehensive labour laws from countries worldwide with detailed explanations',
    expertCommunity: 'Expert Community',
    expertCommunityDesc: 'Connect with legal experts and get answers to your specific questions',
    verifiedUpdated: 'Verified & Updated',
    verifiedUpdatedDesc: 'All information is verified by experts and kept up-to-date with latest amendments',
    fastSearch: 'Fast Search',
    fastSearchDesc: 'Quickly find relevant laws with our powerful search and filtering system',
    howItWorks: 'HOW IT WORKS',
    getStartedSteps: 'Get started in 3 simple steps',
    stepSearch: 'Search',
    stepSearchDesc: 'Find laws by country or category',
    stepLearn: 'Learn',
    stepLearnDesc: 'Read detailed explanations',
    stepAsk: 'Ask',
    stepAskDesc: 'Get help from our community',
    readyToExplore: 'Ready to explore?',
    joinThousands: 'Join thousands of users who trust our platform for labour law information',
    browseLawsNow: 'Browse Laws Now',
    createFreeAccount: 'Create Free Account',
    allRightsReserved: 'All rights reserved',
    // Laws & Questions pages
    unanswered: 'Unanswered',
    noQuestionsFound: 'No questions found',
    beFirstToAsk: 'Be the first to ask!',
    tryAdjustingFilters: 'Try adjusting filters',
    noLawsAvailable: 'No laws available',
    // Contact page
    getInTouch: 'Get in Touch',
    weLoveToHear: "We'd love to hear from you",
    emailUsDirectly: 'Email us directly',
    orSendMessage: 'or send a message',
    yourName: 'Name',
    yourEmail: 'Email',
    subject: 'Subject',
    whatsThisAbout: "What's this about?",
    yourMessage: 'Message',
    tellUsMore: 'Tell us more about your inquiry...',
    sendMessage: 'Send Message',
    // Profile page
    editProfile: 'Edit Profile',
    updateInfo: 'Update your information',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    notifications: 'Notifications',
    enabled: 'Enabled',
    disabled: 'Disabled',
    topContributors: 'Top Contributors',
    memberSince: 'Member since',
    online: 'Online',
    about: 'About',
    settings: 'Settings',
    badgesEarned: 'Badges Earned',
    language: 'Language',
    switchToLight: 'Light',
    switchToDark: 'Dark',
    invalidCredentials: 'Invalid credentials. Try: admin@labourlaw.com or john@example.com',
    // Admin page
    dashboard: 'Dashboard',
    totalUsers: 'Total Users',
    activeToday: 'Active Today',
    pendingReview: 'Pending Review',
    // Notifications
    notificationsTitle: 'Notifications',
    allCaughtUp: 'All caught up',
    unread: 'unread',
    markAllRead: 'Mark all read',
    clearAll: 'Clear all',
    noNotifications: 'No Notifications',
    notificationsDesc: "You're all caught up! We'll notify you when there's something new.",
    notificationSettings: 'Notification Settings',
    enableNotifications: 'Enable Notifications',
    masterToggle: 'Master toggle for all notifications',
    notificationTypes: 'NOTIFICATION TYPES',
    newAnswers: 'New Answers',
    newAnswersDesc: 'When someone answers your question',
    bestAnswer: 'Best Answer',
    bestAnswerDesc: 'When your answer is selected',
    lawUpdates: 'Law Updates',
    lawUpdatesDesc: 'Updates to bookmarked laws',
    announcements: 'Announcements',
    announcementsDesc: 'Admin announcements',
    achievements: 'Achievements',
    achievementsDesc: 'Badges and achievements',
    preferences: 'PREFERENCES',
    sound: 'Sound',
    soundDesc: 'Play sound for notifications',
    vibration: 'Vibration',
    vibrationDesc: 'Vibrate for notifications',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    earlier: 'Earlier',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    // Onboarding
    skip: 'Skip',
    next: 'Next',
    onboardingTitle1: 'Global Labour Laws',
    onboardingDesc1: 'Access comprehensive labour laws from countries around the world, all in one place.',
    onboardingTitle2: 'Easy to Understand',
    onboardingDesc2: 'Complex legal information simplified with clear explanations and organized categories.',
    onboardingTitle3: 'Expert Community',
    onboardingDesc3: 'Ask questions and get answers from legal experts and experienced professionals.',
    onboardingTitle4: 'Always Up-to-Date',
    onboardingDesc4: 'Stay informed with the latest law updates and amendments verified by experts.',
    // Share
    share: 'Share',
    shareLaw: 'Share this law',
    shareQuestion: 'Share this question',
    shareMore: 'More Options',
    copyLink: 'Copy Text',
    copied: 'Copied!',
    // Search
    suggestions: 'Suggestions',
    recentSearches: 'Recent',
    popularSearches: 'Popular',
    // History
    readingHistory: 'Reading History',
    noHistory: 'No Reading History',
    noHistoryDesc: 'Laws and questions you view will appear here',
    clearHistory: 'Clear History',
    clearHistoryConfirm: 'Are you sure you want to clear all reading history?',
    clear: 'Clear',
    view: 'view',
    views: 'views',
    item: 'item',
    items: 'items',
    justNow: 'Just now',
    ago: 'ago',
    exploreLaws: 'Explore Laws',
    viewAll: 'View All',
    // Calculators
    calculatorTools: 'Calculator Tools',
    calculatorSubtitle: 'Calculate your labor benefits',
    endOfServiceCalc: 'End of Service',
    endOfServiceDesc: 'Calculate your end of service benefits',
    overtimeCalc: 'Overtime Pay',
    overtimeDesc: 'Calculate overtime compensation',
    leaveCalc: 'Annual Leave',
    leaveDesc: 'Calculate leave entitlement & encashment',
    calculatorDisclaimer: 'These calculators provide estimates based on general labor law guidelines. Actual amounts may vary based on your specific contract and local regulations.',
    fillDetails: 'Fill in the details below',
    basicSalary: 'Basic Salary (Monthly)',
    years: 'Years',
    months: 'Months',
    separationType: 'Type of Separation',
    resignation: 'Resignation',
    termination: 'Termination',
    calculate: 'Calculate',
    estimatedGratuity: 'Estimated End of Service',
    currency: 'AED',
    overtimeHours: 'Overtime Hours',
    overtimeType: 'Overtime Type',
    normalDay: 'Normal',
    weekend: 'Weekend',
    holiday: 'Holiday',
    overtimePay: 'Overtime Pay',
    yearsOfService: 'Years of Service',
    unusedLeaveDays: 'Unused Leave Days (for encashment)',
    annualEntitlement: 'Annual Entitlement',
    leaveEncashment: 'Leave Encashment',
    days: 'days',
    hours: 'hrs',
    selectCountry: 'Select Country',
    selectCountryDesc: 'Choose your work location',
    selectCalculator: 'Select Calculator',
    gccCountries: 'GCC Countries',
    otherCountries: 'Other Countries',
    daysPerYear: 'days/year',
    extra: 'extra',
    fullBenefits: 'Full benefits',
    mayReduce: 'May reduce',
    estimated: 'Estimated',
    endOfServiceBenefit: 'End of Service Benefit',
    basedOn: 'Based on',
    laborLaw: 'Labor Law',
    hourlyRate: 'Hourly Rate',
    multiplier: 'Multiplier',
    dailyRate: 'Daily Rate',
    // Settings
    settings: 'Settings',
    fontSize: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extraLarge: 'Extra Large',
    previewText: 'Preview text - نص المعاينة',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    more: 'More',
    privacy: 'Privacy',
    help: 'Help & Support',
    about: 'About',
    version: 'Version',
    // Related Laws
    relatedLaws: 'Related Laws',
    read: 'Read',
    // Ask Question
    askCommunity: 'Ask the Community',
    getExpertAnswers: 'Get expert answers to your labour law questions',
    questionTitle: 'Question Title',
    whatIsYourQuestion: 'What is your question?',
    details: 'Details',
    provideContext: 'Provide more context and details...',
    country: 'Country',
    category: 'Category',
    tagsOptional: 'Tags (Optional)',
    addTag: 'Add a tag...',
    add: 'Add',
    tagsHint: 'tags • Press Add or Enter to add a tag',
    postQuestion: 'Post Question',
    errorEnterTitle: 'Please enter a question title',
    errorEnterDetails: 'Please enter question details',
    errorSelectCountry: 'Please select a country',
    errorSelectCategory: 'Please select a category',
    errorMustLogin: 'You must be logged in to ask a question',
    successQuestionPosted: 'Your question has been posted! You earned 5 reputation points.',
    errorPostQuestion: 'Failed to post question. Please try again.',
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
    fullName: 'الاسم الكامل',
    createAccount: 'إنشاء حساب',
    demoAccounts: 'حسابات تجريبية',
    accessLawsWorldwide: 'الوصول إلى قوانين العمل في جميع أنحاء العالم',
    fillAllFields: 'يرجى ملء جميع الحقول',
    authError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
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
    favorites: 'المفضلة',
    savedItems: 'عنصر محفوظ',
    noLawsSaved: 'لا توجد قوانين محفوظة',
    noQuestionsSaved: 'لا توجد أسئلة محفوظة',
    bookmarkToSave: 'احفظ العناصر لتظهر هنا',
    browseLaws: 'تصفح القوانين',
    browseQuestions: 'تصفح الأسئلة',
    home: 'الرئيسية',
    contact: 'تواصل معنا',
    searchQuestions: 'ابحث عن الأسئلة...',
    total: 'الكل',
    solved: 'تم الحل',
    open: 'مفتوح',
    recent: 'الأحدث',
    popular: 'الأكثر شعبية',
    results: 'نتيجة',
    // Home page
    trustedByUsers: 'موثوق من قبل +10,000 مستخدم',
    getStarted: 'ابدأ الآن',
    exploreLaws: 'استكشف القوانين',
    askAQuestion: 'اطرح سؤالاً',
    exploreDatabase: 'استكشف قاعدة البيانات',
    getExpertHelp: 'احصل على مساعدة الخبراء',
    available: 'متاح',
    access: 'الوصول',
    whyChooseUs: 'لماذا تختارنا',
    everythingYouNeed: 'كل ما تحتاجه لفهم قوانين العمل',
    globalCoverage: 'تغطية عالمية',
    globalCoverageDesc: 'الوصول إلى قوانين العمل الشاملة من دول حول العالم مع شروحات مفصلة',
    expertCommunity: 'مجتمع الخبراء',
    expertCommunityDesc: 'تواصل مع خبراء قانونيين واحصل على إجابات لأسئلتك المحددة',
    verifiedUpdated: 'موثق ومحدث',
    verifiedUpdatedDesc: 'جميع المعلومات موثقة من قبل الخبراء ومحدثة بأحدث التعديلات',
    fastSearch: 'بحث سريع',
    fastSearchDesc: 'ابحث بسرعة عن القوانين ذات الصلة باستخدام نظام البحث والفلترة القوي',
    howItWorks: 'كيف يعمل',
    getStartedSteps: 'ابدأ في 3 خطوات بسيطة',
    stepSearch: 'ابحث',
    stepSearchDesc: 'ابحث عن القوانين حسب الدولة أو الفئة',
    stepLearn: 'تعلم',
    stepLearnDesc: 'اقرأ الشروحات المفصلة',
    stepAsk: 'اسأل',
    stepAskDesc: 'احصل على مساعدة من مجتمعنا',
    readyToExplore: 'هل أنت مستعد للاستكشاف؟',
    joinThousands: 'انضم إلى آلاف المستخدمين الذين يثقون بمنصتنا للحصول على معلومات قانون العمل',
    browseLawsNow: 'تصفح القوانين الآن',
    createFreeAccount: 'إنشاء حساب مجاني',
    allRightsReserved: 'جميع الحقوق محفوظة',
    // Laws & Questions pages
    unanswered: 'بدون إجابة',
    noQuestionsFound: 'لم يتم العثور على أسئلة',
    beFirstToAsk: 'كن أول من يسأل!',
    tryAdjustingFilters: 'حاول تعديل الفلاتر',
    noLawsAvailable: 'لا توجد قوانين متاحة',
    // Contact page
    getInTouch: 'تواصل معنا',
    weLoveToHear: 'نحب أن نسمع منك',
    emailUsDirectly: 'راسلنا مباشرة',
    orSendMessage: 'أو أرسل رسالة',
    yourName: 'الاسم',
    yourEmail: 'البريد الإلكتروني',
    subject: 'الموضوع',
    whatsThisAbout: 'ما هو الموضوع؟',
    yourMessage: 'الرسالة',
    tellUsMore: 'أخبرنا المزيد عن استفسارك...',
    sendMessage: 'إرسال الرسالة',
    // Profile page
    editProfile: 'تعديل الملف الشخصي',
    updateInfo: 'تحديث معلوماتك',
    theme: 'المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    notifications: 'الإشعارات',
    enabled: 'مفعلة',
    disabled: 'معطلة',
    topContributors: 'أفضل المساهمين',
    memberSince: 'عضو منذ',
    online: 'متصل',
    about: 'نبذة',
    settings: 'الإعدادات',
    badgesEarned: 'الشارات المكتسبة',
    language: 'اللغة',
    switchToLight: 'فاتح',
    switchToDark: 'داكن',
    invalidCredentials: 'بيانات غير صحيحة. جرب: admin@labourlaw.com أو john@example.com',
    // Admin page
    dashboard: 'لوحة التحكم',
    totalUsers: 'إجمالي المستخدمين',
    activeToday: 'نشط اليوم',
    pendingReview: 'قيد المراجعة',
    // Notifications
    notificationsTitle: 'الإشعارات',
    allCaughtUp: 'لا جديد',
    unread: 'غير مقروءة',
    markAllRead: 'تعيين الكل كمقروء',
    clearAll: 'مسح الكل',
    noNotifications: 'لا توجد إشعارات',
    notificationsDesc: 'لا جديد! سنعلمك عندما يكون هناك شيء جديد.',
    notificationSettings: 'إعدادات الإشعارات',
    enableNotifications: 'تفعيل الإشعارات',
    masterToggle: 'التحكم الرئيسي لجميع الإشعارات',
    notificationTypes: 'أنواع الإشعارات',
    newAnswers: 'إجابات جديدة',
    newAnswersDesc: 'عندما يجيب أحد على سؤالك',
    bestAnswer: 'أفضل إجابة',
    bestAnswerDesc: 'عندما يتم اختيار إجابتك',
    lawUpdates: 'تحديثات القوانين',
    lawUpdatesDesc: 'تحديثات القوانين المحفوظة',
    announcements: 'الإعلانات',
    announcementsDesc: 'إعلانات الإدارة',
    achievements: 'الإنجازات',
    achievementsDesc: 'الشارات والإنجازات',
    preferences: 'التفضيلات',
    sound: 'الصوت',
    soundDesc: 'تشغيل صوت للإشعارات',
    vibration: 'الاهتزاز',
    vibrationDesc: 'اهتزاز للإشعارات',
    today: 'اليوم',
    yesterday: 'أمس',
    thisWeek: 'هذا الأسبوع',
    earlier: 'سابقاً',
    justNow: 'الآن',
    minutesAgo: 'د',
    hoursAgo: 'س',
    // Onboarding
    skip: 'تخطي',
    next: 'التالي',
    onboardingTitle1: 'قوانين العمل العالمية',
    onboardingDesc1: 'الوصول إلى قوانين العمل الشاملة من دول حول العالم، كلها في مكان واحد.',
    onboardingTitle2: 'سهلة الفهم',
    onboardingDesc2: 'معلومات قانونية معقدة مبسطة مع شروحات واضحة وفئات منظمة.',
    onboardingTitle3: 'مجتمع الخبراء',
    onboardingDesc3: 'اطرح أسئلة واحصل على إجابات من خبراء قانونيين ومحترفين ذوي خبرة.',
    onboardingTitle4: 'دائماً محدث',
    onboardingDesc4: 'ابق على اطلاع بأحدث تحديثات القوانين والتعديلات الموثقة من قبل الخبراء.',
    // Share
    share: 'مشاركة',
    shareLaw: 'مشاركة هذا القانون',
    shareQuestion: 'مشاركة هذا السؤال',
    shareMore: 'خيارات أخرى',
    copyLink: 'نسخ النص',
    copied: 'تم النسخ!',
    // Search
    suggestions: 'اقتراحات',
    recentSearches: 'الأخيرة',
    popularSearches: 'الأكثر بحثاً',
    // History
    readingHistory: 'سجل القراءة',
    noHistory: 'لا يوجد سجل قراءة',
    noHistoryDesc: 'ستظهر هنا القوانين والأسئلة التي تشاهدها',
    clearHistory: 'مسح السجل',
    clearHistoryConfirm: 'هل أنت متأكد من مسح سجل القراءة بالكامل؟',
    clear: 'مسح',
    view: 'مشاهدة',
    views: 'مشاهدات',
    item: 'عنصر',
    items: 'عناصر',
    justNow: 'الآن',
    ago: 'منذ',
    exploreLaws: 'استكشف القوانين',
    viewAll: 'عرض الكل',
    // Calculators
    calculatorTools: 'أدوات الحساب',
    calculatorSubtitle: 'احسب مستحقاتك العمالية',
    endOfServiceCalc: 'نهاية الخدمة',
    endOfServiceDesc: 'احسب مكافأة نهاية الخدمة',
    overtimeCalc: 'أجر الوقت الإضافي',
    overtimeDesc: 'احسب تعويض العمل الإضافي',
    leaveCalc: 'الإجازة السنوية',
    leaveDesc: 'احسب استحقاق الإجازة وصرفها',
    calculatorDisclaimer: 'توفر هذه الحاسبات تقديرات بناءً على إرشادات قانون العمل العامة. قد تختلف المبالغ الفعلية بناءً على عقدك واللوائح المحلية.',
    fillDetails: 'أدخل التفاصيل أدناه',
    basicSalary: 'الراتب الأساسي (شهري)',
    years: 'سنوات',
    months: 'أشهر',
    separationType: 'نوع إنهاء الخدمة',
    resignation: 'استقالة',
    termination: 'إنهاء',
    calculate: 'احسب',
    estimatedGratuity: 'مكافأة نهاية الخدمة المقدرة',
    currency: 'درهم',
    overtimeHours: 'ساعات العمل الإضافي',
    overtimeType: 'نوع العمل الإضافي',
    normalDay: 'عادي',
    weekend: 'عطلة أسبوعية',
    holiday: 'عطلة رسمية',
    overtimePay: 'أجر العمل الإضافي',
    yearsOfService: 'سنوات الخدمة',
    unusedLeaveDays: 'أيام الإجازة غير المستخدمة (للصرف)',
    annualEntitlement: 'الاستحقاق السنوي',
    leaveEncashment: 'صرف الإجازة',
    days: 'أيام',
    hours: 'ساعات',
    selectCountry: 'اختر الدولة',
    selectCountryDesc: 'اختر موقع عملك',
    selectCalculator: 'اختر الحاسبة',
    gccCountries: 'دول الخليج',
    otherCountries: 'دول أخرى',
    daysPerYear: 'يوم/سنة',
    extra: 'إضافي',
    fullBenefits: 'مستحقات كاملة',
    mayReduce: 'قد تنخفض',
    estimated: 'تقديري',
    endOfServiceBenefit: 'مكافأة نهاية الخدمة',
    basedOn: 'بناءً على',
    laborLaw: 'قانون العمل',
    hourlyRate: 'الأجر بالساعة',
    multiplier: 'المضاعف',
    dailyRate: 'الأجر اليومي',
    // Settings
    settings: 'الإعدادات',
    fontSize: 'حجم الخط',
    small: 'صغير',
    medium: 'متوسط',
    large: 'كبير',
    extraLarge: 'كبير جداً',
    previewText: 'نص المعاينة - Preview text',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    more: 'المزيد',
    privacy: 'الخصوصية',
    help: 'المساعدة والدعم',
    about: 'حول التطبيق',
    version: 'الإصدار',
    // Related Laws
    relatedLaws: 'قوانين ذات صلة',
    read: 'قراءة',
    // Ask Question
    askCommunity: 'اسأل المجتمع',
    getExpertAnswers: 'احصل على إجابات الخبراء لأسئلتك حول قانون العمل',
    questionTitle: 'عنوان السؤال',
    whatIsYourQuestion: 'ما هو سؤالك؟',
    details: 'التفاصيل',
    provideContext: 'قدم المزيد من السياق والتفاصيل...',
    country: 'الدولة',
    category: 'الفئة',
    tagsOptional: 'الوسوم (اختياري)',
    addTag: 'أضف وسم...',
    add: 'إضافة',
    tagsHint: 'وسوم • اضغط إضافة أو Enter لإضافة وسم',
    postQuestion: 'نشر السؤال',
    errorEnterTitle: 'يرجى إدخال عنوان السؤال',
    errorEnterDetails: 'يرجى إدخال تفاصيل السؤال',
    errorSelectCountry: 'يرجى اختيار الدولة',
    errorSelectCategory: 'يرجى اختيار الفئة',
    errorMustLogin: 'يجب تسجيل الدخول لطرح سؤال',
    successQuestionPosted: 'تم نشر سؤالك! لقد حصلت على 5 نقاط سمعة.',
    errorPostQuestion: 'فشل نشر السؤال. يرجى المحاولة مرة أخرى.',
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
        
        if (Platform.OS === 'web') {
          // For web, apply RTL via document direction
          if (typeof document !== 'undefined') {
            document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = stored;
          }
        } else if (I18nManager.isRTL !== shouldBeRTL) {
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
      
      if (Platform.OS === 'web') {
        // For web, apply RTL via document direction
        if (typeof document !== 'undefined') {
          document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
          document.documentElement.lang = newLanguage;
        }
      } else {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const t = translations[language];

  // Helper function to get translated name for items with nameTranslations
  const getTranslatedName = (item: { name: string; nameTranslations?: { en: string; ar: string } }) => {
    if (item.nameTranslations) {
      return item.nameTranslations[language] || item.nameTranslations.en || item.name;
    }
    return item.name;
  };

  // Helper function to get translated title for items with titleTranslations
  const getTranslatedTitle = (item: { title: string; titleTranslations?: { en: string; ar: string } }) => {
    if (item.titleTranslations) {
      return item.titleTranslations[language] || item.titleTranslations.en || item.title;
    }
    return item.title;
  };

  // Helper function to get translated description
  const getTranslatedDescription = (item: { description: string; descriptionTranslations?: { en: string; ar: string } }) => {
    if (item.descriptionTranslations) {
      return item.descriptionTranslations[language] || item.descriptionTranslations.en || item.description;
    }
    return item.description;
  };

  // Helper function to get translated content
  const getTranslatedContent = (item: { content: string; contentTranslations?: { en: string; ar: string } }) => {
    if (item.contentTranslations) {
      return item.contentTranslations[language] || item.contentTranslations.en || item.content;
    }
    return item.content;
  };

  return {
    language,
    isRTL,
    changeLanguage,
    t,
    getTranslatedName,
    getTranslatedTitle,
    getTranslatedDescription,
    getTranslatedContent,
  };
});
