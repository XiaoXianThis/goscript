package main

import "fmt"

// 接口定义
interface Shape {
    area() -> Float
    perimeter() -> Float
}

interface Printable {
    toString() -> String
}

// 接口组合
interface PrintableShape: Shape, Printable {}

// 类隐式实现接口
class Circle(radius Float) {
    fun area() -> Float = 3.14159 * radius * radius
    fun perimeter() -> Float = 2.0 * 3.14159 * radius
    fun toString() -> String = "Circle(r=$radius)"
}

class Rectangle(width Float, height Float) {
    fun area() -> Float = width * height
    fun perimeter() -> Float = 2.0 * (width + height)
    fun toString() -> String = "Rect(${width}x${height})"
}

// 使用接口类型作为参数
fun printShapeInfo(s Shape) {
    fmt.Println("Area: ${s.area()}, Perimeter: ${s.perimeter()}")
}

// 使用 when + is 进行类型分支
fun describe(s Shape) -> String {
    return when s {
        is Circle -> "A circle with area ${s.area()}"
        is Rectangle -> "A rectangle with area ${s.area()}"
        else -> "Unknown shape"
    }
}

// 匿名实现
fun createGreeter(msg String) -> Printable {
    return object Printable {
        fun toString() -> String = msg
    }
}

fun main() {
    val shapes Shape[] = [
        Circle(radius: 5.0),
        Rectangle(width: 3.0, height: 4.0),
    ]

    for shape in shapes {
        printShapeInfo(shape)
        fmt.Println(describe(shape))
    }

    // 接口类型变量
    let s Shape = Circle(radius: 10.0)
    fmt.Println("Circle area: ${s.area()}")

    // 类型检查
    if s is Circle {
        fmt.Println("Radius: ${s.radius}")
    }

    // 匿名实现
    val greeter = createGreeter("Hello from anonymous!")
    fmt.Println(greeter.toString())
}
