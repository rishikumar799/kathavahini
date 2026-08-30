export type ReadingTheme = 'light' | 'sepia' | 'dark';

export type StoryCategory = 
  | 'ప్రేమ' // Love
  | 'కుటుంబం' // Family
  | 'స్నేహం' // Friendship
  | 'జీవితం' // Life
  | 'ప్రేరణ' // Inspirational
  | 'హాస్యం' // Humor
  | 'రహస్యం' // Mystery
  | 'థ్రిల్లర్' // Thriller
  | 'ఫాంటసీ' // Fantasy
  | 'చారిత్రక' // Historical
  | 'భయం' // Horror
  | 'పిల్లల కథలు' // Kids
  | 'ఆధ్యాత్మికం' // Spiritual
  | 'సామాజికం' // Social
  | 'గ్రామీణ కథలు' // Rural Stories
  | 'సాహిత్యం'; // Literature

export type ContentStatus = 'draft' | 'pending' | 'approved' | 'scheduled' | 'published' | 'rejected' | 'archived';
export type ContentVisibility = 'public' | 'private' | 'hidden';

export interface Author {
  id: string;
  name: string;
  teluguName: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  teluguBio: string;
  followersCount: number;
  storiesCount: number;
  novelsCount: number;
  jokesCount: number;
  isVerified?: boolean;
  isFollowing?: boolean;
  joinedDate: string;
  location?: string;
}

export interface Story {
  id: string;
  title: string;
  teluguTitle: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  teluguExcerpt: string;
  content: string[]; // Paragraphs in Telugu
  authorId: string;
  authorName?: string;
  writerId?: string;
  author: Author;
  category: StoryCategory;
  tags: string[];
  rating: number;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  readingTimeMinutes: number;
  publishedAt: string;
  status: ContentStatus;
  visibility?: ContentVisibility;
  featured?: boolean;
  scheduledAt?: any;
  submittedAt?: any;
  approvedAt?: any;
  approvedBy?: string;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectedAt?: any;
  rejectionReason?: string;
  archivedAt?: any;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  progressPercent?: number;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  teluguTitle: string;
  content: string[];
  readingTimeMinutes: number;
  publishedAt: string;
}

export interface Episode {
  id: string;
  novelId: string;
  novelTitle?: string;
  episodeNumber: number;
  title: string;
  teluguTitle: string;
  content: string[];
  authorId: string;
  authorName?: string;
  status: ContentStatus;
  visibility: ContentVisibility;
  readingTimeMinutes?: number;
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: string;
  scheduledAt?: any;
}

export interface Novel {
  id: string;
  title: string;
  teluguTitle: string;
  slug: string;
  coverImage: string;
  description: string;
  teluguDescription: string;
  authorId: string;
  author: Author;
  category: StoryCategory;
  tags: string[];
  status: 'ongoing' | 'completed' | ContentStatus;
  visibility?: ContentVisibility;
  episodeCount?: number;
  chaptersCount: number;
  chapters: Chapter[];
  rating: number;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  publishedAt: string;
  scheduledAt?: any;
  approvedAt?: any;
  approvedBy?: string;
  createdAt?: any;
  updatedAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Joke {
  id: string;
  content: string;
  teluguContent?: string;
  category: string;
  authorId: string;
  author: Author;
  likeCount: number;
  shareCount: number;
  publishedAt: string;
  scheduledAt?: any;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  createdAt?: any;
  updatedAt?: any;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  storyId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
}

export type UserRole = 'reader' | 'writer' | 'admin' | 'superadmin' | 'user' | 'author';
export type CanonicalUserRole = 'reader' | 'writer' | 'admin';
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'banned' | 'rejected';

export interface User {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  teluguName?: string;
  avatar: string;
  bio?: string;
  teluguBio?: string;
  role: UserRole;
  status?: AccountStatus;
  followersCount: number;
  followingCount: number;
  savedStoriesCount: number;
  publishedCount: number;
  preferences: {
    theme: ReadingTheme;
    fontSize: number;
    fontFamily: 'serif' | 'sans';
    notifications: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface ReaderProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferences?: {
    theme?: ReadingTheme;
    fontSize?: number;
    fontFamily?: string;
    notifications?: boolean;
  };
  bookmarksCount?: number;
  followingCount?: number;
  commentsCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface WriterProfile {
  uid: string;
  displayName: string;
  penName: string;
  email: string;
  photoURL?: string;
  bio: string;
  genres: string[];
  writingExperience: string;
  status: 'active' | 'suspended';
  approvedAt?: any;
  approvedBy?: string;
  publishedStoriesCount: number;
  totalStoriesSubmitted: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface AdminProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'superadmin';
  status: 'active';
  createdAt?: any;
  updatedAt?: any;
}

export interface WriterApplication {
  id?: string;
  applicantUid: string;
  applicantType: 'new_registration' | 'reader_conversion';
  fullName: string;
  penName?: string;
  displayName?: string;
  email: string;
  mobileNumber?: string;
  phone?: string;
  username?: string;
  city?: string;
  bio: string;
  writingExperience: string;
  experience?: string;
  genres: string[];
  categories?: string[];
  reasonForApplying?: string;
  reason?: string;
  sampleWriting?: string;
  sampleText?: string;
  photoURL?: string;

  agreementAccepted: boolean;
  agreementVersion: string;
  agreementAcceptedAt?: any;
  agreementAcceptedByUid?: string;
  agreementAcceptedName?: string;

  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AdminAuditLog {
  id?: string;
  adminUid: string;
  adminEmail?: string;
  action: string;
  targetType: 'writer_application' | 'story' | 'novel' | 'episode' | 'joke' | 'knowledge' | 'comment' | 'user' | 'category' | 'report' | 'contact' | 'system';
  targetId: string;
  targetTitle?: string;
  metadata?: Record<string, any>;
  createdAt: any;
}

export interface CategoryItem {
  id: string;
  name: string;
  teluguName: string;
  slug?: string;
  description?: string;
  icon?: string;
  contentType?: 'story' | 'novel' | 'joke' | 'knowledge' | 'all';
  storyCount?: number;
  isActive?: boolean;
  sortOrder?: number;
  status: 'active' | 'archived';
  createdAt?: any;
  updatedAt?: any;
}

export interface ReadingHistoryItem {
  storyId: string;
  story: Story;
  lastReadChapterId?: string;
  progressPercent: number;
  lastReadAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'story' | 'follower' | 'like' | 'system';
  linkId?: string;
}

export interface CreatorStats {
  totalReads: number;
  totalLikes: number;
  totalFollowers: number;
  monthlyReadsTrend: { month: string; reads: number }[];
  topStories: { id: string; title: string; reads: number; likes: number }[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  teluguTitle: string;
  category: string;
  summary: string;
  content: string[];
  authorName: string;
  readTimeMinutes: number;
  publishedAt: string;
  coverImage: string;
  tags: string[];
  status?: ContentStatus;
  visibility?: ContentVisibility;
  scheduledAt?: any;
  createdAt?: any;
  updatedAt?: any;
  authorId?: string;
}

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  createdAt?: any;
  status?: 'unread' | 'read' | 'resolved';
}

export interface IssueReport {
  id?: string;
  issueType: 'broken_story' | 'incorrect_info' | 'offensive_content' | 'copyright_concern' | 'broken_image' | 'technical_problem' | 'comment_problem' | 'other';
  contentReference?: string;
  description: string;
  name?: string;
  email?: string;
  userId?: string;
  createdAt?: any;
  status?: 'pending' | 'reviewed' | 'resolved';
}
