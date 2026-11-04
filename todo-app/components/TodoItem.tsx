
import { StyleSheet, Text, View, Pressable } from 'react-native';

type TodoItemProps = {
  title: string;
  done: boolean;
  createdAt: string;
  onToggle: () => void;
  onDelete: () => void;
};

export default function TodoItem({
  title,
  done,
  createdAt,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <View style={[styles.container, done && styles.completedContainer]}>
      <Pressable style={styles.taskSection} onPress={onToggle}>
        <View style={[styles.checkbox, done && styles.checkedBox]}>
          {done && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, done && styles.completedTitle]}>
            {title}
          </Text>

          <Text style={styles.createdAt}>
            Created: {createdAt}
          </Text>
        </View>
      </Pressable>

      <Pressable onPress={onDelete} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#edf0f4',
  },
  completedContainer: {
    backgroundColor: '#effbf4',
    borderColor: '#c8f0d8',
  },
  taskSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#19b889',
    borderColor: '#19b889',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    color: '#475467',
    flexShrink: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#98a2b3',
  },
  createdAt: {
    fontSize: 10,
    color: '#98a2b3',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
});
