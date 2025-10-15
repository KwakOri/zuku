/**
 * School Tags Serialization/Deserialization Utilities
 *
 * Handles conversion between:
 * - Array of school names (UI state)
 * - Comma-separated string (Database storage)
 */

/**
 * Serialize school tags array to comma-separated string for database storage
 * @param tags - Array of school names
 * @returns Comma-separated string or null if empty
 * @example
 * serializeSchoolTags(['서울고', '강남고']) // => '서울고,강남고'
 * serializeSchoolTags([]) // => null
 */
export function serializeSchoolTags(tags: string[]): string | null {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Remove empty strings and trim whitespace
  const cleanedTags = tags
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  if (cleanedTags.length === 0) {
    return null;
  }

  return cleanedTags.join(',');
}

/**
 * Deserialize comma-separated string from database to array of school names
 * @param tagsString - Comma-separated string from database
 * @returns Array of school names
 * @example
 * deserializeSchoolTags('서울고,강남고') // => ['서울고', '강남고']
 * deserializeSchoolTags(null) // => []
 * deserializeSchoolTags('') // => []
 */
export function deserializeSchoolTags(tagsString: string | null | undefined): string[] {
  if (!tagsString || tagsString.trim().length === 0) {
    return [];
  }

  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Add a school tag to existing tags (avoiding duplicates)
 * @param existingTags - Current array of school tags
 * @param newTag - New school tag to add
 * @returns Updated array of school tags
 * @example
 * addSchoolTag(['서울고'], '강남고') // => ['서울고', '강남고']
 * addSchoolTag(['서울고'], '서울고') // => ['서울고'] (no duplicate)
 */
export function addSchoolTag(existingTags: string[], newTag: string): string[] {
  const trimmedTag = newTag.trim();

  if (trimmedTag.length === 0) {
    return existingTags;
  }

  // Check if tag already exists (case-insensitive)
  const tagExists = existingTags.some(
    tag => tag.toLowerCase() === trimmedTag.toLowerCase()
  );

  if (tagExists) {
    return existingTags;
  }

  return [...existingTags, trimmedTag];
}

/**
 * Remove a school tag from existing tags
 * @param existingTags - Current array of school tags
 * @param tagToRemove - School tag to remove
 * @returns Updated array of school tags
 * @example
 * removeSchoolTag(['서울고', '강남고'], '서울고') // => ['강남고']
 */
export function removeSchoolTag(existingTags: string[], tagToRemove: string): string[] {
  return existingTags.filter(tag => tag !== tagToRemove);
}

/**
 * Validate school tag input
 * @param tag - School tag to validate
 * @returns Object with validation result and error message
 * @example
 * validateSchoolTag('서울고') // => { isValid: true, error: null }
 * validateSchoolTag('') // => { isValid: false, error: '학교명을 입력해주세요' }
 */
export function validateSchoolTag(tag: string): { isValid: boolean; error: string | null } {
  const trimmedTag = tag.trim();

  if (trimmedTag.length === 0) {
    return { isValid: false, error: '학교명을 입력해주세요' };
  }

  if (trimmedTag.length > 50) {
    return { isValid: false, error: '학교명은 50자 이내로 입력해주세요' };
  }

  // Check for invalid characters (only Korean, English, numbers, spaces allowed)
  const validPattern = /^[가-힣a-zA-Z0-9\s]+$/;
  if (!validPattern.test(trimmedTag)) {
    return { isValid: false, error: '학교명은 한글, 영문, 숫자만 입력 가능합니다' };
  }

  return { isValid: true, error: null };
}
