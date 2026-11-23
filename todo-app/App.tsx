
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import TodoInput from './components/TodoInput';
import TodoItem from './components/TodoItem';

type Todo = {
  id: string;
  title: string;
  done: boolean;
};

type Filter = 'All' | 'Active' | 'Done';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<Filter>('All');

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: title,
      done: false,
    };

    setTodos((previousTodos) => [...previousTodos, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((previousTodos) =>
      previousTodos.filter((todo) => todo.id !== id)
    );
  };

  const clearDone = () => {
    setTodos((previousTodos) =>
      previousTodos.filter((todo) => !todo.done)
    );
  };

  const pendingTasks = todos.filter((todo) => !todo.done).length;
  const completedTasks = todos.filter((todo) => todo.done).length;

  const filteredTodos = todos.filter((todo) => {
    if (selectedFilter === 'Active') return !todo.done;
    if (selectedFilter === 'Done') return todo.done;
    return true;
  });

  const filters: Filter[] = ['All', 'Active', 'Done'];

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.heading}>My Tasks</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {pendingTasks} tasks pending
            </Text>
          </View>

          <View style={styles.filters}>
            {filters.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.activeFilter,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.activeFilterText,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TodoInput onAdd={addTodo} />
        </View>

        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              title={item.title}
              done={item.done}
              createdAt={new Date(Number(item.id)).toLocaleString()}
              onToggle={() => toggleTodo(item.id)}
              onDelete={() => deleteTodo(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyText}>No tasks here yet</Text>
            </View>
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {completedTasks} of {todos.length} complete
          </Text>

          <Pressable
            onPress={clearDone}
            disabled={completedTasks === 0}
          >
            <Text
              style={[
                styles.clearText,
                completedTasks === 0 && styles.disabledText,
              ]}
            >
              Clear done
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef0ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    height: '90%',
    maxHeight: 650,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 5,
    marginBottom: 20,
  },
  heading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#202b40',
    flexShrink: 0,
  },
  countBadge: {
    backgroundColor: '#eef0ff',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#5965d8',
    fontSize: 10,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    gap: 3,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#e2e5ec',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 15,
  },
  activeFilter: {
    backgroundColor: '#6264e8',
    borderColor: '#6264e8',
  },
  filterText: {
    fontSize: 10,
    color: '#667085',
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
  },
  emptyIcon: {
    fontSize: 35,
    color: '#94a3b8',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    paddingHorizontal: 9,
    marginBottom: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#8490a3',
  },
  clearText: {
    fontSize: 11,
    color: '#5965d8',
    fontWeight: '600',
  },
  disabledText: {
    color: '#cbd5e1',
  },
});
