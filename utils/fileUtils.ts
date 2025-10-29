
/**
 * Converts a File object to a Base64 encoded string, without the data URL prefix.
 * @param file The file to convert.
 * @returns A promise that resolves with the Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // result is "data:image/jpeg;base64,..."
        // We need to strip the prefix for the Gemini API
        const base64String = reader.result.split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error('Could not extract base64 content from file.'));
        }
      } else {
        reject(new Error('Failed to read file as a data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};


/**
 * Converts a File object to a Data URL string, including the prefix.
 * @param file The file to convert.
 * @returns A promise that resolves with the Data URL string.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as a data URL.'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };
