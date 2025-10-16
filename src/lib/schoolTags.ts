/**
 * School Tags Serialization/Deserialization Utilities
 *
 * Handles conversion between:
 * - Array of school IDs (UI state)
 * - Comma-separated school ID string (Database storage)
 */

/**
 * Serialize school IDs array to comma-separated string for database storage
 * @param schoolIds - Array of school IDs
 * @returns Comma-separated string or null if empty
 * @example
 * serializeSchoolTags(['uuid1', 'uuid2']) // => 'uuid1,uuid2'
 * serializeSchoolTags([]) // => null
 */
export function serializeSchoolTags(schoolIds: string[]): string | null {
  if (!schoolIds || schoolIds.length === 0) {
    return null;
  }

  // Remove empty strings and trim whitespace
  const cleanedIds = schoolIds
    .map(id => id.trim())
    .filter(id => id.length > 0);

  if (cleanedIds.length === 0) {
    return null;
  }

  return cleanedIds.join(',');
}

/**
 * Deserialize comma-separated string from database to array of school IDs
 * @param tagsString - Comma-separated string from database
 * @returns Array of school IDs
 * @example
 * deserializeSchoolTags('uuid1,uuid2') // => ['uuid1', 'uuid2']
 * deserializeSchoolTags(null) // => []
 * deserializeSchoolTags('') // => []
 */
export function deserializeSchoolTags(tagsString: string | null | undefined): string[] {
  if (!tagsString || tagsString.trim().length === 0) {
    return [];
  }

  return tagsString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
}

/**
 * Add a school ID to existing tags (avoiding duplicates)
 * @param existingIds - Current array of school IDs
 * @param newId - New school ID to add
 * @returns Updated array of school IDs
 * @example
 * addSchoolTag(['uuid1'], 'uuid2') // => ['uuid1', 'uuid2']
 * addSchoolTag(['uuid1'], 'uuid1') // => ['uuid1'] (no duplicate)
 */
export function addSchoolTag(existingIds: string[], newId: string): string[] {
  const trimmedId = newId.trim();

  if (trimmedId.length === 0) {
    return existingIds;
  }

  // Check if ID already exists
  const idExists = existingIds.includes(trimmedId);

  if (idExists) {
    return existingIds;
  }

  return [...existingIds, trimmedId];
}

/**
 * Remove a school ID from existing tags
 * @param existingIds - Current array of school IDs
 * @param idToRemove - School ID to remove
 * @returns Updated array of school IDs
 * @example
 * removeSchoolTag(['uuid1', 'uuid2'], 'uuid1') // => ['uuid2']
 */
export function removeSchoolTag(existingIds: string[], idToRemove: string): string[] {
  return existingIds.filter(id => id !== idToRemove);
}
