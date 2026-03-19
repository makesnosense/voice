import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CallsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[callScreenStyles.container, { paddingTop: insets.top }]}>
      <View style={callScreenStyles.header}>
        <Text style={callScreenStyles.headerTitle}>Calls</Text>
      </View>
      <Text style={callScreenStyles.empty}>no past calls</Text>
    </View>
  );
}

const callScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: '#94a3b8',
    fontSize: 15,
  },
});
