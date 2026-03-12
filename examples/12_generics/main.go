package main

import "fmt"

func first[T any](items []T) *T {
	if len(items) == 0 {
		return nil
	}
	return &items[0]
}

func mapSlice[T any, U any](items []T, transform func(T) U) []U {
	result := make([]U, 0, len(items))
	for _, item := range items {
		result = append(result, transform(item))
	}
	return result
}

func filterSlice[T any](items []T, predicate func(T) bool) []T {
	result := []T{}
	for _, item := range items {
		if predicate(item) {
			result = append(result, item)
		}
	}
	return result
}

type Pair[A any, B any] struct {
	First  A
	Second B
}

func (p Pair[A, B]) String() string {
	return fmt.Sprintf("(%v, %v)", p.First, p.Second)
}

type Stack[T any] struct {
	items []T
}

func NewStack[T any]() *Stack[T] {
	return &Stack[T]{items: []T{}}
}

func (s *Stack[T]) Push(item T) {
	s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() *T {
	if len(s.items) == 0 {
		return nil
	}
	item := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return &item
}

func (s *Stack[T]) Peek() *T {
	if len(s.items) == 0 {
		return nil
	}
	return &s.items[len(s.items)-1]
}

func (s *Stack[T]) IsEmpty() bool { return len(s.items) == 0 }
func (s *Stack[T]) Size() int     { return len(s.items) }

type Comparable[T any] interface {
	CompareTo(other T) int
}

func maxOf[T Comparable[T]](a, b T) T {
	if a.CompareTo(b) > 0 {
		return a
	}
	return b
}

type Box[T any] struct {
	Value T
}

func NewBox[T any](value T) *Box[T] {
	return &Box[T]{Value: value}
}

func (b *Box[T]) Get() T { return b.Value }

func MapBox[T any, U any](b *Box[T], f func(T) U) *Box[U] {
	return NewBox(f(b.Value))
}

func main() {
	nums := []int{10, 20, 30}
	names := []string{"Alice", "Bob"}
	fmt.Println(*first(nums))
	fmt.Println(*first(names))
	fmt.Println(first([]int{}))

	doubled := mapSlice(nums, func(it int) int { return it * 2 })
	fmt.Println(doubled)

	longNames := filterSlice(names, func(it string) bool { return len(it) > 3 })
	fmt.Println(longNames)

	p := Pair[string, int]{First: "age", Second: 30}
	fmt.Println(p.String())
	fmt.Println(p.First)

	stack := NewStack[int]()
	stack.Push(1)
	stack.Push(2)
	stack.Push(3)
	fmt.Println(*stack.Peek())
	fmt.Println(*stack.Pop())
	fmt.Println(*stack.Pop())
	fmt.Println(stack.Size())

	box := NewBox(42)
	strBox := MapBox(box, func(it int) string { return fmt.Sprintf("%d", it) })
	fmt.Println(strBox.Get())

	m := map[string]*Stack[int]{}
	s := NewStack[int]()
	s.Push(100)
	m["data"] = s
	if v, ok := m["data"]; ok {
		fmt.Println(*v.Peek())
	}
}
