import messageTextStyles from './MessageText.module.css';
import {
  splitTextWithLinks,
  TEXT_SEGMENT_TYPE,
} from '../../../../../../../../shared/utils/linkify';

interface MessageTextProps {
  text: string;
}

export default function MessageText({ text }: MessageTextProps) {
  const segments = splitTextWithLinks(text);
  return (
    <div className={messageTextStyles.messageText}>
      {segments.map((segment, index) =>
        segment.type === TEXT_SEGMENT_TYPE.LINK ? (
          <a
            key={index}
            href={segment.value}
            target="_blank"
            rel="noopener noreferrer"
            className={messageTextStyles.link}
          >
            {segment.value}
          </a>
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </div>
  );
}
