import { useState, useEffect, useRef } from 'react';
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
  Animated,
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
  Send,
  Award,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useReputation } from '@/contexts/ReputationContext';
import { useReadingHistory } from '@/contexts/ReadingHistoryContext';
import FlagDisplay from '@/components/FlagDisplay';
import ShareModal from '@/components/ShareModal';

type VoteState = 'up' | 'down' | null;

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, users } = useAuth();
  const { questions, answers: allAnswers, countries, voteQuestion, voteAnswer, addAnswer, acceptAnswer } = useData();
  const { toggleQuestionFavorite, isQuestionFavorited } = useFavorites();
  const theme = useTheme();
  const { notifyAnswerReceived, notifyBestAnswer } = useNotifications();
  const { onAnswerGiven, onVoteReceived, onBestAnswer } = useReputation();
  const { addToHistory } = useReadingHistory();
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionVote, setQuestionVote] = useState<VoteState>(null);
  const [answerVotes, setAnswerVotes] = useState<Record<string, VoteState>>({});
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  // Animations - must be before any early returns
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  
  const question = questions.find(q => q.id === id);
  const answers = allAnswers.filter(a => a.questionId === id);
  
  // Track in reading history
  useEffect(() => {
    if (question && id) {
      addToHistory(id as string, 'question');
    }
  }, [question, id]);
  
  // Load saved vote states
  useEffect(() => {
    const loadVotes = async () => {
      if (user && id) {
        try {
          const savedQuestionVote = await AsyncStorage.getItem(`@vote_question_${id}_${user.id}`);
          if (savedQuestionVote) {
            setQuestionVote(savedQuestionVote as VoteState);
          }
          
          const savedAnswerVotes = await AsyncStorage.getItem(`@vote_answers_${id}_${user.id}`);
          if (savedAnswerVotes) {
            setAnswerVotes(JSON.parse(savedAnswerVotes));
          }
        } catch (error) {
          console.error('Failed to load votes:', error);
        }
      }
    };
    loadVotes();
  }, [id, user]);
  
  // Animate on mount
  useEffect(() => {
    if (question) {
      Animated.stagger(100, [
        Animated.spring(headerAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(contentAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [question, headerAnim, contentAnim]);
  
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

  const handleQuestionVote = async (isUpvote: boolean) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to vote on questions.');
      return;
    }
    
    if (!question) return;
    
    const newVote: VoteState = isUpvote ? 'up' : 'down';
    let increment = 0;
    
    if (questionVote === newVote) {
      // Remove vote
      increment = isUpvote ? -1 : 1;
      setQuestionVote(null);
      await AsyncStorage.removeItem(`@vote_question_${id}_${user.id}`);
    } else if (questionVote === null) {
      // New vote
      increment = isUpvote ? 1 : -1;
      setQuestionVote(newVote);
      await AsyncStorage.setItem(`@vote_question_${id}_${user.id}`, newVote);
      // Award reputation to question author
      if (question.userId !== user.id) {
        await onVoteReceived(question.userId, isUpvote);
      }
    } else {
      // Change vote
      increment = isUpvote ? 2 : -2;
      setQuestionVote(newVote);
      await AsyncStorage.setItem(`@vote_question_${id}_${user.id}`, newVote);
      // Award/remove reputation
      if (question.userId !== user.id) {
        await onVoteReceived(question.userId, isUpvote);
      }
    }
    
    await voteQuestion(question.id, increment);
  };

  const handleAnswerVote = async (answerId: string, isUpvote: boolean) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to vote on answers.');
      return;
    }
    
    const answer = answers.find(a => a.id === answerId);
    if (!answer) return;
    
    const currentVote = answerVotes[answerId] || null;
    const newVote: VoteState = isUpvote ? 'up' : 'down';
    let increment = 0;
    
    let updatedVotes = { ...answerVotes };
    
    if (currentVote === newVote) {
      // Remove vote
      increment = isUpvote ? -1 : 1;
      delete updatedVotes[answerId];
    } else if (currentVote === null) {
      // New vote
      increment = isUpvote ? 1 : -1;
      updatedVotes[answerId] = newVote;
      // Award reputation to answer author
      if (answer.userId !== user.id) {
        await onVoteReceived(answer.userId, isUpvote);
      }
    } else {
      // Change vote
      increment = isUpvote ? 2 : -2;
      updatedVotes[answerId] = newVote;
      // Award/remove reputation
      if (answer.userId !== user.id) {
        await onVoteReceived(answer.userId, isUpvote);
      }
    }
    
    setAnswerVotes(updatedVotes);
    await AsyncStorage.setItem(`@vote_answers_${id}_${user.id}`, JSON.stringify(updatedVotes));
    await voteAnswer(answerId, increment);
  };

  const handleShare = () => {
    setShareModalVisible(true);
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
          title: '', 
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/questions')} 
              style={styles.headerBtn}
            >
              <ArrowLeft size={20} color={theme.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightRow}>
              <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
                <Share2 size={18} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleQuestionFavorite(question.id)}
                style={[
                  styles.headerBtn,
                  isQuestionFavorited(question.id) && styles.headerBtnActive
                ]}
              >
                <Bookmark
                  size={18}
                  color={isQuestionFavorited(question.id) ? '#6366f1' : theme.textSecondary}
                  fill={isQuestionFavorited(question.id) ? '#6366f1' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Question Stats Card */}
          <Animated.View
            style={[
              styles.statsSection,
              {
                opacity: headerAnim,
                transform: [{ translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })}],
              },
            ]}
          >
            <LinearGradient
              colors={question.isResolved ? ['#22c55e', '#16a34a'] : ['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIconBg}>
                    <ThumbsUp size={14} color="#6366f1" />
                  </View>
                  <View>
                    <Text style={styles.statNumber}>{question.votes}</Text>
                    <Text style={styles.statLabel}>Votes</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}>
                    <MessageSquare size={14} color="#3b82f6" />
                  </View>
                  <View>
                    <Text style={styles.statNumber}>{answers.length}</Text>
                    <Text style={styles.statLabel}>Answers</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={[styles.statIconBg, { backgroundColor: question.isResolved ? '#dcfce7' : '#fef3c7' }]}>
                    {question.isResolved ? (
                      <CheckCircle size={14} color="#22c55e" />
                    ) : (
                      <Clock size={14} color="#f59e0b" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.statNumber}>{question.isResolved ? 'Yes' : 'No'}</Text>
                    <Text style={styles.statLabel}>Solved</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Question Content */}
          <Animated.View
            style={[
              styles.questionSection,
              { backgroundColor: theme.card },
              {
                opacity: contentAnim,
                transform: [{ translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })}],
              },
            ]}
          >
            {/* Author Row */}
            <View style={styles.authorRow}>
              <View style={styles.authorInfo}>
                {questionUser?.avatar ? (
                  <Image source={{ uri: questionUser.avatar }} style={styles.authorAvatar} />
                ) : (
                  <LinearGradient
                    colors={[getLevelColor(questionUser?.level || 'beginner'), getLevelColor(questionUser?.level || 'beginner') + 'bb']}
                    style={styles.authorAvatar}
                  >
                    <Text style={styles.authorAvatarText}>
                      {questionUser?.name.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.authorDetails}>
                  <View style={styles.authorNameRow}>
                    <Text style={[styles.authorName, { color: theme.text }]}>{questionUser?.name}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(questionUser?.level || 'beginner') + '20' }]}>
                      <LevelIcon size={10} color={getLevelColor(questionUser?.level || 'beginner')} />
                      <Text style={[styles.levelText, { color: getLevelColor(questionUser?.level || 'beginner') }]}>
                        {questionUser?.level}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.authorMeta}>
                    <FlagDisplay flag={country?.flag || ''} size="small" />
                    <Text style={[styles.dotSeparator, { color: theme.textSecondary }]}>•</Text>
                    <Text style={[styles.questionDate, { color: theme.textSecondary }]}>
                      {new Date(question.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.questionTitle, { color: theme.text }]}>{question.title}</Text>
            
            {/* Content */}
            <Text style={[styles.questionContent, { color: theme.text }]}>{question.content}</Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {question.tags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: theme.backgroundSecondary }]}>
                  <Text style={[styles.tagText, { color: theme.textSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Vote Actions */}
            <View style={[styles.actionsRow, { borderTopColor: theme.border }]}>
              <TouchableOpacity 
                style={[
                  styles.voteBtn, 
                  questionVote === 'up' && styles.voteBtnActive
                ]}
                onPress={() => handleQuestionVote(true)}
              >
                <ThumbsUp size={16} color={questionVote === 'up' ? '#fff' : '#6366f1'} />
                <Text style={[styles.voteBtnText, questionVote === 'up' && styles.voteBtnTextActive]}>
                  {question.votes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.voteBtn,
                  styles.voteBtnDown,
                  questionVote === 'down' && styles.voteBtnDownActive
                ]}
                onPress={() => handleQuestionVote(false)}
              >
                <ThumbsDown size={16} color={questionVote === 'down' ? '#fff' : theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary }]} onPress={handleCopyLink}>
                <Copy size={14} color={theme.textSecondary} />
                <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Answers Section */}
          <View style={styles.answersSection}>
            <View style={styles.answersSectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </Text>
              {answers.length > 0 && (
                <View style={styles.sortIndicator}>
                  <TrendingUp size={12} color={theme.textSecondary} />
                  <Text style={[styles.sortText, { color: theme.textSecondary }]}>Top</Text>
                </View>
              )}
            </View>
            
            {answers.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                <LinearGradient colors={['#eef2ff', '#e0e7ff']} style={styles.emptyIconBg}>
                  <MessageSquare size={28} color="#6366f1" />
                </LinearGradient>
                <Text style={[styles.emptyStateText, { color: theme.text }]}>No answers yet</Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
                  Be the first to help!
                </Text>
              </View>
            ) : (
              answers.map((answer, index) => {
                const answerUser = users.find(u => u.id === answer.userId);
                const AnswerLevelIcon = getLevelIcon(answerUser?.level || 'beginner');
                const answerAnim = new Animated.Value(0);
                Animated.spring(answerAnim, {
                  toValue: 1,
                  tension: 50,
                  friction: 8,
                  delay: index * 80,
                  useNativeDriver: true,
                }).start();
                
                return (
                  <Animated.View 
                    key={answer.id} 
                    style={[
                      styles.answerItem,
                      { backgroundColor: theme.card },
                      {
                        opacity: answerAnim,
                        transform: [{ translateX: answerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        })}],
                      },
                    ]}
                  >
                    {/* Status Line */}
                    <View style={[
                      styles.answerStatusLine,
                      { backgroundColor: answer.isAccepted ? '#22c55e' : '#e2e8f0' }
                    ]} />
                    
                    {/* Accepted Badge */}
                    {answer.isAccepted && (
                      <View style={styles.acceptedBadge}>
                        <Award size={12} color="#22c55e" />
                        <Text style={styles.acceptedText}>Best Answer</Text>
                      </View>
                    )}
                    
                    {/* Answer Header */}
                    <View style={styles.answerHeader}>
                      {answerUser?.avatar ? (
                        <Image source={{ uri: answerUser.avatar }} style={styles.answerAvatar} />
                      ) : (
                        <LinearGradient
                          colors={[getLevelColor(answerUser?.level || 'beginner'), getLevelColor(answerUser?.level || 'beginner') + 'bb']}
                          style={styles.answerAvatar}
                        >
                          <Text style={styles.answerAvatarText}>
                            {answerUser?.name.charAt(0).toUpperCase()}
                          </Text>
                        </LinearGradient>
                      )}
                      <View style={styles.answerUserInfo}>
                        <View style={styles.answerUserNameRow}>
                          <Text style={[styles.answerUserName, { color: theme.text }]}>{answerUser?.name}</Text>
                          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(answerUser?.level || 'beginner') + '20' }]}>
                            <AnswerLevelIcon size={9} color={getLevelColor(answerUser?.level || 'beginner')} />
                          </View>
                        </View>
                        <Text style={[styles.answerDate, { color: theme.textSecondary }]}>
                          {new Date(answer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      
                      {/* Accept button for question owner */}
                      {user && user.id === question.userId && !answer.isAccepted && !question.isResolved && (
                        <TouchableOpacity 
                          style={styles.acceptBtn}
                          onPress={() => handleAcceptAnswer(answer.id)}
                        >
                          <CheckCircle size={14} color="#22c55e" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Answer Content */}
                    <Text style={[styles.answerContent, { color: theme.text }]}>{answer.content}</Text>

                    {/* Answer Actions */}
                    <View style={styles.answerActions}>
                      <TouchableOpacity 
                        style={[
                          styles.answerVoteBtn,
                          answerVotes[answer.id] === 'up' && styles.answerVoteBtnActive
                        ]}
                        onPress={() => handleAnswerVote(answer.id, true)}
                      >
                        <ThumbsUp size={14} color={answerVotes[answer.id] === 'up' ? '#fff' : '#6366f1'} />
                        <Text style={[
                          styles.answerVoteText, 
                          answerVotes[answer.id] === 'up' && styles.answerVoteTextActive
                        ]}>
                          {answer.votes}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.answerVoteBtn,
                          styles.answerVoteBtnDown,
                          answerVotes[answer.id] === 'down' && styles.answerVoteBtnDownActive
                        ]}
                        onPress={() => handleAnswerVote(answer.id, false)}
                      >
                        <ThumbsDown size={14} color={answerVotes[answer.id] === 'down' ? '#fff' : theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Answer Input */}
        {user && (
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary }]}>
              <TextInput
                style={[styles.answerInput, { color: theme.text }]}
                placeholder="Write your answer..."
                value={answerText}
                onChangeText={setAnswerText}
                multiline
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, !answerText.trim() && styles.sendBtnDisabled]}
              onPress={handleSubmitAnswer}
              disabled={!answerText.trim() || isSubmitting}
            >
              <LinearGradient
                colors={answerText.trim() ? ['#6366f1', '#8b5cf6'] : ['#cbd5e1', '#94a3b8']}
                style={styles.sendBtnGradient}
              >
                <Send size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        title={question.title}
        content={question.content}
        type="question"
        url={`https://labourlawapp.com/questions/${question.id}`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  
  // Header
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  headerBtnActive: {
    backgroundColor: '#eef2ff',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  statsCard: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  statIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  // Question Section
  questionSection: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  authorRow: {
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  levelText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  countryFlag: {
    fontSize: 13,
  },
  dotSeparator: {
    fontSize: 8,
  },
  questionDate: {
    fontSize: 11,
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 23,
  },
  questionContent: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  voteBtnActive: {
    backgroundColor: '#6366f1',
  },
  voteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
  },
  voteBtnTextActive: {
    color: '#fff',
  },
  voteBtnDown: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
  },
  voteBtnDownActive: {
    backgroundColor: '#94a3b8',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Answers Section
  answersSection: {
    padding: 12,
    paddingBottom: 120,
  },
  answersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sortIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 14,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  
  // Answer Item
  answerItem: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  answerStatusLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  acceptedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22c55e',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  answerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  answerAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  answerUserInfo: {
    flex: 1,
  },
  answerUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  answerUserName: {
    fontSize: 13,
    fontWeight: '600',
  },
  answerDate: {
    fontSize: 10,
    marginTop: 1,
  },
  acceptBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerContent: {
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  answerActions: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  answerVoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 6,
  },
  answerVoteBtnActive: {
    backgroundColor: '#6366f1',
  },
  answerVoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  answerVoteTextActive: {
    color: '#fff',
  },
  answerVoteBtnDown: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
  },
  answerVoteBtnDownActive: {
    backgroundColor: '#94a3b8',
  },
  
  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 100,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  answerInput: {
    fontSize: 14,
    maxHeight: 80,
    minHeight: 36,
  },
  sendBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
