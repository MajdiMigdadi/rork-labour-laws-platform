import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { showAlert, showSuccess } from '@/utils/alert';

type UploadType = 'countries' | 'categories' | 'laws';

interface BulkUploadModalProps {
  visible: boolean;
  onClose: () => void;
  type: UploadType;
  onUpload: (data: any[]) => Promise<{ success: number; failed: number }>;
}

const TEMPLATES = {
  countries: `[
  {
    "name": "Country Name",
    "name_ar": "اسم الدولة",
    "code": "XX",
    "flag": "🏳️",
    "description": "Description",
    "description_ar": "الوصف"
  }
]`,
  categories: `[
  {
    "name": "Category Name",
    "name_ar": "اسم الفئة",
    "icon": "FileText",
    "color": "#6366F1"
  }
]`,
  laws: `[
  {
    "title": "Law Title",
    "title_ar": "عنوان القانون",
    "content": "Law content...",
    "content_ar": "محتوى القانون...",
    "country_id": "1",
    "category_id": "1",
    "source": "Ministry of Labor"
  }
]`,
};

const LABELS = {
  countries: { en: 'Countries', ar: 'الدول' },
  categories: { en: 'Categories', ar: 'الفئات' },
  laws: { en: 'Laws', ar: 'القوانين' },
};

export default function BulkUploadModal({ visible, onClose, type, onUpload }: BulkUploadModalProps) {
  const theme = useTheme();
  const { language, isRTL } = useLanguage();
  const [jsonInput, setJsonInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setError(null);
    setResult(null);

    if (!jsonInput.trim()) {
      setError(language === 'ar' ? 'الرجاء إدخال بيانات JSON' : 'Please enter JSON data');
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      
      if (!Array.isArray(data)) {
        setError(language === 'ar' ? 'يجب أن تكون البيانات مصفوفة JSON' : 'Data must be a JSON array');
        return;
      }

      if (data.length === 0) {
        setError(language === 'ar' ? 'المصفوفة فارغة' : 'Array is empty');
        return;
      }

      setIsUploading(true);
      const uploadResult = await onUpload(data);
      setResult(uploadResult);
      
      if (uploadResult.success > 0) {
        showSuccess(
          language === 'ar' ? 'تم الرفع' : 'Upload Complete',
          language === 'ar' 
            ? `تم رفع ${uploadResult.success} عنصر بنجاح` 
            : `Successfully uploaded ${uploadResult.success} items`
        );
      }
    } catch (e) {
      setError(language === 'ar' ? 'خطأ في تنسيق JSON' : 'Invalid JSON format');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadTemplate = () => {
    setJsonInput(TEMPLATES[type]);
    setError(null);
    setResult(null);
  };

  const handleClear = () => {
    setJsonInput('');
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    setJsonInput('');
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtl]}>
            <View style={[styles.headerTitle, isRTL && styles.rtl]}>
              <Upload size={24} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>
                {language === 'ar' ? 'رفع جماعي - ' : 'Bulk Upload - '}
                {LABELS[type][language]}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Instructions */}
            <View style={[styles.instructions, { backgroundColor: theme.backgroundSecondary }]}>
              <FileText size={20} color={theme.primary} />
              <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
                {language === 'ar' 
                  ? 'الصق بيانات JSON أدناه. استخدم الزر "تحميل القالب" لرؤية التنسيق المطلوب.'
                  : 'Paste JSON data below. Use "Load Template" button to see the required format.'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.primary + '20' }]}
                onPress={handleLoadTemplate}
              >
                <Download size={16} color={theme.primary} />
                <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                  {language === 'ar' ? 'تحميل القالب' : 'Load Template'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
                onPress={handleClear}
              >
                <X size={16} color={theme.error} />
                <Text style={[styles.actionBtnText, { color: theme.error }]}>
                  {language === 'ar' ? 'مسح' : 'Clear'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* JSON Input */}
            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
              <TextInput
                style={[
                  styles.jsonInput, 
                  { 
                    color: theme.text, 
                    backgroundColor: theme.backgroundSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                  }
                ]}
                placeholder={language === 'ar' ? 'الصق بيانات JSON هنا...' : 'Paste JSON data here...'}
                placeholderTextColor={theme.textSecondary}
                value={jsonInput}
                onChangeText={setJsonInput}
                multiline
                numberOfLines={12}
                textAlignVertical="top"
              />
            </View>

            {/* Error Message */}
            {error && (
              <View style={[styles.errorBox, { backgroundColor: theme.error + '15' }]}>
                <AlertCircle size={18} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            {/* Result */}
            {result && (
              <View style={[styles.resultBox, { backgroundColor: theme.success + '15' }]}>
                <CheckCircle size={18} color={theme.success} />
                <Text style={[styles.resultText, { color: theme.success }]}>
                  {language === 'ar' 
                    ? `نجح: ${result.success} | فشل: ${result.failed}`
                    : `Success: ${result.success} | Failed: ${result.failed}`}
                </Text>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                styles.uploadBtn, 
                { backgroundColor: theme.primary },
                isUploading && { opacity: 0.7 }
              ]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Upload size={20} color="#fff" />
                  <Text style={styles.uploadBtnText}>
                    {language === 'ar' ? 'رفع البيانات' : 'Upload Data'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  jsonInput: {
    minHeight: 200,
    padding: 16,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
});

