package main

import "fmt"

class Address(city String, zip String?)

class User(name String, age Int, address Address?)

fun main() {
    // 可空类型
    let name String? = "Alice"
    let empty String? = null

    // 可选链
    fmt.Println(name?.length)    // 5
    fmt.Println(empty?.length)   // null

    // 空值合并
    val displayName = name ?? "Anonymous"
    val displayEmpty = empty ?? "No name"
    fmt.Println(displayName)     // "Alice"
    fmt.Println(displayEmpty)    // "No name"

    // 非空断言
    val len = name!.length
    fmt.Println("Name length: $len")

    // 深层可选链
    val user1 = User(
        name: "Bob",
        age: 30,
        address: Address(city: "Shanghai", zip: "200000"),
    )
    val user2 = User(name: "Charlie", age: 25, address: null)

    // user1 有 address，user2 没有
    fmt.Println(user1.address?.city)           // "Shanghai"
    fmt.Println(user2.address?.city)           // null
    fmt.Println(user2.address?.city ?? "Unknown")  // "Unknown"

    // zip 本身也是可空的
    fmt.Println(user1.address?.zip ?? "N/A")   // "200000"

    // 后缀优先级
    let items Int?[] = [1, null, 3, null, 5]  // 元素可空的数组
    for item in items {
        fmt.Print("${item ?? 0} ")
    }
    fmt.Println()

    let arr Int[]? = null   // 可空的数组
    fmt.Println(arr?.length ?? 0)

    // 智能转型
    fun printLength(x Any) {
        if x is String {
            fmt.Println("String length: ${x.length}")
        } else if x is Int {
            fmt.Println("Int value: $x")
        } else {
            fmt.Println("Unknown type")
        }
    }

    printLength("hello")
    printLength(42)
    printLength(true)

    // when + is 智能转型
    fun describe(x Any) -> String {
        return when x {
            is String -> "String of length ${x.length}"
            is Int -> "Int: $x"
            is Bool -> "Bool: $x"
            is User -> "User: ${x.name}"
            else -> "Unknown"
        }
    }

    fmt.Println(describe("test"))
    fmt.Println(describe(123))
    fmt.Println(describe(user1))
}
