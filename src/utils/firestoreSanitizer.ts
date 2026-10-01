import {
  Timestamp,
  DocumentReference,
  GeoPoint,
  FieldValue,
  setDoc,
  updateDoc,
  addDoc,
  SetOptions,
  DocumentData,
  CollectionReference,
  Transaction,
} from 'firebase/firestore';

/**
 * Checks if a value is a Firebase Timestamp
 */
export function isTimestamp(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false;
  if (val instanceof Timestamp) return true;
  return (
    typeof (val as any).toDate === 'function' &&
    typeof (val as any).toMillis === 'function' &&
    'seconds' in (val as any) &&
    'nanoseconds' in (val as any)
  );
}

/**
 * Checks if a value is a Firebase FieldValue (serverTimestamp, deleteField, increment, arrayUnion, etc.)
 */
export function isFieldValue(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false;
  if (val instanceof FieldValue) return true;
  const constructorName = val.constructor?.name;
  if (
    constructorName === 'FieldValue' ||
    constructorName === 'ServerTimestampTransform' ||
    constructorName === 'ArrayUnionTransform' ||
    constructorName === 'ArrayRemoveTransform' ||
    constructorName === 'NumericIncrementTransform' ||
    constructorName === 'DeleteTransform' ||
    '_methodName' in (val as any)
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if a value is a Firebase DocumentReference
 */
export function isDocumentReference(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false;
  if (val instanceof DocumentReference) return true;
  return (
    (val as any).type === 'document' &&
    'firestore' in (val as any) &&
    'path' in (val as any) &&
    'id' in (val as any)
  );
}

/**
 * Checks if a value is a Firebase GeoPoint
 */
export function isGeoPoint(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false;
  if (val instanceof GeoPoint) return true;
  return (
    'latitude' in (val as any) &&
    'longitude' in (val as any) &&
    typeof (val as any).isEqual === 'function'
  );
}

/**
 * Centralized recursive Firestore payload sanitizer.
 * 
 * Rules:
 * - undefined -> OMITTED entirely from objects and arrays
 * - null -> PRESERVED when intentionally provided
 * - string, number, boolean -> PRESERVED (NaN converted or omitted)
 * - Timestamp, Date, GeoPoint, DocumentReference -> PRESERVED
 * - FieldValue (serverTimestamp, increment, arrayUnion, deleteField, etc.) -> PRESERVED
 * - Arrays -> recursively sanitized
 * - Objects -> recursively sanitized with all undefined keys omitted
 * 
 * Never converts undefined to "undefined" string or null.
 */
export function sanitizeFirestoreData<T = any>(data: T): T {
  if (data === undefined) {
    return undefined as unknown as T;
  }

  if (data === null) {
    return null as unknown as T;
  }

  // Primitive types
  if (typeof data === 'string' || typeof data === 'boolean') {
    return data;
  }

  if (typeof data === 'number') {
    if (Number.isNaN(data)) {
      return 0 as unknown as T;
    }
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  // Special Firebase & JS objects to preserve directly
  if (
    data instanceof Date ||
    isTimestamp(data) ||
    isFieldValue(data) ||
    isDocumentReference(data) ||
    isGeoPoint(data)
  ) {
    return data;
  }

  // Arrays: recursively sanitize elements and omit undefined elements
  if (Array.isArray(data)) {
    const cleanedArray: any[] = [];
    for (const item of data) {
      if (item !== undefined) {
        const cleaned = sanitizeFirestoreData(item);
        if (cleaned !== undefined) {
          cleanedArray.push(cleaned);
        }
      }
    }
    return cleanedArray as unknown as T;
  }

  // Plain objects: recursively sanitize key/values and omit any undefined keys
  const sanitizedObj: Record<string, any> = {};
  const entries = Object.entries(data as Record<string, any>);

  for (const [key, value] of entries) {
    if (value === undefined) {
      // OMIT undefined field completely
      continue;
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      // Omit NaN or convert
      sanitizedObj[key] = 0;
      continue;
    }

    const sanitizedVal = sanitizeFirestoreData(value);
    if (sanitizedVal !== undefined) {
      sanitizedObj[key] = sanitizedVal;
    }
  }

  return sanitizedObj as unknown as T;
}

/**
 * Validates a payload before Firestore write and finds all paths with undefined values.
 * Returns an array of dot-notated paths (e.g. ['subtitle', 'documentURL', 'author.bio']).
 */
export function findUndefinedFirestorePaths(data: any, currentPath: string = ''): string[] {
  const undefinedPaths: string[] = [];

  if (data === undefined) {
    undefinedPaths.push(currentPath || '(root)');
    return undefinedPaths;
  }

  if (
    data === null ||
    typeof data !== 'object' ||
    data instanceof Date ||
    isTimestamp(data) ||
    isFieldValue(data) ||
    isDocumentReference(data) ||
    isGeoPoint(data)
  ) {
    return undefinedPaths;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const p = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
      if (item === undefined) {
        undefinedPaths.push(p);
      } else {
        undefinedPaths.push(...findUndefinedFirestorePaths(item, p));
      }
    });
    return undefinedPaths;
  }

  for (const [key, value] of Object.entries(data)) {
    const p = currentPath ? `${currentPath}.${key}` : key;
    if (value === undefined) {
      undefinedPaths.push(p);
    } else if (value && typeof value === 'object') {
      undefinedPaths.push(...findUndefinedFirestorePaths(value, p));
    }
  }

  return undefinedPaths;
}

/**
 * Development & runtime assertion helper.
 * Throws a descriptive error with exact field paths if unhandled undefined values are detected.
 */
export function assertNoUndefinedFirestoreValues(payload: any, contextDescription?: string): void {
  const badPaths = findUndefinedFirestorePaths(payload);
  if (badPaths.length > 0) {
    const errorMsg = `[Firestore Payload Error] Unsupported undefined fields found in ${contextDescription || 'payload'}: [${badPaths.join(', ')}]`;
    console.error(errorMsg, { payload });
    throw new Error(errorMsg);
  }
}

/**
 * Safe wrapper around Firestore setDoc with automatic sanitization and assertion
 */
export async function safeSetDoc<T extends DocumentData = DocumentData>(
  docRef: any,
  data: T,
  options?: SetOptions
): Promise<void> {
  const cleanData = sanitizeFirestoreData(data);
  if (process.env.NODE_ENV !== 'production') {
    assertNoUndefinedFirestoreValues(cleanData, `setDoc(${docRef?.path || 'unknown'})`);
  }
  if (options) {
    return setDoc(docRef, cleanData, options);
  }
  return setDoc(docRef, cleanData);
}

/**
 * Safe wrapper around Firestore updateDoc with automatic sanitization
 */
export async function safeUpdateDoc<T extends DocumentData = DocumentData>(
  docRef: any,
  data: Partial<T>
): Promise<void> {
  const cleanData = sanitizeFirestoreData(data);
  if (process.env.NODE_ENV !== 'production') {
    assertNoUndefinedFirestoreValues(cleanData, `updateDoc(${docRef?.path || 'unknown'})`);
  }
  return updateDoc(docRef, cleanData as any);
}

/**
 * Safe wrapper around Firestore addDoc with automatic sanitization
 */
export async function safeAddDoc<T extends DocumentData = DocumentData>(
  collectionRef: CollectionReference<T>,
  data: T
): Promise<any> {
  const cleanData = sanitizeFirestoreData(data);
  if (process.env.NODE_ENV !== 'production') {
    assertNoUndefinedFirestoreValues(cleanData, `addDoc(${collectionRef?.path || 'unknown'})`);
  }
  return addDoc(collectionRef, cleanData as any);
}

/**
 * Safe wrapper around Transaction.set with automatic sanitization
 */
export function safeTransactionSet<T extends DocumentData = DocumentData>(
  transaction: Transaction,
  docRef: any,
  data: T,
  options?: SetOptions
): Transaction {
  const cleanData = sanitizeFirestoreData(data);
  if (process.env.NODE_ENV !== 'production') {
    assertNoUndefinedFirestoreValues(cleanData, `transaction.set(${docRef?.path || 'unknown'})`);
  }
  if (options) {
    return transaction.set(docRef, cleanData, options);
  }
  return transaction.set(docRef, cleanData);
}

/**
 * Safe wrapper around Transaction.update with automatic sanitization
 */
export function safeTransactionUpdate<T extends DocumentData = DocumentData>(
  transaction: Transaction,
  docRef: any,
  data: Partial<T>
): Transaction {
  const cleanData = sanitizeFirestoreData(data);
  if (process.env.NODE_ENV !== 'production') {
    assertNoUndefinedFirestoreValues(cleanData, `transaction.update(${docRef?.path || 'unknown'})`);
  }
  return transaction.update(docRef, cleanData as any);
}
