import {
  View,
  Text,
  Pressable,
  Linking,
  Share,
  StyleSheet,
} from 'react-native';
import { memo } from 'react';
import { ExternalLink } from 'lucide-react-native';
import Header from '../../../components/Header';
import HeaderBackButton from '../../../components/HeaderBackButton';
import { PRIVACY_POLICY_URL } from '../../../config';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BACKGROUND_PRIMARY,
  TEXT_MUTED,
} from '../../../styles/colors';
import { version } from '../../../../package.json';
import { useContentPadding } from '../../../hooks/useContentPadding';
import { formatLogsForSharing } from '../../../utils/logger';
import { pressedStyle } from '../../../styles/common';

interface AboutScreenProps {
  onBack: () => void;
}

function AboutScreen({ onBack }: AboutScreenProps) {
  const contentPadding = useContentPadding();

  const handleShareLog = async () => {
    await Share.share({ message: formatLogsForSharing() });
  };

  return (
    <View style={styles.container}>
      <Header title="About" leftSlot={<HeaderBackButton onPress={onBack} />} />
      <View style={[styles.content, contentPadding]}>
        <View style={styles.brandingBlock}>
          <Text style={styles.appName}>Voice</Text>
          <Text style={styles.appVersion}>{version}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Pressable
            style={({ pressed }) => [
              styles.shareButton,
              pressed && pressedStyle,
            ]}
            onPress={handleShareLog}
          >
            <Text style={styles.shareButtonText}>Share local log</Text>
          </Pressable>
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
    paddingHorizontal: 20,
  },
  brandingBlock: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 28,
  },
  appName: {
    fontSize: 32,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.8,
    includeFontPadding: false,
  },
  appVersion: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  bottomRow: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  shareButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: TEXT_MUTED,
    padding: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
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
