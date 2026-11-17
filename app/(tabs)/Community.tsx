import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NarratorBar } from '../../components/Narrator/NarratorBar';
import { StorageContext } from '../../Context/StorageContext';
import { AIService } from '../../services/AIService';
import { NarratorService } from '../../services/NarratorService';

interface Comment {
  author: string;
  role: string;
  content: string;
  isAI?: boolean;
}

interface Post {
  id: number;
  author: string;
  location: string;
  expertise: string;
  verified: boolean;
  avatar: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  helpful: number;
  tags: string[];
  isQuestion?: boolean;
  isProfessional?: boolean;
  comments: Comment[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: 'Rajesh Kumar (राजेश कुमार)',
    location: 'अमृतसर, पंजाब',
    expertise: 'धान व गेहूं विशेषज्ञ',
    verified: true,
    avatar: '🌾',
    timeAgo: '2 घंटे पहले',
    content:
      'इस बार गेहूं की बुवाई में सुपर सीडर का उपयोग किया। पराली को बिना जलाए मिट्टी में दबाने से नमी बनी हुई है और खरपतवार भी 40% कम उगे हैं। किसान भाइयों को सलाह है कि पराली कभी न जलाएं।',
    likes: 38,
    commentsCount: 2,
    helpful: 24,
    tags: ['SuperSeeder', 'ZeroBurning', 'WheatSowing'],
    comments: [
      {
        author: 'KrishiMitra AI Bot 🤖',
        role: 'सत्यापित कृषि AI',
        content: 'सराहनीय पहल! पराली को मिट्टी में मिलाने से प्रति एकड़ लगभग 35 kg यूरिया, 15 kg फॉस्फेट व 150 kg पोटाश प्राकृतिक रूप से जमीन को मिलता है।',
        isAI: true,
      },
    ],
  },
  {
    id: 2,
    author: 'Priya Sharma (प्रिया शर्मा)',
    location: 'करनाल, हरियाणा',
    expertise: 'जैविक खेती (Organic Farming)',
    verified: true,
    avatar: '🍅',
    timeAgo: '4 घंटे पहले',
    content:
      'टमाटर के पौधों की पत्तियों पर काले व भूरे गोल छल्लेदार धब्बे आ रहे हैं। क्या यह अगेती झुलसा (Early Blight) है? कृपया बिना रासायनिक दवा के सुरक्षित जैविक समाधान बताएं।',
    likes: 19,
    commentsCount: 1,
    helpful: 12,
    tags: ['Tomato', 'OrganicCure', 'EarlyBlight'],
    isQuestion: true,
    comments: [
      {
        author: 'KrishiMitra AI Bot 🤖',
        role: 'सत्यापित कृषि AI',
        content: 'हाँ प्रिया जी, यह अर्ली ब्लाइट के लक्षण हैं। उपाय: 5ml नीम तेल (10,000 PPM) + 2g ट्राइकोडर्मा विरिडी प्रति लीटर पानी में मिलाकर 7 दिन के अंतराल पर 2 बार छिड़काव करें। निचली संक्रमित पत्तियों को तोड़कर नष्ट कर दें।',
        isAI: true,
      },
    ],
  },
  {
    id: 3,
    author: 'Dr. Amit Verma (कृषि वैज्ञानिक)',
    location: 'IARI पूसा, नई दिल्ली',
    expertise: 'पादप रोग विशेषज्ञ (Plant Pathologist)',
    verified: true,
    avatar: '🧑‍🔬',
    timeAgo: '6 घंटे पहले',
    content:
      'मौसम चेतावनी: उत्तर भारत में आगामी दिनों में रात का तापमान गिरने और कोहरा छाने से सरसों में चेपा (Aphids) और गेहूं में रतुआ रोग का खतरा बढ़ सकता है। अपने खेतों की प्रतिदिन सुबह निगरानी करें।',
    likes: 64,
    commentsCount: 0,
    helpful: 48,
    tags: ['WeatherAlert', 'CropProtection', 'Mustard'],
    isProfessional: true,
    comments: [],
  },
];

export default function Community() {
  const storageContext = useContext(StorageContext);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [filter, setFilter] = useState<'all' | 'questions' | 'experts'>('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newIsQuestion, setNewIsQuestion] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    if (filter === 'questions') return post.isQuestion;
    if (filter === 'experts') return post.isProfessional;
    return true;
  });

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post))
    );
  };

  const handleHelpful = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, helpful: post.helpful + 1 } : post
      )
    );
  };

  const handleNarratePost = (post: Post) => {
    const text = `${post.author} ने लिखा: ${post.content}`;
    NarratorService.speak(text, { language: 'hi-IN' });
  };

  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      Alert.alert('अपूर्ण पोस्ट', 'कृपया अपना प्रश्न या अनुभव लिखें।');
      return;
    }

    setIsPosting(true);
    const newPostId = Date.now();
    const userPost: Post = {
      id: newPostId,
      author: storageContext?.userBasicInfo?.farmerName || 'किसान साथी (You)',
      location: storageContext?.userBasicInfo?.location || 'भारत',
      expertise: `${storageContext?.userBasicInfo?.cropType || 'फसल'} कृषक`,
      verified: false,
      avatar: '🧑‍🌾',
      timeAgo: 'अभी-अभी (Just now)',
      content: newContent.trim(),
      likes: 1,
      commentsCount: 0,
      helpful: 0,
      tags: ['FarmerQuestion', 'KrishiMitra'],
      isQuestion: newIsQuestion,
      comments: [],
    };

    setPosts((prev) => [userPost, ...prev]);
    setShowNewPostModal(false);
    const queryForAI = newContent.trim();
    setNewContent('');

    // If it's a question, trigger AI to automatically generate an intelligent answer
    if (newIsQuestion) {
      try {
        const prompt = `A farmer posted this question on the agriculture community board:
"${queryForAI}"
Provide an immediate, authoritative 2-line practical solution in conversational Hindi as KrishiMitra AI Bot.`;

        await AIService.streamChat(
          { messageText: prompt },
          {
            onChunk: () => {},
            onComplete: (aiReply) => {
              setPosts((current) =>
                current.map((p) =>
                  p.id === newPostId
                    ? {
                        ...p,
                        commentsCount: p.commentsCount + 1,
                        comments: [
                          ...p.comments,
                          {
                            author: 'KrishiMitra AI Bot 🤖',
                            role: 'सत्यापित कृषि AI',
                            content: aiReply.trim(),
                            isAI: true,
                          },
                        ],
                      }
                    : p
                )
              );
            },
            onError: () => {},
          }
        );
      } catch {}
    }

    setIsPosting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>किसान चौपाल (Community)</Text>
            <Text style={styles.headerSubtitle}>अनुभव साझा करें • वैज्ञानिकों व AI से उत्तर पाएं</Text>
          </View>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => setShowNewPostModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color="#ffffff" />
            <Text style={styles.postButtonText}>सवाल पूछें</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
              सभी पोस्ट ({posts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'questions' && styles.filterPillActive]}
            onPress={() => setFilter('questions')}
          >
            <Text style={[styles.filterPillText, filter === 'questions' && styles.filterPillTextActive]}>
              किसान प्रश्न ❓
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'experts' && styles.filterPillActive]}
            onPress={() => setFilter('experts')}
          >
            <Text style={[styles.filterPillText, filter === 'experts' && styles.filterPillTextActive]}>
              वैज्ञानिक सलाह 🧑‍🔬
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Post List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postListContent}
        renderItem={({ item: post }) => (
          <View style={styles.postCard}>
            <View style={styles.postAuthorRow}>
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 20 }}>{post.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  {post.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                  )}
                  {post.isProfessional && (
                    <Ionicons name="star" size={14} color="#f59e0b" />
                  )}
                </View>
                <Text style={styles.authorMeta}>
                  {post.expertise} • 📍 {post.location} • {post.timeAgo}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleNarratePost(post)}
                style={styles.listenBtn}
              >
                <Ionicons name="volume-high" size={16} color="#15803d" />
              </TouchableOpacity>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {post.tags.map((tag, tIdx) => (
                <View key={tIdx} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* AI or Member Comments */}
            {post.comments.length > 0 && (
              <View style={styles.commentsBox}>
                {post.comments.map((cm, cIdx) => (
                  <View key={cIdx} style={styles.commentItem}>
                    <View style={styles.commentAuthorRow}>
                      <Ionicons name="sparkles" size={13} color="#15803d" />
                      <Text style={styles.commentAuthor}>{cm.author}</Text>
                      <Text style={styles.commentRole}>({cm.role})</Text>
                    </View>
                    <Text style={styles.commentText}>{cm.content}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions Bar */}
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleLike(post.id)}
              >
                <Ionicons name="heart-outline" size={16} color="#ef4444" />
                <Text style={styles.actionText}>{post.likes} पसंद</Text>
              </TouchableOpacity>

              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#15803d" />
                <Text style={styles.actionText}>{post.comments.length} उत्तर</Text>
              </View>

              <TouchableOpacity
                style={styles.helpfulBtn}
                onPress={() => handleHelpful(post.id)}
              >
                <Ionicons name="thumbs-up" size={14} color="#15803d" />
                <Text style={styles.helpfulText}>मददगार ({post.helpful})</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button to Post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewPostModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="create" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* MODAL: CREATE NEW POST */}
      <Modal visible={showNewPostModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>किसान चौपाल में पोस्ट करें</Text>
              <TouchableOpacity
                onPress={() => setShowNewPostModal(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.postTypeSwitch}>
              <TouchableOpacity
                style={[styles.typeBtn, newIsQuestion && styles.typeBtnActive]}
                onPress={() => setNewIsQuestion(true)}
              >
                <Text style={[styles.typeBtnText, newIsQuestion && styles.typeBtnTextActive]}>
                  ❓ सवाल पूछें (AI उत्तर देगा)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, !newIsQuestion && styles.typeBtnActive]}
                onPress={() => setNewIsQuestion(false)}
              >
                <Text style={[styles.typeBtnText, !newIsQuestion && styles.typeBtnTextActive]}>
                  💡 अनुभव साझा करें
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="अपनी फसल की समस्या, बीमारी या सुझाव यहाँ लिखें..."
              placeholderTextColor="#9ca3af"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              autoFocus
            />

            <TouchableOpacity
              style={styles.submitPostBtn}
              onPress={handleCreatePost}
              disabled={isPosting}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="paper-plane" size={18} color="#ffffff" />
              )}
              <Text style={styles.submitPostBtnText}>
                {isPosting ? 'पोस्ट किया जा रहा है...' : 'चौपाल में पोस्ट करें'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Global Narrator Bar */}
      <NarratorBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#15803d',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterPillActive: {
    backgroundColor: '#ffffff',
  },
  filterPillText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#15803d',
    fontWeight: '700',
  },
  postListContent: {
    padding: 16,
    paddingBottom: 80,
    gap: 12,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  authorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  authorMeta: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  listenBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  postContent: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 21,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  commentsBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  commentItem: {
    gap: 2,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  commentRole: {
    fontSize: 10,
    color: '#166534',
  },
  commentText: {
    fontSize: 12,
    color: '#14532d',
    lineHeight: 18,
    marginTop: 2,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  helpfulText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  fab: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#15803d',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  postTypeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  typeBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#15803d',
    fontWeight: 'bold',
  },
  postInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#15803d',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  submitPostBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
