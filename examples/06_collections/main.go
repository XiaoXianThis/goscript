package main

import "fmt"

func main() {
	// ===== 数组 / 切片 =====

	numbers := []int{1, 2, 3, 4, 5}
	fmt.Println(numbers)

	names := []string{"Alice", "Bob", "Charlie"}

	_ = []int{}

	_ = make([]int, 0, 100)

	numbers = append(numbers, 6)
	fmt.Println(numbers)
	fmt.Println(len(numbers))
	fmt.Println(numbers[0])

	sub := numbers[1:3]
	fmt.Println(sub)

	for i, name := range names {
		fmt.Printf("%d: %s\n", i, name)
	}

	// ===== Map =====

	scores := map[string]int{"Alice": 95, "Bob": 87, "Charlie": 72}
	fmt.Println(scores)

	_ = map[string]int{}

	scores["Dave"] = 88
	aliceScore := 0
	if v, ok := scores["Alice"]; ok {
		aliceScore = v
	}
	fmt.Printf("Alice: %d\n", aliceScore)

	if _, ok := scores["Bob"]; ok {
		fmt.Println("Bob is in the map")
	}

	delete(scores, "Charlie")

	for key, value := range scores {
		fmt.Printf("%s -> %d\n", key, value)
	}

	// ===== Set (Go 没有内置 Set，用 map[T]struct{}) =====

	colors := map[string]struct{}{
		"red": {}, "green": {}, "blue": {},
	}
	_, hasRed := colors["red"]
	fmt.Println(hasRed)
	_, hasYellow := colors["yellow"]
	fmt.Println(hasYellow)

	// ===== 方法链（Go 中需手动实现） =====

	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	result := 0
	for _, v := range nums {
		if v > 3 {
			result += v * v
		}
	}
	fmt.Printf("Sum of squares (>3): %d\n", result)
}
