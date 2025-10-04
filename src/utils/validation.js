// Validation utilities for WeCars frontend

/**
 * Validates VIN according to ISO 3779 standard
 * @param {string} vin - The VIN to validate
 * @returns {boolean} - True if valid VIN
 */
export function isValidVIN(vin) {
  if (!vin || vin.length !== 17) return false;
  
  const transliteration = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9, 'S': 2,
    'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
  };
  
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 17; i++) {
    const char = vin[i].toUpperCase();
    const value = transliteration[char] || parseInt(char);
    sum += value * weights[i];
  }
  
  const checkDigit = sum % 11;
  const expected = checkDigit === 10 ? 'X' : checkDigit.toString();
  
  return vin[8].toUpperCase() === expected;
}

/**
 * Formats UAE mobile number as user types
 * @param {string} input - Raw input value
 * @returns {string} - Formatted mobile number
 */
export function formatUAEMobile(input) {
  let digits = input.replace(/\D/g, '');
  
  if (digits.startsWith('00971')) digits = digits.substring(2);
  else if (digits.startsWith('971')) digits = digits;
  else if (digits.startsWith('0')) digits = '971' + digits.substring(1);
  else if (digits[0] === '5') digits = '971' + digits;
  
  digits = digits.substring(0, 12);
  
  if (digits.length <= 3) return `+${digits}`;
  if (digits.length <= 5) return `+${digits.substring(0, 3)} ${digits.substring(3)}`;
  if (digits.length <= 8) return `+${digits.substring(0, 3)} ${digits.substring(3, 5)} ${digits.substring(5)}`;
  return `+${digits.substring(0, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`;
}

/**
 * Validates UAE mobile number format
 * @param {string} number - Mobile number to validate
 * @returns {boolean} - True if valid UAE mobile
 */
export function isValidUAEMobile(number) {
  const digits = number.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('971') && digits[3] === '5';
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates required fields are not empty
 * @param {object} fields - Object with field values
 * @param {array} requiredFields - Array of required field names
 * @returns {object} - { isValid: boolean, missingFields: array }
 */
export function validateRequiredFields(fields, requiredFields) {
  const missingFields = requiredFields.filter(field => !fields[field] || fields[field].toString().trim() === '');
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
