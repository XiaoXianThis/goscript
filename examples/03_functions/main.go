package main

import "fmt"

func add(a int, b int) int {
	return a + b
}

func double(x int) int { return x * 2 }

func multiply(a int, b int) int { return a * b }

func greet(name string) {
	fmt.Printf("Hello, %s!\n", name)
}

func greetWith(name string, greeting string) {
	fmt.Printf("%s, %s!\n", greeting, name)
}

func sum(nums ...int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func apply(x int, f func(int) int) int { return f(x) }

func makeAdder(n int) func(int) int {
	return func(x int) int { return x + n }
}

func main() {
	fmt.Println(add(3, 5))
	fmt.Println(double(21))
	fmt.Println(multiply(6, 7))

	greet("World")
	greetWith("Alice", "Hello")
	greetWith("Bob", "Hi")

	fmt.Println(sum(1, 2, 3, 4, 5))

	result := apply(10, func(it int) int { return it * 3 })
	fmt.Println(result)

	addFive := makeAdder(5)
	fmt.Println(addFive(10))
}
