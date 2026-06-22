import { Text, StyleSheet } from 'react-native';
import { TEXT_PRIMARY } from '../../../../styles/colors';

interface MessageTextProps {
  text: string;
}

export default function MessageText({ text }: MessageTextProps) {
  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 19,
  },
});
