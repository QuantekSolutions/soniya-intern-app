
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import AppButton from './AppButton';

type TodoInputProps = {
  onAdd: (title: string) => void;
};

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      return;
    }

    onAdd(title.trim());
    setTitle('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a new task..."
        placeholderTextColor="#9299a8"
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />

      <AppButton title="+" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#f8f9fb',
    borderWidth: 1,
    borderColor: '#e2e5ec',
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 13,
    color: '#344054',
  },
});
