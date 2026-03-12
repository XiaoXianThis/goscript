package main

import "fmt"

fun classify(x Int) -> String {
    // if 表达式
    val sign = if x > 0 { "positive" } else if x < 0 { "negative" } else { "zero" }
    return sign
}

fun grade(score Int) -> String {
    // when 无参数形式（替代 if-else 链）
    return when {
        score >= 90 -> "A"
        score >= 80 -> "B"
        score >= 70 -> "C"
        score >= 60 -> "D"
        else -> "F"
    }
}

fun dayName(day Int) -> String {
    // when 有参数形式（替代 switch）
    return when day {
        1 -> "Monday"
        2 -> "Tuesday"
        3 -> "Wednesday"
        4 -> "Thursday"
        5 -> "Friday"
        6, 7 -> "Weekend"
        else -> "Invalid"
    }
}

fun main() {
    // if / else
    val x = 42
    if x > 0 {
        fmt.Println("$x is positive")
    }

    fmt.Println(classify(10))
    fmt.Println(classify(-5))
    fmt.Println(classify(0))

    // for-in 遍历数组
    val fruits = ["apple", "banana", "cherry"]
    for fruit in fruits {
        fmt.Println(fruit)
    }

    // for-in 带 index
    for i, fruit in fruits {
        fmt.Println("$i: $fruit")
    }

    // for-in 区间
    for i in 0..<5 {
        fmt.Print("$i ")
    }
    fmt.Println()

    for i in 1..=5 {
        fmt.Print("$i ")
    }
    fmt.Println()

    // C 风格 for
    for let i = 0; i < 5; i++ {
        fmt.Print("$i ")
    }
    fmt.Println()

    // 条件循环
    let countdown = 5
    for countdown > 0 {
        fmt.Print("$countdown ")
        countdown--
    }
    fmt.Println("Go!")

    // break / continue / 标签
    outer: for let i = 0; i < 3; i++ {
        for let j = 0; j < 3; j++ {
            if i == 1 && j == 1 { break outer }
            fmt.Println("($i, $j)")
        }
    }

    // when
    fmt.Println(grade(95))
    fmt.Println(grade(73))
    fmt.Println(dayName(5))
    fmt.Println(dayName(6))
}
