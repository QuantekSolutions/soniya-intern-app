
import { Pressable, Text, StyleSheet } from 'react-native';

type AppButtonProps = {
  title: string;
  onPress: () => void;
};

export default function AppButton({
  title,
  onPress,
}: AppButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    backgroundColor: '#6264e8',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '400',
  },
});
