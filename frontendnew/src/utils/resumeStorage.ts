/**
 * Utility functions for managing resume storage in localStorage
 */

export interface StoredResume {
  file: string; // Base64 encoded file
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  resumeId?: string | number;
  metadata?: any;
}

const RESUME_STORAGE_KEY = 'storedResume';

/**
 * Store resume file in localStorage as base64
 */
export const storeResume = async (file: File, resumeId?: string | number, metadata?: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const storedResume: StoredResume = {
          file: reader.result as string, // Base64 string
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          resumeId,
          metadata,
        };
        
        localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(storedResume));
        console.log('✅ Resume stored in localStorage:', {
          fileName: file.name,
          fileSize: file.size,
          resumeId,
        });
        resolve();
      } catch (error) {
        console.error('❌ Failed to store resume in localStorage:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      console.error('❌ Failed to read file:', reader.error);
      reject(reader.error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Get stored resume from localStorage
 */
export const getStoredResume = (): StoredResume | null => {
  try {
    const stored = localStorage.getItem(RESUME_STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored) as StoredResume;
  } catch (error) {
    console.error('❌ Failed to get stored resume from localStorage:', error);
    return null;
  }
};

/**
 * Check if a resume is stored in localStorage
 */
export const hasStoredResume = (): boolean => {
  return getStoredResume() !== null;
};

/**
 * Remove stored resume from localStorage
 */
export const removeStoredResume = (): void => {
  try {
    localStorage.removeItem(RESUME_STORAGE_KEY);
    console.log('✅ Stored resume removed from localStorage');
  } catch (error) {
    console.error('❌ Failed to remove stored resume from localStorage:', error);
  }
};

/**
 * Convert stored resume back to File object
 */
export const getStoredResumeAsFile = (): File | null => {
  const stored = getStoredResume();
  if (!stored) return null;
  
  try {
    // Convert base64 to blob
    const byteString = atob(stored.file.split(',')[1]);
    const mimeString = stored.fileType;
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    return new File([blob], stored.fileName, { type: stored.fileType });
  } catch (error) {
    console.error('❌ Failed to convert stored resume to File:', error);
    return null;
  }
};

/**
 * Update resume metadata (e.g., resumeId after upload)
 */
export const updateStoredResumeMetadata = (updates: Partial<StoredResume>): void => {
  const stored = getStoredResume();
  if (!stored) return;
  
  try {
    const updated: StoredResume = {
      ...stored,
      ...updates,
    };
    
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(updated));
    console.log('✅ Stored resume metadata updated');
  } catch (error) {
    console.error('❌ Failed to update stored resume metadata:', error);
  }
};

