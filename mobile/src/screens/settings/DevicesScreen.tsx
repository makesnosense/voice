import { View, StyleSheet } from 'react-native';
import { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';
import Header from '../../components/Header';

interface DevicesScreenProps {
  onBack: () => void;
}

function DevicesScreen({ onBack }: DevicesScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Devices"
        leftSlot={
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
          >
            <ArrowLeft size={22} color="#0f172a" strokeWidth={1.75} />
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default memo(DevicesScreen);
