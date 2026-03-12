package main

import "fmt"

// 泛型函数
fun first<T>(items T[]) -> T? {
    if items.length == 0 {
        return null
    }
    return items[0]
}

fun mapSlice<T, U>(items T[], transform (T) -> U) -> U[] {
    let result = U[]()
    for item in items {
        result.push(transform(item))
    }
    return result
}

fun filterSlice<T>(items T[], predicate (T) -> Bool) -> T[] {
    let result = T[]()
    for item in items {
        if predicate(item) {
            result.push(item)
        }
    }
    return result
}

// 泛型 type（值语义）
type Pair<A, B> = {
    first A
    second B
}

fun Pair<A, B>.toString() -> String {
    return "(${first}, ${second})"
}

// 泛型 class（引用语义）
class Stack<T> {
    private items T[] = T[]()

    fun push(item T) {
        items.push(item)
    }

    fun pop() -> T? {
        if items.length == 0 {
            return null
        }
        return items.removeLast()
    }

    fun peek() -> T? {
        if items.length == 0 {
            return null
        }
        return items[items.length - 1]
    }

    fun isEmpty() -> Bool = items.length == 0

    fun size() -> Int = items.length
}

// 泛型约束
interface Comparable<T> {
    compareTo(other T) -> Int
}

fun maxOf<T Comparable<T>>(a T, b T) -> T {
    return if a.compareTo(b) > 0 { a } else { b }
}

// 嵌套泛型
class Box<T>(value T) {
    fun get() -> T = value

    fun map<U>(f (T) -> U) -> Box<U> {
        return Box<U>(value: f(value))
    }
}

fun main() {
    // 泛型函数
    val nums = [10, 20, 30]
    val names = ["Alice", "Bob"]
    fmt.Println(first(nums))      // 10
    fmt.Println(first(names))     // "Alice"
    fmt.Println(first(Int[]()))   // null

    // mapSlice
    val doubled = mapSlice(nums) { it * 2 }
    fmt.Println(doubled)

    // filterSlice
    val longNames = filterSlice(names) { it.length > 3 }
    fmt.Println(longNames)

    // 泛型 Pair
    val p = Pair(first: "age", second: 30)
    fmt.Println(p.toString())
    fmt.Println(p.first)

    // 泛型 Stack
    let stack = Stack<Int>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    fmt.Println(stack.peek())   // 3
    fmt.Println(stack.pop())    // 3
    fmt.Println(stack.pop())    // 2
    fmt.Println(stack.size())   // 1

    // 嵌套泛型 Box.map
    val box = Box(value: 42)
    val strBox = box.map { "$it" }
    fmt.Println(strBox.get())   // "42"

    // 嵌套泛型类型参数
    let m Map<String, Stack<Int>> = Map<String, Stack<Int>>()
    let s = Stack<Int>()
    s.push(100)
    m["data"] = s
    fmt.Println(m["data"]?.peek())
}
