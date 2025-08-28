import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Restaurar desde AsyncStorage al iniciar
  useEffect(() => {
    loadTasks();
  }, []);

  // Guardar automáticamente cada vez que cambien las tareas
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Guardar en AsyncStorage
  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem("@tasks", JSON.stringify(tasksToSave));
    } catch (e) {
      console.log("Error guardando tareas", e);
    }
  };

  // Cargar desde AsyncStorage
  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem("@tasks");
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (e) {
      console.log("Error cargando tareas", e);
    }
  };

  // Agregar tarea
  const addTask = () => {
    if (text.trim() === "") return; // no tareas vacías
    const newTask: Task = {
      id: Date.now().toString(), // key estable
      text: text.trim(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setText("");
  };

  // completar
  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // Eliminar con long press
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Filtrar
  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true; // "all"
  });

  // Contadores
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 To-Do App</Text>

      {/* Input + Botón */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Contadores */}
      <Text style={styles.counter}>
        Total: {total} | Completadas: {completed}
      </Text>

      {/* Filtros */}
      <View style={styles.filters}>
        {(["all", "active", "completed"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={{
                color: filter === f ? "#fff" : "#333",
                fontWeight: filter === f ? "bold" : "normal",
              }}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleTask(item.id)}
            onLongPress={() => deleteTask(item.id)}
            style={[
              styles.task,
              item.completed && styles.completedTask,
            ]}
          >
            <Text
              style={[
                styles.taskText,
                item.completed && styles.completedText,
              ]}
            >
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  inputRow: { flexDirection: "row", marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#14b7e9",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 5,
  },
  addText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  counter: { marginBottom: 10, fontSize: 16 },
  filters: { flexDirection: "row", marginBottom: 10 },
  filterButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#14b7e9",
    borderRadius: 5,
    marginRight: 5,
  },
  filterActive: { backgroundColor: "#14b7e9" },
  task: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  taskText: { fontSize: 18 },
  completedTask: { backgroundColor: "#d3ffd6" },
  completedText: { textDecorationLine: "line-through", color: "#555" },
});
