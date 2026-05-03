import { View, StyleSheet } from 'react-native';
import { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import HeaderBackButton from '../../../components/HeaderBackButton';
import { BACKGROUND_PRIMARY } from '../../../styles/colors';

interface AboutScreenProps {
  onBack: () => void;
}

function AboutScreen({ onBack }: AboutScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="About" leftSlot={<HeaderBackButton onPress={onBack} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
});

export default memo(AboutScreen);
