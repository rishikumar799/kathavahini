import React from 'react';
import { 
  BalavinodhiniGame, 
  BalavinodhiniAgeGroup 
} from '../../../types';

export interface GameMetadata {
  id: string;
  gameType: string;
  name: string;
  teluguName: string;
  description: string;
  shortDesc: string;
  icon: string;
  category: string;
  ageGroup: BalavinodhiniAgeGroup;
  difficulty: 'సులభం' | 'మధ్యస్థం' | 'కఠినం';
  colorGradient: string;
  isEnabled: boolean;
  isFeatured: boolean;
  rules: string[];
}

export const ALL_12_GAMES_METADATA: GameMetadata[] = [
  {
    id: 'bv-game-1',
    gameType: 'memory',
    name: 'Memory Match',
    teluguName: 'జ్ఞాపకాలను కలుపుదాం (Memory Match)',
    shortDesc: 'కార్డులు గుర్తుంచుకోండి & జంటలను కలపండి',
    description: 'జంతువులు, పక్షులు మరియు పండ్ల జంట కార్డులను సరిపోల్చి మీ జ్ఞాపకశక్తిని పరీక్షించుకోండి.',
    icon: '🦁',
    category: 'జ్ఞాపకశక్తి',
    ageGroup: 'all',
    difficulty: 'సులభం',
    colorGradient: 'from-purple-500 to-indigo-600',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'రెండు కార్డులను తిప్పండి',
      'ఒకేలాంటి బొమ్మలు వస్తే పాయింట్లు లభిస్తాయి',
      'కనిష్ట కదలికలతో అన్ని జతలను పూర్తి చేయండి'
    ],
  },
  {
    id: 'bv-game-2',
    gameType: 'number',
    name: 'Number Challenge',
    teluguName: 'సంఖ్యల సవాలు (Number Challenge)',
    shortDesc: 'సంఖ్యలతో సరదాగా ఆడండి & క్రమంలో పెట్టండి',
    description: 'సంఖ్యల క్రమం, మిస్సింగ్ నంబర్లు మరియు సరదా గణిత పజిల్స్‌తో సంఖ్యా పరిజ్ఞానాన్ని పెంచుకోండి.',
    icon: '🔢',
    category: 'గణితం',
    ageGroup: '7-9',
    difficulty: 'సులభం',
    colorGradient: 'from-blue-500 to-cyan-600',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'సంఖ్యలను ఆరోహణ క్రమంలో అమర్చండి',
      'తప్పిపోయిన సంఖ్యను కనుక్కోండి',
      'పాయింట్లు సాధించండి'
    ],
  },
  {
    id: 'bv-game-3',
    gameType: 'letters',
    name: 'Telugu Letter Match',
    teluguName: 'తెలుగు అక్షరాలు (Telugu Letter Match)',
    shortDesc: 'అక్షరాలను గుర్తించండి & బొమ్మలతో జతపరచండి',
    description: 'అచ్చులు, హల్లులు మరియు వాటికి సరిపోయే చిత్రాలను జతపరిచే సరదా తెలుగు భాషా ఆట.',
    icon: '🔤',
    category: 'భాష',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    colorGradient: 'from-emerald-500 to-teal-600',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'అక్షరాన్ని దానికి సరిపోయే బొమ్మతో కలపండి',
      'అమ్మ, ఆవు, ఇల్లు వంటి పదాల ఉచ్చారణ వినండి'
    ],
  },
  {
    id: 'bv-game-4',
    gameType: 'word',
    name: 'Word Puzzle',
    teluguName: 'పద పజిల్ (Telugu Word Puzzle)',
    shortDesc: 'అక్షరాలు కలిపి సరైన పదాలు తయారుచేయండి',
    description: 'చెల్లాచెదురుగా ఉన్న అక్షరాలను సరిగ్గా అమర్చి అందమైన తెలుగు పదాలను రూపొందించండి.',
    icon: '🧩',
    category: 'భాష',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    colorGradient: 'from-pink-500 to-rose-600',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'అక్షరాలను క్రమ పద్ధతిలో నొక్కండి',
      'సరైన తెలుగు పదాన్ని నిర్మించండి',
      'క్లూ ఆధారంగా పదాన్ని కనిపెట్టండి'
    ],
  },
  {
    id: 'bv-game-5',
    gameType: 'math',
    name: 'Math Challenge',
    teluguName: 'గణిత మాయ (Math Challenge)',
    shortDesc: 'గణితాన్ని సరదాగా నేర్చుకోండి',
    description: 'కూడికలు, తీసివేతలు, గుణకారాల వేగవంతమైన ఛాలెంజ్. మీ కాలిక్యులేషన్ వేగాన్ని పెంచుకోండి.',
    icon: '➗',
    category: 'గణితం',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    colorGradient: 'from-amber-500 to-orange-600',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'గణిత సమస్యను పరిశీలించండి',
      'సరైన సమాధానం ఎంచుకోండి',
      'స్ట్రీక్ పెంచుకుని ఎక్కువ మార్కులు సాధించండి'
    ],
  },
  {
    id: 'bv-game-6',
    gameType: 'picture',
    name: 'Picture Match',
    teluguName: 'బొమ్మల జంట (Picture Match)',
    shortDesc: 'బొమ్మలను చూసి సరైన పేరుతో జతపరచండి',
    description: 'రంగురంగుల బొమ్మలను చూసి సరైన తెలుగు పేర్లతో సరిపోల్చి పద సంపదను పెంచుకోండి.',
    icon: '🎨',
    category: 'విజ్ఞానం',
    ageGroup: '4-6',
    difficulty: 'సులభం',
    colorGradient: 'from-teal-500 to-emerald-700',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'ఎడమ వైపు చిత్రంపై నొక్కండి',
      'కుడి వైపు సరైన పేరుపై నొక్కండి',
      'అన్ని జంటలను సరిగ్గా కలపండి'
    ],
  },
  {
    id: 'bv-game-7',
    gameType: 'difference',
    name: 'Find the Difference',
    teluguName: 'తేడాలు కనుక్కోండి (Spot the Difference)',
    shortDesc: 'రెండు చిత్రాల మధ్య తేడాలు కనిపెట్టండి',
    description: 'రెండు రంగుల చిత్రాలలో దాగివున్న 5 సున్నితమైన తేడాలను కళ్ళతో కనిపెట్టి క్లిక్ చేయండి.',
    icon: '🔍',
    category: 'పరిశీలన',
    ageGroup: '7-9',
    difficulty: 'మధ్యస్థం',
    colorGradient: 'from-violet-500 to-purple-800',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'రెండు చిత్రాలను జాగ్రత్తగా గమనించండి',
      'తేడా ఉన్న స్థలంలో నొక్కండి',
      'అన్ని 5 తేడాలను వెతికి విజయం సాధించండి'
    ],
  },
  {
    id: 'bv-game-8',
    gameType: 'logic',
    name: 'Logic Puzzle',
    teluguName: 'లాజిక్ పజిల్ (Logic Puzzle)',
    shortDesc: 'ఆలోచింపజేసే సరదా లాజిక్ సవాళ్లు',
    description: 'క్రమాలు, నమూనాలు, బరువులు మరియు మేధో సవాళ్లను పరిష్కరించే అత్యుత్తమ గేమ్.',
    icon: '💡',
    category: 'లాజిక్',
    ageGroup: '13-15',
    difficulty: 'కఠినం',
    colorGradient: 'from-fuchsia-500 to-rose-700',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'ప్యాటర్న్ లేదా పజిల్‌ను చదవండి',
      'తార్కికంగా ఆలోచించి సరైన సమాధానం ఇవ్వండి'
    ],
  },
  {
    id: 'bv-game-9',
    gameType: 'riddle',
    name: 'Riddle Challenge',
    teluguName: 'పొడుపు కథల ఛాలెంజ్ (Riddle Challenge)',
    shortDesc: 'తెలుగు పొడుపు కథలు విప్పండి',
    description: 'తెలుగు వారి సరదా పొడుపు కథలను చదివి, హింట్లను ఉపయోగించి సమాధానాలను కనిపెట్టండి.',
    icon: '❓',
    category: 'తెలుగు విజ్ఞానం',
    ageGroup: 'all',
    difficulty: 'సులభం',
    colorGradient: 'from-yellow-500 to-amber-600',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'పొడుపు కథను చదవండి',
      'సందేహం ఉంటే "హింట్" పై నొక్కండి',
      'సమాధానాన్ని ఎంచుకోండి'
    ],
  },
  {
    id: 'bv-game-10',
    gameType: 'crossword',
    name: 'Telugu Crossword',
    teluguName: 'పదబంధం (Telugu Crossword)',
    shortDesc: 'తెలుగు పదాలతో గడులు నింపండి',
    description: 'అడ్డం మరియు నిలువు క్లూల ఆధారంగా గడుల్లో సరైన తెలుగు అక్షరాలను నింపి పజిల్ పూర్తి చేయండి.',
    icon: '▦',
    category: 'భాష',
    ageGroup: '10-12',
    difficulty: 'మధ్యస్థం',
    colorGradient: 'from-cyan-600 to-blue-700',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'గడిని ఎంచుకోండి',
      'అడ్డం/నిలువు క్లూ చదవండి',
      'కింద ఉన్న అక్షరాలను నొక్కి గడిని నింపండి'
    ],
  },
  {
    id: 'bv-game-11',
    gameType: 'knowledge_quiz',
    name: 'Knowledge Quiz',
    teluguName: 'జ్ఞాన క్విజ్ (Knowledge Quiz)',
    shortDesc: 'విజ్ఞానం, ప్రకృతి & చరిత్రపై ప్రశ్నలు',
    description: 'భారతదేశం, ఆంధ్రప్రదేశ్, ప్రకృతి, సైన్స్ మరియు పురాణాల గురించిన ఆసక్తికరమైన ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    icon: '🧠',
    category: 'విజ్ఞానం',
    ageGroup: 'all',
    difficulty: 'సులభం',
    colorGradient: 'from-rose-500 to-pink-600',
    isEnabled: true,
    isFeatured: true,
    rules: [
      '4 ఆప్షన్లలో సరైనదాన్ని ఎంచుకోండి',
      'వెంటనే వివరమైన వివరణ తెలుసుకోండి'
    ],
  },
  {
    id: 'bv-game-12',
    gameType: 'quick_quiz',
    name: 'Quick Quiz',
    teluguName: 'తళుకుబెళుకుల క్విజ్ (Speed Quiz)',
    shortDesc: 'వేగవంతమైన నిజం/అబద్ధం క్విజ్',
    description: 'సమయంతో పోటీపడుతూ నిజం లేదా అబద్ధం ప్రశ్నలకు మెరుపు వేగంతో సమాధానం ఇచ్చి రికార్డు సృష్టించండి.',
    icon: '⚡',
    category: 'వేగం',
    ageGroup: 'all',
    difficulty: 'సులభం',
    colorGradient: 'from-indigo-500 to-violet-700',
    isEnabled: true,
    isFeatured: true,
    rules: [
      'ప్రశ్న నిజమో అబద్ధమో త్వరగా చెప్పండి',
      'సమయం ముగిసేలోపు వీలైనన్ని ఎక్కువ సమాధానాలు ఇవ్వండి'
    ],
  },
];
