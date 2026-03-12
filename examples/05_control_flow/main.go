package main

import "fmt"

func classify(x int) string {
	var sign string
	if x > 0 {
		sign = "positive"
	} else if x < 0 {
		sign = "negative"
	} else {
		sign = "zero"
	}
	return sign
}

func grade(score int) string {
	switch {
	case score >= 90:
		return "A"
	case score >= 80:
		return "B"
	case score >= 70:
		return "C"
	case score >= 60:
		return "D"
	default:
		return "F"
	}
}

func dayName(day int) string {
	switch day {
	case 1:
		return "Monday"
	case 2:
		return "Tuesday"
	case 3:
		return "Wednesday"
	case 4:
		return "Thursday"
	case 5:
		return "Friday"
	case 6, 7:
		return "Weekend"
	default:
		return "Invalid"
	}
}

func main() {
	x := 42
	if x > 0 {
		fmt.Printf("%d is positive\n", x)
	}

	fmt.Println(classify(10))
	fmt.Println(classify(-5))
	fmt.Println(classify(0))

	fruits := []string{"apple", "banana", "cherry"}
	for _, fruit := range fruits {
		fmt.Println(fruit)
	}

	for i, fruit := range fruits {
		fmt.Printf("%d: %s\n", i, fruit)
	}

	for i := 0; i < 5; i++ {
		fmt.Printf("%d ", i)
	}
	fmt.Println()

	for i := 1; i <= 5; i++ {
		fmt.Printf("%d ", i)
	}
	fmt.Println()

	for i := 0; i < 5; i++ {
		fmt.Printf("%d ", i)
	}
	fmt.Println()

	countdown := 5
	for countdown > 0 {
		fmt.Printf("%d ", countdown)
		countdown--
	}
	fmt.Println("Go!")

outer:
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if i == 1 && j == 1 {
				break outer
			}
			fmt.Printf("(%d, %d)\n", i, j)
		}
	}

	fmt.Println(grade(95))
	fmt.Println(grade(73))
	fmt.Println(dayName(5))
	fmt.Println(dayName(6))
}
