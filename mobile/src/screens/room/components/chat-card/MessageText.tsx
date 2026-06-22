import { useState, useMemo } from 'react';
import { Text, Linking, StyleSheet } from 'react-native';
import {
  splitTextWithLinks,
  TEXT_SEGMENT_TYPE,
} from '../../../../../../shared/utils/linkify';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
} from '../../../../styles/colors';

interface MessageTextProps {
  text: string;
}

export default function MessageText({ text }: MessageTextProps) {
  const [pressedLinkIndex, setPressedLinkIndex] = useState<number | null>(null);
  const segments = useMemo(() => splitTextWithLinks(text), [text]);

  return (
    <Text style={styles.text}>
      {segments.map((segment, index) =>
        segment.type === TEXT_SEGMENT_TYPE.LINK ? (
          <Text
            key={index}
            style={
              pressedLinkIndex === index ? styles.linkPressed : styles.link
            }
            onPressIn={() => setPressedLinkIndex(index)}
            onPressOut={() => setPressedLinkIndex(null)}
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
  linkPressed: {
    color: TEXT_MUTED,
    textDecorationLine: 'underline',
  },
});
