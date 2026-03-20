/**
 * Validates if the given string is a valid Indian phone number.
 * - Must be 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Can optionally have +91 prefix
 */
export const validateIndianPhone = (phone: string): boolean => {
    // Remove any non-digit characters except +
    const clean = phone.replace(/[^\d+]/g, '');
    
    // Check for +91 or 91 prefix
    let digits = clean;
    if (clean.startsWith('+91')) {
        digits = clean.substring(3);
    } else if (clean.startsWith('91') && clean.length === 12) {
        digits = clean.substring(2);
    }
    
    // Check if remaining is 10 digits and starts with 6-9
    return /^[6789]\d{9}$/.test(digits);
};

/**
 * Normalizes a phone number to +91XXXXXXXXXX format.
 */
export const normalizeIndianPhone = (phone: string): string => {
    const clean = phone.replace(/\D/g, '');
    let digits = clean;
    
    if (clean.length === 12 && clean.startsWith('91')) {
        digits = clean.substring(2);
    } else if (clean.length === 10) {
        digits = clean;
    }
    
    return `+91${digits}`;
};
