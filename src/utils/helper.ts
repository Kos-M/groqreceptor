/**
 * Stores a key-value pair in localStorage.
 * @param key The key under which the data will be stored.
 * @param value The value to store. It can be any serializable data.
 */
export function setToLocalStorage<T>(key: string, value: T, force : boolean = false): void {
    try {
      if ( !force && localStorage.getItem(key)) return
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
 * Retrieves a value from localStorage by key.
 * Parses JSON and returns the value inside the "value" key.
 * @param key The localStorage key.
 * @returns The parsed value inside "value", or null if not found or invalid.
 */
export function getFromLocalStorage<T>(key: string): string  {
    try {
      const item = localStorage.getItem(key);
      if (!item) return ''; // Return null if key does not exist
      
      let parsed = JSON.parse(item);
      if ( typeof parsed === 'string' && parsed !== ''){
        parsed = JSON.parse(parsed)
      }
    // console.log('Parsed: ', parsed)
      return parsed?.value ?? ''; // Return the "value" key if it exists
    } catch (error) {
      console.error("Error parsing localStorage item:", error);
      return '';
    }
  }

  export  function flattenAndConcatenate(obj: { [key: string]: any }): string {
    const result: string[] = [];
    const recursiveFlatten = (obj: { [key: string]: any }, prefix: string = '') => {
      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            // Only flatten nested objects, skip arrays and other non-objects
            if (typeof value == 'object') {
              recursiveFlatten(value, prefix + key + ' > ');
            } else {
              result.push(`${prefix}${key}:  ${value.join('\n ')}`);
            }
          } else {
            // console.log('dd-> ', value)
            
            result.push(`${prefix} ${value}`);
          }
        }
      }
    };
    recursiveFlatten(obj, ' ');
    return result.join('\n');
  }


  /**
 * Searches for keys in local storage that start with the given prefix
 * and returns their corresponding values.
 * 
 * @param prefix The prefix to search for in local storage keys.
 * @returns An object containing the found key-value pairs.
 */
export function searchLocalStorageWithPrefix(prefix: string, exact:boolean = false): { [key: string]: string } {
  const foundValues: { [key: string]: string } = {};

  // Iterate over all local storage keys
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Check if the key starts with the given prefix
      if (key  && !exact && key.startsWith(prefix) && prefix !== '') {
          // If it does, add the key-value pair to the foundValues object
          foundValues[key] = localStorage.getItem(key) ?? '';
      }else if (key && exact && key === prefix && prefix !== '') {
        foundValues[key] = localStorage.getItem(key) ?? '';
      }
  }

  return foundValues;
}

export function deleteItemsFromLocalStorage(foundValues: { [key: string]: string }): void {
  Object.keys(foundValues).forEach((key) => {
    localStorage.removeItem(key);
  });
}