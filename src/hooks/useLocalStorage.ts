import { useState, useEffect, useCallback } from 'react';

/**
 * 本地存储 Hook
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [存储值, 更新函数]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 更新存储值的函数
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 允许传入函数来更新值
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // 更新状态
        setStoredValue(valueToStore);
        
        // 保存到 localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 监听其他标签页的存储变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * 移除本地存储项的 Hook
 * @param key 存储键名
 * @returns 移除函数
 */
export function useRemoveLocalStorage(key: string) {
  return useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);
}

/**
 * 清空所有本地存储的 Hook
 * @returns 清空函数
 */
export function useClearLocalStorage() {
  return useCallback(() => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }, []);
}