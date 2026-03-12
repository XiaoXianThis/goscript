package main

import "fmt"

func main() {
	double := func(x int) int { return x * 2 }
	sum := func(a, b int) int { return a + b }
	fmt.Println(double(5))
	fmt.Println(sum(3, 4))

	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

	// filter
	evens := []int{}
	for _, v := range nums {
		if v%2 == 0 {
			evens = append(evens, v)
		}
	}
	fmt.Println(evens)

	// map
	doubled := make([]int, len(nums))
	for i, v := range nums {
		doubled[i] = v * 2
	}
	fmt.Println(doubled)

	// forEach
	for _, v := range nums {
		fmt.Println(v)
	}

	// fold
	total := 0
	for _, v := range nums {
		total += v
	}
	fmt.Printf("Sum: %d\n", total)

	// 方法链 → Go 中手动展开
	src := []int{1, 2, 3, 4, 5}
	result := 0
	for _, v := range src {
		if v > 2 {
			result += v * v
		}
	}
	fmt.Printf("Sum of squares: %d\n", result)

	// 闭包
	counter := 0
	increment := func() int {
		counter++
		return counter
	}
	fmt.Println(increment())
	fmt.Println(increment())
	fmt.Println(increment())

	// 嵌套 Lambda
	nested := [][]int{{1, 2}, {3, 4}, {5, 6}}
	flattened := make([][]int, len(nested))
	for i, inner := range nested {
		var filtered []int
		for _, v := range inner {
			if v > 2 {
				filtered = append(filtered, v)
			}
		}
		flattened[i] = filtered
	}
	fmt.Println(flattened)

	// map with early return in lambda
	processed := make([]int, len(nums))
	for i, v := range nums {
		if v < 0 {
			processed[i] = 0
		} else {
			processed[i] = v * 2
		}
	}
	fmt.Println(processed)

	// 函数类型变量
	transform := func(x int) int { return x * 3 }
	fmt.Println(transform(10))

	transform = func(x int) int { return x + 100 }
	fmt.Println(transform(10))

	// IIFE
	greeting := func() string {
		hour := 14
		if hour < 12 {
			return "Good morning"
		}
		return "Good afternoon"
	}()
	fmt.Println(greeting)
}
