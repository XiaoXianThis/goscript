package main

import "fmt"

fun main() {
    val name = "GoScript"
    val version = 1
    val pi = 3.14159

    // 字符串插值
    val greeting = "Hello, $name!"
    val info = "Version: ${version + 1}, PI ≈ ${pi}"
    fmt.Println(greeting)
    fmt.Println(info)

    // 转义序列
    val escaped = "line1\nline2\ttab"
    fmt.Println(escaped)

    // 字面 $ 符号
    val price = "Price: \$9.99"
    fmt.Println(price)

    // 原始字符串（反引号，不插值不转义）
    val raw = `SELECT * FROM users WHERE name = 'Alice'`
    fmt.Println(raw)

    val multiline = `
        {
            "name": "GoScript",
            "version": 1
        }
    `
    fmt.Println(multiline)

    // 字符串方法
    val s = "  Hello, World!  "
    fmt.Println(s.trim())
    fmt.Println(s.uppercase())
    fmt.Println(s.lowercase())
    fmt.Println(s.contains("World"))
    fmt.Println(s.replace("World", "GoScript"))

    val csv = "a,b,c,d"
    val parts = csv.split(",")
    fmt.Println(parts)
    fmt.Println(csv.length)
}
