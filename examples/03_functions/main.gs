package main

import "fmt"

// 基本函数
fun add(a Int, b Int) -> Int {
    return a + b
}

// 单表达式函数
fun double(x Int) -> Int = x * 2

// 省略返回类型（编译器推断）
fun multiply(a Int, b Int) = a * b

// 无返回值
fun greet(name String) {
    fmt.Println("Hello, $name!")
}

// 默认参数
fun greetWith(name String, greeting String = "Hello") {
    fmt.Println("$greeting, $name!")
}

// 可变参数
fun sum(nums ...Int) -> Int {
    let total = 0
    for n in nums {
        total += n
    }
    return total
}

// 函数作为参数
fun apply(x Int, f (Int) -> Int) -> Int = f(x)

// 返回函数
fun makeAdder(n Int) -> (Int) -> Int {
    return { x Int -> x + n }
}

fun main() {
    fmt.Println(add(3, 5))
    fmt.Println(double(21))
    fmt.Println(multiply(6, 7))

    greet("World")
    greetWith("Alice")
    greetWith(name: "Bob", greeting: "Hi")

    fmt.Println(sum(1, 2, 3, 4, 5))

    val result = apply(10) { it * 3 }
    fmt.Println(result)

    val addFive = makeAdder(5)
    fmt.Println(addFive(10))
}
