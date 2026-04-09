import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { TEXT_PRIMARY } from '../styles/colors';
import { pressedStyle } from '../styles/common';

interface HeaderBackButtonProps {
  onPress: () => void;
}

export default function HeaderBackButton({ onPress }: HeaderBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={16}
      style={({ pressed }) => pressed && pressedStyle}
    >
      <ArrowLeft size={24} color={TEXT_PRIMARY} strokeWidth={1.75} />
    </Pressable>
  );
}
