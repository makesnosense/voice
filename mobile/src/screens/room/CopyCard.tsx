import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Copy, Check } from 'lucide-react-native';
import type { RoomId } from '../../../../shared/types/core';

interface CopyCardProps {
  roomId: RoomId;
}

export default function CopyCard({ roomId }: CopyCardProps) {
  const [copied, setCopied] = useState(false);

  const url = `https://voice.k.vu/${roomId}`;

  const handleCopy = () => {
    Clipboard.setString(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.label}>room link</Text>
        <Text style={styles.url} numberOfLines={1}>
          {url}
        </Text>
      </View>
      <Pressable style={styles.button} onPress={handleCopy}>
        {copied ? (
          <Check size={18} color="#22c55e" />
        ) : (
          <Copy size={18} color="#94a3b8" />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
  },
  url: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
  button: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
});
