// Image utility functions for profile photo upload

/**
 * Compress an image file to reduce its size
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - Compression quality (0.1 to 1.0)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new File object with the compressed blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert a file to Base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string with data URL prefix
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to convert file to Base64'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateImageFile = (file, maxSizeInMB = 1) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }
  
  // Check file size
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `Image size should be less than ${maxSizeInMB}MB`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Process image file: validate, compress if needed, and convert to Base64
 * @param {File} file - The image file to process
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Promise<string>} - Base64 string ready for upload
 */
export const processImageForUpload = async (file, maxSizeInMB = 1) => {
  // Validate the file
  const validation = validateImageFile(file, maxSizeInMB);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  let processedFile = file;
  
  // Compress if file is too large
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes * 0.8) { // Compress if larger than 80% of max size
    try {
      processedFile = await compressImage(file, 400, 400, 0.7);
    } catch (error) {
      console.warn('Failed to compress image, using original:', error);
    }
  }
  
  // Convert to Base64
  return await fileToBase64(processedFile);
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Object URL for preview
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke an image preview URL to free memory
 * @param {string} url - The object URL to revoke
 */
export const revokeImagePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
