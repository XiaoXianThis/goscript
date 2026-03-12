package main

import "fmt"

fun main() {
    // 基本 Lambda
    val double = { x Int -> x * 2 }
    val sum = { a Int, b Int -> a + b }
    fmt.Println(double(5))
    fmt.Println(sum(3, 4))

    // 隐式参数 it
    val nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    val evens = nums.filter { it % 2 == 0 }
    fmt.Println(evens)

    val doubled = nums.map { it * 2 }
    fmt.Println(doubled)

    nums.forEach { fmt.Println(it) }

    // 尾随 Lambda
    val total = nums.fold(0) { acc, item -> acc + item }
    fmt.Println("Sum: $total")

    // 方法链
    val result = [1, 2, 3, 4, 5]
        .filter { it > 2 }
        .map { it * it }
        .sum()
    fmt.Println("Sum of squares: $result")

    // 闭包捕获外部变量
    let counter = 0
    val increment = { ->
        counter++
        counter
    }
    fmt.Println(increment())  // 1
    fmt.Println(increment())  // 2
    fmt.Println(increment())  // 3

    // 嵌套 Lambda — 内层用 it，外层用显式参数名
    val nested = [[1, 2], [3, 4], [5, 6]]
    val flattened = nested.map { inner ->
        inner.filter { it > 2 }
    }
    fmt.Println(flattened)

    // Lambda 中的 return（只退出 Lambda，不退出外层函数）
    val processed = nums.map {
        if it < 0 { return 0 }
        return it * 2
    }
    fmt.Println(processed)

    // 函数类型变量
    let transform (Int) -> Int = { x Int -> x * 3 }
    fmt.Println(transform(10))

    // 替换 Lambda
    transform = { x Int -> x + 100 }
    fmt.Println(transform(10))

    // 自调用闭包 (IIFE)
    val greeting = {
        val hour = 14
        if hour < 12 { "Good morning" } else { "Good afternoon" }
    }()
    fmt.Println(greeting)
}
