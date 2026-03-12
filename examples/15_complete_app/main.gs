package main

import "fmt"
import "net/http"
import "sync"
import "encoding/json"
import "strconv"

// ===== 数据模型 =====

class Todo(
    val id Int,
    title String,
    done Bool = false,
)

class TodoStore {
    private mu = sync.Mutex()
    private todos = Todo[]()
    private nextID = 1

    fun add(title String) -> Todo {
        mu.Lock()
        defer { mu.Unlock() }

        let todo = Todo(id: nextID, title: title)
        nextID++
        todos.push(todo)
        return todo
    }

    fun getAll() -> Todo[] {
        mu.Lock()
        defer { mu.Unlock() }
        return todos
    }

    fun getByID(id Int) -> Todo? {
        mu.Lock()
        defer { mu.Unlock() }

        for todo in todos {
            if todo.id == id {
                return todo
            }
        }
        return null
    }

    fun toggle(id Int) -> Bool {
        mu.Lock()
        defer { mu.Unlock() }

        for todo in todos {
            if todo.id == id {
                todo.done = !todo.done
                return true
            }
        }
        return false
    }

    fun remove(id Int) -> Bool {
        mu.Lock()
        defer { mu.Unlock() }

        for i, todo in todos {
            if todo.id == id {
                todos = todos[0..<i] + todos[(i+1)..]
                return true
            }
        }
        return false
    }

    fun stats() -> TodoStats {
        mu.Lock()
        defer { mu.Unlock() }

        val total = todos.length
        val completed = todos.filter { it.done }.length
        return TodoStats(
            total: total,
            completed: completed,
            pending: total - completed,
        )
    }
}

type TodoStats = {
    total Int
    completed Int
    pending Int
}

// ===== JSON 辅助 =====

fun writeJSON(w http.ResponseWriter, status Int, data Any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    try! json.NewEncoder(w).Encode(data)
}

fun writeError(w http.ResponseWriter, status Int, msg String) {
    writeJSON(w, status, #{"error": msg})
}

// ===== HTTP 处理器 =====

class TodoHandler(store TodoStore) {

    fun handleList(w http.ResponseWriter, r http.Request) {
        val todos = store.getAll()
        writeJSON(w, 200, todos)
    }

    fun handleCreate(w http.ResponseWriter, r http.Request) {
        type CreateReq = { title String }

        let req = CreateReq(title: "")
        json.NewDecoder(r.Body).Decode(&req) catch { err ->
            writeError(w, 400, "invalid JSON: ${err.message()}")
            return
        }

        if req.title.length == 0 {
            writeError(w, 400, "title is required")
            return
        }

        val todo = store.add(req.title)
        writeJSON(w, 201, todo)
    }

    fun handleToggle(w http.ResponseWriter, r http.Request) {
        val idStr = r.URL.Query().Get("id")
        val id = strconv.Atoi(idStr) catch { err ->
            writeError(w, 400, "invalid id")
            return
        }

        if !store.toggle(id) {
            writeError(w, 404, "todo not found")
            return
        }

        val todo = store.getByID(id)
        writeJSON(w, 200, todo)
    }

    fun handleDelete(w http.ResponseWriter, r http.Request) {
        val idStr = r.URL.Query().Get("id")
        val id = strconv.Atoi(idStr) catch { err ->
            writeError(w, 400, "invalid id")
            return
        }

        if !store.remove(id) {
            writeError(w, 404, "todo not found")
            return
        }

        writeJSON(w, 200, #{"deleted": id})
    }

    fun handleStats(w http.ResponseWriter, r http.Request) {
        writeJSON(w, 200, store.stats())
    }
}

// ===== 入口 =====

fun main() {
    val store = TodoStore()

    // 预填充一些数据
    store.add("Learn GoScript")
    store.add("Build a compiler")
    store.add("Write documentation")

    val handler = TodoHandler(store: store)

    http.HandleFunc("/todos", handler.handleList)
    http.HandleFunc("/todos/create", handler.handleCreate)
    http.HandleFunc("/todos/toggle", handler.handleToggle)
    http.HandleFunc("/todos/delete", handler.handleDelete)
    http.HandleFunc("/todos/stats", handler.handleStats)

    fmt.Println("Todo API server starting on :8080")
    fmt.Println("  GET  /todos         — list all")
    fmt.Println("  POST /todos/create  — create (JSON body: {title})")
    fmt.Println("  POST /todos/toggle?id=N — toggle done")
    fmt.Println("  POST /todos/delete?id=N — delete")
    fmt.Println("  GET  /todos/stats   — statistics")

    try! http.ListenAndServe(":8080", null)
}
