import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default undefined;

export function useBottomTabOverflow() {
  try {
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
}
