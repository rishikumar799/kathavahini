import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  where,
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { 
  BalavinodhiniItem, 
  BalavinodhiniTab, 
  BalavinodhiniAgeGroup, 
  BalavinodhiniTodayConfig,
  BalavinodhiniComment,
  BalavinodhiniGame,
  BalavinodhiniQuiz,
  BalavinodhiniRiddle
} from '../types';
import { deletionTracker } from './deletionTracker';

// ---------------------------------------------------------------------------
// 12 DEFAULT INTERACTIVE TELUGU GAMES FOR CHILDREN
// ---------------------------------------------------------------------------
export const DEFAULT_BALAVINODHINI_GAMES: BalavinodhiniGame[] = [
  {
    id: 'bv-game-1',
    name: 'Memory Match',
    teluguName: 'జ్ఞాపకాలను కలుపుదాం (Memory Match)',
    description: 'జంతువులు, పక్షులు మరియు పండ్ల జంట కార్డులను సరిపోల్చి మీ జ్ఞాపకశక్తిని పరీక్షించుకోండి.',
    type: 'memory',
    ageGroup: 'all',
    difficulty: 'సులభం',
    icon: '🦁',
    colorGradient: 'from-purple-500 to-indigo-600',
    isEnabled: true,
    isFeatured: true,
    playCount: 1240,
    rules: ['రెండు కార్డులను తిప్పండి', 'ఒకేలాంటి బొమ్మలు వస్తే పాయింట్లు లభిస్తాయి', 'కనిష్ట కదలికలతో అన్ని జతలను పూర్తి చేయండి'],
  },
  {
    id: 'bv-game-2',
    name: 'Number Challenge',
    teluguName: 'సంఖ్యల సవాలు (Number Challenge)',
    description: 'సంఖ్యల క్రమం, మిస్సింగ్ నంబర్లు మరియు సరదా గణిత పజిల్స్‌తో సంఖ్యా పరిజ్ఞానాన్ని పెంచుకోండి.',
    type: 'number',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    icon: '🔢',
    colorGradient: 'from-blue-500 to-cyan-600',
    isEnabled: true,
    isFeatured: true,
    playCount: 980,
    rules: ['సంఖ్యలను ఆరోహణ క్రమంలో అమర్చండి', 'తప్పిపోయిన సంఖ్యను కనుక్కోండి'],
  },
  {
    id: 'bv-game-3',
    name: 'Telugu Letter Match',
    teluguName: 'తెలుగు అక్షరాలు (Telugu Letter Match)',
    description: 'అచ్చులు, హల్లులు మరియు వాటికి సరిపోయే చిత్రాలను జతపరిచే సరదా తెలుగు భాషా ఆట.',
    type: 'letters',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    icon: '🔤',
    colorGradient: 'from-emerald-500 to-teal-600',
    isEnabled: true,
    isFeatured: true,
    playCount: 1450,
    rules: ['అక్షరాన్ని దానికి సరిపోయే బొమ్మతో కలపండి', 'అమ్మ, ఆవు, ఇల్లు వంటి పదాల ఉచ్చారణ వినండి'],
  },
  {
    id: 'bv-game-4',
    name: 'Word Puzzle',
    teluguName: 'పద పజిల్ (Telugu Word Puzzle)',
    description: 'చెల్లాచెదురుగా ఉన్న అక్షరాలను సరిగ్గా అమర్చి అందమైన తెలుగు పదాలను రూపొందించండి.',
    type: 'word',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    icon: '🧩',
    colorGradient: 'from-pink-500 to-rose-600',
    isEnabled: true,
    isFeatured: true,
    playCount: 820,
    rules: ['అక్షరాలను క్రమ పద్ధతిలో నొక్కండి', 'సరైన తెలుగు పదాన్ని నిర్మించండి'],
  },
  {
    id: 'bv-game-5',
    name: 'Math Challenge',
    teluguName: 'గణిత మాయ (Math Challenge)',
    description: 'కూడికలు, తీసివేతలు, గుణకారాల వేగవంతమైన ఛాలెంజ్. మీ కాలిక్యులేషన్ వేగాన్ని పెంచుకోండి.',
    type: 'math',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    icon: '➗',
    colorGradient: 'from-amber-500 to-orange-600',
    isEnabled: true,
    isFeatured: true,
    playCount: 670,
    rules: ['గణిత సమస్యను పరిశీలించండి', 'సరైన సమాధానం ఎంచుకోండి'],
  },
  {
    id: 'bv-game-6',
    name: 'Picture Match',
    teluguName: 'బొమ్మల జంట (Picture Match)',
    description: 'రంగురంగుల బొమ్మలను చూసి సరైన తెలుగు పేర్లతో సరిపోల్చి పద సంపదను పెంచుకోండి.',
    type: 'picture',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    icon: '🎨',
    colorGradient: 'from-teal-500 to-emerald-700',
    isEnabled: true,
    isFeatured: true,
    playCount: 1100,
    rules: ['ఎడమ వైపు చిత్రంపై నొక్కండి', 'కుడి వైపు సరైన పేరుపై నొక్కండి'],
  },
  {
    id: 'bv-game-7',
    name: 'Find Difference',
    teluguName: 'తేడాలు కనుక్కోండి (Spot the Difference)',
    description: 'రెండు రంగుల చిత్రాలలో దాగివున్న 5 సున్నితమైన తేడాలను కళ్ళతో కనిపెట్టి క్లిక్ చేయండి.',
    type: 'difference',
    ageGroup: '7-9',
    difficulty: 'మధ్యస్థం',
    icon: '🔍',
    colorGradient: 'from-violet-500 to-purple-800',
    isEnabled: true,
    isFeatured: true,
    playCount: 790,
    rules: ['రెండు చిత్రాలను జాగ్రత్తగా గమనించండి', 'తేడా ఉన్న స్థలంలో నొక్కండి'],
  },
  {
    id: 'bv-game-8',
    name: 'Logic Puzzle',
    teluguName: 'లాజిక్ పజిల్ (Logic Puzzle)',
    description: 'క్రమాలు, నమూనాలు, బరువులు మరియు మేధో సవాళ్లను పరిష్కరించే అత్యుత్తమ గేమ్.',
    type: 'logic',
    ageGroup: '13-15',
    difficulty: 'కఠినం',
    icon: '💡',
    colorGradient: 'from-fuchsia-500 to-rose-700',
    isEnabled: true,
    isFeatured: true,
    playCount: 540,
    rules: ['ప్యాటర్న్ లేదా పజిల్‌ను చదవండి', 'తార్కికంగా ఆలోచించి సరైన సమాధానం ఇవ్వండి'],
  },
  {
    id: 'bv-game-9',
    name: 'Riddle Challenge',
    teluguName: 'పొడుపు కథల ఛాలెంజ్ (Riddle Challenge)',
    description: 'తెలుగు వారి సరదా పొడుపు కథలను చదివి, హింట్లను ఉపయోగించి సమాధానాలను కనిపెట్టండి.',
    type: 'riddle',
    ageGroup: 'all',
    difficulty: 'సులభం',
    icon: '❓',
    colorGradient: 'from-yellow-500 to-amber-600',
    isEnabled: true,
    isFeatured: true,
    playCount: 2150,
    rules: ['పొడుపు కథను చదవండి', 'సందేహం ఉంటే "హింట్" పై నొక్కండి'],
  },
  {
    id: 'bv-game-10',
    name: 'Telugu Crossword',
    teluguName: 'పదబంధం (Telugu Crossword)',
    description: 'అడ్డం మరియు నిలువు క్లూల ఆధారంగా గడుల్లో సరైన తెలుగు అక్షరాలను నింపి పజిల్ పూర్తి చేయండి.',
    type: 'crossword',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    icon: '▦',
    colorGradient: 'from-cyan-600 to-blue-700',
    isEnabled: true,
    isFeatured: true,
    playCount: 920,
    rules: ['గడిని ఎంచుకోండి', 'అడ్డం/నిలువు క్లూ చదవండి', 'అక్షరాలను నొక్కి నింపండి'],
  },
  {
    id: 'bv-game-11',
    name: 'Knowledge Quiz',
    teluguName: 'జ్ఞాన క్విజ్ (Knowledge Quiz)',
    description: 'భారతదేశం, ఆంధ్రప్రదేశ్, ప్రకృతి, సైన్స్ మరియు పురాణాల గురించిన ఆసక్తికరమైన ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    type: 'knowledge_quiz',
    ageGroup: 'all',
    difficulty: 'సులభం',
    icon: '🧠',
    colorGradient: 'from-rose-500 to-pink-600',
    isEnabled: true,
    isFeatured: true,
    playCount: 1650,
    rules: ['4 ఆప్షన్లలో సరైనదాన్ని ఎంచుకోండి', 'వెంటనే వివరమైన వివరణ తెలుసుకోండి'],
  },
  {
    id: 'bv-game-12',
    name: 'Quick Quiz',
    teluguName: 'తళుకుబెళుకుల క్విజ్ (Speed Quiz)',
    description: 'సమయంతో పోటీపడుతూ నిజం లేదా అబద్ధం ప్రశ్నలకు మెరుపు వేగంతో సమాధానం ఇచ్చి రికార్డు సృష్టించండి.',
    type: 'quick_quiz',
    ageGroup: 'all',
    difficulty: 'సులభం',
    icon: '⚡',
    colorGradient: 'from-indigo-500 to-violet-700',
    isEnabled: true,
    isFeatured: true,
    playCount: 1890,
    rules: ['ప్రశ్న నిజమో అబద్ధమో త్వరగా చెప్పండి', 'సమయం ముగిసేలోపు సమాధానాలు ఇవ్వండి'],
  },
];

// ---------------------------------------------------------------------------
// RICH SEED DATA FOR ALL 16 BALAVINODHINI SECTIONS
// ---------------------------------------------------------------------------
export const SEED_BALAVINODHINI_ITEMS: BalavinodhiniItem[] = [
  // 1. Stories (బాలల కథలు)
  {
    id: 'bv-story-1',
    title: 'The Wise Rabbit and the Lion',
    teluguTitle: 'బుద్ధిబలంతో గెలిచిన కుందేలు',
    slug: 'buddhibalamtho-gelichina-kundelu',
    description: 'పంచతంత్ర కథ: అహంకారంతో విర్రవీగే సింహాన్ని చిన్న కుందేలు తన యుక్తితో ఎలా ఓడించిందో తెలిపే అద్భుత నీతి కథ.',
    teluguDescription: 'పంచతంత్ర కథ: అహంకారంతో విర్రవీగే సింహాన్ని చిన్న కుందేలు తన యుక్తితో ఎలా ఓడించిందో తెలిపే అద్భుత నీతి కథ.',
    content: `ఒక దట్టమైన అడవిలో భాసురకము అనే ఒక క్రూరమైన సింహం ఉండేది. అది ప్రతిరోజూ అడవిలోని ఎన్నో జంతువులను వేటాడి చంపేది. దీనివల్ల అడవిలోని జంతువులన్నీ భయపడి ఒకరోజు సింహం వద్దకు వెళ్లి సమావేశమయ్యాయి.\n\n"మృగరాజా! నువ్వు రోజూ ఎన్నో జంతువులను చంపడం వల్ల అడవి ఖాళీ అయిపోతోంది. అలా కాకుండా మేమే రోజుకొక జంతువును నీ ఆహారంగా పంపిస్తాం" అని వేడుకున్నాయి. సింహం అందుకు అంగీకరించింది.\n\nఒకరోజు ఒక తెలివైన చిన్న కుందేలు వంతు వచ్చింది. ఆ కుందేలు సమయస్ఫూర్తితో ఆలోచించింది. అది మెల్లగా ఆలస్యంగా సింహం వద్దకు నడిచింది.\n\nఆకలితో రగిలిపోతున్న సింహం, "ఎందుకు ఇంత ఆలస్యం చేశావు?" అని గర్జించింది.\n\nఅప్పుడు కుందేలు వినయంగా, "మృగరాజా! నేను వస్తుంటే దారిలో మరొక పెద్ద సింహం నన్ను ఆపి, తనే ఈ అడవికి నిజమైన రాజునని చెప్పింది. దాని నుండి తప్పించుకుని నీ వద్దకు వచ్చాను" అని చెప్పింది.\n\nకోపంతో ఊగిపోయిన భాసురకం, "ఆ సింహం ఎక్కడుందో నన్ను అక్కడికి తీసుకువెళ్లు!" అని ఆజ్ఞాపించింది.\n\nకుందేలు సింహాన్ని ఒక లోతైన బావి వద్దకు తీసుకువెళ్లి, "రాజా! ఆ సింహం ఈ బావి లోపలే దాక్కుంది" అని చూపించింది. భాసురకం బావిలోకి చూడగా నీటిలో తన ప్రతిబింబం కనిపించింది. అది మరొక సింహమే అనుకుని భీకరంగా గర్జించి, బావిలోకి దూకి ప్రాణాలు కోల్పోయింది. అలా చిన్న కుందేలు తన బుద్ధిబలంతో అడవి జంతువులన్నింటినీ రక్షించింది.\n\nనీతి: శారీరక బలం కంటే బుద్ధిబలమే గొప్పది. యుక్తితో ఎంతటి కష్టాన్నైనా జయించవచ్చు.`,
    contentType: 'story',
    section: 'balavinodhini',
    categoryId: 'stories',
    subcategoryId: 'పంచతంత్ర కథలు',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 4,
    coverImage: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&q=80&w=800',
    authorName: 'విష్ణుశర్మ పంచతంత్రం',
    tags: ['నీతి కథలు', 'పంచతంత్రం', 'జంతువులు', 'సమయస్ఫూర్తి'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    likeCount: 428,
    commentCount: 18,
    shareCount: 65,
    featured: true,
  },
  {
    id: 'bv-story-2',
    title: 'Tenali Rama and the Golden Mangoes',
    teluguTitle: 'తెనాలి రామలింగడి బంగారు మామిడిపండ్లు',
    slug: 'tenali-ramalingadi-bangaru-mamidipandlu',
    description: 'శ్రీకృష్ణదేవరాయల ఆస్థాన విదూషకుడు తెనాలి రామలింగడు అత్యాశపరులైన పురోహితులకు నేర్పిన చమత్కార గుణపాఠం.',
    teluguDescription: 'శ్రీకృష్ణదేవరాయల ఆస్థాన విదూషకుడు తెనాలి రామలింగడు అత్యాశపరులైన పురోహితులకు నేర్పిన చమత్కార గుణపాఠం.',
    content: `శ్రీకృష్ణదేవరాయల తల్లిగారు మరణించే సమయంలో మామిడిపండ్లు తినాలని కోరుకున్నారు. కానీ ఆమె కోరిక తీరకముందే కన్నుమూశారు. రాయలవారు తల్లి అంతిమ కోరిక తీరలేదని ఎంతో బాధపడ్డారు.\n\nఆస్థానంలోని కొందరు స్వార్థపరులైన పురోహితులు దీన్ని అవకాశంగా తీసుకుని, "రాజా! మీ తల్లిగారి ఆత్మ శాంతించాలంటే బ్రాహ్మణులకు బంగారు మామిడిపండ్లను దానం చేయాలి" అని చెప్పారు.\n\nరాయలవారు అలాగే చేయాలని నిర్ణయించారు. ఇది తెలుసుకున్న తెనాలి రామలింగడు పురోహితుల అత్యాశను అణచాలని భావించాడు. రామలింగడు పురోహితులందరినీ తన ఇంటికి భోజనానికి ఆహ్వానించాడు.\n\nవారంతా భోజనం చేసిన తర్వాత రామలింగడు ఒక ఎర్రగా కాల్చిన ఇనుప చువ్వను తీసుకువచ్చి వారి వీపులపై వాతలు పెట్టబోయాడు! భయపడిపోయిన పురోహితులు, "రామలింగా! ఏమిటిది? ఎందుకు మమ్మల్ని కాల్చబోతున్నావు?" అని కేకలు వేశారు.\n\nఅప్పుడు రామలింగడు వినయంగా, "అయ్యా! మా అమ్మగారు వాతరోగంతో బాధపడుతూ మరణించారు. ఆమె ఆత్మ శాంతించాలంటే మీకు వాతలు పెట్టాలని మా కులగురువు చెప్పారు" అన్నాడు.\n\nపురోహితులకు తమ తప్పు తెలిసొచ్చి రాయలవారి వద్దకు వెళ్లి క్షమాపణలు కోరారు. రాయలవారు రామలింగడి సమయస్ఫూర్తిని మెచ్చుకున్నారు.\n\nనీతి: మూఢనమ్మకాలతో మోసగించే వారికి సమయోచితమైన ఉపాయంతో బుద్ధి చెప్పాలి.`,
    contentType: 'story',
    section: 'balavinodhini',
    categoryId: 'stories',
    subcategoryId: 'హాస్య కథలు',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    readingTimeMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3d062?auto=format&fit=crop&q=80&w=800',
    authorName: 'తెనాలి రామలింగ కథలు',
    tags: ['తెనాలి రామ', 'హాస్యం', 'చమత్కారం', 'రాయలసీమ'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
    likeCount: 382,
    commentCount: 14,
    shareCount: 42,
    featured: true,
  },

  // 2. Science (బాల విజ్ఞానం)
  {
    id: 'bv-sci-1',
    title: 'Why is the sky blue?',
    teluguTitle: 'ఆకాశం నీలంగా ఎందుకు కనిపిస్తుంది?',
    slug: 'aakasam-neelamga-enduku-kanipisthundi',
    description: 'సూర్యకాంతి భూమి వాతావరణంలో ప్రవేశించినప్పుడు కాంతి విక్షేపణం (Rayleigh Scattering) వల్ల ఆకాశం నీలంగా కనిపిస్తుంది.',
    teluguDescription: 'సూర్యకాంతి భూమి వాతావరణంలో ప్రవేశించినప్పుడు కాంతి విక్షేపణం (Rayleigh Scattering) వల్ల ఆకాశం నీలంగా కనిపిస్తుంది.',
    content: `మనందరం రోజూ తల పైకెత్తి చూస్తే నీలాకాశం ఎంతో అందంగా కనిపిస్తుంది కదా! కానీ నిజానికి ఆకాశంలో నీలి రంగు పెయింట్ ఏమీ ఉండదు. మరి ఆకాశం నీలంగా ఎందుకు కనిపిస్తుందో తెలుసుకుందామా?\n\n🌈 సూర్యకాంతి రహస్యం:\nసూర్యుడి నుండి వచ్చే తెల్లని కాంతిలో నిజానికి ఏడు రంగులు ఉంటాయి. అవే ఇంద్రధనుస్సులోని రంగులు: ఎరుపు, నారింజ, పసుపు, ఆకుపచ్చ, నీలం, ఇండిగో, ఊదా (VIBGYOR).\n\n🌬️ భూమి వాతావరణం:\nభూమి చుట్టూ గాలి, నత్రజని, ఆక్సిజన్ వంటి అనేక వాయువులు, చిన్న చిన్న ధూళికణాలు ఉంటాయి. సూర్యకాంతి ఈ వాతావరణంలోకి ప్రవేశించినప్పుడు, కాంతి కిరణాలు ఈ వాయు కణాలను ఢీకొంటాయి.\n\n✨ కాంతి విక్షేపణం (Rayleigh Scattering):\nఎరుపు, నారింజ రంగులకు ఎక్కువ తరంగదైర్ఘ్యం (Wavelength) ఉంటుంది. అందువల్ల అవి చెల్లాచెదురు కాకుండా నేరుగా ప్రయాణిస్తాయి. కానీ నీలం, ఊదా రంగులకు తక్కువ తరంగదైర్ఘ్యం ఉంటుంది. అందువల్ల అవి గాలి కణాలతో ఢీకొని ఆకాశమంతటా అన్ని దిక్కులా బాగా విస్తరిస్తాయి (విక్షేపణం చెందుతాయి).\n\nమన కళ్ళు ఊదా రంగు కంటే నీలి రంగును ఎక్కువగా గుర్తించగలవు. అందుకే పగటి పూట ఆకాశం అంతా నీలి రంగు కాంతితో నిండి మనకు నీలంగా కనిపిస్తుంది!\n\n💡 మీకు తెలుసా? అంతరిక్షంలో వాతావరణం ఉండదు కాబట్టి అక్కడ ఆకాశం ఎప్పుడూ నల్లగా కనిపిస్తుంది!`,
    contentType: 'science_article',
    section: 'balavinodhini',
    categoryId: 'science',
    subcategoryId: 'భూమి & వాతావరణం',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 3,
    coverImage: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=800',
    authorName: 'బాల విజ్ఞాన బృందం',
    tags: ['సైన్స్', 'ఆకాశం', 'సూర్యకాంతి', 'భౌతిక శాస్త్రం'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    likeCount: 512,
    commentCount: 29,
    shareCount: 94,
    featured: true,
  },
  {
    id: 'bv-sci-2',
    title: 'How do ants communicate with each other?',
    teluguTitle: 'చీమలు వరుసగా ఎలా నడుస్తాయి? ఎలా మాట్లాడుకుంటాయి?',
    slug: 'cheemalu-varusaga-ela-nadusthayi',
    description: 'చీమలు ఫెరోమోన్లు (Pheromones) అనే రసాయన వాసనల ద్వారా ఒకదానితో ఒకటి మాట్లాడుకుంటాయి మరియు క్రమశిక్షణగా నడుస్తాయి.',
    teluguDescription: 'చీమలు ఫెరోమోన్లు (Pheromones) అనే రసాయన వాసనల ద్వారా ఒకదానితో ఒకటి మాట్లాడుకుంటాయి మరియు క్రమశిక్షణగా నడుస్తాయి.',
    content: `మీరు ఎప్పుడైనా గమనించారా? చీమలు ఎప్పుడూ గోడ మీద లేదా నేల మీద చక్కగా ఒకదాని వెనుక ఒకటి క్రమశిక్షణగా ఒకే వరుసలో నడుస్తాయి. అవి ఎలా మాట్లాడుకుంటాయో తెలుసా?\n\n👃 ఫెరోమోన్ల (Pheromones) భాష:\nచీమలకు మనలా మాట్లాడేందుకు గొంతు ఉండదు. కానీ వాటికి అత్యంత సున్నితమైన వాసన చూసే స్పర్శశృంగాలు (Antennae) ఉంటాయి. ఏదైనా ఆహారం దొరికినప్పుడు ఒక చీమ నేలపై "ఫెరోమోన్లు" అనే ఒక రకమైన సువాసన ద్రవాన్ని వదులుతూ వెళ్తుంది.\n\n🐜 రహదారి సంకేతాలు:\nమిగిలిన చీమలు తమ స్పర్శశృంగాల ద్వారా ఆ వాసనను పసిగట్టి అదే దారిలో నడుస్తాయి. ఆహారం ఎక్కువ ఉన్నప్పుడు ఎక్కువ వాసన వదిలి మిగతా స్నేహితులందరినీ పిలుస్తాయి.\n\n⚠️ ప్రమాద సంకేతం:\nఏదైనా ఆపద వచ్చినప్పుడు కూడా ప్రత్యేకమైన హెచ్చరిక ఫెరోమోన్లను విడుదల చేసి కాలనీలోని చీమలన్నింటినీ అప్రమత్తం చేస్తాయి. \n\nక్రమశిక్షణ, ఐకమత్యం, కష్టపడే తత్వానికి చీమలే ఉత్తమ ఉదాహరణ!`,
    contentType: 'science_article',
    section: 'balavinodhini',
    categoryId: 'science',
    subcategoryId: 'జీవశాస్త్రం & జంతువులు',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    readingTimeMinutes: 3,
    coverImage: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800',
    authorName: 'ప్రకృతి విజ్ఞానం',
    tags: ['చీమలు', 'జీవశాస్త్రం', 'కీటకాలు', 'క్రమశిక్షణ'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
    likeCount: 390,
    commentCount: 16,
    shareCount: 51,
  },

  // 3. Riddles (పొడుపు కథలు)
  {
    id: 'bv-riddle-1',
    title: 'Riddle: The Red-capped Little King',
    teluguTitle: 'ఎర్రని టోపీ పెట్టిన పచ్చని చిన్నోడు',
    slug: 'podupu-katha-errani-topi-pachani-chinnodu',
    description: 'తీయని మాటల ముద్దుల పక్షి గురించి ఒక ముచ్చటైన పొడుపు కథ!',
    teluguDescription: 'తీయని మాటల ముద్దుల పక్షి గురించి ఒక ముచ్చటైన పొడుపు కథ!',
    content: 'పచ్చని కోటు వేసుకుంటాడు, ఎర్రని ముక్కుతో మాట్లాడుతాడు. పండ్లంటే ఇష్టం, రామ చిలక పలుకులు పలుకుతాడు. నేనెవరో చెప్పుకోండి చూద్దాం?',
    riddleAnswer: 'రామచిలక (Parrot) 🦜',
    contentType: 'riddle',
    section: 'balavinodhini',
    categoryId: 'riddles',
    subcategoryId: 'సులభమైన పొడుపు కథలు',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    readingTimeMinutes: 1,
    coverImage: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=800',
    authorName: 'పొడుపుల మామయ్య',
    tags: ['పొడుపు కథలు', 'సరదా', 'పక్షులు', 'క్విజ్'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
    likeCount: 620,
    commentCount: 45,
    shareCount: 88,
    featured: true,
  },
  {
    id: 'bv-riddle-2',
    title: 'Riddle: Water above, stone below',
    teluguTitle: 'పైన పెంకు - లోపల అమృతం!',
    slug: 'podupu-katha-paina-penku-lopala-amrutham',
    description: 'ముగ్గురు కన్నులుంటాయి కానీ చూడలేదు, లోపల తియ్యని నీరుంటుంది. నేనెవరు?',
    teluguDescription: 'ముగ్గురు కన్నులుంటాయి కానీ చూడలేదు, లోపల తియ్యని నీరుంటుంది. నేనెవరు?',
    content: 'చెట్టు పైన ఉంటాను, గట్టి చిప్ప కప్పుకుంటాను. నాకు మూడు కన్నులుంటాయి కానీ చూడలేను. పగలగొడితే తియ్యని నీళ్లు, తెల్లని కొబ్బరి ఇస్తాను. నేనెవరో చెప్పుకోండి?',
    riddleAnswer: 'కొబ్బరికాయ (Coconut) 🥥',
    contentType: 'riddle',
    section: 'balavinodhini',
    categoryId: 'riddles',
    subcategoryId: 'మధ్యస్థ స్థాయి',
    ageGroup: '7-9',
    difficulty: 'మధ్యస్థం',
    readingTimeMinutes: 1,
    coverImage: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=800',
    authorName: 'పొడుపుల మామయ్య',
    tags: ['పొడుపు కథలు', 'ప్రకృతి', 'పజిల్స్'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
    likeCount: 489,
    commentCount: 31,
    shareCount: 60,
  },
  {
    id: 'bv-riddle-3',
    title: 'Riddle: Goes around the world but stays in a corner',
    teluguTitle: 'ప్రపంచమంతా తిరుగుతుంది కానీ ఒక మూలనే ఉంటుంది!',
    slug: 'podupu-katha-prapanchamanta-thiruguthundi',
    description: 'ఉత్తరాల మీద కూర్చుని లోకమంతా విహరించే వింత వస్తువు!',
    teluguDescription: 'ఉత్తరాల మీద కూర్చుని లోకమంతా విహరించే వింత వస్తువు!',
    content: 'నేను ప్రపంచమంతా తిరుగుతాను, దేశదేశాలు దాటుతాను. కానీ ఎప్పుడూ ఉత్తరం మూలనే అంటిపెట్టుకుని ఉంటాను. నేనెవరో చెప్పుకోండి?',
    riddleAnswer: 'పోస్టల్ స్టాంపు (Postal Stamp) ✉️',
    contentType: 'riddle',
    section: 'balavinodhini',
    categoryId: 'riddles',
    subcategoryId: 'కఠినమైనవి',
    ageGroup: '10-12',
    difficulty: 'కఠినం',
    readingTimeMinutes: 1,
    coverImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800',
    authorName: 'పొడుపుల మామయ్య',
    tags: ['తార్కిక ప్రశ్నలు', 'పజిల్స్'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
    likeCount: 512,
    commentCount: 37,
    shareCount: 71,
  },

  // 4. Jokes (బాలల హాస్యం)
  {
    id: 'bv-joke-1',
    title: 'Teacher and Student Exam Joke',
    teluguTitle: 'టీచర్ - చింటూ పరీక్ష జోక్!',
    slug: 'teacher-chintu-pariksha-joke',
    description: 'పరీక్ష హాల్లో చింటూ ఇచ్చిన తెలివైన సమాధానం విని టీచర్‌కు దిమ్మతిరిగింది!',
    teluguDescription: 'పరీక్ష హాల్లో చింటూ ఇచ్చిన తెలివైన సమాధానం విని టీచర్‌కు దిమ్మతిరిగింది!',
    content: `టీచర్: "చింటూ! మహాత్మా గాంధీ ఎప్పుడు జన్మించారు?"\n\nచింటూ: "గాంధీ జయంతి రోజున టీచర్!"\n\nటీచర్ (కోపంగా): "సరే, మరి ఆయన ఎక్కడ జన్మించారు?"\n\nచింటూ: "హాస్పిటల్లో టీచర్!"\n\nటీచర్ (తలపట్టుకుని): "నువ్వు పరీక్షల్లో ఎందుకు ఎప్పుడూ సున్నా తెచ్చుకుంటావో అర్థమైంది!"\n\nచింటూ: "అది నా తప్పు కాదు టీచర్, మీరు అడిగిన ప్రశ్నలన్నీ సమాధానాలు పుస్తకంలో ఉన్నవే అడుగుతున్నారు, కొత్తవి అడగట్లేదు!" 😂`,
    contentType: 'joke',
    section: 'balavinodhini',
    categoryId: 'jokes',
    subcategoryId: 'టీచర్–స్టూడెంట్ జోక్స్',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 1,
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    authorName: 'హాస్యప్రియుడు',
    tags: ['హాస్యం', 'జోక్స్', 'బడి జోక్స్', 'చింటూ'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    likeCount: 740,
    commentCount: 52,
    shareCount: 110,
    featured: true,
  },
  {
    id: 'bv-joke-2',
    title: 'Doctor and Paparao Joke',
    teluguTitle: 'డాక్టర్ - పాపారావు సరదా సంభాషణ',
    slug: 'doctor-paparao-sarada-sambhashana',
    description: 'కళ్ళజోడు పెట్టుకుంటే చదువు వస్తుందా అని అడిగిన అమాయక రోగి!',
    teluguDescription: 'కళ్ళజోడు పెట్టుకుంటే చదువు వస్తుందా అని అడిగిన అమాయక రోగి!',
    content: `పాపారావు: "డాక్టర్ గారూ! ఈ కళ్ళజోడు పెట్టుకుంటే నేను పేపర్ స్పష్టంగా చదవగలనా?"\n\nడాక్టర్: "తప్పకుండా పాపారావు గారూ! అక్షరాలు చాలా క్లియర్‌గా కనిపిస్తాయి."\n\nపాపారావు (ఎంతో సంతోషంగా): "చాలా థాంక్స్ డాక్టర్! నాకు అసలు చదువే రాదు, మీ కళ్ళజోడుతో చదువు కూడా వచ్చేస్తుందన్నమాట!" 😂👓`,
    contentType: 'joke',
    section: 'balavinodhini',
    categoryId: 'jokes',
    subcategoryId: 'సరదా ప్రశ్నలు',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    readingTimeMinutes: 1,
    coverImage: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&q=80&w=800',
    authorName: 'నవ్వుల నరసింహం',
    tags: ['హాస్యం', 'సరదా', 'డాక్టర్ జోక్స్'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-03T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
    likeCount: 580,
    commentCount: 22,
    shareCount: 68,
  },

  // 5. Poems (బాలల కవితలు)
  {
    id: 'bv-poem-1',
    title: 'Little Chitti Chilakamma Rhyme',
    teluguTitle: 'చిట్టి చిలకమ్మా.. అమ్మ కొట్టిందా!',
    slug: 'chitti-chilakamma-amma-kottinda',
    description: 'ప్రతి తెలుగు చిన్నారి నోట పలికే అమృతతుల్యమైన సాంప్రదాయ బాలగేయం.',
    teluguDescription: 'ప్రతి తెలుగు చిన్నారి నోట పలికే అమృతతుల్యమైన సాంప్రదాయ బాలగేయం.',
    content: `చిట్టి చిలకమ్మా! అమ్మ కొట్టిందా?\nతోటకెళ్ళావా? పండు తెచ్చావా?\nగూట్లో పెట్టావా? గుటుక్కు మింగావా?\nబుజ్జి మేకమ్మా! బజ్జీ తిన్నావా?\nకాస్తంత కారం, ఎక్కువైందా?\nనీళ్లు తాగావా? నిద్రపోయావా?\nలాలీ లాలీ లాలమ్మ లాలీ! 🌸`,
    contentType: 'poem',
    section: 'balavinodhini',
    categoryId: 'poems',
    subcategoryId: 'ప్రాస గీతాలు',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    readingTimeMinutes: 1,
    coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    authorName: 'సాంప్రదాయ బాలగేయం',
    tags: ['బాల గేయాలు', 'చిలకమ్మా', 'పాటలు', 'చిన్నారి కవితలు'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
    likeCount: 820,
    commentCount: 42,
    shareCount: 145,
    featured: true,
  },
  {
    id: 'bv-poem-2',
    title: 'Rain, Rain, Come to Our Fields',
    teluguTitle: 'వాన జల్లులు - పచ్చని పైర్లు!',
    slug: 'vaana-jallulu-pachani-pairlu',
    description: 'చిటపట చినుకుల వర్షం ప్రకృతికి ఎలా ప్రాణం పోస్తుందో వివరించే అందమైన కవిత.',
    teluguDescription: 'చిటపట చినుకుల వర్షం ప్రకృతికి ఎలా ప్రాణం పోస్తుందో వివరించే అందమైన కవిత.',
    content: `చిటపట చినుకుల వానలొచ్చెను\nచిన్నారి చేలలో ప్రాణమొచ్చెను!\nచెరువులు నిండెను, కాల్వలు పారెను\nరైతుల కళ్ళల్లో వెలుగులు విరిసెను!\n\nకాగితం పడవలు నీటిలో వేసి\nగెంతులేసెదము వానలో తడిసి!\nప్రకృతి తల్లికి నమస్సులిడుతూ\nచెట్లను నాటుదాం భూమిని కాపాడుతూ! 🌧️🌱`,
    contentType: 'poem',
    section: 'balavinodhini',
    categoryId: 'poems',
    subcategoryId: 'ప్రకృతి కవితలు',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 2,
    coverImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800',
    authorName: 'కవిరత్న పిల్లల బృందం',
    tags: ['వాన', 'వర్షం', 'ప్రకృతి', 'కవితలు'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-07T10:00:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
    likeCount: 460,
    commentCount: 19,
    shareCount: 55,
  },

  // 6. History (మన చరిత్ర)
  {
    id: 'bv-hist-1',
    title: 'Rani Rudrama Devi - The Brave Kakatiya Queen',
    teluguTitle: 'వీరవనిత రాణి రుద్రమదేవి సాహసం',
    slug: 'veera-vanitha-rani-rudramadevi-saahasam',
    description: 'ఓరుగల్లు సామ్రాజ్యాన్ని పాలించిన కాకతీయ వీరనారి రాణి రుద్రమదేవి అద్భుత చరిత్ర.',
    teluguDescription: 'ఓరుగల్లు సామ్రాజ్యాన్ని పాలించిన కాకతీయ వీరనారి రాణి రుద్రమదేవి అద్భుత చరిత్ర.',
    content: `మన తెలుగు నేలలో పుట్టిన ఎందరో వీరుల్లో కాకతీయ సామ్రాజ్య అధినేత్రి రాణి రుద్రమదేవి అత్యంత ప్రముఖురాలు.\n\n🛡️ బాల్యం & శిక్షణ:\nరుద్రమదేవి తండ్రి గణపతిదేవుడు. ఆమె చిన్ననాటి నుంచే గుర్రపుస్వారీ, కత్తిసాము, బాణవిద్య, యుద్ధ వ్యూహాలలో విశేష శిక్షణ పొందింది. తండ్రి ఆమెను "రుద్రదేవుడు" అనే పేరుతో పురుషుడిలా పెంచాడు.\n\n👑 సింహాసనం & పాలన:\nరుద్రమదేవి పాలనలోకి వచ్చినప్పుడు ఎందరో శత్రురాజులు ఆమె స్త్రీ అని తక్కువగా అంచనా వేసి యుద్ధానికి వచ్చారు. కానీ ఆమె అజేయమైన ధైర్యసాహసాలతో శత్రువులందరినీ యుద్ధభూమిలో మట్టికరిపించింది!\n\n🏛️ ప్రజా సంక్షేమం:\nఆమె ఓరుగల్లు (వరంగల్) కోటను అజేయమైన రక్షణ గోడలతో నిర్మించింది. రైతుల కోసం చెరువులు తవ్వించి వ్యవసాయాన్ని అభివృద్ధి చేసింది.\n\nప్రపంచ ప్రఖ్యాత యాత్రికుడు మార్కోపోలో రుద్రమదేవి పరిపాలనను చూసి "ఈ రాణి ధైర్యవంతురాలు మాత్రమే కాదు, ప్రజలను కన్నబిడ్డల్లా చూసుకునే దయామయి" అని ప్రశంసించాడు!`,
    contentType: 'history_article',
    section: 'balavinodhini',
    categoryId: 'history',
    subcategoryId: 'తెలుగు చరిత్ర & వీరులు',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    readingTimeMinutes: 4,
    coverImage: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&q=80&w=800',
    authorName: 'తెలుగు చారిత్రక పరిశోధన',
    tags: ['రుద్రమదేవి', 'కాకతీయులు', 'చరిత్ర', 'వరంగల్', 'వీరనారి'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
    likeCount: 680,
    commentCount: 38,
    shareCount: 120,
    featured: true,
  },

  // 7. Nature & Environment (ప్రకృతి & పర్యావరణం)
  {
    id: 'bv-nat-1',
    title: 'Why Trees are Our True Friends',
    teluguTitle: 'చెట్లే మన నిజమైన ప్రాణమిత్రులు!',
    slug: 'chetle-mana-nijamaina-pranamithrulu',
    description: 'మనకు ప్రాణవాయువును అందించే చెట్లను ఎలా కాపాడుకోవాలి? పర్యావరణ పరిరక్షణ సూత్రాలు.',
    teluguDescription: 'మనకు ప్రాణవాయువును అందించే చెట్లను ఎలా కాపాడుకోవాలి? పర్యావరణ పరిరక్షణ సూత్రాలు.',
    content: `చెట్లు కేవలం అందమైన ప్రకృతి భాగం మాత్రమే కాదు, మన జీవనానికి అత్యంత కీలకమైన ప్రాణాధారాలు!\n\n🍃 చెట్లు మనకు ఏమిస్తాయి?\n1. ప్రాణవాయువు (Oxygen): మనం పీల్చే ప్రాణవాయువును చెట్లే కిరణజన్య సంయోగక్రియ (Photosynthesis) ద్వారా తయారు చేస్తాయి.\n2. వాతావరణ సమతుల్యత: కార్బన్ డయాక్సైడ్ వంటి హానికర వాయువులను పీల్చుకుని భూతాపాన్ని (Global Warming) తగ్గిస్తాయి.\n3. వర్షాలు: చెట్లు మేఘాలను ఆకర్షించి వర్షాలు కురవడానికి సహాయపడతాయి.\n4. ఆహారం & ఆశ్రయం: ఎన్నో పక్షులు, జంతువులకు గూడును, పండ్లను, ఔషధాలను అందిస్తాయి.\n\n🌱 మనం ఏమి చేయాలి?\n- మన పుట్టినరోజున ప్రతి ఒక్కరం ఒక మొక్క నాటి దాన్ని పెంచాలి.\n- అనవసరంగా చెట్లను నరకడాన్ని అడ్డుకోవాలి.\n- కాగితాన్ని పొదుపుగా వాడాలి (కాగితం చెట్లతోనే తయారవుతుంది).\n\n"వృక్షో రక్షతి రక్షితః" — మనం చెట్లను రక్షిస్తే, ఆ చెట్లు మనల్ని రక్షిస్తాయి!`,
    contentType: 'nature_article',
    section: 'balavinodhini',
    categoryId: 'nature',
    subcategoryId: 'వృక్షాలు & పర్యావరణం',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 3,
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    authorName: 'హరిత భారతి',
    tags: ['చెట్లు', 'పర్యావరణం', 'ఆక్సిజన్', 'ప్రకృతి రక్షణ'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-12T10:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z',
    likeCount: 490,
    commentCount: 21,
    shareCount: 64,
  },

  // 8. Culture (మన సంస్కృతి)
  {
    id: 'bv-cult-1',
    title: 'Sankranti: The Grand Harvest Festival of Telugu People',
    teluguTitle: 'సంక్రాంతి - తెలుగు వారి పెద్ద పండుగ సంబరం',
    slug: 'sankranti-telugu-vaari-pedda-panduga',
    description: 'భోగి, సంక్రాంతి, కనుమ.. మూడు రోజుల సంబరాల వెనుక ఉన్న సాంస్కృతిక విశేషాలు.',
    teluguDescription: 'భోగి, సంక్రాంతి, కనుమ.. మూడు రోజుల సంబరాల వెనుక ఉన్న సాంస్కృతిక విశేషాలు.',
    content: `సంక్రాంతి అంటే తెలుగువారి హృదయాల్లో వెల్లివిరిసే ఆనందోత్సాహాల పండుగ. ఇది ప్రకృతిని, సూర్యభగవానుడిని, పశుసంపదను గౌరవించే పంటల పండుగ.\n\n🔥 1. భోగి పండుగ:\nపాత వస్తువులను, చెడు ఆలోచనలను భోగి మంటల్లో వేసి, కొత్త వెలుగులను స్వాగతిస్తాము. సాయంత్రం వేళల్లో చిన్న పిల్లలకు దిష్టి తగలకుండా భోగి పండ్లు పోస్తారు.\n\n🌾 2. మకర సంక్రాంతి:\nసూర్యుడు మకర రాశిలోకి ప్రవేశించే పుణ్యదినం. ఇంటి ముంగిళ్ళలో రంగురంగుల ముగ్గులు, గొబ్బెమ్మలు, హరిదాసుల కీర్తనలు, గంగిరెద్దుల విన్యాసాలు పండుగకు శోభను చేకూరుస్తాయి. కొత్త బియ్యం, బెల్లంతో చేసిన పరమాన్నం, అరిసెలు తిని సంబరపడుతాము.\n\n🐂 3. కనుమ పండుగ:\nవ్యవసాయంలో మనకు సహాయపడే ఎద్దులు, ఆవులు, ఇతర పశువులను పూజించి వాటికి కృతజ్ఞతలు తెలుపుకుంటాము.\n\nసంక్రాంతి మనకు కుటుంబ బంధాలు, కృతజ్ఞతా భావాన్ని నేర్పిస్తుంది!`,
    contentType: 'culture_article',
    section: 'balavinodhini',
    categoryId: 'culture',
    subcategoryId: 'పండుగలు & సంప్రదాయాలు',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 4,
    coverImage: 'https://images.unsplash.com/photo-1609137144822-793db5f86c2e?auto=format&fit=crop&q=80&w=800',
    authorName: 'సాంస్కృతిక వేదిక',
    tags: ['సంక్రాంతి', 'పండుగలు', 'తెలుగు సంస్కృతి', 'గొబ్బెమ్మలు'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
    likeCount: 570,
    commentCount: 26,
    shareCount: 89,
    featured: true,
  },

  // 9. Learning & Education (చదువు సరదాగా)
  {
    id: 'bv-learn-1',
    title: 'Magic Math: Easy Multiplication by 9 & 11',
    teluguTitle: 'మ్యాజిక్ మ్యాథ్స్: 9 మరియు 11 లతో వేగవంతమైన గుణకారం!',
    slug: 'magic-maths-9-11-speed-multiplication',
    description: 'వేద గణిత చిట్కాలతో పెద్ద గుణకారాలను చిటికెలో సులభంగా ఎలా చేయాలో నేర్చుకోండి.',
    teluguDescription: 'వేద గణిత చిట్కాలతో పెద్ద గుణకారాలను చిటికెలో సులభంగా ఎలా చేయాలో నేర్చుకోండి.',
    content: `లెక్కలంటే భయమా? ఈ సింపుల్ ట్రిక్స్ నేర్చుకుంటే మీరే మ్యాథ్స్ విజార్డ్ అవుతారు!\n\n✨ ట్రిక్ 1: 11 తో ఏదైనా రెండు అంకెల సంఖ్యను గుణించడం (ఉదా: 35 x 11)\n- మొదటి అంకె '3' ను ఎడమవైపు, చివరి అంకె '5' ను కుడివైపు రాయండి.\n- మధ్యలో ఆ రెండు అంకెల మొత్తాన్ని (3 + 5 = 8) పెట్టండి.\n- సమాధానం: 385! ఎంత సులభమో చూశారా?\n\n✨ ట్రిక్ 2: చేతి వేళ్ళతో 9వ ఎక్కం (9th Table with Fingers):\n- మీ రెండు చేతులను తెరచి ఉంచండి (10 వేళ్ళు).\n- 9 x 3 చేయాలనుకుంటే, ఎడమ నుండి 3వ వేలిని ముడవండి.\n- ముడిచిన వేలికి ఎడమవైపు 2 వేళ్ళు ఉన్నాయి (దశల స్థానం = 2).\n- కుడివైపు 7 వేళ్ళు ఉన్నాయి (ఒకట్ల స్థానం = 7).\n- సమాధానం = 27!\n\nఇలాంటి అద్భుతమైన ట్రిక్స్‌తో గణితాన్ని ఆటలా నేర్చుకోవచ్చు!`,
    contentType: 'science_article',
    section: 'balavinodhini',
    categoryId: 'learning',
    subcategoryId: 'గణిత చిట్కాలు & ట్రిక్స్',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 3,
    coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=800',
    authorName: 'సరదా మాస్టారు',
    tags: ['మ్యాథ్స్', 'వేద గణితం', 'ట్రిక్స్', 'విద్య'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-16T10:00:00Z',
    updatedAt: '2026-02-16T10:00:00Z',
    likeCount: 630,
    commentCount: 33,
    shareCount: 115,
  },

  // 10. Bedtime Stories (నిద్రపూట కథలు)
  {
    id: 'bv-bed-1',
    title: 'The Starlight and the Sleepy Sparrow',
    teluguTitle: 'మినుకు మినుకు నక్షత్రం - చిన్ని పిచ్చుక కల',
    slug: 'minuku-nakshathram-chinni-pichuka-kala',
    description: 'రాత్రి వేళ చిన్నారులను తీపి కలల లోకంలోకి తీసుకెళ్ళే ప్రశాంతమైన నిద్రపూట కథ.',
    teluguDescription: 'రాత్రి వేళ చిన్నారులను తీపి కలల లోకంలోకి తీసుకెళ్ళే ప్రశాంతమైన నిద్రపూట కథ.',
    content: `సూర్యుడు మెల్లగా కొండల వెనుక విశ్రాంతి తీసుకోవడానికి వెళ్ళాడు. ఆకాశంలో చల్లని వెన్నెల కురిపిస్తూ చందమామ చిరునవ్వులు చిందించాడు. చెట్లన్నీ తమ ఆకులను మెల్లగా ముడుచుకుని జోలపాట పాడుకుంటున్నాయి.\n\nఒక పెద్ద వేపచెట్టు కొమ్మపై చిన్ని పిచ్చుక చీకూ తన గూట్లో ముడుచుకుని పడుకుంది. చీకూకు ఇంకా నిద్ర పట్టలేదు. \n\nఅప్పుడు ఆకాశంలో నుండి ఒక చిన్న మినుకుమినుకు వెండి నక్షత్రం చీకూతో మాట్లాడింది. "చిన్ని చీకూ! రోజంతా ఎంత బాగా ఎగిరావు, తియ్యని పండ్లను తిన్నావు కదా. ఇప్పుడు నీ కనురెప్పలు విశ్రాంతి కోరుకుంటున్నాయి. నీ కళ్ళను మెల్లగా మూసుకో" అని చెప్పింది.\n\nచందమామ వెన్నెల చీకూపై వెచ్చని దుప్పటిలా పరుచుకుంది. గాలి చల్లగా వీచింది. చీకూ మెల్లగా కళ్ళు మూసుకుని అందమైన పూలతోటల్లో ఎగురుతున్నట్లు తీపి కలలోకి జారుకుంది. \n\nశుభరాత్రి చిన్నారులూ! మీరూ హాయిగా నిద్రపోండి.. 🌙✨`,
    contentType: 'story',
    section: 'balavinodhini',
    categoryId: 'bedtime',
    subcategoryId: '5 నిమిషాల ప్రశాంత కథలు',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    readingTimeMinutes: 3,
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    authorName: 'అమ్మ ప్రేమ కథలు',
    tags: ['నిద్రపూట కథలు', 'చందమామ', 'పిల్లల కథలు', 'శుభరాత్రి'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-18T10:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
    likeCount: 710,
    commentCount: 40,
    shareCount: 95,
    featured: true,
  },

  // 11. Digital Book Showcase (Digital Book Creator / Srujanatmaka Prapancham)
  {
    id: 'bv-book-1',
    title: 'The Journey to the Moon - Kids Illustrated Book',
    teluguTitle: 'చందమామ పైకి నా ప్రయాణం - సచిత్ర డిజిటల్ పుస్తకం',
    slug: 'chandamama-paiki-naa-prayaanam-book',
    description: 'ఒక చిన్నారి ఊహా ప్రపంచంలో రాకెట్ నిర్మించి చందమామను ఎలా దర్శించాడో తెలిపే బహుళ పేజీల సచిత్ర పుస్తకం.',
    teluguDescription: 'ఒక చిన్నారి ఊహా ప్రపంచంలో రాకెట్ నిర్మించి చందమామను ఎలా దర్శించాడో తెలిపే బహుళ పేజీల సచిత్ర పుస్తకం.',
    content: 'ఈ పుస్తకంలో 4 పేజీల రంగుల బొమ్మలు మరియు తేలికపాటి కథనం ఉన్నాయి. పిల్లలు ఆన్‌లైన్‌లో చదువుకోవచ్చు లేదా ప్రింట్ తీసుకోవచ్చు.',
    contentType: 'book',
    section: 'balavinodhini',
    categoryId: 'creations',
    subcategoryId: 'డిజిటల్ పుస్తకాలు',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    authorName: 'చిరు సృజనకారుడు ఆదిత్య (9 సం.)',
    authorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
    authorBio: '4వ తరగతి విద్యార్థి, బొమ్మలు గీయడం మరియు రోదసి కథలు రాయడం అంటే ఇష్టం.',
    tags: ['పుస్తకం', 'స్పేస్', 'డ్రాయింగ్స్', 'పిల్లల సృజన'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-20T10:00:00Z',
    likeCount: 450,
    commentCount: 28,
    shareCount: 82,
    featured: true,
    bookPages: [
      {
        pageNumber: 1,
        title: 'పేజీ 1: నా చిన్న రాకెట్ కల',
        content: 'నా పేరు ఆదిత్య. రోజూ రాత్రి డాబాపై పడుకుని చందమామను చూస్తుంటే నాకో ఆలోచన వచ్చింది. నేను కూడా వ్యోమగామిలా చందమామ పైకి ఎందుకు వెళ్ళకూడదు? నా స్కెచ్‌బుక్‌లో ఒక అందమైన వెండి రాకెట్ బొమ్మ గీశాను.',
        imageUrl: 'https://images.unsplash.com/photo-1517976487508-30bb6321921f?auto=format&fit=crop&q=80&w=600',
      },
      {
        pageNumber: 2,
        title: 'పేజీ 2: కౌంట్‌డౌన్ మొదలైంది!',
        content: '3.. 2.. 1.. బ్లాస్ట్ ఆఫ్! నా కలల రాకెట్ నింగిలోకి దూసుకుపోయింది. కింద చూస్తే మన భూమి నీలిరంగు పాలరాతి గోళంలా మెరిసిపోతోంది. దారిలో రంగురంగుల నక్షత్రాలు నాకు స్వాగతం పలికాయి.',
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600',
      },
      {
        pageNumber: 3,
        title: 'పేజీ 3: చందమామపై అడుగులు',
        content: 'నా రాకెట్ చందమామ నేలపై నెమ్మదిగా దిగింది. అక్కడ గురుత్వాకర్షణ తక్కువ కాబట్టి నేను ఒక అడుగు వేస్తే ఐదు అడుగులు పైకి గెంతాను! అక్కడ ఒక అందమైన భారతీయ జెండాను నాటాను.',
        imageUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&q=80&w=600',
      },
      {
        pageNumber: 4,
        title: 'పేజీ 4: తిరుగు ప్రయాణం & తీపి జ్ఞాపకం',
        content: 'చందమామ నుండి కొన్ని వెండి మట్టి నమూనాలను తీసుకుని సురక్షితంగా భూమికి తిరిగి వచ్చాను. పెద్దయ్యాక నిజమైన ఇస్రో సైంటిస్ట్ అవుతానని మా అమ్మనాన్నలకు మాటిచ్చాను!',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
      }
    ]
  },

  // 12. Creative Drawing (సృజనాత్మక ప్రపంచం డ్రాయింగ్)
  {
    id: 'bv-draw-1',
    title: 'Colorful Peacock Drawing',
    teluguTitle: 'రమణీయ నెమలి వర్ణచిత్రం',
    slug: 'ramaneeya-nemali-varnachitram',
    description: 'మన జాతీయ పక్షి నెమలి తన అందమైన పించం విప్పి నాట్యం చేస్తున్నట్లు వేసిన ఆకర్షణీయమైన పెయింటింగ్.',
    teluguDescription: 'మన జాతీయ పక్షి నెమలి తన అందమైన పించం విప్పి నాట్యం చేస్తున్నట్లు వేసిన ఆకర్షణీయమైన పెయింటింగ్.',
    content: 'సృజనాత్మక ప్రపంచం డ్రాయింగ్ కాన్వాస్ ద్వారా రూపొందించబడిన వర్ణచిత్రం.',
    contentType: 'drawing',
    section: 'balavinodhini',
    categoryId: 'creations',
    subcategoryId: 'డ్రాయింగ్స్ & ఆర్ట్',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    readingTimeMinutes: 1,
    coverImage: 'https://images.unsplash.com/photo-1546853020-ca4909aef454?auto=format&fit=crop&q=80&w=800',
    authorName: 'స్నేహిత (8 సం.)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    tags: ['డ్రాయింగ్', 'నెమలి', 'చిత్రకళ', 'ఆర్ట్'],
    status: 'published',
    moderationStatus: 'approved',
    createdAt: '2026-02-22T10:00:00Z',
    updatedAt: '2026-02-22T10:00:00Z',
    likeCount: 390,
    commentCount: 24,
    shareCount: 45,
    featured: true,
  }
];

export const DEFAULT_TODAY_BALAVINODHINI: BalavinodhiniTodayConfig = {
  date: new Date().toISOString().split('T')[0],
  storyTitle: 'బుద్ధిబలంతో గెలిచిన కుందేలు',
  storyExcerpt: 'శారీరక బలం కంటే బుద్ధిబలమే గొప్పది. సమయస్ఫూర్తితో సింహాన్ని బోల్తా కొట్టించిన చిన్ని కుందేలు కథ చదవండి!',
  storyLink: 'bv-story-1',
  storyCover: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&q=80&w=800',
  scienceTitle: 'ఆకాశం నీలంగా ఎందుకు కనిపిస్తుంది?',
  scienceFact: 'సూర్యకాంతిలోని నీలి రంగు తక్కువ తరంగదైర్ఘ్యం వల్ల వాతావరణంలో ఎక్కువగా విక్షేపణం చెందుతుంది.',
  scienceExplanation: 'సూర్యుని తెల్లని కాంతిలోని ఏడు రంగుల్లో నీలం రంగు గాలి కణాలతో ఢీకొని ఆకాశమంతటా వ్యాపిస్తుంది.',
  riddleQuestion: 'ఎర్రని టోపీ పెట్టిన పచ్చని చిన్నోడు, తీయని మాటలు పలుకుతాడు. నేనెవరు?',
  riddleAnswer: 'రామచిలక (Parrot) 🦜',
  dailyFact: 'ఒక తేనెటీగ తన జీవితకాలంలో కేవలం 1/12 టీస్పూన్ తేనెను మాత్రమే సేకరించగలదు!',
  dailyFactExplanation: 'ఒక బాటిల్ తేనె తయారీకి వేలాది తేనెటీగలు లక్షలాది పూలను సందర్శిస్తాయి. శ్రమకు నిదర్శనం!',
  jokeText: 'టీచర్: "చింటూ! భూమి గుండ్రంగా ఉందని నిరూపించు?"\nచింటూ: "నేను అసలు చదునుగా ఉందని అనలేదే టీచర్!" 😂',
  jokePunchline: 'సమయస్ఫూర్తికి నవ్వులు పూయించే పంచ్!',
  creativeTaskTitle: 'ఈరోజు సృజనాత్మక పని: మీకు నచ్చిన జంతువును గీయండి!',
  creativeTaskDescription: 'డ్రాయింగ్ కాన్వాస్‌ను తెరిచి మీకు ఇష్టమైన ఏనుగు, నెమలి లేదా పిల్లి బొమ్మను గీసి "సృజనాత్మక ప్రపంచం" లో పంచుకోండి! 🎨'
};

// ---------------------------------------------------------------------------
// SERVICE CLASS
// ---------------------------------------------------------------------------
export class BalavinodhiniService {
  private cachedItems: BalavinodhiniItem[] = [...SEED_BALAVINODHINI_ITEMS];
  private todayConfig: BalavinodhiniTodayConfig = { ...DEFAULT_TODAY_BALAVINODHINI };
  private listeners: ((items: BalavinodhiniItem[]) => void)[] = [];
  private guestLikes: Set<string> = new Set();

  constructor() {
    this.initGuestLikes();
  }

  private initGuestLikes() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kathavahini_bv_guest_likes');
        if (stored) {
          this.guestLikes = new Set(JSON.parse(stored));
        }
      } catch (e) {}
    }
  }

  private saveGuestLikes() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kathavahini_bv_guest_likes', JSON.stringify(Array.from(this.guestLikes)));
      } catch (e) {}
    }
  }

  /**
   * Subscribe to real-time Balavinodhini items from Firestore
   */
  public subscribeItems(callback: (items: BalavinodhiniItem[]) => void): () => void {
    this.listeners.push(callback);
    // Initial emit
    callback(this.getItemsWithGuestLikes());

    try {
      const q = query(collection(db, 'balavinodhini'), limit(150));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreItems: BalavinodhiniItem[] = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as BalavinodhiniItem))
          .filter(item => !deletionTracker.isDeleted(item.id) && item.status !== 'archived' && (item as any).deleted !== true);

        // Merge with seed items (firestore overrides seed)
        const map = new Map<string, BalavinodhiniItem>();
        SEED_BALAVINODHINI_ITEMS.forEach(item => {
          if (!deletionTracker.isDeleted(item.id)) {
            map.set(item.id, item);
          }
        });
        firestoreItems.forEach(item => {
          map.set(item.id, item);
        });

        this.cachedItems = Array.from(map.values());
        this.notifyListeners();
      }, (err) => {
        console.warn('Balavinodhini Firestore onSnapshot subscription note:', err);
      });

      return () => {
        unsubscribe();
        this.listeners = this.listeners.filter(l => l !== callback);
      };
    } catch (e) {
      return () => {
        this.listeners = this.listeners.filter(l => l !== callback);
      };
    }
  }

  private notifyListeners() {
    const items = this.getItemsWithGuestLikes();
    this.listeners.forEach(cb => {
      try { cb(items); } catch (e) {}
    });
  }

  private getItemsWithGuestLikes(): BalavinodhiniItem[] {
    return this.cachedItems.map(item => ({
      ...item,
      isLiked: this.guestLikes.has(item.id) || item.isLiked || false,
    }));
  }

  /**
   * Get all active public Balavinodhini items
   */
  public async getItems(tab?: BalavinodhiniTab, ageGroup?: BalavinodhiniAgeGroup, search?: string): Promise<BalavinodhiniItem[]> {
    let items = this.getItemsWithGuestLikes().filter(i => i.status === 'published' && i.moderationStatus !== 'rejected');

    if (tab && tab !== 'home' && tab !== 'today' && tab !== 'my-creations') {
      items = items.filter(i => i.categoryId === tab);
    }

    if (ageGroup && ageGroup !== 'all') {
      items = items.filter(i => i.ageGroup === ageGroup || i.ageGroup === 'all');
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(i => 
        i.teluguTitle.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.authorName && i.authorName.toLowerCase().includes(q)) ||
        (i.subcategoryId && i.subcategoryId.toLowerCase().includes(q)) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return items;
  }

  /**
   * Get item by ID
   */
  public async getItemById(id: string): Promise<BalavinodhiniItem | null> {
    try {
      const docSnap = await getDoc(doc(db, 'balavinodhini', id));
      if (docSnap.exists()) {
        const data = docSnap.data() as BalavinodhiniItem;
        return {
          ...data,
          id: docSnap.id,
          isLiked: this.guestLikes.has(docSnap.id),
        };
      }
    } catch (e) {}

    const seed = this.cachedItems.find(i => i.id === id);
    if (seed) {
      return {
        ...seed,
        isLiked: this.guestLikes.has(seed.id),
      };
    }
    return null;
  }

  /**
   * Subscribe to Today's Balavinodhini
   */
  public subscribeTodayConfig(callback: (config: BalavinodhiniTodayConfig) => void): () => void {
    callback(this.todayConfig);

    try {
      const docRef = doc(db, 'settings', 'balavinodhini_today');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          this.todayConfig = { ...DEFAULT_TODAY_BALAVINODHINI, ...(snapshot.data() as BalavinodhiniTodayConfig) };
          callback(this.todayConfig);
        }
      }, (err) => {
        console.warn('Today Balavinodhini note:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      return () => {};
    }
  }

  /**
   * Toggle Like on any Balavinodhini creation (Works with or without login, prevents double count)
   */
  public async toggleLike(itemId: string, userId?: string): Promise<{ isLiked: boolean; newCount: number }> {
    const item = await this.getItemById(itemId);
    const currentCount = item ? (item.likeCount || 0) : 0;
    const isCurrentlyLiked = this.guestLikes.has(itemId);

    let isLiked: boolean;
    let newCount: number;

    if (isCurrentlyLiked) {
      this.guestLikes.delete(itemId);
      isLiked = false;
      newCount = Math.max(0, currentCount - 1);
    } else {
      this.guestLikes.add(itemId);
      isLiked = true;
      newCount = currentCount + 1;
    }
    this.saveGuestLikes();

    // Update in-memory
    const idx = this.cachedItems.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      this.cachedItems[idx].likeCount = newCount;
      this.cachedItems[idx].isLiked = isLiked;
    }

    // Try Firestore update
    try {
      const docRef = doc(db, 'balavinodhini', itemId);
      await setDoc(docRef, { likeCount: newCount, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {}

    this.notifyListeners();
    return { isLiked, newCount };
  }

  /**
   * Submit a new creation by child / authenticated creator
   */
  public async submitCreation(creation: Partial<BalavinodhiniItem>): Promise<BalavinodhiniItem> {
    const id = creation.id || `bv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newItem: BalavinodhiniItem = {
      id,
      title: creation.title || 'Untitled Creation',
      teluguTitle: creation.teluguTitle || creation.title || 'కొత్త సృజన',
      slug: (creation.title || 'creation').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      description: creation.description || '',
      teluguDescription: creation.teluguDescription || creation.description || '',
      content: creation.content || '',
      contentType: creation.contentType || 'story',
      section: 'balavinodhini',
      categoryId: creation.categoryId || 'creations',
      subcategoryId: creation.subcategoryId || 'పిల్లల సృజనలు',
      ageGroup: creation.ageGroup || '7-9',
      difficulty: creation.difficulty || 'సులభం',
      readingTimeMinutes: creation.readingTimeMinutes || 3,
      coverImage: creation.coverImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
      images: creation.images || [],
      authorId: creation.authorId || 'guest-creator',
      authorName: creation.authorName || 'యువ సృజనకారుడు',
      authorAvatar: creation.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      authorBio: creation.authorBio || 'బాలవినోదిని చిరు సృజనకారుడు',
      tags: creation.tags || ['సృజనాత్మక ప్రపంచం'],
      status: creation.status || 'published', // Published directly or pending review
      moderationStatus: creation.moderationStatus || 'approved',
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      bookPages: creation.bookPages,
      drawingDataUrl: creation.drawingDataUrl,
      riddleAnswer: creation.riddleAnswer,
      audioUrl: creation.audioUrl,
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'balavinodhini', id), {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Balavinodhini Firestore save note:', e);
    }

    // Add to in-memory
    this.cachedItems.unshift(newItem);
    this.notifyListeners();
    return newItem;
  }

  /**
   * Get user's own creations
   */
  public async getMyCreations(userId: string): Promise<BalavinodhiniItem[]> {
    if (!userId) return [];
    return this.cachedItems.filter(i => i.authorId === userId);
  }

  /**
   * Save Today's Balavinodhini Config (Admin)
   */
  public async setTodayConfig(config: Partial<BalavinodhiniTodayConfig>): Promise<void> {
    this.todayConfig = { ...this.todayConfig, ...config };
    try {
      await setDoc(doc(db, 'settings', 'balavinodhini_today'), {
        ...this.todayConfig,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {}
  }

  /**
   * Admin: Update Item moderation status
   */
  public async updateItemStatus(
    itemId: string, 
    status: BalavinodhiniItem['status'], 
    moderationStatus?: BalavinodhiniItem['moderationStatus']
  ): Promise<void> {
    const idx = this.cachedItems.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      this.cachedItems[idx].status = status;
      if (moderationStatus) this.cachedItems[idx].moderationStatus = moderationStatus;
    }

    try {
      await updateDoc(doc(db, 'balavinodhini', itemId), {
        status,
        ...(moderationStatus ? { moderationStatus } : {}),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {}
    this.notifyListeners();
  }

  /**
   * Toggle Bookmark for authenticated user or local storage
   */
  public async toggleBookmark(itemId: string, userId?: string): Promise<boolean> {
    const key = `kathavahini_bv_bookmarks_${userId || 'guest'}`;
    let bookmarks: string[] = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) bookmarks = JSON.parse(stored);
    } catch (e) {}

    const isBookmarked = bookmarks.includes(itemId);
    let updated: string[];
    if (isBookmarked) {
      updated = bookmarks.filter(id => id !== itemId);
    } else {
      updated = [...bookmarks, itemId];
    }

    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {}

    if (userId) {
      try {
        const docRef = doc(db, 'users', userId, 'balavinodhini_bookmarks', itemId);
        if (isBookmarked) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { itemId, createdAt: serverTimestamp() });
        }
      } catch (e) {}
    }

    return !isBookmarked;
  }

  /**
   * Check if an item is bookmarked
   */
  public isBookmarked(itemId: string, userId?: string): boolean {
    const key = `kathavahini_bv_bookmarks_${userId || 'guest'}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const list: string[] = JSON.parse(stored);
        return list.includes(itemId);
      }
    } catch (e) {}
    return false;
  }

  /**
   * Upload image to Firebase Storage with safe data-url fallback
   */
  public async uploadImage(blobOrFile: Blob | File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, blobOrFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (e) {
      console.warn('Storage upload fallback:', e);
      // Fallback: create base64 data URL
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blobOrFile);
      });
    }
  }

  /**
   * Add a comment to Balavinodhini creation / story
   */
  public async addComment(itemId: string, comment: Partial<BalavinodhiniComment>): Promise<BalavinodhiniComment> {
    const commentId = `cm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newComment: BalavinodhiniComment = {
      id: commentId,
      itemId,
      userId: comment.userId || 'guest',
      userName: comment.userName || 'చిన్నారి పాఠకుడు',
      userAvatar: comment.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      text: comment.text || '',
      createdAt: new Date().toISOString(),
      status: 'published',
    };

    try {
      await setDoc(doc(db, 'balavinodhini', itemId, 'comments', commentId), {
        ...newComment,
        createdAt: serverTimestamp(),
      });
      // Increment comment count on item
      const item = await this.getItemById(itemId);
      if (item) {
        const newCount = (item.commentCount || 0) + 1;
        await setDoc(doc(db, 'balavinodhini', itemId), { commentCount: newCount }, { merge: true });
        const idx = this.cachedItems.findIndex(i => i.id === itemId);
        if (idx !== -1) {
          this.cachedItems[idx].commentCount = newCount;
          this.notifyListeners();
        }
      }
    } catch (e) {}

    return newComment;
  }

  /**
   * Get comments for an item
   */
  public async getComments(itemId: string): Promise<BalavinodhiniComment[]> {
    try {
      const q = query(collection(db, 'balavinodhini', itemId, 'comments'), limit(50));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as BalavinodhiniComment));
      }
    } catch (e) {}
    return [
      {
        id: 'c1',
        itemId,
        userId: 'u1',
        userName: 'ఆరుష్ (4వ తరగతి)',
        text: 'ఈ కథ నాకు చాలా నచ్చింది! చాలా మంచి నీతి ఉంది. 😊',
        createdAt: '2026-02-15T14:30:00Z',
        status: 'published',
      },
      {
        id: 'c2',
        itemId,
        userId: 'u2',
        userName: 'తన్వి (3వ తరగతి)',
        text: 'చిత్రాలు ఎంతో అందంగా ఉన్నాయి! నేను నా స్నేహితులకు కూడా చెప్పాను.',
        createdAt: '2026-02-18T09:15:00Z',
        status: 'published',
      }
    ];
  }

  /**
   * SpeechSynthesis Telugu / English audio narrator helper
   */
  public speakText(text: string, onEnd?: () => void, rate: number = 0.9): boolean {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    
    // Pick Telugu or Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = voices.find(v => v.lang.startsWith('te') || v.lang.includes('TEL'));
    const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('en-IN'));
    if (teluguVoice) {
      utterance.voice = teluguVoice;
      utterance.lang = 'te-IN';
    } else if (indianVoice) {
      utterance.voice = indianVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public pauseSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  public resumeSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Admin: Delete item
   */
  public async deleteItem(itemId: string): Promise<void> {
    await deletionTracker.markDeleted(itemId, 'balavinodhini');
    this.cachedItems = this.cachedItems.filter(i => i.id !== itemId);
    try {
      await deleteDoc(doc(db, 'balavinodhini', itemId));
    } catch (e) {}
    this.notifyListeners();
  }

  /**
   * Admin: Create or Save new Balavinodhini content item
   */
  public async createItem(data: Partial<BalavinodhiniItem>): Promise<BalavinodhiniItem> {
    const id = data.id || `bv-${data.categoryId || 'story'}-${Date.now()}`;
    const now = new Date().toISOString();
    const newItem: BalavinodhiniItem = {
      id,
      title: data.title || 'Untitled',
      teluguTitle: data.teluguTitle || data.title || 'శీర్షిక',
      slug: (data.title || 'content').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      description: data.description || '',
      teluguDescription: data.teluguDescription || data.description || '',
      content: data.content || '',
      contentType: data.contentType || 'story',
      section: 'balavinodhini',
      categoryId: data.categoryId || 'stories',
      subcategoryId: data.subcategoryId || 'పిల్లల కథలు',
      ageGroup: data.ageGroup || '7-9',
      difficulty: data.difficulty || 'సులభం',
      readingTimeMinutes: data.readingTimeMinutes || 3,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
      images: data.images || [],
      authorName: data.authorName || 'కథావాహిని బాల సంపాదకవర్గం',
      authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      tags: data.tags || ['బాలవినోదిని'],
      status: data.status || 'published',
      moderationStatus: data.moderationStatus || 'approved',
      moderationNote: data.moderationNote || '',
      featured: data.featured ?? false,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      shareCount: data.shareCount || 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
      riddleAnswer: data.riddleAnswer,
      quizOptions: data.quizOptions,
      quizAnswerIndex: data.quizAnswerIndex,
      quizExplanation: data.quizExplanation,
      bookPages: data.bookPages,
      drawingDataUrl: data.drawingDataUrl,
      audioUrl: data.audioUrl,
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'balavinodhini', id), {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Error saving Balavinodhini item to Firestore:', e);
    }

    this.cachedItems.unshift(newItem);
    this.notifyListeners();
    return newItem;
  }

  /**
   * Admin: Update existing Balavinodhini content item
   */
  public async updateItem(id: string, updates: Partial<BalavinodhiniItem>): Promise<BalavinodhiniItem> {
    const idx = this.cachedItems.findIndex(i => i.id === id);
    const now = new Date().toISOString();
    
    if (idx !== -1) {
      this.cachedItems[idx] = {
        ...this.cachedItems[idx],
        ...updates,
        updatedAt: now,
      };
    }

    try {
      const docRef = doc(db, 'balavinodhini', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      // In case doc didn't exist in Firestore, set it
      try {
        if (idx !== -1) {
          await setDoc(doc(db, 'balavinodhini', id), {
            ...this.cachedItems[idx],
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {}
    }

    this.notifyListeners();
    return idx !== -1 ? this.cachedItems[idx] : ({ id, ...updates } as BalavinodhiniItem);
  }

  /**
   * Admin: Toggle Publish Status
   */
  public async togglePublishItem(id: string): Promise<void> {
    const item = this.cachedItems.find(i => i.id === id);
    if (!item) return;
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    await this.updateItem(id, {
      status: newStatus,
      publishedAt: newStatus === 'published' ? new Date().toISOString() : undefined,
    });
  }

  public async togglePublish(id: string): Promise<void> {
    return this.togglePublishItem(id);
  }

  /**
   * Admin: Toggle Featured Status
   */
  public async toggleFeaturedItem(id: string): Promise<void> {
    const item = this.cachedItems.find(i => i.id === id);
    if (!item) return;
    await this.updateItem(id, { featured: !item.featured });
  }

  public async toggleFeatured(id: string): Promise<void> {
    return this.toggleFeaturedItem(id);
  }

  /**
   * Admin: Approve / Reject Submissions
   */
  public async approveItem(id: string): Promise<void> {
    return this.moderateSubmission(id, 'approve');
  }

  public async rejectItem(id: string, reason?: string): Promise<void> {
    return this.moderateSubmission(id, 'reject', reason);
  }

  /**
   * Admin & User: Games Management
   */
  public getGames(): BalavinodhiniGame[] {
    return [...DEFAULT_BALAVINODHINI_GAMES];
  }

  public subscribeGames(callback: (games: BalavinodhiniGame[]) => void): () => void {
    try {
      const q = query(collection(db, 'balavinodhini_games'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            callback([...DEFAULT_BALAVINODHINI_GAMES]);
            return;
          }
          const loadedGames: BalavinodhiniGame[] = [];
          snapshot.forEach((docSnap) => {
            loadedGames.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });

          // Merge loaded with any defaults not yet in Firestore
          const finalGames = DEFAULT_BALAVINODHINI_GAMES.map(def => {
            const found = loadedGames.find(g => g.id === def.id);
            return found ? { ...def, ...found } : def;
          });

          callback(finalGames);
        },
        (error) => {
          console.warn('subscribeGames error fallback:', error);
          callback([...DEFAULT_BALAVINODHINI_GAMES]);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('subscribeGames fallback to defaults:', e);
      callback([...DEFAULT_BALAVINODHINI_GAMES]);
      return () => {};
    }
  }

  public async updateGame(gameId: string, updates: Partial<BalavinodhiniGame>): Promise<void> {
    const game = DEFAULT_BALAVINODHINI_GAMES.find(g => g.id === gameId);
    if (game) {
      Object.assign(game, updates);
    }
    try {
      const docRef = doc(db, 'balavinodhini_games', gameId);
      await setDoc(docRef, { ...game, ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('Game firestore sync fallback:', e);
    }
  }

  public async saveGame(game: BalavinodhiniGame): Promise<void> {
    return this.updateGame(game.id, game);
  }

  public async toggleGameStatus(gameId: string, isEnabled: boolean): Promise<void> {
    return this.updateGame(gameId, { isEnabled });
  }

  public async toggleGameFeatured(gameId: string, isFeatured: boolean): Promise<void> {
    return this.updateGame(gameId, { isFeatured });
  }

  /**
   * Admin: Get all items without status filter
   */
  public getAllItemsForAdmin(): BalavinodhiniItem[] {
    return [...this.cachedItems];
  }

  /**
   * Admin: Compute Comprehensive Ecosystem Stats
   */
  public getStats() {
    const all = this.cachedItems;
    const storiesCount = all.filter(i => i.categoryId === 'stories').length;
    const scienceCount = all.filter(i => i.categoryId === 'science').length;
    const poemsCount = all.filter(i => i.categoryId === 'poems').length;
    const factsCount = all.filter(i => i.categoryId === 'facts' || i.categoryId === 'nature').length;
    const jokesCount = all.filter(i => i.categoryId === 'jokes').length;
    const riddlesCount = all.filter(i => i.categoryId === 'riddles').length;
    const creationsCount = all.filter(i => i.categoryId === 'creations' || i.categoryId === 'my-creations').length;
    const pendingModeration = all.filter(i => i.moderationStatus === 'pending' || i.status === 'pending_review').length;
    const publishedCount = all.filter(i => i.status === 'published').length;
    const draftCount = all.filter(i => i.status === 'draft').length;
    const featuredCount = all.filter(i => i.featured).length;

    return {
      totalItems: all.length,
      publishedCount,
      draftCount,
      pendingModeration,
      featuredCount,
      storiesCount,
      scienceCount,
      poemsCount,
      factsCount,
      jokesCount,
      riddlesCount,
      creationsCount,
      gamesCount: DEFAULT_BALAVINODHINI_GAMES.length,
      quizzesCount: 10,
    };
  }

  /**
   * Admin: Update Today's Balavinodhini Config
   */
  public async updateTodayConfig(config: Partial<BalavinodhiniTodayConfig>): Promise<BalavinodhiniTodayConfig> {
    this.todayConfig = {
      ...this.todayConfig,
      ...config,
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, 'settings', 'balavinodhini_today');
      await setDoc(docRef, {
        ...this.todayConfig,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to update today config in Firestore:', e);
    }

    return this.todayConfig;
  }

  /**
   * Admin: Get Today Config directly
   */
  public getTodayConfig(): BalavinodhiniTodayConfig {
    return { ...this.todayConfig };
  }

  /**
   * Admin: Moderate child creative submission (approve/reject)
   */
  public async moderateSubmission(
    id: string,
    action: 'approve' | 'reject',
    note?: string
  ): Promise<void> {
    const status = action === 'approve' ? 'published' : 'rejected';
    const moderationStatus = action === 'approve' ? 'approved' : 'rejected';
    await this.updateItem(id, {
      status,
      moderationStatus,
      moderationNote: note || (action === 'approve' ? 'అడ్మిన్ చే ఆమోదించబడింది' : 'సరిదిద్దవలసినదిగా కోరడమైనది'),
      publishedAt: action === 'approve' ? new Date().toISOString() : undefined,
    });
  }
}

// ---------------------------------------------------------------------------
// QUIZ QUESTIONS DATASET (10 RICH TELUGU QUESTIONS MATCHING THE UI REFERENCE)
// ---------------------------------------------------------------------------
export interface BalavinodhiniQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const BALAVINODHINI_QUIZ_BANK: BalavinodhiniQuizQuestion[] = [
  {
    id: 1,
    question: 'భారతదేశానికి రాజధాని ఏది?',
    options: ['హైదరాబాద్', 'చెన్నై', 'న్యూఢిల్లీ', 'ముంబై'],
    correctIndex: 2,
    explanation: 'భారతదేశ రాజధాని న్యూఢిల్లీ. ఇక్కడ పార్లమెంట్, రాష్ట్రపతి భవన్ ఉన్నాయి.'
  },
  {
    id: 2,
    question: 'సూర్యుని చుట్టూ తిరిగే మొదటి (అతి సమీప) గ్రహం ఏది?',
    options: ['శుక్రుడు (Venus)', 'బుధుడు (Mercury)', 'భూమి (Earth)', 'కుజుడు (Mars)'],
    correctIndex: 1,
    explanation: 'బుధుడు (Mercury) సూర్యుడికి అత్యంత దగ్గరగా ఉండే గ్రహం మరియు సౌరమండలంలో అతి చిన్నది.'
  },
  {
    id: 3,
    question: 'భారతదేశ జాతీయ జంతువు ఏది?',
    options: ['సింహం', 'ఏనుగు', 'పెద్ద పులి (Royal Bengal Tiger)', 'జింక'],
    correctIndex: 2,
    explanation: 'భారతదేశ జాతీయ జంతువు పెద్ద పులి (Royal Bengal Tiger). ఇది పరాక్రమం మరియు అందానికి ప్రతీక.'
  },
  {
    id: 4,
    question: 'తెలుగు వర్ణమాలలో అచ్చులు (Vowels) ఎన్ని?',
    options: ['12', '14', '16', '18'],
    correctIndex: 2,
    explanation: 'తెలుగు భాషలో అ నుండి అః వరకు మొత్తం 16 అచ్చులు ఉన్నాయి.'
  },
  {
    id: 5,
    question: 'ఆంధ్రప్రదేశ్ రాష్ట్ర పక్షి ఏది?',
    options: ['నెమలి', 'రామచిలక (Rose-ringed Parakeet)', 'కోకిల', 'పాలపిట్ట'],
    correctIndex: 1,
    explanation: 'ఆంధ్రప్రదేశ్ రాష్ట్ర పక్షి అందమైన రామచిలక.'
  },
  {
    id: 6,
    question: 'పండ్లలో రారాజు అని దేనిని పిలుస్తారు?',
    options: ['ఆపిల్', 'ద్రాక్ష', 'మామిడి (Mango)', 'అరటి'],
    correctIndex: 2,
    explanation: 'మామిడి పండు భారతదేశ జాతీయ ఫలం మరియు పండ్ల రారాజుగా ప్రసిద్ధి.'
  },
  {
    id: 7,
    question: 'మానవ శరీరంలో అతి పెద్ద అవయవం ఏది?',
    options: ['గుండె', 'చర్మం (Skin)', 'కాలేయం', 'ఊపిరితిత్తులు'],
    correctIndex: 1,
    explanation: 'మానవ శరీరాన్ని కప్పి ఉంచే చర్మం (Skin) అతి పెద్ద బాహ్య అవయవం.'
  },
  {
    id: 8,
    question: 'ప్రసిద్ధ నీతి గ్రంథం "సుమతీ శతకం" రచయిత ఎవరు?',
    options: ['వేమన', 'బద్దెన కవి', 'పోతన', 'శ్రీనాథుడు'],
    correctIndex: 1,
    explanation: 'సుమతీ శతకాన్ని బద్దెన కవి రచించారు. "వినదగు నెవ్వరు చెప్పిన..." వంటి ఎన్నో ఆణిముత్యాలు ఇందులో ఉన్నాయి.'
  },
  {
    id: 9,
    question: 'ఇంద్రధనుస్సు (Rainbow) లో ఎన్ని రంగులు ఉంటాయి?',
    options: ['5', '6', '7 (VIBGYOR)', '8'],
    correctIndex: 2,
    explanation: 'ఇంద్రధనుస్సులో 7 రంగులు ఉంటాయి: ఊదా, ఇండిగో, నీలం, ఆకుపచ్చ, పసుపు, నారింజ, ఎరుపు.'
  },
  {
    id: 10,
    question: 'భూమికి గల ఏకైక సహజ ఉపగ్రహం ఏది?',
    options: ['చంద్రుడు (Moon)', 'సూర్యుడు', 'తోకచుక్క', 'ధృవనక్షత్రం'],
    correctIndex: 0,
    explanation: 'చంద్రుడు భూమి చుట్టూ తిరిగే ఏకైక సహజ ఉపగ్రహం.'
  }
];

export const balavinodhiniService = new BalavinodhiniService();
