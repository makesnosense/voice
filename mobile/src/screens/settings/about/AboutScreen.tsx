import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExternalLink } from 'lucide-react-native';
import Header from '../../../components/Header';
import HeaderBackButton from '../../../components/HeaderBackButton';
import { PRIVACY_POLICY_URL } from '../../../config';
import { TEXT_SECONDARY, BACKGROUND_PRIMARY } from '../../../styles/colors';

interface AboutScreenProps {
  onBack: () => void;
}

function AboutScreen({ onBack }: AboutScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="About" leftSlot={<HeaderBackButton onPress={onBack} />} />
      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
          <ExternalLink size={14} color={TEXT_SECONDARY} strokeWidth={1.75} />
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
    padding: 20,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: TEXT_SECONDARY,
  },
  linkPressed: {
    opacity: 0.5,
  },
  linkText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
});

export default memo(AboutScreen);
