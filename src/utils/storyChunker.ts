import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeFirestoreData } from './firestoreSanitizer';

/**
 * Target conservative chunk byte size: 250 KB (256,000 bytes)
 * Firestore allows up to 1,048,576 bytes per document.
 * 250 KB ensures plenty of safety margin for Telugu 3-byte UTF-8 Unicode characters and metadata.
 */
export const TARGET_CHUNK_BYTE_SIZE = 250 * 1024; // 256,000 bytes

/**
 * Accurately measures the UTF-8 byte size of a string.
 * Especially critical for Telugu text where 1 character is often 3 UTF-8 bytes.
 */
export function getUtf8ByteSize(str: string): number {
  if (!str) return 0;
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  // Fallback UTF-8 byte counter
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // Surrogate pair
      bytes += 4;
      i++;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

export interface StoryContentChunk {
  chunkIndex: number;
  chunkId: string; // "0000", "0001", "0002", etc.
  paragraphs: string[];
  content: string; // Serialized string representation
  byteSize: number;
}

/**
 * Safely splits a single exceptionally large paragraph into smaller sub-paragraphs
 * without corrupting Unicode code points or Telugu multi-byte glyphs.
 */
function splitLargeParagraph(paragraph: string, maxBytes: number): string[] {
  if (getUtf8ByteSize(paragraph) <= maxBytes) {
    return [paragraph];
  }

  // 1. Try splitting by sentences (. , ! , ? , Telugu purna viram । , or newlines)
  const sentenceRegex = /([.!?।\n]+[\s]*)/;
  const rawParts = paragraph.split(sentenceRegex);
  const sentences: string[] = [];
  
  for (let i = 0; i < rawParts.length; i += 2) {
    const sentenceBody = rawParts[i] || '';
    const punctuation = rawParts[i + 1] || '';
    const fullSentence = sentenceBody + punctuation;
    if (fullSentence) {
      sentences.push(fullSentence);
    }
  }

  if (sentences.length <= 1) {
    // Cannot split by sentences, split safely by Unicode code points
    const codePoints = Array.from(paragraph);
    const subParagraphs: string[] = [];
    let currentBuf = '';
    let currentBytes = 0;

    for (const cp of codePoints) {
      const cpBytes = getUtf8ByteSize(cp);
      if (currentBytes + cpBytes > maxBytes && currentBuf.length > 0) {
        subParagraphs.push(currentBuf);
        currentBuf = cp;
        currentBytes = cpBytes;
      } else {
        currentBuf += cp;
        currentBytes += cpBytes;
      }
    }
    if (currentBuf) {
      subParagraphs.push(currentBuf);
    }
    return subParagraphs;
  }

  // Group sentences into sub-paragraphs under maxBytes
  const result: string[] = [];
  let currentGroup = '';
  let currentGroupBytes = 0;

  for (const s of sentences) {
    const sBytes = getUtf8ByteSize(s);
    if (sBytes > maxBytes) {
      // Sentence itself exceeds maxBytes, recurse
      if (currentGroup) {
        result.push(currentGroup);
        currentGroup = '';
        currentGroupBytes = 0;
      }
      const parts = splitLargeParagraph(s, maxBytes);
      result.push(...parts);
    } else if (currentGroupBytes + sBytes > maxBytes && currentGroup.length > 0) {
      result.push(currentGroup);
      currentGroup = s;
      currentGroupBytes = sBytes;
    } else {
      currentGroup += s;
      currentGroupBytes += sBytes;
    }
  }

  if (currentGroup) {
    result.push(currentGroup);
  }

  return result;
}

/**
 * Splits story paragraphs into deterministic, sequential content chunks.
 * Preserves the exact structure, text, and order of the original content.
 */
export function splitStoryIntoChunks(
  paragraphs: string[], 
  maxChunkBytes: number = TARGET_CHUNK_BYTE_SIZE
): StoryContentChunk[] {
  if (!paragraphs || paragraphs.length === 0) {
    return [{
      chunkIndex: 0,
      chunkId: '0000',
      paragraphs: [''],
      content: '',
      byteSize: 0
    }];
  }

  // First expand any gigantic single paragraph safely
  const normalizedParagraphs: string[] = [];
  for (const p of paragraphs) {
    if (getUtf8ByteSize(p) > maxChunkBytes) {
      normalizedParagraphs.push(...splitLargeParagraph(p, maxChunkBytes));
    } else {
      normalizedParagraphs.push(p);
    }
  }

  const chunks: StoryContentChunk[] = [];
  let currentChunkParagraphs: string[] = [];
  let currentChunkBytes = 0;
  let chunkIndex = 0;

  for (const p of normalizedParagraphs) {
    const pBytes = getUtf8ByteSize(p) + 2; // +2 for newline separation overhead
    if (currentChunkBytes + pBytes > maxChunkBytes && currentChunkParagraphs.length > 0) {
      const contentStr = currentChunkParagraphs.join('\n\n');
      chunks.push({
        chunkIndex,
        chunkId: String(chunkIndex).padStart(4, '0'),
        paragraphs: [...currentChunkParagraphs],
        content: contentStr,
        byteSize: getUtf8ByteSize(contentStr)
      });
      chunkIndex++;
      currentChunkParagraphs = [p];
      currentChunkBytes = pBytes;
    } else {
      currentChunkParagraphs.push(p);
      currentChunkBytes += pBytes;
    }
  }

  if (currentChunkParagraphs.length > 0) {
    const contentStr = currentChunkParagraphs.join('\n\n');
    chunks.push({
      chunkIndex,
      chunkId: String(chunkIndex).padStart(4, '0'),
      paragraphs: [...currentChunkParagraphs],
      content: contentStr,
      byteSize: getUtf8ByteSize(contentStr)
    });
  }

  return chunks;
}

/**
 * Reassembles raw chunk documents into the original paragraphs array.
 * Guaranteed to preserve exact order and content.
 */
export function reassembleChunksToParagraphs(
  chunkDocs: Array<{
    chunkIndex?: number;
    id?: string;
    paragraphs?: string[];
    content?: string | string[];
  }>
): string[] {
  if (!chunkDocs || chunkDocs.length === 0) {
    return [];
  }

  // Sort chunks strictly by deterministic chunkIndex (or alphanumeric document ID fallback)
  const sorted = [...chunkDocs].sort((a, b) => {
    const idxA = typeof a.chunkIndex === 'number' ? a.chunkIndex : parseInt(a.id || '0', 10) || 0;
    const idxB = typeof b.chunkIndex === 'number' ? b.chunkIndex : parseInt(b.id || '0', 10) || 0;
    return idxA - idxB;
  });

  const fullParagraphs: string[] = [];

  for (const chunk of sorted) {
    if (Array.isArray(chunk.paragraphs) && chunk.paragraphs.length > 0) {
      fullParagraphs.push(...chunk.paragraphs);
    } else if (typeof chunk.content === 'string') {
      const splitParas = chunk.content.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
      if (splitParas.length > 0) {
        fullParagraphs.push(...splitParas);
      } else if (chunk.content) {
        fullParagraphs.push(chunk.content);
      }
    } else if (Array.isArray(chunk.content)) {
      fullParagraphs.push(...chunk.content);
    }
  }

  return fullParagraphs;
}

/**
 * Saves story content chunks into the Firestore subcollection:
 * stories/{storyId}/contentChunks/{chunkId}
 */
export async function saveStoryContentChunks(
  storyId: string, 
  paragraphs: string[]
): Promise<number> {
  const chunks = splitStoryIntoChunks(paragraphs);

  // Use Firestore batch write for atomic chunk storage
  const batch = writeBatch(db);

  for (const chunk of chunks) {
    const chunkRef = doc(db, 'stories', storyId, 'contentChunks', chunk.chunkId);
    batch.set(chunkRef, sanitizeFirestoreData({
      chunkIndex: chunk.chunkIndex,
      chunkId: chunk.chunkId,
      paragraphs: chunk.paragraphs,
      content: chunk.content,
      byteSize: chunk.byteSize,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));
  }

  await batch.commit();
  return chunks.length;
}

/**
 * Loads and reassembles story content chunks from Firestore.
 * If no chunks exist in subcollection, returns null (fallback to legacy main doc content).
 */
export async function loadStoryContentChunks(storyId: string): Promise<string[] | null> {
  try {
    const chunksColl = collection(db, 'stories', storyId, 'contentChunks');
    const snap = await getDocs(chunksColl);

    if (snap.empty) {
      return null;
    }

    const chunkDocs = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    return reassembleChunksToParagraphs(chunkDocs);
  } catch (err) {
    console.warn(`Could not load content chunks for story ${storyId}:`, err);
    return null;
  }
}

/**
 * Deletes all content chunks for a story from Firestore
 */
export async function deleteStoryContentChunks(storyId: string): Promise<void> {
  try {
    const chunksColl = collection(db, 'stories', storyId, 'contentChunks');
    const snap = await getDocs(chunksColl);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach(d => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn(`Error deleting content chunks for story ${storyId}:`, err);
  }
}
