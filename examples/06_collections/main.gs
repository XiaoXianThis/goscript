package main

import "fmt"

fun main() {
    // ===== 数组 / 切片 =====

    // 字面量
    let numbers = [1, 2, 3, 4, 5]
    fmt.Println(numbers)

    // 显式类型
    let names String[] = ["Alice", "Bob", "Charlie"]

    // 空数组
    let empty = Int[]()

    // 预分配容量
    let buffer = Int[](capacity: 100)

    // 操作
    numbers.push(6)
    fmt.Println(numbers)
    fmt.Println(numbers.length)
    fmt.Println(numbers[0])

    // 切片
    let sub = numbers[1..3]
    fmt.Println(sub)

    // 遍历
    for i, name in names {
        fmt.Println("$i: $name")
    }

    // ===== Map =====

    // Map 字面量
    let scores = #{"Alice": 95, "Bob": 87, "Charlie": 72}
    fmt.Println(scores)

    // 空 Map
    let cache = Map<String, Int>()

    // 操作
    scores["Dave"] = 88
    val aliceScore = scores["Alice"] ?? 0
    fmt.Println("Alice: $aliceScore")

    // 检查 key 是否存在
    if scores.containsKey("Bob") {
        fmt.Println("Bob is in the map")
    }

    // 删除
    scores.remove("Charlie")

    // 遍历 Map
    for key, value in scores {
        fmt.Println("$key -> $value")
    }

    // ===== Set =====

    let colors = setOf("red", "green", "blue")
    fmt.Println(colors.contains("red"))
    fmt.Println(colors.contains("yellow"))

    // ===== 方法链 =====

    val result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        .filter { it > 3 }
        .map { it * it }
        .sum()
    fmt.Println("Sum of squares (>3): $result")
}
