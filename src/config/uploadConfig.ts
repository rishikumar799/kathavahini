/**
 * KATHAVAHINI STORY UPLOAD & CONTENT CONFIGURATION
 * 
 * Centralized upload policies and limits for production.
 * NOTE: These are application/Storage policies and NOT Firestore document limits.
 * Large binary files reside in Firebase Storage, while Firestore stores only metadata.
 */

export const UPLOAD_CONFIG = {
  // File size limits in bytes
  MAX_IMAGE_SIZE: 15 * 1024 * 1024,      // 15 MB per story/page image
  MAX_THUMBNAIL_SIZE: 10 * 1024 * 1024,  // 10 MB per cover thumbnail
  MAX_PROFILE_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB for author/profile avatar
  MAX_DOCUMENT_SIZE: 35 * 1024 * 1024,   // 35 MB per PDF/DOC/DOCX/TXT file
  
  // Batching and concurrency
  MAX_CONCURRENT_UPLOADS: 3,             // Max simultaneous uploads to Firebase Storage
  MAX_BATCH_FILES_PER_TRANCHE: 15,       // Max files processed in a single UI batch
  RECOMMENDED_BATCH_SIZE: 10,            // Recommended tranche size for smooth UI progress
  MAX_PAGES_PER_STORY: 150,              // Max supported image pages per single story
  
  // Supported MIME types
  SUPPORTED_IMAGE_MIMES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ],
  SUPPORTED_DOCUMENT_MIMES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ],
  
  // User-friendly bilingual messaging
  MESSAGES: {
    BATCH_TOO_LARGE_TELUGU: 'ఈ అప్‌లోడ్ బ్యాచ్ చాలా పెద్దదిగా ఉంది. దయచేసి కొంత కంటెంట్‌ను (10-15 చిత్రాలు) ముందుగా అప్‌లోడ్ చేసి భద్రపరచండి. తర్వాత ఇదే కథను తెరిచి మిగిలిన కంటెంట్‌ను సులభంగా కొనసాగించవచ్చు.',
    BATCH_TOO_LARGE_ENGLISH: 'This upload batch is too large to process in one step. Upload a smaller batch (10-15 files) first. After it is saved, reopen this story and continue uploading the remaining content.',
    
    FILE_TOO_LARGE_TELUGU: (fileName: string, maxMb: number) => 
      `"${fileName}" ఫైల్ పరిమాణం అనుమతించిన గరిష్ట పరిమితి (${maxMb} MB) కంటే ఎక్కువ ఉంది. దయచేసి చిన్న ఫైల్‌ను ఎంచుకోండి.`,
    FILE_TOO_LARGE_ENGLISH: (fileName: string, maxMb: number) => 
      `File "${fileName}" exceeds the maximum upload allowance of ${maxMb} MB. Please select a smaller file.`,
      
    PARTIAL_UPLOAD_SAVED_TELUGU: (uploaded: number, total: number) =>
      `${uploaded} / ${total} ఫైళ్లు విజయవంతంగా అప్‌లోడ్ అయ్యి భద్రపరచబడ్డాయి. మిగిలిన ఫైళ్లను ఇప్పుడు లేదా తర్వాత ఎప్పుడైనా అప్‌లోడ్ చేయవచ్చు.`,
    PARTIAL_UPLOAD_SAVED_ENGLISH: (uploaded: number, total: number) =>
      `${uploaded} of ${total} files have been safely uploaded. You can continue uploading the remaining files now or later.`
  }
};
