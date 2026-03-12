package main

import "fmt"

fun main() {
    // 可变变量
    let x = 10
    let y = "hello"
    x = 20

    // 不可变变量
    val PI = 3.14159
    val name = "GoScript"

    // 显式类型标注
    let age Int = 25
    let pi Float = 3.14
    let flag Bool = true
    let ch Char = 'A'

    // 可空类型
    let nickname String? = null
    let count Int? = 42

    fmt.Println("x = $x, y = $y")
    fmt.Println("PI = $PI, name = $name")
    fmt.Println("age = $age, pi = $pi, flag = $flag, ch = $ch")
    fmt.Println("nickname = $nickname, count = $count")
}
