import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  Calendar,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Globe,
  Sparkles,
  Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import FlagDisplay from '@/components/FlagDisplay';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

type Step = 'country' | 'calculator' | 'form';
type CalculatorType = 'endOfService' | 'overtime' | 'leave';

interface CountryRules {
  endOfService: {
    firstYearsRate: number;
    firstYearsPeriod: number;
    laterYearsRate: number;
    minYearsForGratuity: number;
    resignationPenalty: boolean;
    maxGratuityYears: number;
  };
  overtime: {
    normalRate: number;
    weekendRate: number;
    holidayRate: number;
    workHoursPerMonth: number;
  };
  leave: {
    annualDays: number;
    minYearsForFullLeave: number;
    daysPerMonthFirstYear: number;
  };
  currency: string;
  currencySymbol: string;
}

const countryRules: Record<string, CountryRules> = {
  'uae': {
    endOfService: { firstYearsRate: 21, firstYearsPeriod: 5, laterYearsRate: 30, minYearsForGratuity: 1, resignationPenalty: true, maxGratuityYears: 24 },
    overtime: { normalRate: 1.25, weekendRate: 1.5, holidayRate: 2.0, workHoursPerMonth: 240 },
    leave: { annualDays: 30, minYearsForFullLeave: 1, daysPerMonthFirstYear: 2 },
    currency: 'AED', currencySymbol: 'د.إ',
  },
  'sau': {
    endOfService: { firstYearsRate: 15, firstYearsPeriod: 5, laterYearsRate: 30, minYearsForGratuity: 2, resignationPenalty: true, maxGratuityYears: 24 },
    overtime: { normalRate: 1.5, weekendRate: 1.5, holidayRate: 2.0, workHoursPerMonth: 240 },
    leave: { annualDays: 21, minYearsForFullLeave: 5, daysPerMonthFirstYear: 2 },
    currency: 'SAR', currencySymbol: 'ر.س',
  },
  'kwt': {
    endOfService: { firstYearsRate: 15, firstYearsPeriod: 5, laterYearsRate: 30, minYearsForGratuity: 3, resignationPenalty: false, maxGratuityYears: 18 },
    overtime: { normalRate: 1.25, weekendRate: 1.5, holidayRate: 2.0, workHoursPerMonth: 240 },
    leave: { annualDays: 30, minYearsForFullLeave: 1, daysPerMonthFirstYear: 2.5 },
    currency: 'KWD', currencySymbol: 'د.ك',
  },
  'qat': {
    endOfService: { firstYearsRate: 21, firstYearsPeriod: 5, laterYearsRate: 30, minYearsForGratuity: 1, resignationPenalty: false, maxGratuityYears: 24 },
    overtime: { normalRate: 1.25, weekendRate: 1.5, holidayRate: 2.0, workHoursPerMonth: 240 },
    leave: { annualDays: 21, minYearsForFullLeave: 1, daysPerMonthFirstYear: 2 },
    currency: 'QAR', currencySymbol: 'ر.ق',
  },
  'bhr': {
    endOfService: { firstYearsRate: 15, firstYearsPeriod: 3, laterYearsRate: 15, minYearsForGratuity: 1, resignationPenalty: false, maxGratuityYears: 24 },
    overtime: { normalRate: 1.25, weekendRate: 1.5, holidayRate: 2.0, workHoursPerMonth: 240 },
    leave: { annualDays: 30, minYearsForFullLeave: 1, daysPerMonthFirstYear: 2.5 },
    currency: 'BHD', currencySymbol: 'د.ب',
  },
  'omn': {
    endOfService: { firstYearsRate: 15, firstYearsPeriod: 3, laterYearsRate: 30, minYearsForGratuity: 1, resignationPenalty: false, maxGratuityYears: 24 },
    overtime: { normalRate: 1.25, weekendRate: 1.5, holidayRate: 2.0, workHoursPerMonth: 240 },
    leave: { annualDays: 30, minYearsForFullLeave: 1, daysPerMonthFirstYear: 2 },
    currency: 'OMR', currencySymbol: 'ر.ع',
  },
};

const defaultRules: CountryRules = {
  endOfService: { firstYearsRate: 21, firstYearsPeriod: 5, laterYearsRate: 30, minYearsForGratuity: 1, resignationPenalty: false, maxGratuityYears: 24 },
  overtime: { normalRate: 1.25, weekendRate: 1.5, holidayRate: 2.0, workHoursPerMonth: 240 },
  leave: { annualDays: 21, minYearsForFullLeave: 1, daysPerMonthFirstYear: 2 },
  currency: 'USD', currencySymbol: '$',
};

export default function CalculatorsScreen() {
  const theme = useTheme();
  const { isRTL, t, getTranslatedName } = useLanguage();
  const { countries } = useData();
  const [step, setStep] = useState<Step>('country');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const selectedCountryData = useMemo(() => {
    return countries.find(c => c.id === selectedCountry);
  }, [selectedCountry, countries]);

  const rules = useMemo(() => {
    if (!selectedCountryData) return defaultRules;
    return countryRules[selectedCountryData.code.toLowerCase()] || defaultRules;
  }, [selectedCountryData]);

  const handleSelectCountry = (countryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateTransition(() => {
      setSelectedCountry(countryId);
      setStep('calculator');
    });
  };

  const handleSelectCalculator = (calc: CalculatorType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(() => {
      setSelectedCalculator(calc);
      setStep('form');
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(() => {
      if (step === 'form') {
        setStep('calculator');
        setSelectedCalculator(null);
      } else if (step === 'calculator') {
        setStep('country');
        setSelectedCountry(null);
      }
    });
  };

  const calculators = [
    {
      id: 'endOfService' as CalculatorType,
      title: t.endOfServiceCalc || 'End of Service',
      description: t.endOfServiceDesc || 'Calculate gratuity benefits',
      icon: Briefcase,
      color: '#6366f1',
      bgColor: '#eef2ff',
      info: `${rules.endOfService.firstYearsRate} ${t.daysPerYear || 'days/year'}`,
    },
    {
      id: 'overtime' as CalculatorType,
      title: t.overtimeCalc || 'Overtime Pay',
      description: t.overtimeDesc || 'Calculate extra hours pay',
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      info: `+${Math.round((rules.overtime.normalRate - 1) * 100)}% ${t.extra || 'extra'}`,
    },
    {
      id: 'leave' as CalculatorType,
      title: t.leaveCalc || 'Annual Leave',
      description: t.leaveDesc || 'Calculate leave & encashment',
      icon: Calendar,
      color: '#10b981',
      bgColor: '#ecfdf5',
      info: `${rules.leave.annualDays} ${t.daysPerYear || 'days/year'}`,
    },
  ];

  const getStepTitle = () => {
    if (step === 'country') return t.selectCountry || 'Select Country';
    if (step === 'calculator') return t.selectCalculator || 'Choose Calculator';
    return calculators.find(c => c.id === selectedCalculator)?.title || '';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerTop}>
          {step !== 'country' ? (
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.backgroundSecondary }]} onPress={handleBack}>
              <ArrowLeft size={20} color={theme.text} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerIconContainer}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.headerIcon}>
                <Calculator size={20} color="#fff" />
              </LinearGradient>
            </View>
          )}
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{getStepTitle()}</Text>
            {selectedCountryData && step !== 'country' && (
              <View style={[styles.countryPill, { backgroundColor: theme.backgroundSecondary }]}>
                <FlagDisplay countryCode={selectedCountryData.code} size={14} />
                <Text style={[styles.countryPillText, { color: theme.textSecondary }]}>
                  {getTranslatedName(selectedCountryData)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerRight} />
        </View>
        
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'country' ? styles.stepDotActive : styles.stepDotDone]} />
          <View style={[styles.stepLine, step !== 'country' && styles.stepLineDone]} />
          <View style={[styles.stepDot, step === 'calculator' ? styles.stepDotActive : step === 'form' ? styles.stepDotDone : styles.stepDotInactive]} />
          <View style={[styles.stepLine, step === 'form' && styles.stepLineDone]} />
          <View style={[styles.stepDot, step === 'form' ? styles.stepDotActive : styles.stepDotInactive]} />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {step === 'country' && (
              <CountrySelector 
                countries={countries}
                onSelect={handleSelectCountry}
                theme={theme}
                isRTL={isRTL}
                t={t}
                getTranslatedName={getTranslatedName}
              />
            )}
            
            {step === 'calculator' && (
              <CalculatorSelector
                calculators={calculators}
                onSelect={handleSelectCalculator}
                theme={theme}
                isRTL={isRTL}
                t={t}
              />
            )}
            
            {step === 'form' && selectedCalculator === 'endOfService' && (
              <EndOfServiceCalculator 
                theme={theme} 
                isRTL={isRTL} 
                t={t} 
                rules={rules}
                countryName={selectedCountryData ? getTranslatedName(selectedCountryData) : ''}
              />
            )}
            
            {step === 'form' && selectedCalculator === 'overtime' && (
              <OvertimeCalculator theme={theme} isRTL={isRTL} t={t} rules={rules} />
            )}
            
            {step === 'form' && selectedCalculator === 'leave' && (
              <LeaveCalculator theme={theme} isRTL={isRTL} t={t} rules={rules} />
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Country Selector
function CountrySelector({ countries, onSelect, theme, isRTL, t, getTranslatedName }: any) {
  const gccCountries = countries.filter((c: any) => ['UAE', 'SAU', 'KWT', 'QAT', 'BHR', 'OMN'].includes(c.code));
  const otherCountries = countries.filter((c: any) => !['UAE', 'SAU', 'KWT', 'QAT', 'BHR', 'OMN'].includes(c.code));

  return (
    <View style={styles.selectorContainer}>
      {/* GCC Section */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
          <Star size={16} color="#f59e0b" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.gccCountries || 'GCC Countries'}
          </Text>
        </View>
        
        <View style={styles.countryGrid}>
          {gccCountries.map((country: any) => (
            <TouchableOpacity
              key={country.id}
              style={[styles.countryCard, { backgroundColor: theme.card }]}
              onPress={() => onSelect(country.id)}
              activeOpacity={0.7}
            >
              <View style={styles.countryFlagWrapper}>
                <FlagDisplay countryCode={country.code} size={36} />
              </View>
              <Text style={[styles.countryName, { color: theme.text }]} numberOfLines={1}>
                {getTranslatedName(country)}
              </Text>
              <Text style={[styles.countryCurrency, { color: theme.textSecondary }]}>
                {countryRules[country.code.toLowerCase()]?.currency || 'USD'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Other Countries */}
      {otherCountries.length > 0 && (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
            <Globe size={16} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.otherCountries || 'Other Countries'}
            </Text>
          </View>
          
          <View style={styles.countryList}>
            {otherCountries.map((country: any) => (
              <TouchableOpacity
                key={country.id}
                style={[styles.countryListItem, { backgroundColor: theme.card }]}
                onPress={() => onSelect(country.id)}
                activeOpacity={0.7}
              >
                <FlagDisplay countryCode={country.code} size={24} />
                <Text style={[styles.countryListName, { color: theme.text }]}>
                  {getTranslatedName(country)}
                </Text>
                <ChevronRight size={18} color={theme.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Calculator Selector
function CalculatorSelector({ calculators, onSelect, theme, isRTL, t }: any) {
  return (
    <View style={styles.selectorContainer}>
      <View style={styles.calcGrid}>
        {calculators.map((calc: any) => {
          const IconComponent = calc.icon;
          return (
            <TouchableOpacity
              key={calc.id}
              style={[styles.calcCard, { backgroundColor: theme.card }]}
              onPress={() => onSelect(calc.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.calcIconWrapper, { backgroundColor: calc.bgColor }, isRTL && styles.calcIconWrapperRTL]}>
                <IconComponent size={28} color={calc.color} />
              </View>
              
              <Text style={[styles.calcTitle, { color: theme.text }, isRTL && styles.textRTL]}>{calc.title}</Text>
              <Text style={[styles.calcDesc, { color: theme.textSecondary }, isRTL && styles.textRTL]}>{calc.description}</Text>
              
              <View style={[styles.calcBadge, { backgroundColor: calc.bgColor }, isRTL && styles.calcBadgeRTL]}>
                <Text style={[styles.calcBadgeText, { color: calc.color }]}>{calc.info}</Text>
              </View>
              
              <View style={[styles.calcArrow, { backgroundColor: calc.bgColor }, isRTL && styles.calcArrowRTL]}>
                <ChevronRight size={18} color={calc.color} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Styled Input Component
function StyledInput({ label, icon: Icon, iconColor, iconBg, value, onChangeText, placeholder, suffix, theme, keyboardType = 'decimal-pad' }: any) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={[styles.inputContainer, { backgroundColor: theme.card }, isFocused && styles.inputContainerFocused]}>
      <View style={styles.inputTop}>
        <View style={[styles.inputIcon, { backgroundColor: iconBg }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <View style={[styles.inputField, { backgroundColor: theme.backgroundSecondary }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {suffix && <Text style={[styles.inputSuffix, { color: theme.textSecondary }]}>{suffix}</Text>}
      </View>
    </View>
  );
}

// End of Service Calculator
function EndOfServiceCalculator({ theme, isRTL, t, rules, countryName }: any) {
  const [salary, setSalary] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [type, setType] = useState<'termination' | 'resignation'>('termination');
  const [result, setResult] = useState<number | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;

  const calculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const salaryNum = parseFloat(salary) || 0;
    const yearsNum = parseFloat(years) || 0;
    const monthsNum = parseFloat(months) || 0;
    const totalYears = yearsNum + (monthsNum / 12);
    
    if (salaryNum <= 0 || totalYears <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    let gratuity = 0;
    const dailyRate = salaryNum / 30;
    const { firstYearsRate, firstYearsPeriod, laterYearsRate, minYearsForGratuity, resignationPenalty, maxGratuityYears } = rules.endOfService;

    if (totalYears < minYearsForGratuity) {
      gratuity = 0;
    } else if (totalYears <= firstYearsPeriod) {
      gratuity = dailyRate * firstYearsRate * totalYears;
    } else {
      gratuity = (dailyRate * firstYearsRate * firstYearsPeriod) + (dailyRate * laterYearsRate * (totalYears - firstYearsPeriod));
    }

    if (resignationPenalty && type === 'resignation' && totalYears < 5) {
      if (totalYears >= 1 && totalYears < 3) gratuity *= (1/3);
      else if (totalYears >= 3 && totalYears < 5) gratuity *= (2/3);
    }

    gratuity = Math.min(gratuity, salaryNum * maxGratuityYears);
    setResult(Math.round(gratuity * 100) / 100);
    
    resultAnim.setValue(0);
    Animated.spring(resultAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.formContainer}>
      <StyledInput
        label={t.basicSalary || 'Monthly Salary'}
        icon={DollarSign}
        iconColor="#6366f1"
        iconBg="#eef2ff"
        value={salary}
        onChangeText={setSalary}
        placeholder="0.00"
        suffix={rules.currency}
        theme={theme}
      />
      
      <View style={styles.rowInputs}>
        <View style={styles.halfInput}>
          <StyledInput
            label={t.years || 'Years'}
            icon={Calendar}
            iconColor="#f59e0b"
            iconBg="#fffbeb"
            value={years}
            onChangeText={setYears}
            placeholder="0"
            theme={theme}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.halfInput}>
          <StyledInput
            label={t.months || 'Months'}
            icon={Clock}
            iconColor="#10b981"
            iconBg="#ecfdf5"
            value={months}
            onChangeText={setMonths}
            placeholder="0"
            theme={theme}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {rules.endOfService.resignationPenalty && (
        <View style={[styles.toggleSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>{t.separationType || 'Separation Type'}</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, type === 'termination' && styles.toggleBtnActive]}
              onPress={() => setType('termination')}
            >
              <Text style={[styles.toggleBtnText, type === 'termination' && styles.toggleBtnTextActive]}>
                {t.termination || 'Termination'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, type === 'resignation' && styles.toggleBtnActiveOrange]}
              onPress={() => setType('resignation')}
            >
              <Text style={[styles.toggleBtnText, type === 'resignation' && styles.toggleBtnTextActive]}>
                {t.resignation || 'Resignation'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.calculateBtn} onPress={calculate} activeOpacity={0.9}>
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.calculateBtnGradient}>
          <Calculator size={20} color="#fff" />
          <Text style={styles.calculateBtnText}>{t.calculate || 'Calculate'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {result !== null && (
        <Animated.View style={[styles.resultCard, { backgroundColor: theme.card, opacity: resultAnim, transform: [{ scale: resultAnim }] }]}>
          <View style={styles.resultHeader}>
            <View style={styles.resultIconBg}>
              <CheckCircle size={24} color="#10b981" />
            </View>
            <Text style={[styles.resultTitle, { color: theme.textSecondary }]}>
              {t.estimatedGratuity || 'Estimated Gratuity'}
            </Text>
          </View>
          <Text style={[styles.resultAmount, { color: theme.text }]}>
            <Text style={styles.resultCurrency}>{rules.currencySymbol} </Text>
            {result.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.resultNote, { color: theme.textSecondary }]}>
            {t.basedOn || 'Based on'} {countryName} {t.laborLaw || 'Labor Law'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

// Overtime Calculator
function OvertimeCalculator({ theme, isRTL, t, rules }: any) {
  const [salary, setSalary] = useState('');
  const [hours, setHours] = useState('');
  const [type, setType] = useState<'normal' | 'weekend' | 'holiday'>('normal');
  const [result, setResult] = useState<number | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;

  const types = [
    { id: 'normal', label: t.normalDay || 'Normal', rate: rules.overtime.normalRate, color: '#6366f1' },
    { id: 'weekend', label: t.weekend || 'Weekend', rate: rules.overtime.weekendRate, color: '#f59e0b' },
    { id: 'holiday', label: t.holiday || 'Holiday', rate: rules.overtime.holidayRate, color: '#10b981' },
  ];

  const calculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const salaryNum = parseFloat(salary) || 0;
    const hoursNum = parseFloat(hours) || 0;
    
    if (salaryNum <= 0 || hoursNum <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const hourlyRate = salaryNum / rules.overtime.workHoursPerMonth;
    const multiplier = type === 'normal' ? rules.overtime.normalRate : type === 'weekend' ? rules.overtime.weekendRate : rules.overtime.holidayRate;
    const pay = hourlyRate * multiplier * hoursNum;
    
    setResult(Math.round(pay * 100) / 100);
    resultAnim.setValue(0);
    Animated.spring(resultAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.formContainer}>
      <StyledInput
        label={t.basicSalary || 'Monthly Salary'}
        icon={DollarSign}
        iconColor="#f59e0b"
        iconBg="#fffbeb"
        value={salary}
        onChangeText={setSalary}
        placeholder="0.00"
        suffix={rules.currency}
        theme={theme}
      />
      
      <StyledInput
        label={t.overtimeHours || 'Overtime Hours'}
        icon={Clock}
        iconColor="#6366f1"
        iconBg="#eef2ff"
        value={hours}
        onChangeText={setHours}
        placeholder="0"
        suffix={t.hours || 'hrs'}
        theme={theme}
      />

      <View style={[styles.typeSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{t.overtimeType || 'Type'}</Text>
        <View style={styles.typeGrid}>
          {types.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.typeCard, type === item.id && { backgroundColor: item.color }]}
              onPress={() => setType(item.id as any)}
            >
              <Text style={[styles.typeLabel, type === item.id && styles.typeLabelActive]}>{item.label}</Text>
              <Text style={[styles.typeRate, type === item.id && styles.typeRateActive]}>+{Math.round((item.rate - 1) * 100)}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.calculateBtn} onPress={calculate} activeOpacity={0.9}>
        <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.calculateBtnGradient}>
          <Calculator size={20} color="#fff" />
          <Text style={styles.calculateBtnText}>{t.calculate || 'Calculate'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {result !== null && (
        <Animated.View style={[styles.resultCard, { backgroundColor: theme.card, opacity: resultAnim, transform: [{ scale: resultAnim }] }]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIconBg, { backgroundColor: '#fffbeb' }]}>
              <TrendingUp size={24} color="#f59e0b" />
            </View>
            <Text style={[styles.resultTitle, { color: theme.textSecondary }]}>{t.overtimePay || 'Overtime Pay'}</Text>
          </View>
          <Text style={[styles.resultAmount, { color: theme.text }]}>
            <Text style={styles.resultCurrency}>{rules.currencySymbol} </Text>
            {result.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

// Leave Calculator
function LeaveCalculator({ theme, isRTL, t, rules }: any) {
  const [salary, setSalary] = useState('');
  const [years, setYears] = useState('');
  const [unusedDays, setUnusedDays] = useState('');
  const [result, setResult] = useState<{ days: number; amount: number } | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;

  const calculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const salaryNum = parseFloat(salary) || 0;
    const yearsNum = parseFloat(years) || 0;
    const unusedNum = parseFloat(unusedDays) || 0;
    
    if (salaryNum <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    let entitlement = yearsNum < rules.leave.minYearsForFullLeave 
      ? Math.floor(yearsNum * 12) * rules.leave.daysPerMonthFirstYear 
      : rules.leave.annualDays;
    
    const dailyRate = salaryNum / 30;
    const encashment = dailyRate * unusedNum;

    setResult({ days: Math.round(entitlement), amount: Math.round(encashment * 100) / 100 });
    resultAnim.setValue(0);
    Animated.spring(resultAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.formContainer}>
      <StyledInput
        label={t.basicSalary || 'Monthly Salary'}
        icon={DollarSign}
        iconColor="#10b981"
        iconBg="#ecfdf5"
        value={salary}
        onChangeText={setSalary}
        placeholder="0.00"
        suffix={rules.currency}
        theme={theme}
      />
      
      <StyledInput
        label={t.yearsOfService || 'Years of Service'}
        icon={Briefcase}
        iconColor="#f59e0b"
        iconBg="#fffbeb"
        value={years}
        onChangeText={setYears}
        placeholder="0"
        suffix={t.years || 'years'}
        theme={theme}
      />
      
      <StyledInput
        label={t.unusedLeaveDays || 'Unused Leave Days'}
        icon={Calendar}
        iconColor="#6366f1"
        iconBg="#eef2ff"
        value={unusedDays}
        onChangeText={setUnusedDays}
        placeholder="0"
        suffix={t.days || 'days'}
        theme={theme}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={styles.calculateBtn} onPress={calculate} activeOpacity={0.9}>
        <LinearGradient colors={['#10b981', '#059669']} style={styles.calculateBtnGradient}>
          <Calculator size={20} color="#fff" />
          <Text style={styles.calculateBtnText}>{t.calculate || 'Calculate'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {result !== null && (
        <Animated.View style={[styles.resultCard, { backgroundColor: theme.card, opacity: resultAnim, transform: [{ scale: resultAnim }] }]}>
          <View style={styles.leaveResultRow}>
            <View style={styles.leaveResultItem}>
              <View style={[styles.leaveResultIcon, { backgroundColor: '#ecfdf5' }]}>
                <Calendar size={20} color="#10b981" />
              </View>
              <Text style={[styles.leaveResultLabel, { color: theme.textSecondary }]}>{t.annualEntitlement || 'Annual Leave'}</Text>
              <Text style={[styles.leaveResultValue, { color: theme.text }]}>{result.days}</Text>
              <Text style={[styles.leaveResultUnit, { color: theme.textSecondary }]}>{t.days || 'days'}</Text>
            </View>
            <View style={[styles.leaveResultDivider, { backgroundColor: theme.backgroundSecondary }]} />
            <View style={styles.leaveResultItem}>
              <View style={[styles.leaveResultIcon, { backgroundColor: '#eef2ff' }]}>
                <DollarSign size={20} color="#6366f1" />
              </View>
              <Text style={[styles.leaveResultLabel, { color: theme.textSecondary }]}>{t.leaveEncashment || 'Encashment'}</Text>
              <Text style={[styles.leaveResultValue, { color: theme.text }]}>{result.amount.toLocaleString()}</Text>
              <Text style={[styles.leaveResultUnit, { color: theme.textSecondary }]}>{rules.currency}</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  countryPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  stepDotDone: {
    backgroundColor: '#10b981',
  },
  stepDotInactive: {
    backgroundColor: '#d1d5db',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: '#10b981',
  },
  content: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  selectorContainer: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  countryCard: {
    width: (width - 52) / 3,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  countryFlagWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  countryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  countryCurrency: {
    fontSize: 11,
    fontWeight: '500',
  },
  countryList: {
    gap: 8,
  },
  countryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  countryListName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  calcGrid: {
    gap: 12,
  },
  calcCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  calcIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  calcTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  calcDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  calcBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  calcBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  calcArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcArrowRTL: {
    right: undefined,
    left: 16,
  },
  formContainer: {
    gap: 12,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerFocused: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  inputTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  toggleSection: {
    borderRadius: 16,
    padding: 14,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#6366f1',
  },
  toggleBtnActiveOrange: {
    backgroundColor: '#f59e0b',
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  typeSection: {
    borderRadius: 16,
    padding: 14,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeLabelActive: {
    color: '#fff',
  },
  typeRate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 2,
  },
  typeRateActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  calculateBtn: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  calculateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  calculateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  resultCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  resultIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  resultCurrency: {
    fontSize: 20,
  },
  resultNote: {
    fontSize: 12,
    marginTop: 8,
  },
  leaveResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveResultItem: {
    flex: 1,
    alignItems: 'center',
  },
  leaveResultDivider: {
    width: 1,
    height: 80,
    marginHorizontal: 16,
  },
  leaveResultIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  leaveResultLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  leaveResultValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  leaveResultUnit: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  calcIconWrapperRTL: {
    alignSelf: 'flex-end',
  },
  calcBadgeRTL: {
    alignSelf: 'flex-end',
  },
});
