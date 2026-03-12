package main

import "fmt"

// ===== 简单枚举 =====
enum Color {
    Red
    Green
    Blue
}

// ===== Distinct Type =====
type UserID = Int64
type Meters = Float64
type Seconds = Float64

// ===== 字面量类型 =====
type Direction = "north" | "south" | "east" | "west"

// ===== 联合类型 =====
type JsonValue = String | Int | Float | Bool | JsonValue[] | Map<String, JsonValue>

// ===== 结构类型（值语义） =====
type Point = { x Float, y Float }
type Size = { width Float, height Float }

// ===== 交叉类型 =====
type Rect = Point & Size

// ===== type 方法（扩展方法） =====
fun Point.distanceTo(other Point) -> Float {
    val dx = x - other.x
    val dy = y - other.y
    return Math.sqrt(dx * dx + dy * dy)
}

fun Point.toString() -> String = "($x, $y)"

// ===== class vs type 演示 =====
class MutableCounter {
    private count Int = 0

    fun increment() { count++ }
    fun get() -> Int = count
}

type ImmutablePoint = { x Float, y Float, z Float }

fun main() {
    // 枚举
    let c = Color.Red
    val name = when c {
        Color.Red -> "Red"
        Color.Green -> "Green"
        Color.Blue -> "Blue"
    }
    fmt.Println("Color: $name")

    // Distinct Type — 不能隐式互换
    let id UserID = UserID(42)
    let distance Meters = Meters(100.5)
    let duration Seconds = Seconds(3.14)
    // let wrong Meters = duration  // 编译错误！Meters ≠ Seconds
    fmt.Println("ID: $id, Distance: $distance, Duration: $duration")

    // 类型转换
    let raw Int64 = Int64(id)
    fmt.Println("Raw ID: $raw")

    // 字面量类型
    let dir Direction = "north"
    fmt.Println("Direction: $dir")

    // 结构类型（值语义）
    let p1 = Point(x: 1.0, y: 2.0)
    let p2 = p1     // 值拷贝
    p2.x = 10.0
    fmt.Println("p1: ${p1.toString()}")  // (1, 2) — 不受 p2 影响
    fmt.Println("p2: ${p2.toString()}")  // (10, 2)

    // type 方法
    val origin = Point(x: 0.0, y: 0.0)
    val target = Point(x: 3.0, y: 4.0)
    fmt.Println("Distance: ${origin.distanceTo(target)}")  // 5.0

    // 联合类型
    fun printJson(v JsonValue) {
        when v {
            is String -> fmt.Println("String: $v")
            is Int -> fmt.Println("Int: $v")
            is Float -> fmt.Println("Float: $v")
            is Bool -> fmt.Println("Bool: $v")
            else -> fmt.Println("Complex type")
        }
    }
    printJson("hello")
    printJson(42)
    printJson(3.14)

    // class（引用语义） vs type（值语义）
    let counter = MutableCounter()
    counter.increment()
    counter.increment()
    counter.increment()
    fmt.Println("Counter: ${counter.get()}")

    let pt = ImmutablePoint(x: 1.0, y: 2.0, z: 3.0)
    fmt.Println("3D Point: (${pt.x}, ${pt.y}, ${pt.z})")
}
