import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { TEXT_PRIMARY } from '../styles/colors';

interface HeaderBackButtonProps {
  onPress: () => void;
}

export default function HeaderBackButton({ onPress }: HeaderBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={16}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <ArrowLeft size={24} color={TEXT_PRIMARY} strokeWidth={1.75} />
    </Pressable>
  );
}
