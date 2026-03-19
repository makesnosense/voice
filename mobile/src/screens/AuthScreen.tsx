import { View, Text, StyleSheet } from 'react-native';
import Auth from '../components/Auth';

export default function AuthScreen() {
  return (
    <View style={authScreenStyles.container}>
      <Text style={authScreenStyles.title}>Voice</Text>
      <Auth />
    </View>
  );
}

const authScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#f1f5f9',
    letterSpacing: 1,
  },
});
