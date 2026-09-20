import { useMemo } from 'react';
import { Text, Linking, StyleSheet } from 'react-native';
import {
  splitTextWithLinks,
  TEXT_SEGMENT_TYPE,
} from '../../../../../../shared/utils/linkify';
import { TEXT_PRIMARY, BACKGROUND_PRIMARY } from '../../../../styles/colors';

interface MessageTextProps {
  text: string;
  isFromMe: boolean;
}

export default function MessageText({ text, isFromMe }: MessageTextProps) {
  const segments = useMemo(() => splitTextWithLinks(text), [text]);

  return (
    <Text style={isFromMe ? styles.textFromMe : styles.text}>
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
  textFromMe: {
    fontSize: 13,
    color: BACKGROUND_PRIMARY,
    lineHeight: 19,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
