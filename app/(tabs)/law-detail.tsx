import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Calendar, ExternalLink, FileText, Tag, Bookmark, Share2, Copy, ArrowLeft } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/hooks/useTheme';

export default function LawDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { laws, countries, categories } = useData();
  const { toggleLawFavorite, isLawFavorited } = useFavorites();
  const theme = useTheme();
  
  const law = laws.find(l => l.id === id);
  
  if (!law) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>Law not found</Text>
      </View>
    );
  }

  const country = countries.find(c => c.id === law.countryId);
  const category = categories.find(c => c.id === law.categoryId);

  const handleShare = async () => {
    try {
      const shareText = `${law.title}\n\n${law.description}\n\nCountry: ${country?.name}\nCategory: ${category?.name}\n\nView full details: https://app.legal/${law.id}`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: law.title,
            text: shareText,
          });
        } else {
          await Clipboard.setStringAsync(shareText);
          alert('Content copied to clipboard!');
        }
      } else {
        await Share.share({
          message: shareText,
          title: law.title,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = `https://app.legal/${law.id}`;
      await Clipboard.setStringAsync(link);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Law Details', 
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/laws')} style={{ marginLeft: 8 }}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => toggleLawFavorite(law.id)}
              style={styles.headerBookmark}
            >
              <Bookmark
                size={24}
                color={isLawFavorited(law.id) ? theme.primary : theme.text}
                fill={isLawFavorited(law.id) ? theme.primary : 'transparent'}
              />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <View style={styles.badges}>
            <View style={[styles.countryBadge, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.countryBadgeText, { color: theme.text }]}>
                {country?.flag} {country?.name}
              </Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: theme.accent }]}>
              <Tag size={14} color="#fff" />
              <Text style={styles.categoryBadgeText}>{category?.name}</Text>
            </View>
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>{law.title}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{law.description}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                Effective: {new Date(law.effectiveDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <FileText size={16} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                Updated: {new Date(law.lastUpdated).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Full Content</Text>
          <View style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.content, { color: theme.text }]}>{law.content}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Official Source</Text>
          <TouchableOpacity style={[styles.sourceCard, { backgroundColor: theme.card, borderColor: theme.border }]} activeOpacity={0.7}>
            <ExternalLink size={20} color={theme.primary} />
            <Text style={[styles.sourceText, { color: theme.primary }]} numberOfLines={1}>
              {law.source}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Share</Text>
          <View style={styles.shareContainer}>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleShare}>
              <Share2 size={20} color={theme.primary} />
              <Text style={[styles.shareButtonText, { color: theme.primary }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleCopyLink}>
              <Copy size={20} color={theme.primary} />
              <Text style={[styles.shareButtonText, { color: theme.primary }]}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            This information is provided for reference purposes only. Please consult with legal professionals for advice specific to your situation.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
  header: {
    backgroundColor: Colors.light.background,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  countryBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countryBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  content: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sourceText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500' as const,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic' as const,
  },
  headerBookmark: {
    marginRight: 8,
  },
  shareContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
});
