import { useEffect, useRef, RefObject, useState, useCallback } from 'react';

/**
 * 自动滚动到底部的 Hook
 * @param dependency 依赖项数组，当依赖项变化时触发滚动
 * @param smooth 是否使用平滑滚动，默认为 true
 * @returns 滚动容器的 ref
 */
export function useAutoScroll<T extends HTMLElement>(
  dependency: any[],
  smooth: boolean = true
): RefObject<T> {
  const scrollRef = useRef<T>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight } = scrollRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        
        if (smooth) {
          scrollRef.current.scrollTo({
            top: maxScrollTop,
            behavior: 'smooth'
          });
        } else {
          scrollRef.current.scrollTop = maxScrollTop;
        }
      }
    };

    // 使用 setTimeout 确保 DOM 更新完成后再滚动
    const timeoutId = setTimeout(scrollToBottom, 0);
    
    return () => clearTimeout(timeoutId);
  }, dependency);

  return scrollRef;
}

/**
 * 检查是否滚动到底部的 Hook
 * @param threshold 阈值，默认为 100px
 * @returns [是否在底部, 滚动容器的 ref, 手动滚动到底部的函数]
 */
export function useScrollToBottom<T extends HTMLElement>(
  threshold: number = 100
): [boolean, RefObject<T>, () => void] {
  const scrollRef = useRef<T>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsAtBottom(distanceFromBottom <= threshold);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return [isAtBottom, scrollRef, scrollToBottom];
}

/**
 * 智能自动滚动 Hook - 只有当用户在底部时才自动滚动
 * @param dependency 依赖项数组
 * @param threshold 判断是否在底部的阈值
 * @returns [滚动容器的 ref, 是否在底部, 手动滚动到底部的函数]
 */
export function useSmartAutoScroll<T extends HTMLElement>(
  dependency: any[],
  threshold: number = 100
): [RefObject<T>, boolean, () => void] {
  const [isAtBottom, scrollRef, scrollToBottom] = useScrollToBottom<T>(threshold);

  useEffect(() => {
    if (isAtBottom) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [...dependency, isAtBottom]);

  return [scrollRef, isAtBottom, scrollToBottom];
}