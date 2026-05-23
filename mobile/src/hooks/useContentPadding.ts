import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HEADER_HEIGHT } from '../components/Header';
import {
  NAV_PILL_HEIGHT,
  NAV_PILL_BOTTOM_MARGIN,
} from '../components/NavigationBar';

export function useContentPadding() {
  const insets = useSafeAreaInsets();

  return {
    paddingTop: insets.top + HEADER_HEIGHT,
    paddingBottom: insets.bottom + NAV_PILL_BOTTOM_MARGIN + NAV_PILL_HEIGHT,
  };
}
