import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExternalLink } from 'lucide-react-native';
import Header from '../../../components/Header';
import HeaderBackButton from '../../../components/HeaderBackButton';
import { PRIVACY_POLICY_URL } from '../../../config';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BACKGROUND_PRIMARY,
} from '../../../styles/colors';
import { version } from '../../../../package.json';

interface AboutScreenProps {
  onBack: () => void;
}

function AboutScreen({ onBack }: AboutScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="About" leftSlot={<HeaderBackButton onPress={onBack} />} />
      <View style={styles.content}>
        <View style={styles.brandingBlock}>
          <Text style={styles.appName}>Voice</Text>
          <Text style={styles.appVersion}>{version}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.privacyLink,
            pressed && styles.privacyLinkPressed,
          ]}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <Text style={styles.privacyLinkText}>Privacy Policy</Text>
          <ExternalLink size={12} color={TEXT_SECONDARY} strokeWidth={1.75} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  brandingBlock: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 28,
    paddingBottom: 28,
  },
  appName: {
    fontSize: 32,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.8, // -0.025em × 32px
    includeFontPadding: false,
  },
  appVersion: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  privacyLinkPressed: {
    opacity: 0.5,
  },
  privacyLinkText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textDecorationLine: 'underline',
    textDecorationColor: TEXT_SECONDARY,
  },
});

export default memo(AboutScreen);
