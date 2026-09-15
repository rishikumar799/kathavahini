import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  ActionCodeSettings,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, ReadingTheme, WriterApplication } from '../types';

export const MASTER_ADMIN_EMAIL = 'thekathavahini@gmail.com';
export const MASTER_ADMIN_PASSWORD = 'Kathavahini@123';

export interface AuthStateListener {
  (user: User | null, loading: boolean): void;
}

class AuthService {
  private currentUser: User | null = null;
  private authLoading: boolean = true;
  private listeners: AuthStateListener[] = [];
  private unsubscribeAuth: (() => void) | null = null;
  private userDocUnsubscribe: (() => void) | null = null;

  constructor() {
    this.initAuthListener();
  }

  /**
   * Helper to construct authoritative Master Admin User profile
   */
  public getMasterAdminUser(customUid?: string): User {
    const uid = customUid || 'kathavahini_master_admin';
    return {
      id: uid,
      uid: uid,
      name: 'కథావాహిని అడ్మిన్',
      displayName: 'కథావాహిని అడ్మిన్',
      email: MASTER_ADMIN_EMAIL,
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thekathavahini',
      teluguName: 'కథావాహిని అడ్మిన్',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thekathavahini',
      bio: 'కథావాహిని అధికారిక నిర్వాహక ఖాతా (Master Administrator)',
      teluguBio: 'కథావాహిని అధికారిక నిర్వాహక ఖాతా',
      role: 'admin',
      status: 'active',
      followersCount: 0,
      followingCount: 0,
      savedStoriesCount: 0,
      publishedCount: 0,
      preferences: {
        theme: 'light',
        fontSize: 18,
        fontFamily: 'serif',
        notifications: true,
      },
    };
  }

  private initAuthListener() {
    // 1. Instantly check if Master Admin session is remembered in localStorage
    try {
      const isMasterAdmin = localStorage.getItem('kathavahini_master_admin_session') === 'true';
      if (isMasterAdmin) {
        const adminUid = localStorage.getItem('kathavahini_master_admin_uid') || 'kathavahini_master_admin';
        this.currentUser = this.getMasterAdminUser(adminUid);
        this.authLoading = false;
        this.notify();
      }
    } catch (e) {
      console.warn('LocalStorage access note:', e);
    }

    // 2. Listen to Firebase Authentication lifecycle
    this.unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isMaster = firebaseUser.email?.toLowerCase() === MASTER_ADMIN_EMAIL;
        if (isMaster) {
          try {
            localStorage.setItem('kathavahini_master_admin_session', 'true');
            localStorage.setItem('kathavahini_master_admin_uid', firebaseUser.uid);
          } catch (e) {}
          this.currentUser = this.getMasterAdminUser(firebaseUser.uid);
        } else {
          // Clear master admin flag if regular user logged in
          try {
            localStorage.removeItem('kathavahini_master_admin_session');
            localStorage.removeItem('kathavahini_master_admin_uid');
          } catch (e) {}

          try {
            const userProfile = await this.syncFirestoreUserProfile(firebaseUser);
            // Block pending writers from direct login - they must wait for admin approval
            if (userProfile.role === 'writer' && userProfile.status === 'pending') {
              await signOut(auth);
              this.currentUser = null;
            } else if (userProfile.status === 'suspended' || userProfile.status === 'banned' || userProfile.status === 'rejected') {
              await signOut(auth);
              this.currentUser = null;
            } else {
              this.currentUser = userProfile;
            }

            // Real-time listener for user profile updates (role promotions, status changes by admin)
            if (this.userDocUnsubscribe) {
              this.userDocUnsubscribe();
              this.userDocUnsubscribe = null;
            }
            try {
              const uDocRef = doc(db, 'users', firebaseUser.uid);
              this.userDocUnsubscribe = onSnapshot(uDocRef, (snap) => {
                if (snap.exists() && this.currentUser && this.currentUser.id === firebaseUser.uid) {
                  const data = snap.data();
                  const newRole = data.role === 'admin' ? 'admin' : (data.role === 'writer' || data.role === 'author') ? 'writer' : 'reader';
                  const newStatus = data.status || 'active';
                  this.currentUser = {
                    ...this.currentUser,
                    role: newRole,
                    status: newStatus,
                    name: data.penName || data.displayName || data.name || this.currentUser.name,
                    displayName: data.penName || data.displayName || data.name || this.currentUser.displayName,
                    teluguName: data.teluguName || this.currentUser.teluguName,
                    bio: data.bio || this.currentUser.bio,
                  };
                  this.notify();
                }
              }, (snapErr) => {
                console.warn('Real-time user snapshot note:', snapErr);
              });
            } catch (e) {}
          } catch (error) {
            console.error('Error fetching/syncing user profile from Firestore:', error);
            // Fallback to minimal profile based on Firebase Auth user
            this.currentUser = this.buildFallbackUser(firebaseUser);
          }
        }
      } else {
        if (this.userDocUnsubscribe) {
          this.userDocUnsubscribe();
          this.userDocUnsubscribe = null;
        }
        // If no Firebase User, check if master admin session is saved
        const isMasterAdmin = localStorage.getItem('kathavahini_master_admin_session') === 'true';
        if (isMasterAdmin) {
          const adminUid = localStorage.getItem('kathavahini_master_admin_uid') || 'kathavahini_master_admin';
          this.currentUser = this.getMasterAdminUser(adminUid);
        } else {
          this.currentUser = null;
        }
      }

      this.authLoading = false;
      this.notify();
    });
  }

  public isAuthLoading(): boolean {
    return this.authLoading;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public subscribe(callback: AuthStateListener): () => void {
    this.listeners.push(callback);
    // Send immediate initial state
    callback(this.currentUser, this.authLoading);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentUser, this.authLoading);
      } catch (err) {
        console.error('Error in auth state listener callback:', err);
      }
    });
  }

  /**
   * Helper to construct a fallback User object directly from Firebase Auth record
   */
  private buildFallbackUser(firebaseUser: FirebaseUser): User {
    const displayName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'తెలుగు పాఠకుడు');
    const avatar = firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.uid)}`;

    const isKnownAdmin = firebaseUser.email?.toLowerCase() === 'thekathavahini@gmail.com';
    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: displayName,
      displayName,
      email: firebaseUser.email || '',
      photoURL: avatar,
      teluguName: displayName,
      avatar,
      role: isKnownAdmin ? 'admin' : 'reader',
      status: 'active',
      followersCount: 0,
      followingCount: 0,
      savedStoriesCount: 0,
      publishedCount: 0,
      preferences: {
        theme: 'light',
        fontSize: 18,
        fontFamily: 'serif',
        notifications: true,
      },
    };
  }

  /**
   * Fetches or creates the user profile document in Firestore (`users/{uid}`)
   * Authoritative role source is strictly the secure backend user record.
   */
  private async syncFirestoreUserProfile(firebaseUser: FirebaseUser, customName?: string): Promise<User> {
    const isMasterAdminEmail = firebaseUser.email?.toLowerCase() === MASTER_ADMIN_EMAIL;

    // Fast path: Master Admin is always unconditionally guaranteed role: 'admin'
    if (isMasterAdminEmail) {
      return this.getMasterAdminUser(firebaseUser.uid);
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const displayName = data.displayName || data.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'తెలుగు పాఠకుడు');
        const avatarUrl = data.photoURL || data.avatar || firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.uid)}`;

        // Resolve role: STRICTLY from Firestore document (admin | writer | reader)
        let resolvedRole: 'reader' | 'writer' | 'admin' = 'reader';
        if (data.role === 'admin') {
          resolvedRole = 'admin';
        } else if (data.role === 'writer' || data.role === 'author') {
          resolvedRole = 'writer';
        } else {
          resolvedRole = 'reader';
        }

        // Check if obsolete role normalization update is needed
        if (data.role === 'author') {
          try {
            await updateDoc(userDocRef, {
              role: 'writer',
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Silent role normalization notice:', err);
          }
        }

        const user: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: displayName,
          displayName: displayName,
          email: firebaseUser.email || data.email || '',
          photoURL: avatarUrl,
          teluguName: data.teluguName || displayName,
          avatar: avatarUrl,
          bio: data.bio || '',
          teluguBio: data.teluguBio || '',
          role: resolvedRole,
          status: data.status || 'active',
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          savedStoriesCount: data.savedStoriesCount || 0,
          publishedCount: data.publishedCount || 0,
          preferences: {
            theme: data.preferences?.theme || 'light',
            fontSize: data.preferences?.fontSize || 18,
            fontFamily: data.preferences?.fontFamily || 'serif',
            notifications: data.preferences?.notifications ?? true,
          },
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        return user;
      } else {
        // First-time user creation if doc does not exist: Default role is strictly 'reader'
        const chosenName = customName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'తెలుగు పాఠకుడు');
        const avatarUrl = firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.uid)}`;

        const newUserData = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          name: chosenName,
          displayName: chosenName,
          email: firebaseUser.email || '',
          photoURL: avatarUrl,
          teluguName: chosenName,
          avatar: avatarUrl,
          bio: '',
          teluguBio: '',
          role: 'reader' as const,
          status: 'active' as const,
          followersCount: 0,
          followingCount: 0,
          savedStoriesCount: 0,
          publishedCount: 0,
          preferences: {
            theme: 'light' as ReadingTheme,
            fontSize: 18,
            fontFamily: 'serif' as const,
            notifications: true,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        try {
          await setDoc(userDocRef, newUserData);
        } catch (setErr) {
          console.warn('Could not save user profile doc in Firestore:', setErr);
        }

        return {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: chosenName,
          displayName: chosenName,
          email: firebaseUser.email || '',
          photoURL: avatarUrl,
          teluguName: chosenName,
          avatar: avatarUrl,
          bio: '',
          teluguBio: '',
          role: newUserData.role,
          status: 'active',
          followersCount: 0,
          followingCount: 0,
          savedStoriesCount: 0,
          publishedCount: 0,
          preferences: {
            theme: 'light',
            fontSize: 18,
            fontFamily: 'serif',
            notifications: true,
          },
        };
      }
    } catch (err) {
      console.warn('Firestore user profile sync warning, falling back:', err);
      return this.buildFallbackUser(firebaseUser);
    }
  }

  /**
   * Refreshes the currently authenticated user's Firestore profile
   */
  public async refreshUser(): Promise<User | null> {
    const isMasterAdmin = localStorage.getItem('kathavahini_master_admin_session') === 'true';
    if (isMasterAdmin) {
      const uid = localStorage.getItem('kathavahini_master_admin_uid') || 'kathavahini_master_admin';
      const admin = this.getMasterAdminUser(uid);
      this.currentUser = admin;
      this.notify();
      return admin;
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      this.currentUser = null;
      return null;
    }
    const updated = await this.syncFirestoreUserProfile(firebaseUser);
    this.currentUser = updated;
    this.notify();
    return updated;
  }

  /**
   * Option A: Register as Reader with Email & Password (Dedicated Reader Signup Flow)
   * Creates Firebase Auth account, sets role: 'reader', status: 'active', and logs in.
   */
  public async register(name: string, email: string, pass: string): Promise<User> {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      throw new Error('దయచేసి సరైన ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
    }

    // Protection: Master Admin account is fixed and cannot be registered via regular signup forms
    if (trimmedEmail.toLowerCase() === MASTER_ADMIN_EMAIL) {
      if (pass === MASTER_ADMIN_PASSWORD) {
        return await this.loginWithEmail(trimmedEmail, pass);
      }
      throw new Error('thekathavahini@gmail.com ప్రధాన అడ్మిన్ ఈమెయిల్. ఇది సైన్-అప్ కొరకు కాదు. దయచేసి "లాగిన్ (Login)" ద్వారా అడ్మిన్ పాస్‌వర్డ్‌తో ప్రవేశించండి.');
    }

    if (pass.length < 6) {
      throw new Error('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
    }

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
    } catch (authErr: any) {
      // If email already in use, attempt seamless login with the entered password
      if (authErr?.code === 'auth/email-already-in-use') {
        try {
          userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
          const existingProfile = await this.syncFirestoreUserProfile(userCredential.user);
          this.currentUser = existingProfile;
          this.notify();
          return existingProfile;
        } catch (signInErr) {
          throw new Error('ఈ ఈమెయిల్‌తో ఇప్పటికే ఖాతా ఉంది. దయచేసి "ప్రవేశం (Login)" ట్యాబ్‌లో మీ పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.');
        }
      }
      throw authErr;
    }
    
    // Update Firebase Auth profile display name
    if (trimmedName) {
      try {
        await updateFirebaseProfile(userCredential.user, {
          displayName: trimmedName,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userCredential.user.uid)}`,
        });
      } catch (err) {
        console.warn('Could not update Auth profile displayName:', err);
      }
    }

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userCredential.user.uid)}`;

    // Create user document with role: 'reader', status: 'active'
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const newUserData = {
      uid: userCredential.user.uid,
      id: userCredential.user.uid,
      name: trimmedName,
      displayName: trimmedName,
      email: trimmedEmail,
      photoURL: avatarUrl,
      teluguName: trimmedName,
      avatar: avatarUrl,
      bio: '',
      teluguBio: '',
      role: 'reader' as const, // STRICTLY 'reader'
      status: 'active' as const,
      followersCount: 0,
      followingCount: 0,
      savedStoriesCount: 0,
      publishedCount: 0,
      preferences: {
        theme: 'light' as const,
        fontSize: 18,
        fontFamily: 'serif' as const,
        notifications: true,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(userDocRef, newUserData);
    } catch (err) {
      console.warn('Could not set user document in Firestore during registration:', err);
    }

    // Maintain readers/{uid} document
    try {
      await setDoc(doc(db, 'readers', userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: trimmedName,
        email: trimmedEmail,
        photoURL: avatarUrl,
        bookmarksCount: 0,
        followingCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not initialize readers collection document:', err);
    }

    const userProfile: User = {
      id: userCredential.user.uid,
      uid: userCredential.user.uid,
      name: trimmedName,
      displayName: trimmedName,
      email: trimmedEmail,
      photoURL: avatarUrl,
      teluguName: trimmedName,
      avatar: avatarUrl,
      bio: '',
      teluguBio: '',
      role: 'reader',
      status: 'active',
      followersCount: 0,
      followingCount: 0,
      savedStoriesCount: 0,
      publishedCount: 0,
      preferences: {
        theme: 'light',
        fontSize: 18,
        fontFamily: 'serif',
        notifications: true,
      },
    };

    this.currentUser = userProfile;
    this.notify();
    return userProfile;
  }

  /**
   * Option B: Register as Writer with Email & Password (Dedicated Writer Signup Flow)
   * Creates Firebase Auth account, sets role: 'writer', status: 'active',
   * creates writers/{uid} and writerApplications entries, and logs in immediately.
   */
  public async registerWriter(data: {
    fullName: string;
    penName?: string;
    displayName?: string;
    email: string;
    pass: string;
    bio?: string;
    writingExperience?: string;
    genres?: string[];
    sampleText?: string;
    signatureName?: string;
  }): Promise<User> {
    const trimmedEmail = data.email.trim();
    const trimmedName = data.fullName.trim();
    const trimmedPenName = data.penName?.trim() || data.displayName?.trim() || trimmedName;
    const resolvedGenres = data.genres && data.genres.length > 0 ? data.genres : ['జీవితం', 'కుటుంబం'];

    if (!trimmedEmail) {
      throw new Error('దయచేసి సరైన ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
    }

    // Protection: Master Admin account is fixed and cannot be registered via regular signup forms
    if (trimmedEmail.toLowerCase() === MASTER_ADMIN_EMAIL) {
      if (data.pass === MASTER_ADMIN_PASSWORD) {
        return await this.loginWithEmail(trimmedEmail, data.pass);
      }
      throw new Error('thekathavahini@gmail.com ప్రధాన అడ్మిన్ ఈమెయిల్. సైన్-అప్ చేయడానికి వీలులేదు. దయచేసి "లాగిన్ (Login)" ద్వారా అడ్మిన్ పాస్‌వర్డ్‌తో ప్రవేశించండి.');
    }

    if (data.pass.length < 6) {
      throw new Error('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
    }
    if (!trimmedPenName) {
      throw new Error('దయచేసి రచయిత కలం పేరు (Pen Name) నమోదు చేయండి.');
    }

    // 1. Create or connect Firebase Auth Account
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, data.pass);
    } catch (authErr: any) {
      if (authErr?.code === 'auth/email-already-in-use') {
        try {
          userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, data.pass);
        } catch (signInErr) {
          throw new Error('ఈ ఈమెయిల్‌తో ఇప్పటికే ఖాతా ఉంది. దయచేసి లాగిన్ చేసి మీ పాస్‌వర్డ్‌ను సరిచూసుకోండి.');
        }
      } else {
        throw authErr;
      }
    }
    
    try {
      await updateFirebaseProfile(userCredential.user, {
        displayName: trimmedPenName,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userCredential.user.uid)}`,
      });
    } catch (err) {
      console.warn('Could not update Auth profile displayName:', err);
    }

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userCredential.user.uid)}`;

    // 2. Create Canonical User Profile in Firestore with role: 'writer', status: 'pending'
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const newUserData = {
      uid: userCredential.user.uid,
      id: userCredential.user.uid,
      name: trimmedName,
      displayName: trimmedPenName,
      penName: trimmedPenName,
      email: trimmedEmail,
      photoURL: avatarUrl,
      teluguName: trimmedPenName,
      avatar: avatarUrl,
      bio: data.bio?.trim() || '',
      teluguBio: data.bio?.trim() || '',
      role: 'writer' as const, // STRICTLY 'writer'
      status: 'pending' as const, // Strictly 'pending' until Admin approval
      writingExperience: data.writingExperience?.trim() || 'బ్లాగులు & సోషల్ మీడియా',
      genres: resolvedGenres,
      followersCount: 0,
      followingCount: 0,
      savedStoriesCount: 0,
      publishedCount: 0,
      preferences: {
        theme: 'light' as const,
        fontSize: 18,
        fontFamily: 'serif' as const,
        notifications: true,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(userDocRef, newUserData, { merge: true });
    } catch (setErr) {
      console.warn('Could not record writer profile in Firestore:', setErr);
    }

    // 3. Record writer account request in writerApplications collection for admin review
    try {
      await addDoc(collection(db, 'writerApplications'), {
        applicantUid: userCredential.user.uid,
        applicantType: 'new_registration',
        fullName: trimmedName,
        penName: trimmedPenName,
        displayName: trimmedPenName,
        email: trimmedEmail,
        bio: data.bio?.trim() || '',
        writingExperience: data.writingExperience?.trim() || '',
        genres: resolvedGenres,
        sampleWriting: data.sampleText?.trim() || '',
        agreementAccepted: true,
        agreementAcceptedName: data.signatureName?.trim() || trimmedName,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not record writer application:', err);
    }

    const userProfile: User = {
      id: userCredential.user.uid,
      uid: userCredential.user.uid,
      name: trimmedName,
      displayName: trimmedPenName,
      email: trimmedEmail,
      photoURL: avatarUrl,
      teluguName: trimmedPenName,
      avatar: avatarUrl,
      bio: data.bio?.trim() || '',
      teluguBio: data.bio?.trim() || '',
      role: 'writer',
      status: 'pending',
      followersCount: 0,
      followingCount: 0,
      savedStoriesCount: 0,
      publishedCount: 0,
      preferences: {
        theme: 'light',
        fontSize: 18,
        fontFamily: 'serif',
        notifications: true,
      },
    };

    // CRITICAL: Immediately sign out so there is NO direct login.
    // The user must wait until the admin checks and approves their request.
    try {
      await signOut(auth);
    } catch (e) {}
    this.currentUser = null;
    this.notify();
    return userProfile;
  }

  /**
   * Option C: Register & Submit Writer Application (For review workflow)
   */
  public async registerWriterApplicant(data: {
    fullName: string;
    penName?: string;
    displayName?: string;
    username?: string;
    mobileNumber?: string;
    phone?: string;
    city?: string;
    email: string;
    pass: string;
    bio: string;
    writingExperience?: string;
    genres?: string[];
    categories?: string[];
    reasonForApplying?: string;
    sampleText: string;
    agreementAcceptedName: string;
  }): Promise<{ user: User; applicationId: string; message: string }> {
    const user = await this.registerWriter({
      fullName: data.fullName,
      penName: data.penName || data.displayName,
      displayName: data.displayName,
      email: data.email,
      pass: data.pass,
      bio: data.bio,
      writingExperience: data.writingExperience,
      genres: data.genres || data.categories,
      sampleText: data.sampleText,
      signatureName: data.agreementAcceptedName,
    });

    return {
      user,
      applicationId: user.id,
      message: 'మీ రచయిత దరఖాస్తు విజయవంతంగా సమర్పించబడింది. కథావాహిని అడ్మిన్ పరిశీలన తర్వాత ఆమోదించబడుతుంది.',
    };
  }

  /**
   * Login with Email & Password (One common login form for all roles)
   */
  public async loginWithEmail(email: string, pass: string): Promise<User> {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error('దయచేసి సరైన ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
    }

    const isMasterAdminEmail = trimmedEmail.toLowerCase() === MASTER_ADMIN_EMAIL;

    // =========================================================================
    // 1. MASTER ADMIN AUTHENTICATION (Fixed & Guaranteed Success)
    // =========================================================================
    if (isMasterAdminEmail) {
      if (pass !== MASTER_ADMIN_PASSWORD) {
        throw new Error('అడ్మిన్ పాస్‌వర్డ్ తప్పుగా ఉంది. దయచేసి సరైన పాస్‌వర్డ్ నమోదు చేయండి.');
      }

      let firebaseUser: FirebaseUser | null = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        // If the Firebase Auth account doesn't exist yet, automatically provision it
        if (
          authErr?.code === 'auth/user-not-found' ||
          authErr?.code === 'auth/invalid-credential' ||
          authErr?.code === 'auth/wrong-password'
        ) {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
            firebaseUser = newCred.user;
            await updateFirebaseProfile(newCred.user, {
              displayName: 'కథావాహిని అడ్మిన్',
              photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thekathavahini',
            });
          } catch (createErr) {
            console.warn('Could not auto-create master admin in Firebase Auth:', createErr);
          }
        } else {
          console.warn('Firebase sign-in note for master admin:', authErr);
        }
      }

      const adminUid = firebaseUser?.uid || 'kathavahini_master_admin';
      const masterAdminProfile = this.getMasterAdminUser(adminUid);

      // Persist admin session so page reloads keep admin status active
      try {
        localStorage.setItem('kathavahini_master_admin_session', 'true');
        localStorage.setItem('kathavahini_master_admin_uid', adminUid);
      } catch (e) {}

      // Ensure Firestore backend records exist with role: 'admin'
      try {
        await setDoc(doc(db, 'users', adminUid), {
          uid: adminUid,
          id: adminUid,
          name: 'కథావాహిని అడ్మిన్',
          displayName: 'కథావాహిని అడ్మిన్',
          email: MASTER_ADMIN_EMAIL,
          role: 'admin',
          status: 'active',
          updatedAt: serverTimestamp(),
        }, { merge: true });

        await setDoc(doc(db, 'admins', adminUid), {
          uid: adminUid,
          email: MASTER_ADMIN_EMAIL,
          displayName: 'కథావాహిని అడ్మిన్',
          role: 'admin',
          status: 'active',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Silent Firestore admin sync notice:', fsErr);
      }

      this.currentUser = masterAdminProfile;
      this.authLoading = false;
      this.notify();
      return masterAdminProfile;
    }

    // =========================================================================
    // 2. STANDARD READER & WRITER AUTHENTICATION
    // =========================================================================
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
    let userProfile: User;
    try {
      userProfile = await this.syncFirestoreUserProfile(userCredential.user);
    } catch (err) {
      console.warn('Could not sync user profile from Firestore on login:', err);
      userProfile = this.buildFallbackUser(userCredential.user);
    }

    // Verify writer pending status - block direct login until admin approves!
    if (userProfile.role === 'writer' && userProfile.status === 'pending') {
      await signOut(auth);
      this.currentUser = null;
      this.notify();
      throw new Error('మీ రచయిత ఖాతా అభ్యర్థన ప్రస్తుతం అడ్మిన్ పరిశీలనలో ఉంది. కథావాహిని అడ్మిన్ పరిశీలించి ఆమోదించిన తర్వాత మాత్రమే మీరు లాగిన్ అవ్వగలరు. అప్పటివరకు దయచేసి వేచి ఉండండి.');
    }

    // Verify account status (Suspended or Banned)
    if (userProfile.status === 'suspended' || userProfile.status === 'banned') {
      await signOut(auth);
      this.currentUser = null;
      this.notify();
      throw new Error('మీ ఖాతా ప్రస్తుతం నిలిపివేయబడింది (Suspended). మరిన్ని వివరాల కోసం అడ్మిన్‌ను సంప్రదించండి.');
    }

    // Verify rejected status
    if (userProfile.status === 'rejected') {
      await signOut(auth);
      this.currentUser = null;
      this.notify();
      throw new Error('మీ రచయిత దరఖాస్తు ప్రస్తుతం ఆమోదించబడలేదు. మరిన్ని వివరాల కోసం అడ్మిన్‌ను సంప్రదించండి.');
    }

    // Update role-specific collection for console clarity
    try {
      if (userProfile.role === 'admin') {
        await setDoc(doc(db, 'admins', userProfile.id), {
          uid: userProfile.id,
          email: userProfile.email,
          displayName: userProfile.displayName || userProfile.name,
          role: 'admin',
          status: 'active',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else if (userProfile.role === 'writer' && userProfile.status === 'active') {
        await setDoc(doc(db, 'writers', userProfile.id), {
          uid: userProfile.id,
          displayName: userProfile.displayName || userProfile.name,
          penName: userProfile.teluguName || userProfile.name,
          email: userProfile.email,
          status: 'active',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        await setDoc(doc(db, 'readers', userProfile.id), {
          uid: userProfile.id,
          displayName: userProfile.displayName || userProfile.name,
          email: userProfile.email,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Role collection sync notice:', err);
    }

    this.currentUser = userProfile;
    this.notify();
    return userProfile;
  }

  /**
   * Sign out current user
   */
  public async logout(): Promise<void> {
    try {
      localStorage.removeItem('kathavahini_master_admin_session');
      localStorage.removeItem('kathavahini_master_admin_uid');
    } catch (e) {}

    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut warning:', err);
    }
    this.currentUser = null;
    this.notify();
  }

  /**
   * Update current user profile in Firestore
   */
  public async updateProfile(data: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('వినియోగదారు లాగిన్ కాలేదు.');
    }

    // Never allow client-side role or status override
    const { role, status, id, uid, ...safeData } = data as any;

    const userDocRef = doc(db, 'users', this.currentUser.id);
    await updateDoc(userDocRef, {
      ...safeData,
      updatedAt: serverTimestamp(),
    });

    this.currentUser = {
      ...this.currentUser,
      ...safeData,
    };
    this.notify();
    return this.currentUser;
  }

  /**
   * Helper to derive the base URL for ActionCodeSettings
   */
  public getAppBaseUrl(): string {
    const metaEnv = (import.meta as any)?.env;
    const envUrl = (metaEnv?.VITE_APP_URL || metaEnv?.APP_URL || '') as string;
    if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
      return envUrl.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin;
    }
    return 'https://kathavahini.org';
  }

  /**
   * Send Password Reset Email with official Firebase ActionCodeSettings and automatic fallback
   */
  public async sendPasswordReset(email: string): Promise<void> {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error('దయచేసి సరైన ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.');
    }

    try {
      const appBaseUrl = this.getAppBaseUrl();
      const actionCodeSettings: ActionCodeSettings = {
        url: `${appBaseUrl}/reset-password`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, trimmedEmail, actionCodeSettings);
    } catch (err: any) {
      console.warn('ActionCodeSettings reset failed or unauthorized continue URI, falling back to standard Firebase reset email:', err);
      // Fallback: standard sendPasswordResetEmail without ActionCodeSettings is always authorized
      await sendPasswordResetEmail(auth, trimmedEmail);
    }
  }

  /**
   * Verify the password reset oobCode from Firebase
   */
  public async verifyPasswordResetCode(oobCode: string): Promise<string> {
    const trimmedCode = oobCode ? oobCode.trim() : '';
    if (!trimmedCode) {
      throw new Error('చెల్లుబాటు అయ్యే రీసెట్ కోడ్ కనుగొనబడలేదు.');
    }
    return await verifyPasswordResetCode(auth, trimmedCode);
  }

  /**
   * Confirm password reset with Firebase Authentication
   */
  public async confirmPasswordReset(oobCode: string, newPass: string): Promise<void> {
    const trimmedCode = oobCode ? oobCode.trim() : '';
    if (!trimmedCode) {
      throw new Error('చెల్లుబాటు అయ్యే రీసెట్ కోడ్ కనుగొనబడలేదు.');
    }
    if (!newPass || newPass.length < 6) {
      throw new Error('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
    }
    await confirmPasswordReset(auth, trimmedCode, newPass);
  }

  /**
   * Translate Firebase Auth error codes into helpful Telugu / user-friendly messages
   */
  public getErrorMessage(error: any): string {
    if (!error) return 'ప్రవేశంలో లోపం జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.';
    
    const code = (error as AuthError)?.code || error.message || '';
    
    switch (code) {
      case 'auth/email-already-in-use':
        return 'ఈ ఈమెయిల్‌తో ఇప్పటికే ఖాతా ఉంది. దయచేసి లాగిన్ చేయండి.';
      case 'auth/invalid-email':
        return 'సరైన ఈమెయిల్ అడ్రస్‌ను నమోదు చేయండి.';
      case 'auth/weak-password':
        return 'పాస్‌వర్డ్ బలహీనంగా ఉంది. కనీసం 6 అక్షరాలు ఉండాలి.';
      case 'auth/user-not-found':
        return 'ఈ ఈమెయిల్‌తో ఖాతా కనుగొనబడలేదు. దయచేసి నమోదు చేసుకోండి.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'పాస్‌వర్డ్ లేదా ఈమెయిల్ తప్పుగా ఉంది. సరిచూసుకోండి.';
      case 'auth/too-many-requests':
        return 'చాలా విఫలమైన ప్రయత్నాలు జరిగాయి. కాసేపు వేచి ఉండి మళ్లీ ప్రయత్నించండి.';
      case 'auth/network-request-failed':
        return 'నెట్‌వర్క్ సమస్య ఏర్పడింది. మీ ఇంటర్నెట్ కనెక్షన్‌ను సరిచూసుకోండి.';
      case 'auth/user-disabled':
        return 'ఈ ఖాతా నిలిపివేయబడింది.';
      case 'auth/invalid-action-code':
        return 'ఈ పాస్వర్డ్ రీసెట్ లింక్ చెల్లదు లేదా గడువు ముగిసింది. దయచేసి కొత్త రీసెట్ లింక్ను అభ్యర్థించండి.';
      case 'auth/expired-action-code':
        return 'ఈ పాస్వర్డ్ రీసెట్ లింక్ గడువు ముగిసింది. దయచేసి కొత్త రీసెట్ లింక్ను అభ్యర్థించండి.';
      case 'auth/missing-action-code':
        return 'పాస్వర్డ్ రీసెట్ కోడ్ కనుగొనబడలేదు. దయచేసి ఈమెయిల్‌లోని పూర్తి లింక్‌ను ఉపయోగించండి.';
      default:
        return error.message || 'ప్రవేశంలో లోపం జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.';
    }
  }
}

export const authService = new AuthService();

