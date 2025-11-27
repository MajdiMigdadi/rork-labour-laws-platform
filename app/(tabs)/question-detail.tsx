import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  MessageSquare,
  Trophy,
  TrendingUp,
  Clock,
  Bookmark,
  Share2,
  Copy,
  ArrowLeft,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useReputation } from '@/contexts/ReputationContext';

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, users } = useAuth();
  const { questions, answers: allAnswers, countries, voteQuestion, voteAnswer, addAnswer, acceptAnswer } = useData();
  const { toggleQuestionFavorite, isQuestionFavorited } = useFavorites();
  const theme = useTheme();
  const { notifyAnswerReceived, notifyBestAnswer } = useNotifications();
  const { onAnswerGiven, onVoteReceived, onBestAnswer } = useReputation();
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const question = questions.find(q => q.id === id);
  const answers = allAnswers.filter(a => a.questionId === id);
  
  if (!question) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>Question not found</Text>
      </View>
    );
  }

  const questionUser = users.find(u => u.id === question.userId);
  const country = countries.find(c => c.id === question.countryId);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#94a3b8';
      case 'intermediate': return '#3b82f6';
      case 'expert': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert': return Trophy;
      case 'intermediate': return TrendingUp;
      default: return Clock;
    }
  };

  const handleSubmitAnswer = async () => {
    if (answerText.trim() && user && id) {
      setIsSubmitting(true);
      try {
        await addAnswer({
          questionId: id as string,
          userId: user.id,
          content: answerText,
        }, notifyAnswerReceived);
        await onAnswerGiven(user.id);
        setAnswerText('');
        Alert.alert('Success', 'Your answer has been posted! You earned 10 reputation points.');
      } catch (error) {
        console.error('Failed to submit answer:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (user && question && user.id === question.userId) {
      await acceptAnswer(question.id, answerId, notifyBestAnswer);
      const answer = answers.find(a => a.id === answerId);
      if (answer) {
        await onBestAnswer(answer.userId);
      }
    }
  };

  const handleShare = async () => {
    try {
      const answerText = answers.length === 1 ? 'answer' : 'answers';
      const shareText = `${question.title}\n\n${question.content}\n\nTags: ${question.tags.join(', ')}\n${answers.length} ${answerText} | ${question.votes} votes\n\nView full question: https://app.legal/q/${question.id}`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: question.title,
            text: shareText,
          });
        } else {
          await Clipboard.setStringAsync(shareText);
          alert('Content copied to clipboard!');
        }
      } else {
        await Share.share({
          message: shareText,
          title: question.title,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = `https://app.legal/q/${question.id}`;
      await Clipboard.setStringAsync(link);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const LevelIcon = getLevelIcon(questionUser?.level || 'beginner');

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Question', 
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/questions')} style={{ marginLeft: 8 }}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => toggleQuestionFavorite(question.id)}
              style={styles.headerBookmark}
            >
              <Bookmark
                size={24}
                color={isQuestionFavorited(question.id) ? theme.primary : theme.text}
                fill={isQuestionFavorited(question.id) ? theme.primary : 'transparent'}
              />
            </TouchableOpacity>
          ),
        }} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={[styles.scrollView, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={[styles.questionSection, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.questionHeader}>
              <View style={styles.userInfo}>
                {questionUser?.avatar ? (
                  <Image
                    source={{ uri: questionUser.avatar }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.userAvatar,
                      { backgroundColor: getLevelColor(questionUser?.level || 'beginner') },
                    ]}
                  >
                    <Text style={styles.userAvatarText}>
                      {questionUser?.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.userDetails}>
                  <View style={styles.userNameRow}>
                    <Text style={[styles.userName, { color: theme.text }]}>{questionUser?.name}</Text>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: getLevelColor(questionUser?.level || 'beginner') },
                      ]}
                    >
                      <LevelIcon size={10} color="#fff" />
                      <Text style={styles.levelText}>{questionUser?.level}</Text>
                    </View>
                  </View>
                  <Text style={[styles.questionTime, { color: theme.textSecondary }]}>
                    {new Date(question.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.countryFlag}>{country?.flag}</Text>
            </View>

            <Text style={[styles.questionTitle, { color: theme.text }]}>{question.title}</Text>
            <Text style={[styles.questionContent, { color: theme.text }]}>{question.content}</Text>

            <View style={styles.tagsContainer}>
              {question.tags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.voteContainer}>
              <TouchableOpacity style={[styles.voteButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <ThumbsUp size={20} color={theme.primary} />
                <Text style={[styles.voteText, { color: theme.text }]}>{question.votes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.voteButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <ThumbsDown size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              <View style={styles.answerCount}>
                <MessageSquare size={18} color={theme.textSecondary} />
                <Text style={[styles.answerCountText, { color: theme.textSecondary }]}>
                  {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                </Text>
              </View>
            </View>

            <View style={[styles.shareContainer, { borderTopColor: theme.border }]}>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]} onPress={handleShare}>
                <Share2 size={18} color={theme.primary} />
                <Text style={[styles.shareButtonText, { color: theme.primary }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]} onPress={handleCopyLink}>
                <Copy size={18} color={theme.primary} />
                <Text style={[styles.shareButtonText, { color: theme.primary }]}>Copy Link</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.answersSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Answers</Text>
            
            {answers.length === 0 ? (
              <View style={styles.emptyState}>
                <MessageSquare size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.text }]}>No answers yet</Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>Be the first to answer!</Text>
              </View>
            ) : (
              answers.map(answer => {
                const answerUser = users.find(u => u.id === answer.userId);
                const AnswerLevelIcon = getLevelIcon(answerUser?.level || 'beginner');
                
                return (
                  <View key={answer.id} style={[styles.answerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {answer.isAccepted && (
                      <View style={[styles.acceptedBadge, { backgroundColor: `${theme.success}15` }]}>
                        <CheckCircle size={16} color={theme.success} />
                        <Text style={[styles.acceptedText, { color: theme.success }]}>Accepted Answer</Text>
                      </View>
                    )}
                    
                    <View style={styles.answerHeader}>
                      {answerUser?.avatar ? (
                        <Image
                          source={{ uri: answerUser.avatar }}
                          style={styles.answerAvatar}
                        />
                      ) : (
                        <View
                          style={[
                            styles.answerAvatar,
                            { backgroundColor: getLevelColor(answerUser?.level || 'beginner') },
                          ]}
                        >
                          <Text style={styles.answerAvatarText}>
                            {answerUser?.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.answerUserDetails}>
                        <View style={styles.answerUserNameRow}>
                          <Text style={[styles.answerUserName, { color: theme.text }]}>{answerUser?.name}</Text>
                          <View
                            style={[
                              styles.levelBadge,
                              { backgroundColor: getLevelColor(answerUser?.level || 'beginner') },
                            ]}
                          >
                            <AnswerLevelIcon size={10} color="#fff" />
                            <Text style={styles.levelText}>{answerUser?.level}</Text>
                          </View>
                        </View>
                        <Text style={[styles.answerTime, { color: theme.textSecondary }]}>
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.answerContent, { color: theme.text }]}>{answer.content}</Text>

                    <View style={styles.answerFooter}>
                      <TouchableOpacity style={[styles.answerVoteButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <ThumbsUp size={18} color={theme.primary} />
                        <Text style={[styles.answerVoteText, { color: theme.text }]}>{answer.votes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.answerVoteButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <ThumbsDown size={18} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {user && (
          <View style={[styles.answerInputContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            <TextInput
              style={[styles.answerInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Write your answer..."
              value={answerText}
              onChangeText={setAnswerText}
              multiline
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }, !answerText.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmitAnswer}
              disabled={!answerText.trim()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
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
  questionSection: {
    backgroundColor: Colors.light.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#fff',
    textTransform: 'uppercase' as const,
  },
  questionTime: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  countryFlag: {
    fontSize: 28,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 30,
  },
  questionContent: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tagText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  voteText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  answerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  answerCountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  answersSection: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  answerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.light.success}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  acceptedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  answerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  answerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  answerAvatarText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  answerUserDetails: {
    flex: 1,
  },
  answerUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerUserName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  answerTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  answerContent: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  answerFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  answerVoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  answerVoteText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  answerInputContainer: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  answerInput: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  headerBookmark: {
    marginRight: 8,
  },
  shareContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
});
