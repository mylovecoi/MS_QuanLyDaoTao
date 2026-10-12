import { useEffect, useState } from 'react';

/**
 * Custom hook hoãn thực thi (debounce) một giá trị.
 * Phù hợp cho ô tìm kiếm gõ phím tức thì (Instant Search/Live Search)
 * giúp tránh spam API request khi người dùng đang gõ liên tục.
 *
 * @param value Giá trị cần debounce (ví dụ: từ khóa tìm kiếm)
 * @param delay Thời gian chờ (mặc định 350ms - tối ưu trải nghiệm gõ)
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
