import { Text, Linking, StyleSheet } from 'react-native';
import {
  splitTextWithLinks,
  TEXT_SEGMENT_TYPE,
} from '../../../../../../shared/utils/linkify';
import { TEXT_PRIMARY, TEXT_SECONDARY } from '../../../../styles/colors';

interface MessageTextProps {
  text: string;
}

export default function MessageText({ text }: MessageTextProps) {
  const segments = splitTextWithLinks(text);

  return (
    <Text style={styles.text}>
      {segments.map((segment, index) =>
        segment.type === TEXT_SEGMENT_TYPE.LINK ? (
          <Text
            key={index}
            style={styles.link}
            onPress={() => Linking.openURL(segment.value)}
          >
            {segment.value}
          </Text>
        ) : (
          <Text key={index}>{segment.value}</Text>
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 19,
  },
  link: {
    color: TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
});
