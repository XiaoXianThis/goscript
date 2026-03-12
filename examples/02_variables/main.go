package main

import "fmt"

func main() {
	// 可变变量
	x := 10
	y := "hello"
	x = 20

	// 不可变变量 — Go 没有 val，用普通变量（语义由 GoScript 编译器保证不可变）
	PI := 3.14159
	name := "GoScript"

	// 显式类型标注
	var age int = 25
	var pi float64 = 3.14
	var flag bool = true
	var ch rune = 'A'

	// 可空类型 → Go 指针
	var nickname *string = nil
	countVal := 42
	count := &countVal

	fmt.Printf("x = %v, y = %v\n", x, y)
	fmt.Printf("PI = %v, name = %v\n", PI, name)
	fmt.Printf("age = %v, pi = %v, flag = %v, ch = %c\n", age, pi, flag, ch)
	fmt.Printf("nickname = %v, count = %v\n", nickname, *count)
}
