import { Author, Story, Novel, Joke, User, ReadingHistoryItem, NotificationItem, CreatorStats, StoryCategory } from '../types';

export const MOCK_CATEGORIES: { name: StoryCategory; description: string; icon: string; count: number }[] = [
  { name: 'ప్రేమ', description: 'హృదయాన్ని తాకే అనురాగాలు, మధుర జ్ఞాపకాలు', icon: 'Heart', count: 1240 },
  { name: 'కుటుంబం', description: 'బంధాలు, బాధ్యతలు మరియు ఆప్యాయతలు', icon: 'Users', count: 890 },
  { name: 'స్నేహం', description: 'కష్టసుఖాల్లో తోడుండే స్నేహ బంధం', icon: 'Smile', count: 650 },
  { name: 'జీవితం', description: 'జీవిత పాఠాలు, యథార్థ సంఘటనలు', icon: 'Compass', count: 1100 },
  { name: 'ప్రేరణ', description: 'లక్ష్య సాధన, ఆత్మవిశ్వాసం నింపే కథలు', icon: 'Zap', count: 720 },
  { name: 'హాస్యం', description: 'ఆహ్లాదకరమైన నవ్వులు, సరదా కబుర్లు', icon: 'Laugh', count: 980 },
  { name: 'రహస్యం', description: 'ఉత్కంఠభరితమైన రహస్యాలు, పరిశోధనలు', icon: 'Key', count: 540 },
  { name: 'థ్రిల్లర్', description: 'ప్రతి క్షణం థ్రిల్ ఇచ్చే కల్పితాలు', icon: 'ShieldAlert', count: 430 },
  { name: 'ఫాంటసీ', description: 'అద్భుత లోకాలు, ఊహా ప్రపంచం', icon: 'Sparkles', count: 310 },
  { name: 'చారిత్రక', description: 'మన సంస్కృతి, పూర్వీకుల చరిత్ర', icon: 'BookOpen', count: 280 },
  { name: 'భయం', description: 'భయానకమైన అనుభవాలు, రహస్య కథనాలు', icon: 'Moon', count: 210 },
  { name: 'పిల్లల కథలు', description: 'నీతి కథలు, బుజ్జాయిల వినోదం', icon: 'Feather', count: 520 },
];

export const MOCK_AUTHORS: Author[] = [
  {
    id: 'auth-1',
    name: 'Venkata Subba Rao',
    teluguName: 'వెంకట సుబ్బారావు',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200',
    bio: 'Renowned Telugu author with over 15 years of literary journey, exploring human emotions and rural heritage.',
    teluguBio: '15 ఏళ్లకు పైగా తెలుగు సాహిత్య ప్రయాణం. గ్రామీణ జీవితం, మానవ సంబంధాలు నా రచనల ముఖ్య మూలం.',
    followersCount: 14200,
    storiesCount: 28,
    novelsCount: 4,
    jokesCount: 12,
    isVerified: true,
    isFollowing: false,
    joinedDate: '2022',
    location: 'విజయవాడ',
  },
  {
    id: 'auth-2',
    name: 'Lakshmi Devi Kopparapu',
    teluguName: 'లక్ష్మీదేవి కొప్పరపు',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200',
    bio: 'Award-winning storyteller focusing on women empowerment, modern relationships, and family dynamics.',
    teluguBio: 'స్త్రీల సాధికారత, ఆధునిక కుటుంబ కథలు మరియు మానసిక అంతర్మథనాలపై ప్రత్యేక శ్రద్ధతో రాసే రచయిత్రి.',
    followersCount: 18900,
    storiesCount: 42,
    novelsCount: 6,
    jokesCount: 5,
    isVerified: true,
    isFollowing: true,
    joinedDate: '2021',
    location: 'హైదరాబాద్',
  },
  {
    id: 'auth-3',
    name: 'Vamsi Krishna',
    teluguName: 'వంశీ కృష్ణ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=1200',
    bio: 'Young fiction writer, thriller enthusiast and tech worker writing contemporary urban tales.',
    teluguBio: 'సస్పెన్స్, క్రైమ్ థ్రిల్లర్ మరియు ఐటీ నగర కథలు రాయడంలో ప్రావీణ్యం ఉన్న నవతరం రచయిత.',
    followersCount: 9400,
    storiesCount: 19,
    novelsCount: 2,
    jokesCount: 45,
    isVerified: false,
    isFollowing: false,
    joinedDate: '2023',
    location: 'బెంగళూరు',
  },
  {
    id: 'auth-4',
    name: 'Radhika Parimi',
    teluguName: 'రాధిక పరిమి',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200',
    bio: 'Poet, essayist and romantic novelist whose works touch readers deeply.',
    teluguBio: 'కవిత్వం, ప్రేమ నవలలు మరియు మనసుకు హత్తుకునే కథలతో వేలాది మంది అభిమానులను సంపాదించుకున్న రచయిత్రి.',
    followersCount: 11800,
    storiesCount: 31,
    novelsCount: 5,
    jokesCount: 8,
    isVerified: true,
    isFollowing: false,
    joinedDate: '2022',
    location: 'విశాఖపట్నం',
  },
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'Yesterday\'s Rain',
    teluguTitle: 'నిన్నటి వాన',
    slug: 'ninnati-vaana',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
    excerpt: 'A nostalgic meeting in the rain after ten long years brings back unsaid feelings and forgotten promises.',
    teluguExcerpt: 'పదేళ్ల తర్వాత కురిసిన ఆ తొలి వానలో, మళ్లీ కలసిన ఇద్దరు పాత స్నేహితుల మధ్య మిగిలిపోయిన మాటల మౌన కావ్యం.',
    content: [
      'సాయంత్రం ఐదు గంటలవుతోంది. ఆకాశం దట్టమైన మేఘాలతో నల్లబడింది. తూర్పు వైపు నుంచి చల్లటి గాలి వీస్తోంది. రైల్వే స్టేషన్ బయట ఉన్న ఆ చిన్న టీ కొట్టు దగ్గర నిలబడి రాఘవ వేడి వేడి టీ తాగుతున్నాడు.',
      'సడన్‌గా చినుకులు మొదలయ్యాయి. వాన పెరిగేసరికి ప్రయాణికులంతా టీ కొట్టు రేకుల కిందకు చేరారు. రాఘవ కూడా కొంచెం వెనక్కు తడిగా ఉన్న గోడకు ఆనుకుని నిలబడ్డాడు. సరిగ్గా అదే సమయంలో ఒక పసుపు రంగు గొడుగు వేసుకుని ఆమె అక్కడికి వచ్చింది.',
      'పదేళ్ల కిందట కళాశాలలో ముగిసిపోయిందనుకున్న అనుబంధం, మళ్లీ ఈ చిన్న వాన చినుకులతో చిగురిస్తుందని రాఘవ ఊహించలేదు. ఆమె కళ్లలోకి చూడగానే, అతని మనసులో జ్ఞాపకాల వరద మొదలైంది.',
      '‘నువ్వా రాఘవ?’ అని ఆమె అడిగిన ఆ ఒక్క మాటలో ఎంతటి ఆర్ద్రత ఉందో అతనికే తెలుసు. కాసేపు ఇద్దరి మధ్య మౌనమే మాట్లాడింది. వర్షం వెలిసినా, వాళ్ల మనసుల్లో చినుకులు మాత్రం పడుతూనే ఉన్నాయి.',
      'జీవితంలో కొన్ని జ్ఞాపకాలు ఎప్పటికీ పాతబడవు. ఎంత కాలం గడిచినా, ఎంతమంది మనుషులు మారినా... వర్షం కురిసిన ప్రతిసారీ ఆ జ్ఞాపకాలు మళ్లీ తాజాగా పలకరిస్తూనే ఉంటాయి.'
    ],
    authorId: 'auth-1',
    author: MOCK_AUTHORS[0],
    category: 'ప్రేమ',
    tags: ['వర్షం', 'ప్రేమ', 'జ్ఞాపకాలు', 'జీవితం'],
    rating: 4.9,
    viewCount: 24500,
    likeCount: 3820,
    bookmarkCount: 1290,
    readingTimeMinutes: 6,
    publishedAt: '2026-08-01',
    status: 'published',
    isLiked: true,
    isBookmarked: true,
    progressPercent: 72,
  },
  {
    id: 'story-2',
    title: 'The Unspoken Word',
    teluguTitle: 'మనసు చెప్పని మాట',
    slug: 'manasu-cheppani-maata',
    coverImage: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&q=80&w=800',
    excerpt: 'In a bustling Hyderabad household, a grandfather shares a lifelong secret with his granddaughter.',
    teluguExcerpt: 'హైదరాబాద్ నగరంలో ఒక పెద్ద కుటుంబపు చట్రంలో, తాతయ్య మనవరాలికి దాచిన జీవిత సత్యాన్ని వివరించిన వేళ.',
    content: [
      'మా తాతయ్య ఎప్పుడూ వరండాలోని ఆ ఇత్తడి కుర్చీలోనే కూర్చునేవారు. చేతిలో ఒక పాత తెలుగు పుస్తకం, కళ్లజోడు ముక్కు కొనపైన ఉండేవి.',
      '‘అమ్మా లక్ష్మీ, జీవితంలో మనం చెప్పే మాటల కంటే... చెప్పకుండా దాచుకునే మౌనానికే ఎక్కువ విలువ ఉంటుంది,’ అని ఆయన అనేవారు.',
      'ఆ రోజు సాయంత్రం తాతయ్య రాసిన డైరీ నన్ను ఎంతో ఆలోచింపజేసింది. మన పెద్దవాళ్ల త్యాగాలు, వాళ్లు బయటకు నవ్వుతూ గుండెల్లో దాచుకునే భావోద్వేగాలు ఎంత గొప్పవో ఆ రోజే నాకు అర్థమైంది.'
    ],
    authorId: 'auth-2',
    author: MOCK_AUTHORS[1],
    category: 'కుటుంబం',
    tags: ['తాతయ్య', 'కుటుంబం', 'అనుబంధం'],
    rating: 4.8,
    viewCount: 18900,
    likeCount: 2910,
    bookmarkCount: 980,
    readingTimeMinutes: 8,
    publishedAt: '2026-07-28',
    status: 'published',
    isLiked: false,
    isBookmarked: true,
    progressPercent: 30,
  },
  {
    id: 'story-3',
    title: 'Poetry in a Coffee Cup',
    teluguTitle: 'కాఫీ కప్పులో కవిత',
    slug: 'coffee-kappulo-kavitha',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    excerpt: 'An IT developer discovers anonymous poems left under coffee cups every Friday in a Jubilee Hills cafe.',
    teluguExcerpt: 'జూబ్లీహిల్స్ కేఫ్‌లో ప్రతి శుక్రవారం కాఫీ కప్పు కింద మిగిలే అనామక కవిత... ఒక యువ ఐటీ ఉద్యోగి జీవితాన్ని మార్చిన తీరు.',
    content: [
      'మాదాపూర్ ఆఫీసు నుంచి అలసిపోయి వచ్చిన ప్రకాష్‌కి ఆ కేఫ్ ఒక ప్రశాంతమైన స్థావరం. డిసెంబర్ నెల చలిలో వేడి వేడి కాఫీ తాగుతుంటే, ప్లేట్ కింద ఒక చిన్న కాగితం ముక్క కనిపించింది.',
      '‘కాలాన్ని ఆపలేము కానీ... ఈ కాఫీ చల్లారే లోపు ఒక నవ్వు నవ్వొచ్చు కదా!’ అని రాసి ఉంది ఆ కాగితంపై. కింద ఏ పేరు లేదు.',
      'అప్పటి నుంచి ప్రతి వారం ఆ అనామక కవి ఎవరై ఉంటారా అనే ఉత్సుకత ప్రకాష్‌లో పెరిగింది. చివరికి ఆ కవిత రాసింది కేఫ్ ఓనర్ కూతురు ఆనంది అని తెలిసినప్పుడు...'
    ],
    authorId: 'auth-3',
    author: MOCK_AUTHORS[2],
    category: 'హాస్యం',
    tags: ['కేఫ్', 'కవిత', 'ఐటీ జీవితం'],
    rating: 4.7,
    viewCount: 15400,
    likeCount: 2100,
    bookmarkCount: 650,
    readingTimeMinutes: 5,
    publishedAt: '2026-08-04',
    status: 'published',
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: 'story-4',
    title: 'Moonlit Night on Godavari',
    teluguTitle: 'గోదావరి తీరాన వెన్నెల రాత్రి',
    slug: 'godavari-teerana-vennela-raatri',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    excerpt: 'A boat journey on the tranquil Godavari waters uncovers old stories and heartwarming friendships.',
    teluguExcerpt: 'ప్రశాంతంగా సాగే గోదావరి పంటి పడవ ప్రయాణంలో... పాత కథలు మరియు మనసును తడిమే ఆప్యాయతల రాత్రి.',
    content: [
      'రాజమండ్రి వద్ద గోదావరి వంతెన దాటుతుంటే రైలు శబ్దం గుండెల్లో ఏదో తీపి సంచలనం కలిగిస్తుంది. పౌర్ణమి రాత్రి కావడం వల్ల నది నీళ్లు వెండిలా మెరుస్తున్నాయి.',
      'పడవ నడుపుతున్న నారాయణ తాత తన చిన్ననాటి కథలు చెబుతున్నాడు. బ్రిటీష్ కాలం నాటి అనుభవాలు, గోదావరి వరదల జ్ఞాపకాలు అతని మాటల్లో జీవంతో ఉలిక్కడ్డాయి.'
    ],
    authorId: 'auth-4',
    author: MOCK_AUTHORS[3],
    category: 'జీవితం',
    tags: ['గోదావరి', 'ప్రకృతి', 'జ్ఞాపకాలు'],
    rating: 4.9,
    viewCount: 31200,
    likeCount: 4500,
    bookmarkCount: 1800,
    readingTimeMinutes: 7,
    publishedAt: '2026-07-20',
    status: 'published',
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: 'story-5',
    title: 'The Courage Within',
    teluguTitle: 'గుండెల్లో ధైర్యం',
    slug: 'gundello-dhairyam',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
    excerpt: 'An inspiring story of a rural girl overcoming all odds to become a doctor.',
    teluguExcerpt: 'అన్ని ప్రతికూల పరిస్థితులను ఎదుర్కొని డాక్టర్‌గా మారిన ఒక పల్లెటూరి అమ్మాయి స్ఫూర్తిదాయక ప్రయాణం.',
    content: [
      'శ్రీకాకుళం జిల్లాలోని ఒక చిన్న గ్రామంలో పెరిగిన గౌతమికి చిన్నతనం నుంచే చదువంటే ఎంతో ప్రాణం. కానీ ఆ ఊరిలో బడి ఐదో తరగతి వరకే ఉంది.',
      'రోజూ ఐదు కిలోమీటర్లు నడిచి వెళ్తూ, కష్టపడి చదివి ఈ రోజు ప్రతిష్టాత్మక మెడికల్ కాలేజీలో సీటు సంపాదించింది.'
    ],
    authorId: 'auth-2',
    author: MOCK_AUTHORS[1],
    category: 'ప్రేరణ',
    tags: ['స్ఫూర్తి', 'విద్య', 'విజయం'],
    rating: 5.0,
    viewCount: 42000,
    likeCount: 6100,
    bookmarkCount: 2400,
    readingTimeMinutes: 9,
    publishedAt: '2026-08-05',
    status: 'published',
    isLiked: false,
    isBookmarked: false,
  }
];

export const MOCK_NOVELS: Novel[] = [
  {
    id: 'novel-1',
    title: 'The Re-started Story',
    teluguTitle: 'మళ్లీ మొదలైన కథ',
    slug: 'malli-modalaina-katha',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
    description: 'A multi-generational novel set in coastal Andhra exploring heritage, changing times and redemption.',
    teluguDescription: 'కోస్తా ఆంధ్ర నేపథ్యంలో తరతరాల మధ్య మారే విలువలు, సంస్కృతి మరియు కోల్పోయిన బంధాలను మళ్లీ గెలుచుకునే మహానవల.',
    authorId: 'auth-1',
    author: MOCK_AUTHORS[0],
    category: 'కుటుంబం',
    tags: ['నవల', 'కుటుంబం', 'సంస్కృతి'],
    status: 'ongoing',
    chaptersCount: 14,
    rating: 4.9,
    viewCount: 58000,
    likeCount: 8900,
    bookmarkCount: 3400,
    publishedAt: '2026-05-10',
    updatedAt: '2026-08-08',
    chapters: [
      {
        id: 'chap-1',
        chapterNumber: 1,
        title: 'The Old House in Penumudi',
        teluguTitle: 'పెనుమూడి పాత ఇల్లు',
        content: [
          'కృష్ణా నది ఒడ్డున ఉన్న పెనుమూడి గ్రామంలో ఆ పెంకుటిల్లు వందేళ్ల చరిత్రకు సజీవ సాక్ష్యం. చుట్టూ కొబ్బరి చెట్లు, పచ్చటి పొలాలు.',
          'రామచంద్రయ్య తాత గారు ఆ ఇంటి అరుగు మీద కూర్చుని హుక్కా పీలుస్తూ పాత రోజులను గుర్తుచేసుకుంటున్నారు.',
          'నగరంలో స్థిరపడిన కొడుకు, మనుమలు దసరా పండక్కి ఊరికి వస్తున్నారనే వార్త వినగానే ఆ ఇంట్లో సందడి మొదలైంది.'
        ],
        readingTimeMinutes: 10,
        publishedAt: '2026-05-10',
      },
      {
        id: 'chap-2',
        chapterNumber: 2,
        title: 'The Festive Arrival',
        teluguTitle: 'పండగ రాక - సందడి పలకరింపు',
        content: [
          'సాయంత్రం నాలుగు గంటలకు తెల్లటి కారు ఊరి చివర కాజాలు అమ్మే కొట్టు దగ్గర ఆగింది. కారు దిగిన నవనీత్ కి పల్లెటూరి చల్లటి గాలి అమృతంలా అనిపించింది.',
          'హైదరాబాద్ శబ్దాల నుంచి దూరంగా... ప్రశాంతమైన ఈ పల్లె సీమలో అతని మనసుకు కొత్త ఊపిరి దొరికింది.'
        ],
        readingTimeMinutes: 12,
        publishedAt: '2026-05-17',
      }
    ]
  },
  {
    id: 'novel-2',
    title: 'Shadows of the Kingdom',
    teluguTitle: 'రాజ్యపు నీడలు',
    slug: 'rajyapu-needalu',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    description: 'An epic historical fantasy adventure based on ancient South Indian folklore and kingdoms.',
    teluguDescription: 'ప్రాచీన దక్షిణ భారత సామ్రాజ్యాల విచిత్ర రహస్యాలు, వీరత్వం మరియు మాయాజాలం మేళవించిన చారిత్రక సాహస గాథ.',
    authorId: 'auth-3',
    author: MOCK_AUTHORS[2],
    category: 'ఫాంటసీ',
    tags: ['చరిత్ర', 'ఫాంటసీ', 'సాహసం'],
    status: 'completed',
    chaptersCount: 22,
    rating: 4.8,
    viewCount: 72000,
    likeCount: 11200,
    bookmarkCount: 4900,
    publishedAt: '2026-01-15',
    updatedAt: '2026-06-30',
    chapters: [
      {
        id: 'chap-101',
        chapterNumber: 1,
        title: 'The Whispering Sword',
        teluguTitle: 'రహస్య ఖడ్గం',
        content: [
          'విజయనగర సామ్రాజ్యపు ఉత్తర సరిహద్దులలో దట్టమైన అడవులు ఉన్నాయి. ఆ అడవుల్లో కొండ పైన ఉన్న పాత శివాలయంలో ఒక పురాతన ఖడ్గం ఉంది.',
          'ఆ ఖడ్గాన్ని తాకిన ప్రతాపవర్మకు విచిత్రమైన దివ్య శక్తులు లభించాయి.'
        ],
        readingTimeMinutes: 11,
        publishedAt: '2026-01-15',
      }
    ]
  }
];

export const MOCK_JOKES: Joke[] = [
  {
    id: 'joke-1',
    content: 'గురూజీ: నీకు భవిష్యత్తులో ఏం కావాలని ఉందో చెప్పరా?\nశిష్యుడు: పెళ్లి కాకుండా కోటీశ్వరుడిని కావాలని ఉంది గురూజీ!\nగురూజీ: అబ్బో! అంత పెద్ద ఆశనా... సాధువైపోవడం నయం రా!',
    category: 'ఆఫీస్',
    authorId: 'auth-3',
    author: MOCK_AUTHORS[2],
    likeCount: 1420,
    shareCount: 380,
    publishedAt: '2026-08-08',
    isLiked: true,
  },
  {
    id: 'joke-2',
    content: 'భార్య: ఏమండీ, నా బర్త్‌డేకి బంగారం లాంటి గిఫ్ట్ ఇస్తారా?\nభర్త: ఖచ్చితంగా ఇస్తాను... ఈ రోజంతా నా నోటికి లాక్ వేసుకుని మౌనవ్రతం చేస్తాను!\nభార్య: అబ్బో! నిజంగా బంగారమేనండి!',
    category: 'కుటుంబం',
    authorId: 'auth-3',
    author: MOCK_AUTHORS[2],
    likeCount: 2150,
    shareCount: 590,
    publishedAt: '2026-08-07',
    isLiked: false,
  },
  {
    id: 'joke-3',
    content: 'ఆఫీస్‌లో బాస్: రేపు సండే కూడా ఆఫీస్‌కి రాగలవా?\nఉద్యోగి: రాగలను సర్... కానీ పెళ్లాం విడాకులు ఇస్తే మీరే బాధ్యత!\nబాస్: సర్లేవోయ్, ఇంట్లోనే ఉండు!',
    category: 'ఆఫీస్',
    authorId: 'auth-1',
    author: MOCK_AUTHORS[0],
    likeCount: 980,
    shareCount: 210,
    publishedAt: '2026-08-06',
    isLiked: false,
  }
];

export const MOCK_USER: User = {
  id: 'user-me',
  name: 'Rishi Kumar',
  teluguName: 'రిషి కుమార్',
  email: 'rishi.telugu@akshara.app',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
  bio: 'Passionate reader of Telugu literature & aspiring short story writer.',
  teluguBio: 'తెలుగు కథలు, కవిత్వం మరియు సాహిత్యాభిమాని. స్వయంగా చిన్న కథలు రాసే ప్రయత్నం.',
  role: 'author',
  followersCount: 340,
  followingCount: 48,
  savedStoriesCount: 12,
  publishedCount: 3,
  preferences: {
    theme: 'light',
    fontSize: 18,
    fontFamily: 'serif',
    notifications: true,
  }
};

export const MOCK_READING_HISTORY: ReadingHistoryItem[] = [
  {
    storyId: 'story-1',
    story: MOCK_STORIES[0],
    progressPercent: 72,
    lastReadAt: '2026-08-09T14:30:00Z',
  },
  {
    storyId: 'story-2',
    story: MOCK_STORIES[1],
    progressPercent: 30,
    lastReadAt: '2026-08-08T18:15:00Z',
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'కొత్త అధ్యాయం!',
    message: 'వెంకట సుబ్బారావు గారి "మళ్లీ మొదలైన కథ" నవలలో 2వ అధ్యాయం విడుదలయింది.',
    time: '2 గంటల క్రితం',
    read: false,
    type: 'story',
    linkId: 'novel-1',
  },
  {
    id: 'notif-2',
    title: 'కొత్త అనుచరుడు',
    message: 'లక్ష్మీదేవి గారు మిమ్మల్ని అనుసరించడం ప్రారంభించారు.',
    time: 'నిన్న',
    read: true,
    type: 'follower',
  },
  {
    id: 'notif-3',
    title: 'మీ కథకి మెప్పు!',
    message: 'మీ "వెన్నెల రాత్రి" కథని 150 మంది పాఠకులు లైక్ చేసారు.',
    time: '3 రోజుల క్రితం',
    read: true,
    type: 'like',
  }
];

export const MOCK_CREATOR_STATS: CreatorStats = {
  totalReads: 14850,
  totalLikes: 2190,
  totalFollowers: 340,
  monthlyReadsTrend: [
    { month: 'మార్చి', reads: 1200 },
    { month: 'ఏప్రిల్', reads: 2100 },
    { month: 'మే', reads: 3400 },
    { month: 'జూన్', reads: 2800 },
    { month: 'జూలై', reads: 4200 },
    { month: 'ఆగస్టు', reads: 5800 },
  ],
  topStories: [
    { id: 'my-1', title: 'ఒక చిన్న ప్రయాణం', reads: 8400, likes: 1250 },
    { id: 'my-2', title: 'సాయంత్రపు నీడలు', reads: 4200, likes: 620 },
    { id: 'my-3', title: 'అనగనగా ఒక గ్రామం', reads: 2250, likes: 320 },
  ]
};

export const MOCK_KNOWLEDGE_ARTICLES = [
  {
    id: 'k-1',
    title: 'History of Telugu Literature and Prabandha Era',
    teluguTitle: 'తెలుగు సాహిత్య చరిత్ర - ప్రబంధ యుగం వైభవం',
    category: 'సాహిత్య చరిత్ర',
    summary: 'శ్రీకృష్ణదేవరాయల కాలంలో తెలుగు ప్రబంధ సాహిత్యం ఎలా శిఖరాగ్రానికి చేరిందో సమగ్ర విశ్లేషణ.',
    content: [
      'తెలుగు సాహిత్య చరిత్రలో విజయనగర చక్రవర్తి శ్రీకృష్ణదేవరాయల కాలాన్ని స్వర్ణయుగంగా పిలుస్తారు. ఈ యుగంలోనే స్వతంత్ర ప్రబంధాల రచన ఊపందుకుంది.',
      'అల్లసాని పెద్దన, నంది తిమ్మన, ధూర్జటి, మాదయ్యగారి మల్లన, తెనాలి రామకృష్ణుడు వంటి అష్టదిగ్గజ కవులు తమ అద్భుతమైన కావ్యాలతో తెలుగు భాషకు అపురూపమైన సౌందర్యాన్ని చేకూర్చారు.',
      'ప్రబంధాలలో వర్ణనలు, భావగాంభీర్యం, శబ్దాలంకారాలు మరియు రసస్ఫూర్తి ప్రధానంగా కనిపిస్తాయి. "దేశభాషలందు తెలుగు లెస్స" అన్న నానుడి ఈ యుగంలోనే అత్యంత ప్రాచుర్యం పొందింది.'
    ],
    authorName: 'డా. శ్రీనివాస శర్మ',
    readTimeMinutes: 5,
    publishedAt: '2026-08-15',
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800',
    tags: ['సాహిత్యం', 'చరిత్ర', 'శ్రీకృష్ణదేవరాయలు', 'ప్రబంధం']
  },
  {
    id: 'k-2',
    title: 'Essential Storytelling Techniques for Modern Writers',
    teluguTitle: 'ఆధునిక కథారచన శిల్పం - ముఖ్యమైన మెళకువలు',
    category: 'రచనా శిల్పం',
    summary: 'కథలో పాత్ర చిత్రణ, సంభాషణలు మరియు పతాక సన్నివేశం ఎలా తీర్చిదిద్దాలో సూచనలు.',
    content: [
      'ఒక మంచి కథ పాఠకుడిని మొదటి వాక్యం నుంచే తనలోకి లాక్కోవాలి. కథ ప్రారంభం ఆసక్తికరంగా ఉండడం ఎంతో ముఖ్యం.',
      'పాత్రల స్వభావాన్ని వివరించేటప్పుడు కేవలం చెప్పడం కాకుండా (Show, Don’t Tell) వారి చేష్టలు, సంభాషణల ద్వారా పాఠకులకు అనుభూతి కలిగించాలి.',
      'పతాక సన్నివేశం (Climax) ఊహించని విధంగా ఉన్నా, కథా ప్రవాహానికి సహజంగా ఉండాలి. కథ ముగింపు పాఠకుడి మదిలో ఒక ఆలోచనను రేకెత్తించాలి.'
    ],
    authorName: 'వెంకట సుబ్బారావు',
    readTimeMinutes: 4,
    publishedAt: '2026-08-20',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
    tags: ['కథారచన', 'సాహిత్యం', 'మెళకువలు', 'రచయితల గైడ్']
  },
  {
    id: 'k-3',
    title: 'Great Telugu Novelists and Their Timeless Works',
    teluguTitle: 'తెలుగు నవలా వికాసం - ప్రముఖ నవలాకారులు',
    category: 'నవల పరిశోధన',
    summary: 'కందుకూరి వీరేశలింగం గారి రాజశేఖర చరిత్రము నుండి సమకాలీన నవలల వరకు నవలా వికాస ప్రయాణం.',
    content: [
      'తెలుగులో తొలి నవలగా ప్రసిద్ధి చెందిన "రాజశేఖర చరిత్రము" సమాజ సంస్కరణ ధ్యేయంగా వెలువడింది.',
      'తరువాతి కాలంలో ఉన్నవ లక్ష్మీనారాయణ గారి "మాలపల్లి", విశ్వనాథ సత్యనారాయణ గారి "వేయిపడగలు", చలం రచనలు తెలుగు నవలా రంగాన్ని కొత్త మలుపు తిప్పాయి.',
      'స్త్రీవాద, అభ్యుదయ, ప్రాంతీయ జీవిత చిత్రణలతో నేటికీ తెలుగు నవల నిరంతరం వికసిస్తూనే ఉంది.'
    ],
    authorName: 'లక్ష్మీదేవి కొప్పరపు',
    readTimeMinutes: 6,
    publishedAt: '2026-08-25',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    tags: ['నవలలు', 'చరిత్ర', 'విశ్వనాథ', 'చలం']
  }
];
