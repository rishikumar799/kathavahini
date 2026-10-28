import { Author } from '../types';
import { resolveAvatarUrl, resolveAuthorName } from './avatarUtils';

export interface WriterProfileSeed {
  id: string;
  name: string;
  teluguName: string;
  penName?: string;
  avatar?: string;
  photoURL?: string;
  bio?: string;
  teluguBio?: string;
  location?: string;
  followersCount?: number;
  storiesCount?: number;
  novelsCount?: number;
}

/**
 * Registry of real, authenticated writers on Kathavahini
 */
export const VERIFIED_WRITERS: Record<string, WriterProfileSeed> = {
  // Aparna - Author of "మూడు ముళ్ళు... ఒక పాప"
  'ir6emGUyvMaG1zSeGb6fbpQcxUr1': {
    id: 'ir6emGUyvMaG1zSeGb6fbpQcxUr1',
    name: 'Aparna',
    teluguName: 'అపర్ణ',
    penName: 'Aparna',
    bio: 'Naku telugu chadavatam anna rayatam anna chala istam.. mana bhaavalani matru bhasha lo cheppagaliginanta baga inka e bhasha lonu cheppalemani na bhavana..',
    teluguBio: 'నాకు తెలుగు చదవటం అన్నా రాయటం అన్నా చాలా ఇష్టం.. మన భావాలని మాతృభాషలో చెప్పగలిగినంత బాగా ఇంక ఏ భాషలోనూ చెప్పలేమని నా భావన..',
    location: 'తెలంగాణ / ఆంధ్రప్రదేశ్',
    followersCount: 120,
    storiesCount: 1,
    novelsCount: 1,
  },
  // TAJU (Shaik Afrin Taj) - Author of "నిశ్శబ్ద వసంతం"
  'fIUcv8mT2RedsDiNQbUq6KqLdHN2': {
    id: 'fIUcv8mT2RedsDiNQbUq6KqLdHN2',
    name: 'TAJU',
    teluguName: 'షేక్ అఫ్రిన్ తాజ్',
    penName: 'TAJU',
    bio: 'హలో నా పేరు షేక్ అఫ్రిన్ తాజ్. నేను చదివినది బి.ఎస్సీ (కంప్యూటర్ సైన్స్). రోజంతా సిస్టమ్స్, కోడింగ్ ఇవే నా ప్రపంచం అనిపించినా, నాకు అసలైన సంతోషం ఇచ్చేది మాత్రం కథలు రాయడమే.',
    teluguBio: 'హలో నా పేరు షేక్ అఫ్రిన్ తాజ్. నేను చదివినది బి.ఎస్సీ (కంప్యూటర్ సైన్స్). రోజంతా సిస్టమ్స్, కోడింగ్ ఇవే నా ప్రపంచం అనిపించినా, నాకు అసలైన సంతోషం ఇచ్చేది మాత్రం కథలు రాయడమే.',
    location: 'తెలంగాణ / ఆంధ్రప్రదేశ్',
    followersCount: 145,
    storiesCount: 1,
    novelsCount: 1,
  },
  // Ch Pratap - Civil Engineer & Renowned Story Writer
  'irSqynr4U5P6Nz9Z8y0MklcTjMt2': {
    id: 'irSqynr4U5P6Nz9Z8y0MklcTjMt2',
    name: 'Ch Pratap',
    teluguName: 'సి.హెచ్. ప్రతాప్',
    penName: 'Ch Pratap',
    bio: 'వృత్తిరీత్యా సివిల్ ఇంజనీర్‌నైనా, సాహిత్యమే నా జీవనసారం. 1984 నుంచి పఠనంతో మొదలైన ప్రయాణం రచనగా వికసించింది.',
    teluguBio: 'వృత్తిరీత్యా సివిల్ ఇంజనీర్‌నైనా, సాహిత్యమే నా జీవనసారం. 1984 నుంచి పఠనంతో మొదలైన ప్రయాణం రచనగా వికసించింది. రెండువందలకు పైగా కథలు, ఐదు నవలలు, రెండువేల వ్యాసాలు రచించాను.',
    location: 'ఆంధ్రప్రదేశ్',
    followersCount: 310,
    storiesCount: 4,
    novelsCount: 0,
  },
  // Manasa Reddy - Award-winning Poet & Storyteller
  'y3FfMop2TYcFxzZtgY5Vi4NTFnN2': {
    id: 'y3FfMop2TYcFxzZtgY5Vi4NTFnN2',
    name: 'Manasa Reddy',
    teluguName: 'మానసా రెడ్డి',
    penName: 'Manasa Reddy',
    bio: 'మానసా రెడ్డి చిచిలి హైదరాబాద్, తెలంగాణకు చెందిన కవయిత్రి మరియు చిన్న కథల రచయిత్రి.',
    teluguBio: 'మానసా రెడ్డి చిచిలి హైదరాబాద్, తెలంగాణకు చెందిన కవయిత్రి మరియు చిన్న కథల రచయిత్రి. ఆమె రచించిన కవితా సంకలనం “A Woman’s Life in Poems”.',
    location: 'హైదరాబాద్, తెలంగాణ',
    followersCount: 280,
    storiesCount: 1,
    novelsCount: 0,
  },
  // PRASAD BHARTHIPUDI - Financial Advisor & Creative Writer
  'ri6Vclq6sdRVDQalQkXnVZ0SY8D3': {
    id: 'ri6Vclq6sdRVDQalQkXnVZ0SY8D3',
    name: 'PRASAD',
    teluguName: 'ప్రసాద్ భారతీపుడి',
    penName: 'PRASAD',
    bio: 'అందరికీ నమస్కారం. నా పేరు ప్రసాద్. LIC ఇన్సూరెన్స్ అడ్వైజర్‌ని. ఫ్యాషన్ అండ్ రైటింగ్ కోసమే నా సమయం దాచుకుంటాను.',
    teluguBio: 'అందరికీ నమస్కారం. నా పేరు ప్రసాద్. వృత్తిరిత్యా నేను ఎంతోమందికి ఆర్థిక భవిష్యత్తును ప్రణాళిక చేసే LIC ఇన్సూరెన్స్ అడ్వైజర్‌ని. ఫ్యాషన్ అండ్ రైటింగ్ నా హాబీలు.',
    location: 'ఆంధ్రప్రదేశ్',
    followersCount: 190,
    storiesCount: 0,
    novelsCount: 0,
  },
  // VAZI (Shaik Wajid Ahmed)
  'ZDzzE61K1rOXFweIeTAklFQ2scq1': {
    id: 'ZDzzE61K1rOXFweIeTAklFQ2scq1',
    name: 'VAZI',
    teluguName: 'షేక్ వాజిద్ అహ్మద్',
    penName: 'VAZI',
    bio: 'నమస్తే నా పేరు షేక్ వాజిద్ అహ్మద్. రోజంతా ఫార్మా కంపెనీలో బిజీగా గడిచిపోయినా రాత్రి కథ రాయడం నా ఇష్టం.',
    teluguBio: 'నమస్తే నా పేరు షేక్ వాజిద్ అహ్మద్. రోజంతా ఫార్మా కంపెనీలో బిజీగా గడిచిపోయినా రాత్రి కథ రాయడం నా ఇష్టం. ప్రయాణాల్లో ఎదురైన సంఘటనలే కథలుగా మారుతుంటాయి.',
    location: 'తెలంగాణ / ఆంధ్రప్రదేశ్',
    followersCount: 110,
    storiesCount: 0,
    novelsCount: 0,
  },
  // Kathavahini Editorial / Admin
  'Y9SlZ61174QLvqbFediSEzqEWSz2': {
    id: 'Y9SlZ61174QLvqbFediSEzqEWSz2',
    name: 'కథావాహిని సంపాదకులు',
    teluguName: 'కథావాహిని సంపాదకులు',
    penName: 'కథావాహిని సంపాదకులు',
    bio: 'కథావాహిని అధికారిక సంపాదక విభాగం',
    teluguBio: 'కథావాహిని అధికారిక సంపాదక విభాగం',
    location: 'హైదరాబాద్',
    followersCount: 500,
    storiesCount: 2,
    novelsCount: 0,
  }
};

/**
 * Resolves the true author for any novel, story, chapter, or episode.
 * Protects against hardcoded placeholders (e.g. Venkata Subba Rao) when the
 * content belongs to real writers like Aparna, TAJU, Ch Pratap, etc.
 */
export function resolveContentAuthor(content: {
  id?: string;
  title?: string;
  teluguTitle?: string;
  authorId?: string;
  writerId?: string;
  authorName?: string;
  authorPenName?: string;
  author?: any;
}): Author {
  const title = (content.teluguTitle || content.title || '').trim();
  const contentId = content.id || '';
  const authorId = content.authorId || content.writerId || content.author?.id || '';

  // 1. Direct Content Matching: "మూడు ముళ్ళు... ఒక పాప" -> Aparna
  if (
    title.includes('మూడు ముళ్ళు') ||
    title.includes('ఒక పాప') ||
    contentId === 'novel-1792459236443' ||
    contentId === 'novel-1792459268304' ||
    contentId === 'chap-1792459236443' ||
    contentId === 'chap-1792459268304' ||
    authorId === 'ir6emGUyvMaG1zSeGb6fbpQcxUr1' ||
    (content.authorName && (content.authorName.toLowerCase() === 'aparna' || content.authorName.includes('అపర్ణ')))
  ) {
    const aparna = VERIFIED_WRITERS['ir6emGUyvMaG1zSeGb6fbpQcxUr1'];
    return {
      id: aparna.id,
      name: aparna.name,
      teluguName: aparna.teluguName,
      avatar: resolveAvatarUrl(aparna.avatar, aparna.teluguName),
      coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200',
      bio: aparna.bio || '',
      teluguBio: aparna.teluguBio || '',
      followersCount: aparna.followersCount || 120,
      storiesCount: aparna.storiesCount || 1,
      novelsCount: aparna.novelsCount || 1,
      jokesCount: 0,
      isVerified: true,
      isFollowing: false,
      joinedDate: '2026',
      location: aparna.location || 'తెలంగాణ / ఆంధ్రప్రదేశ్'
    };
  }

  // 2. Direct Content Matching: "నిశ్శబ్ద వసంతం" -> TAJU (Shaik Afrin Taj)
  if (
    title.includes('నిశ్శబ్ద వసంతం') ||
    contentId === 'novel-1792463176617' ||
    contentId === 'novel-1792463425974' ||
    contentId === 'chap-1792463176617' ||
    contentId === 'chap-1792463425974' ||
    contentId === 'admin-1792420055648' ||
    authorId === 'fIUcv8mT2RedsDiNQbUq6KqLdHN2' ||
    (content.authorName && (content.authorName.toUpperCase() === 'TAJU' || content.authorName.includes('తాజ్')))
  ) {
    const taju = VERIFIED_WRITERS['fIUcv8mT2RedsDiNQbUq6KqLdHN2'];
    return {
      id: taju.id,
      name: taju.name,
      teluguName: taju.teluguName,
      avatar: resolveAvatarUrl(taju.avatar, taju.teluguName),
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
      bio: taju.bio || '',
      teluguBio: taju.teluguBio || '',
      followersCount: taju.followersCount || 145,
      storiesCount: taju.storiesCount || 1,
      novelsCount: taju.novelsCount || 1,
      jokesCount: 0,
      isVerified: true,
      isFollowing: false,
      joinedDate: '2026',
      location: taju.location || 'తెలంగాణ / ఆంధ్రప్రదేశ్'
    };
  }

  // 3. Known Author Registry by Author ID
  if (authorId && VERIFIED_WRITERS[authorId]) {
    const w = VERIFIED_WRITERS[authorId];
    return {
      id: w.id,
      name: w.name,
      teluguName: w.teluguName,
      avatar: resolveAvatarUrl(w.avatar || w.photoURL, w.teluguName),
      coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200',
      bio: w.bio || '',
      teluguBio: w.teluguBio || '',
      followersCount: w.followersCount || 0,
      storiesCount: w.storiesCount || 0,
      novelsCount: w.novelsCount || 0,
      jokesCount: 0,
      isVerified: true,
      isFollowing: false,
      joinedDate: '2026',
      location: w.location || 'ఆంధ్రప్రదేశ్ / తెలంగాణ'
    };
  }

  // 4. If author object is provided and has legitimate data
  if (content.author) {
    const rawAuthor = content.author;
    const authorNameStr = rawAuthor.name || rawAuthor.teluguName || '';
    
    // Guard against placeholder Venkata Subba Rao leaking into real content
    if (authorNameStr === 'Venkata Subba Rao' && contentId && !contentId.startsWith('novel-1') && !contentId.startsWith('story-1')) {
      // Check authorId again or authorName on content
      if (content.authorName && content.authorName !== 'Venkata Subba Rao') {
        return {
          id: rawAuthor.id || authorId || 'writer',
          name: content.authorName,
          teluguName: content.authorPenName || content.authorName,
          avatar: resolveAvatarUrl(rawAuthor.avatar, content.authorName),
          bio: rawAuthor.bio || '',
          teluguBio: rawAuthor.teluguBio || '',
          followersCount: rawAuthor.followersCount || 0,
          storiesCount: rawAuthor.storiesCount || 1,
          novelsCount: rawAuthor.novelsCount || 0,
          jokesCount: 0,
          isVerified: true,
          isFollowing: false,
          joinedDate: '2026'
        };
      }
    }

    return {
      ...rawAuthor,
      avatar: resolveAvatarUrl(rawAuthor.avatar || rawAuthor.photoURL, rawAuthor.teluguName || rawAuthor.name),
      name: rawAuthor.name || content.authorName || 'కథావాహిని రచయిత',
      teluguName: rawAuthor.teluguName || rawAuthor.penName || content.authorName || rawAuthor.name || 'కథావాహిని రచయిత',
    };
  }

  // 5. Build author from content metadata
  const displayName = content.authorName || content.authorPenName || 'కథావాహిని రచయిత';
  return {
    id: authorId || 'writer',
    name: displayName,
    teluguName: content.authorPenName || content.authorName || displayName,
    avatar: resolveAvatarUrl(null, displayName),
    bio: '',
    teluguBio: '',
    followersCount: 0,
    storiesCount: 1,
    novelsCount: 0,
    jokesCount: 0,
    isVerified: true,
    isFollowing: false,
    joinedDate: '2026'
  };
}

/**
 * Returns formatted display name for the author, preferring Telugu name
 */
export function getAuthorDisplayName(author: Author | any): string {
  if (!author) return 'కథావాహిని రచయిత';
  return author.teluguName || author.penName || author.displayName || author.name || 'కథావాహిని రచయిత';
}
