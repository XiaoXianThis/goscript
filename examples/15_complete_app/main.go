package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
)

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

type TodoStore struct {
	mu     sync.Mutex
	todos  []*Todo
	nextID int
}

func NewTodoStore() *TodoStore {
	return &TodoStore{
		todos:  []*Todo{},
		nextID: 1,
	}
}

func (s *TodoStore) Add(title string) *Todo {
	s.mu.Lock()
	defer s.mu.Unlock()

	todo := &Todo{ID: s.nextID, Title: title, Done: false}
	s.nextID++
	s.todos = append(s.todos, todo)
	return todo
}

func (s *TodoStore) GetAll() []*Todo {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.todos
}

func (s *TodoStore) GetByID(id int) *Todo {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, todo := range s.todos {
		if todo.ID == id {
			return todo
		}
	}
	return nil
}

func (s *TodoStore) Toggle(id int) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, todo := range s.todos {
		if todo.ID == id {
			todo.Done = !todo.Done
			return true
		}
	}
	return false
}

func (s *TodoStore) Remove(id int) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, todo := range s.todos {
		if todo.ID == id {
			s.todos = append(s.todos[:i], s.todos[i+1:]...)
			return true
		}
	}
	return false
}

type TodoStats struct {
	Total     int `json:"total"`
	Completed int `json:"completed"`
	Pending   int `json:"pending"`
}

func (s *TodoStore) Stats() TodoStats {
	s.mu.Lock()
	defer s.mu.Unlock()

	total := len(s.todos)
	completed := 0
	for _, t := range s.todos {
		if t.Done {
			completed++
		}
	}
	return TodoStats{
		Total:     total,
		Completed: completed,
		Pending:   total - completed,
	}
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

type TodoHandler struct {
	store *TodoStore
}

func NewTodoHandler(store *TodoStore) *TodoHandler {
	return &TodoHandler{store: store}
}

func (h *TodoHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	todos := h.store.GetAll()
	writeJSON(w, 200, todos)
}

func (h *TodoHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, 400, fmt.Sprintf("invalid JSON: %s", err.Error()))
		return
	}

	if len(req.Title) == 0 {
		writeError(w, 400, "title is required")
		return
	}

	todo := h.store.Add(req.Title)
	writeJSON(w, 201, todo)
}

func (h *TodoHandler) HandleToggle(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, 400, "invalid id")
		return
	}

	if !h.store.Toggle(id) {
		writeError(w, 404, "todo not found")
		return
	}

	todo := h.store.GetByID(id)
	writeJSON(w, 200, todo)
}

func (h *TodoHandler) HandleDelete(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, 400, "invalid id")
		return
	}

	if !h.store.Remove(id) {
		writeError(w, 404, "todo not found")
		return
	}

	writeJSON(w, 200, map[string]int{"deleted": id})
}

func (h *TodoHandler) HandleStats(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, h.store.Stats())
}

func main() {
	store := NewTodoStore()

	store.Add("Learn GoScript")
	store.Add("Build a compiler")
	store.Add("Write documentation")

	handler := NewTodoHandler(store)

	http.HandleFunc("/todos", handler.HandleList)
	http.HandleFunc("/todos/create", handler.HandleCreate)
	http.HandleFunc("/todos/toggle", handler.HandleToggle)
	http.HandleFunc("/todos/delete", handler.HandleDelete)
	http.HandleFunc("/todos/stats", handler.HandleStats)

	fmt.Println("Todo API server starting on :8080")
	fmt.Println("  GET  /todos         — list all")
	fmt.Println("  POST /todos/create  — create (JSON body: {title})")
	fmt.Println("  POST /todos/toggle?id=N — toggle done")
	fmt.Println("  POST /todos/delete?id=N — delete")
	fmt.Println("  GET  /todos/stats   — statistics")

	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}
