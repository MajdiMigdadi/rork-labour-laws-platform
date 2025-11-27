export type UserRole = 'user' | 'admin';

export type UserLevel = 'beginner' | 'intermediate' | 'expert';

export type UserStatus = 'active' | 'banned' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  level: UserLevel;
  reputation: number;
  status: UserStatus;
  joinedDate: string;
  lastLogin?: string;
  notes?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  company?: string;
  location?: string;
  website?: string;
}

export interface Country {
  id: string;
  name: string;
  nameTranslations?: {
    en: string;
    ar: string;
  };
  code: string;
  flag: string;
  lawCount: number;
}

export interface LawCategory {
  id: string;
  name: string;
  nameTranslations?: {
    en: string;
    ar: string;
  };
  icon: string;
}

export interface Law {
  id: string;
  countryId: string;
  categoryId: string;
  title: string;
  titleTranslations?: {
    en: string;
    ar: string;
  };
  description: string;
  descriptionTranslations?: {
    en: string;
    ar: string;
  };
  content: string;
  contentTranslations?: {
    en: string;
    ar: string;
  };
  effectiveDate: string;
  lastUpdated: string;
  source: string;
}

export interface Question {
  id: string;
  userId: string;
  title: string;
  content: string;
  countryId: string;
  categoryId: string;
  votes: number;
  answerCount: number;
  createdAt: string;
  tags: string[];
  isResolved: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  votes: number;
  createdAt: string;
  isAccepted: boolean;
}

export interface LanguageSpecificSettings {
  appName: string;
  appDescription: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
  userId?: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface SocialLoginConfig {
  google?: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
  };
  facebook?: {
    enabled: boolean;
    appId?: string;
    appSecret?: string;
  };
  apple?: {
    enabled: boolean;
    clientId?: string;
    teamId?: string;
    keyId?: string;
  };
}

export interface RecaptchaConfig {
  enabled: boolean;
  siteKey?: string;
  secretKey?: string;
}

export interface AppSettings {
  appName: string;
  appDescription: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  favicon?: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  supportEmail: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  socialLogin?: SocialLoginConfig;
  recaptcha?: RecaptchaConfig;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  themeMode: 'light' | 'dark';
  languageSettings: {
    en: LanguageSpecificSettings;
    ar: LanguageSpecificSettings;
  };
}
