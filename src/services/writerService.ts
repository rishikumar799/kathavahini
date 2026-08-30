import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { WriterApplication, Story, User, StoryCategory } from '../types';

class WriterService {
  /**
   * Submit a new Writer Application (For Authenticated Readers converting to Writer or resubmissions)
   */
  public async submitApplication(data: {
    applicantUid: string;
    applicantType?: 'new_registration' | 'reader_conversion';
    fullName: string;
    name?: string;
    penName?: string;
    displayName?: string;
    username?: string;
    email: string;
    mobileNumber?: string;
    phone?: string;
    city?: string;
    bio: string;
    writingExperience?: string;
    experience?: string;
    reasonForApplying?: string;
    reason?: string;
    genres?: string[];
    categories?: string[];
    sampleWriting?: string;
    sampleText?: string;
    photoURL?: string;
    agreementAcceptedName: string;
  }): Promise<WriterApplication> {
    const existing = await this.getUserApplication(data.applicantUid);
    if (existing && existing.status === 'pending') {
      throw new Error('మీ రచయిత దరఖాస్తు ఇప్పటికే పరిశీలనలో ఉంది. సూపర్ అడ్మిన్ ఆమోదం కోసం దయచేసి వేచి ఉండండి.');
    }

    const fullName = data.fullName.trim() || data.name?.trim() || '';
    const penName = data.penName?.trim() || data.displayName?.trim() || fullName;
    const resolvedGenres = data.genres && data.genres.length > 0 ? data.genres : (data.categories || ['జీవితం']);
    const sampleText = data.sampleWriting?.trim() || data.sampleText?.trim() || '';
    const experience = data.writingExperience?.trim() || data.experience?.trim() || 'బ్లాగులు & సోషల్ మీడియా';
    const reason = data.reasonForApplying?.trim() || data.reason?.trim() || 'తెలుగు కథా ప్రేమికులతో నా రచనలు పంచుకోవడానికి.';

    if (!fullName) {
      throw new Error('దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.');
    }
    if (!data.bio.trim()) {
      throw new Error('దయచేసి రచయిత బయో / పరిచయం రాయండి.');
    }
    if (!sampleText || sampleText.length < 50) {
      throw new Error('మీ రచన యొక్క నమూనా (కనీసం 50 అక్షరాలు) రాయండి.');
    }
    if (!data.agreementAcceptedName.trim()) {
      throw new Error('డిజిటల్ అంగీకారం కోసం దయచేసి మీ పేరును టైప్ చేయండి.');
    }

    const appData = {
      applicantUid: data.applicantUid,
      applicantType: data.applicantType || ('reader_conversion' as const),
      fullName,
      name: fullName,
      penName,
      displayName: penName,
      username: data.username?.trim() || '',
      email: data.email.trim(),
      mobileNumber: data.mobileNumber?.trim() || data.phone?.trim() || '',
      phone: data.mobileNumber?.trim() || data.phone?.trim() || '',
      city: data.city?.trim() || '',
      bio: data.bio.trim(),
      writingExperience: experience,
      experience,
      reasonForApplying: reason,
      reason,
      genres: resolvedGenres,
      categories: resolvedGenres,
      sampleWriting: sampleText,
      sampleText,
      photoURL: data.photoURL || '',

      // Legal Agreement Acceptance
      agreementAccepted: true,
      agreementVersion: '1.0',
      agreementAcceptedAt: serverTimestamp(),
      agreementAcceptedByUid: data.applicantUid,
      agreementAcceptedName: data.agreementAcceptedName.trim(),

      status: 'pending' as const,
      submittedAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    };

    const docRef = await addDoc(collection(db, 'writerApplications'), appData);
    
    return {
      ...appData,
      id: docRef.id,
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * Get the latest Writer Application for a specific user
   */
  public async getUserApplication(applicantUid: string): Promise<WriterApplication | null> {
    try {
      const q = query(
        collection(db, 'writerApplications'),
        where('applicantUid', '==', applicantUid)
      );
      const querySnap = await getDocs(q);
      
      if (querySnap.empty) return null;

      const apps: WriterApplication[] = querySnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          applicantUid: d.applicantUid,
          applicantType: d.applicantType || 'new_registration',
          fullName: d.fullName || d.name || d.displayName || '',
          penName: d.penName || d.displayName || '',
          displayName: d.displayName || d.penName || d.fullName || d.name || '',
          email: d.email || '',
          mobileNumber: d.mobileNumber || d.phone,
          phone: d.phone || d.mobileNumber,
          username: d.username,
          city: d.city,
          bio: d.bio || '',
          writingExperience: d.writingExperience || d.experience || '',
          experience: d.experience || d.writingExperience || '',
          genres: d.genres || d.categories || [],
          categories: d.categories || d.genres || [],
          reasonForApplying: d.reasonForApplying || d.reason || '',
          reason: d.reason || d.reasonForApplying || '',
          sampleWriting: d.sampleWriting || d.sampleText || '',
          sampleText: d.sampleText || d.sampleWriting || '',
          agreementAccepted: d.agreementAccepted !== undefined ? d.agreementAccepted : true,
          agreementAcceptedAt: d.agreementAcceptedAt instanceof Timestamp ? d.agreementAcceptedAt.toDate().toISOString() : d.agreementAcceptedAt,
          agreementAcceptedName: d.agreementAcceptedName || d.fullName || d.displayName,
          agreementVersion: d.agreementVersion || '1.0',
          declarationsConfirmed: d.declarationsConfirmed !== undefined ? d.declarationsConfirmed : true,
          declarations: d.declarations,
          photoURL: d.photoURL,
          status: d.status || 'pending',
          submittedAt: d.submittedAt instanceof Timestamp ? d.submittedAt.toDate().toISOString() : d.submittedAt || new Date().toISOString(),
          reviewedAt: d.reviewedAt instanceof Timestamp ? d.reviewedAt.toDate().toISOString() : d.reviewedAt,
          reviewedBy: d.reviewedBy,
          rejectionReason: d.rejectionReason,
        };
      });

      // Sort by newest first
      apps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return apps[0] || null;
    } catch (err) {
      console.warn('Could not query writer applications from Firestore:', err);
      return null;
    }
  }

  /**
   * Check if a writer can submit a story today (Max 1 submission per calendar day)
   * Calendar day is defined using Indian Standard Time (UTC+5:30) / local standard date
   */
  public async checkCanSubmitToday(writerUid: string): Promise<{ canSubmit: boolean; countToday: number; reason?: string }> {
    try {
      const now = new Date();
      const todayString = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now); // YYYY-MM-DD in IST

      // 1. Direct check on dedicated dailySubmissions tracker document
      try {
        const dailyDocRef = doc(db, 'writers', writerUid, 'dailySubmissions', todayString);
        const dailyDocSnap = await getDoc(dailyDocRef);
        if (dailyDocSnap.exists()) {
          return {
            canSubmit: false,
            countToday: 1,
            reason: 'ఈరోజుకు మీరు ఇప్పటికే ఒక కథను సమర్పించారు. నిబంధనల ప్రకారం రోజుకు గరిష్టంగా ఒక కథ మాత్రమే సమర్పించగలరు (1 Story Per Day Limit). రేపు మరో కొత్త కథను సమర్పించవచ్చు.',
          };
        }
      } catch (docErr) {
        console.warn('Daily tracker check note:', docErr);
      }

      // 2. Secondary check across stories collection
      const q = query(
        collection(db, 'stories'),
        where('authorId', '==', writerUid)
      );
      const snap = await getDocs(q);

      let countToday = 0;
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const ts = data.submittedAt || data.createdAt;
        if (ts) {
          const dateObj = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
          const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(dateObj);
          if (dateStr === todayString && data.status !== 'draft') {
            countToday++;
          }
        }
      });

      if (countToday >= 1) {
        return {
          canSubmit: false,
          countToday,
          reason: 'ఈరోజుకు మీరు ఇప్పటికే ఒక కథను సమర్పించారు. నిబంధనల ప్రకారం రోజుకు గరిష్టంగా ఒక కథ మాత్రమే సమర్పించగలరు (1 Story Per Day Limit). రేపు మరో కొత్త కథను సమర్పించవచ్చు.',
        };
      }

      return {
        canSubmit: true,
        countToday,
      };
    } catch (err) {
      console.warn('Error checking daily limit:', err);
      return { canSubmit: true, countToday: 0 };
    }
  }

  /**
   * Submit a story for review by Super Admin
   */
  public async submitStory(storyData: {
    title: string;
    teluguTitle?: string;
    category: StoryCategory;
    coverImage?: string;
    excerpt?: string;
    teluguExcerpt?: string;
    content: string[];
    tags?: string[];
  }, writer: User): Promise<Story> {
    // 1. Enforce Writer / Admin Role Check
    const isWriter = writer.role === 'writer' || writer.role === 'admin' || writer.role === 'superadmin' || writer.role === 'author';
    if (!isWriter) {
      throw new Error('కథలను సమర్పించడానికి మీరు ఆమోదించబడిన రచయిత (Writer) అయి ఉండాలి.');
    }

    const isAdmin = writer.role === 'admin' || writer.role === 'superadmin';
    
    // Authoritative calendar day in Asia/Kolkata timezone
    const todayString = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

    // 2. Pre-check for immediate UX feedback
    if (!isAdmin) {
      const limitCheck = await this.checkCanSubmitToday(writer.id);
      if (!limitCheck.canSubmit) {
        throw new Error(limitCheck.reason || 'ఈరోజుకు మీరు ఇప్పటికే ఒక కథను సమర్పించారు. రోజుకు గరిష్టంగా ఒక కథ మాత్రమే సమర్పించగలరు (1 Story Per Day Limit).');
      }
    }

    const storyId = `story-${Date.now()}`;
    const paragraphs = storyData.content.length > 0 ? storyData.content : ['కథ కంటెంట్...'];
    const excerpt = storyData.teluguExcerpt || storyData.excerpt || paragraphs[0]?.slice(0, 120) || 'కథ వివరణ';

    const newStoryData = {
      id: storyId,
      title: storyData.title.trim() || 'Untitled Story',
      teluguTitle: storyData.teluguTitle?.trim() || storyData.title.trim() || 'శీర్షిక లేని కథ',
      slug: (storyData.title || 'story').toLowerCase().replace(/\s+/g, '-'),
      coverImage: storyData.coverImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
      excerpt,
      teluguExcerpt: excerpt,
      content: paragraphs,
      authorId: writer.id,
      writerId: writer.id,
      authorName: writer.teluguName || writer.displayName || writer.name,
      author: {
        id: writer.id,
        name: writer.displayName || writer.name,
        teluguName: writer.teluguName || writer.displayName || writer.name,
        avatar: writer.avatar || writer.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(writer.id)}`,
        bio: writer.teluguBio || writer.bio || 'కథావాహిని రచయిత',
        teluguBio: writer.teluguBio || writer.bio || 'కథావాహిని రచయిత',
        followersCount: writer.followersCount || 0,
        storiesCount: (writer.publishedCount || 0) + 1,
        novelsCount: 0,
        jokesCount: 0,
        joinedDate: '2026',
      },
      category: storyData.category || 'జీవితం',
      tags: storyData.tags || ['తెలుగు', 'కథ'],
      rating: 5.0,
      viewCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      readingTimeMinutes: Math.max(1, Math.ceil(paragraphs.join(' ').length / 300)),
      publishedAt: todayString,
      status: 'pending' as const, // ALWAYS 'pending' - Writers CANNOT directly publish
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (isAdmin) {
      // Admin bypasses daily limit and creates story directly
      await setDoc(doc(db, 'stories', storyId), newStoryData);
    } else {
      // ATOMIC TRANSACTION: Check daily limit reservation & create story in single atomic operation
      const dailyDocRef = doc(db, 'writers', writer.id, 'dailySubmissions', todayString);
      const storyDocRef = doc(db, 'stories', storyId);
      const userDocRef = doc(db, 'users', writer.id);

      await runTransaction(db, async (transaction) => {
        // Read phase
        const dailySnap = await transaction.get(dailyDocRef);
        if (dailySnap.exists()) {
          throw new Error('ఈరోజుకు మీరు ఇప్పటికే ఒక కథను సమర్పించారు. నిబంధనల ప్రకారం రోజుకు గరిష్టంగా ఒక కథ మాత్రమే సమర్పించగలరు (1 Story Per Day Limit). రేపు మరో కొత్త కథను సమర్పించవచ్చు.');
        }

        const userSnap = await transaction.get(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.status === 'suspended' || userData.status === 'banned') {
            throw new Error('మీ రచయిత ఖాతా నిలిపివేయబడింది లేదా రద్దు చేయబడింది. కథలను సమర్పించలేరు.');
          }
        }

        // Write phase: Reserve daily limit slot and create pending story atomically
        transaction.set(dailyDocRef, {
          date: todayString,
          storyId,
          writerUid: writer.id,
          submittedAt: serverTimestamp(),
        });

        transaction.set(storyDocRef, newStoryData);
      });
    }

    return {
      ...newStoryData,
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * Get all submissions (draft, pending, published, rejected) by this writer
   */
  public async getWriterStories(writerUid: string): Promise<Story[]> {
    try {
      const q = query(
        collection(db, 'stories'),
        where('authorId', '==', writerUid)
      );
      const snap = await getDocs(q);
      
      const stories: Story[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          teluguTitle: data.teluguTitle || data.title || '',
          slug: data.slug || 'story',
          coverImage: data.coverImage || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
          excerpt: data.excerpt || '',
          teluguExcerpt: data.teluguExcerpt || data.excerpt || '',
          content: data.content || [],
          authorId: data.authorId,
          authorName: data.authorName,
          author: data.author,
          category: data.category || 'జీవితం',
          tags: data.tags || [],
          rating: data.rating || 5.0,
          viewCount: data.viewCount || 0,
          likeCount: data.likeCount || 0,
          bookmarkCount: data.bookmarkCount || 0,
          readingTimeMinutes: data.readingTimeMinutes || 3,
          publishedAt: data.publishedAt || '',
          status: data.status || 'pending',
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate().toISOString() : data.submittedAt,
          reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
          reviewedBy: data.reviewedBy,
          rejectionReason: data.rejectionReason,
        };
      });

      return stories;
    } catch (err) {
      console.warn('Error fetching writer stories from Firestore:', err);
      return [];
    }
  }
}

export const writerService = new WriterService();
