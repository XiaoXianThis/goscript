# GoScript 语言特性文档

GoScript 是一门转译到Go的语言，这篇文档演示/定义了 GoScript 的语法。

---

## 目录

1. [变量与常量](#1-变量与常量)
2. [基本数据类型](#2-基本数据类型)
3. [运算符](#3-运算符)
4. [字符串](#4-字符串)
5. [控制流](#5-控制流)
6. [函数](#6-函数)
7. [闭包 / Lambda](#7-闭包--lambda)
8. [结构体 / 类](#8-结构体--类)
9. [接口 / Trait](#9-接口--trait)
10. [枚举](#10-枚举)
11. [泛型](#11-泛型)
12. [集合类型](#12-集合类型)
13. [错误处理](#13-错误处理)
14. [模式匹配](#14-模式匹配)
15. [并发](#15-并发)
16. [模块与导入](#16-模块与导入)
17. [类型系统增强](#17-类型系统增强)
18. [运算符重载](#18-运算符重载)
19. [属性 / 装饰器](#19-属性--装饰器)
20. [解构赋值](#20-解构赋值)
21. [区间与范围](#21-区间与范围)
22. [管道 / 链式调用](#22-管道--链式调用)
23. [可选链 / 空值安全](#23-可选链--空值安全)
24. [字符串插值 / 模板](#24-字符串插值--模板)
25. [多返回值](#25-多返回值)
26. [延迟执行 / 资源管理](#26-延迟执行--资源管理)
27. [注释与文档](#27-注释与文档)
28. [测试支持](#28-测试支持)
29. [宏 / 元编程](#29-宏--元编程)
30. [异步 / Await](#30-异步--await)
31. [类型别名与新类型](#31-类型别名与新类型)
32. [扩展方法](#32-扩展方法)
33. [内存管理](#33-内存管理)
34. [条件编译 / 编译指令](#34-条件编译--编译指令)

---


## 1. 变量与常量

### 1.1 可变变量

```GoScript
let x = 10
```

### 1.2 不可变变量 / 常量

```GoScript
val PI = 3.14
val max = 9999
```

### 1.3 类型推断 vs 显式类型标注

```GoScript
// 推断
let x = 10
// 显式
let x Int = 10
```


## 2. 基本数据类型

### 2.1 整数


```GoScript
// Int, Int8, Int16, Int32, Int64, UInt, UInt8...
let x Int16 = 100
```

### 2.2 浮点数

```GoScript
// Float, Float64
let x Float = 3.123
```

### 2.3 布尔

```GoScript
// Bool
let x Bool = false
```

### 2.4 字符

```GoScript
let x Char = 'a'
```

### 2.5 空值

```GoScript
let x Char? = null
```


## 3. 运算符

### 3.1 算术运算符

```GoScript
a + b    // 加
a - b    // 减
a * b    // 乘
a / b    // 除
a % b    // 取模
```

### 3.2 比较运算符

```GoScript
a == b   a != b
a < b    a > b
a <= b   a >= b
```

### 3.3 逻辑运算符

```GoScript
a && b   // AND
a || b   // OR
!a       // NOT
```

### 3.4 位运算符

```GoScript
a & b    // AND
a | b    // OR
a ^ b    // XOR
a << n   // 左移
a >> n   // 右移
```

### 3.5 赋值运算符

```GoScript
x += 1
x -= 1
x *= 2
x++
x--
```

## 4. 字符串

### 4.1 字符串拼接

```GoScript
let s = "Hello $name! You are ${age + 1} years old."
```

### 4.3 原始字符串 / 多行字符串

```GoScript
let s = ` line1
    line2
other line...
`
```

### 4.4 字符串方法

```GoScript
// 成员方法风格
s.contains("hello")
s.split(",")
s.uppercase()
s.length
```

## 5. 控制流

### 5.1 If / Else

```GoScript
// 括号可选，括号来自表达式而不是if语句
if x>0 {
    a = 1
} else if (x<0) {
    a = 2
} else {
    a = 3
}

// if 也是表达式
val msg = if (x > 0) "positive" else "negative"

```

### 5.2 For 循环

for是唯一的循环关键字，没有其他循环方式

```GoScript
for i=0; i<10; i++ { }

for i in items { }

// 条件循环
for condition { }

// 无限循环
for { }
```

### 5.4 When

```GoScript
val result = when x {
    1 -> "one"
    2, 3 -> "two or three"
    else -> "other"
}
```


### 5.5 Break / Continue / 标签

```GoScript
outer: for i := 0; i < 10; i++ {
    for j := 0; j < 10; j++ {
        if j == 5 { break outer }
    }
}
```

## 6. 函数

### 6.1 基本函数定义

```GoScript
// 返回类型自动推断为 Int
fun add(a Int, b Int) {
    return a + b
}
// 单表达式
fun add(a Int, b Int) = a + b
fun add(a Int, b Int) Int = a + b
```

### 6.2 默认参数

```GoScript
fun greet(name String, greeting String = "Hello") {
    return "$greeting, $name!"
}
```

### 6.3 命名参数

```GoScript
greet( name: "Alice", greeting: "Hi")
```

### 6.4 可变参数

```GoScript
fun sum(nums ...Int) Int = nums.sum()
```

### 6.5 函数作为一等公民 / 高阶函数

```GoScript
fun add(a Int, b Int) Int = a + b
// 完整写法
let add2 (Int, Int)->Int = add
// 自动推断类型
let add3 = add
```

## 7. 闭包 / Lambda

```GoScript
// 类似 Kotlin 写法
val double = { x: Int -> x * 2 }
items.filter { it > 3 }
items.map { it * 2 }
```

## 8. 结构体 / 类
在GoScript中只有类，没有结构体，或者说结构体就是类。
语法和 Kotlin 接近。
### 8.1 类定义

```GoScript
class Person(
    name String,
    age Int,
    weight Float?,  // 支持可空类型
)
// 实例化
let p = Person (
    name: "Tom",
    age: 10,
    // weight 可不填
)
```

### 8.2 方法

```GoScript
class Person(name String, age Int) {
    // 方法写在类里面
    fun greet() {
        // 访问内部变量不需要加 this
        return "hello, $name"
    }
}

// 方法写在类外面
fun Person.greet() {
    return "hello, $name"
}
```

### 8.3 构造函数

```GoScript
// 主构造函数
class Person (
    name String,
    age Int,
)

// 次构造函数 constructor，适用于需要多个构造方法的类
class Person {
    name String         // 非空类型必填
    age Int = 0        // 支持默认值
    weight Float?       // 支持可空类型
    
    constructor() {
        this.name = "None"
        this.age = 0
    }
    
    constructor(name String, age Int, weight Float?) {
        this.name = name
        this.age = age
        this.weight = weight
    }
}

// 如果有 init 代码块，将在构造之后被执行
class Person(name String, age Int){
    init {
        
    }
}
```


### 8.4 继承 / 嵌入

```GoScript
class Employee( 
    person Person,  // 嵌入
    company String,
)
```

### 8.5 可见性 / 访问控制

```GoScript
class Person(
    name String,        // 默认公开
    private age Int,    // 添加 private 则为私有
)
```

## 9. 接口 / type

### 9.1 接口定义

和 TypeScript 类似

```GoScript
// 接口
inf Dog {
    name String
    age Int
    jump ()->Void  // 函数
}

// 接口实现
let dog = object Dog {
    name: "Cutyy",
    age: 2,
    jump: {
        print("$name is jumping.")
    },
}

```

### 9.2 默认实现

不支持

### 9.3 接口组合 / 继承

```GoScript

inf A {
    valueA String
}

inf B {
    valueB Float
}

inf C -> A {
    valueC Int
}

inf D -> A, B {
    valueD Int
}
```

### 9.4 type

```GoScript
// 定义类型
type User = {
    name: String
    points: Int
}

// 使用类型
let user = object User {
    name: "Alice",
    points: 100,
}

// 组合类型
type Number = Int | Float
```

## 10. 枚举

### 10.1 简单枚举

```GoScript
enum Color {
    Red
    Green
    Blue
}
```

### 10.2 关联值枚举 / 代数数据类型

不支持


## 11. 泛型

### 11.1 泛型函数

```GoScript
fun map<T,U>(items T[], callback (T)->U) U[] {
    let result = array<U>(12)
    for item, index in items {
        reslut[i] = callback(item)
    }
    return result
}
```

### 11.2 泛型类型

```GoScript
type Stack<T> = {
    items T[]
}

fun Stack<T>.push(item T) {
    items.push(item)
}
fun Stack<T>.pop() T {  }
```

### 11.3 泛型约束

```GoScript
type Number = Int | Float

fun Sum<T Number>(items T) T { }

```

## 12. 集合类型

### 12.1 数组 / 切片

```GoScript
let list = [1,2,3]                          // 类型推断
let list Int[] = listOf<Int[]> [1,2,3]      // 完整写法
```

### 12.2 Map / 字典

```GoScript
val m = {"a": 1, "b": 2}
m["c"] = 3

let m Map<String, Int> = mapOf<String, Int> { "a": 1, "b": 2 }
```

### 12.3 Set

```GoScript
val set = setOf [1, 2, 3]

val set Set<Int> = setOf<Int> [1, 2, 3]
```

### 12.4 元组

不支持

## 13. 错误处理

```GoScript

fun divide(a Float, b Float) Float {
    if b == 0 {
        throw "division by zero"
    }
    return a / b
}
let result = divide(10, 0)   // 不处理 (向外传递)
let result = divide(10, 0) { err -> print("出现错误：$err") }     // 使用闭包处理

// 使用自定义函数处理
fun onError(err: Any) { print(err) }
let result = divide(10, 0) catch onError
```

## 14. 模式匹配

### 14.1 基本模式匹配

```GoScript
val result = when x {
    1 -> print("one")
    2, 3 -> print("two or three")
    is String -> print("string: $value")
    else -> print("other")
}
```

### 14.2 解构模式

不支持

### 14.3 If-let / While-let

不支持

## 15. 并发

### 15.1 Goroutine / 协程

```GoScript
go {
    print("running concurrently")
}
```

### 15.2 Channel
```GoScript

let ch = channelOf<Int>         // 无缓冲
let ch = channelOf<Int> 3      // 有缓冲
ch send 123              // 发送
let value = recv ch     // 接收

```

### 15.3 Mutex / 同步原语

参考 Kotlin 实现



## 16. 模块与导入

### 16.1 包 / 模块声明

```GoScript
package main
package utils
```

### 16.2 导入

```GoScript
import "os"                 // 导入
import f "fmt"              // 别名
import { Println } "fmt"      // 按需导入
import { Println print, Sprintf sprintf } "fmt"      // 按需导入 + 别名
```

### 16.3 调用 Go 标准库 / 第三方库

这是 GoScript 的核心需求。需要设计如何无缝调用 Go 的任意库。

```GoScript
// 直接映射Go库
import "fmt"
import "net/http"

fmt.Println("Hello")
http.ListenAndServe(":8080", null)

// 同时支持按需导入 和 别名
import { Println print } "fmt"
import { ListenAndServe } "net/http"

print("hello")
ListenAndServe(":8080", null)
```


## 17. 类型系统增强

### 17.1 联合类型

```GoScript
type StringOrNumber = String | Number
fun process(x StringOrNumber) { }
```

### 17.2 交叉类型

```GoScript
type Named = { name: String }
type Aged = { age: Number }
type Person = Named & Aged
```

### 17.3 类型守卫 / 类型断言

```GoScript
if typeof x === "String" { }
if x is Person { }
// 自定义类型守卫
fun isString(x unknown) Bool {
    return typeof x === "String"
}
```

### 17.4 字面量类型

```GoScript
type Direction = "north" | "south" | "east" | "west"
```


### 17.5 Never / Bottom 类型

```GoScript
fun fail(msg string) Never {
    throw Error(msg)
}
```


## 18. 运算符重载

不支持


## 19. 属性 / 装饰器

不支持

## 20. 解构赋值

```GoScript
let { name, age } = person
let [first, ...rest] = array
let { a renamedA, b renamedB } = obj
```


## 21. 区间与范围

不支持

## 22. 管道 / 链式调用

### 22.1 管道运算符

不支持

### 22.2 方法链

```GoScript
[1,2,3,4,5]
    .filter { it > 2 }
    .map { it * it }
    .sum()
```


## 23. 可选链 / 空值安全

### 23.1 可空类型

```GoScript
let name String? = null
val len = name?.length          // 可选链
val len = name?.length || 0     // 默认值
val len = name!.length          // 强制非空
```


### 23.2 可选链方法调用

```GoScript
user?.address?.city?.uppercase()
```

## 24. 字符串插值 / 模板
（与第 4 节部分重叠，此处侧重更复杂的用法）

```GoScript
val s = "Name: $name, Next year: ${age + 1}"
val s = `
    |SELECT *
    |FROM users
    |WHERE age > $minAge
`
```


## 25. 多返回值

GoScript 不支持多值返回，如果需要返回多个值，使用数组，或者解构运算符。

```GoScript
fun getInfo() {
    let x = 1
    let y = 2
    return [x, y]
}
let [x, y] = getInfo()

fun getInfo() {
    return {
        x: 10,
        y: 20,
    }
}
let { x, y } = getInfo()

// 和 Golang 多值返回兼容，返回 error 给到 catch
let [file] = os.Open(path)
let [file] = os.Open(path)
```

## 26. 延迟执行 / 资源管理

### 26.1 Defer

```GoScript
let [f] = os.Open(path) catch { err -> print(err) } 
defer { f.Close() }
// 使用 f...
```


### 26.2 RAII / 自动释放

不支持，交给Go语言/GC处理

### 26.3 Using / With

```GoScript
File("test.txt").bufferedReader().use { reader ->
    reader.readLine()
}
```

## 27. 注释与文档

### 27.1 单行注释

```GoScript
// a / b / c / d
// 这是单行注释
```

### 27.2 多行注释

```GoScript
/*  多行
    注释 */
```

### 27.3 文档注释

```GoScript
// Kotlin — KDoc
/**
 * 计算两个数的和
 * @param a 第一个数
 * @param b 第二个数
 * @return 两数之和
 */
 
fun add(a Int, b Int) Int = a + b
```


## 28. 测试支持

### 28.1 内置测试

不支持

### 28.2 断言

不支持，使用社区库

### 28.3 表驱动测试

不支持

## 29. 宏 / 元编程
GoScript 不支持元编程/宏相关语法
### 29.1 文本宏

不支持

### 29.2 过程宏 / 编译时代码生成

不支持

### 29.3 编译时求值

不支持


## 30. 异步 / Await

### 30.1 Async / Await

不支持

## 31. 类型别名与新类型

### 31.1 类型别名

不支持别名，只支持 distinct type。

### 31.2 新类型（distinct type）

```GoScript
// 类型定义（新类型）
type UserID = Int64       // 新类型，不能与 int64 隐式互换
type Meters = Float64
type Seconds = Float64
```

## 32. 扩展方法

不支持


## 33. 内存管理

### 33.1 指针

不支持

### 33.2 所有权 / 借用

不支持

### 33.3 智能指针

不支持


## 34. 条件编译 / 编译指令

### 34.1 构建标签

```GoScript
// 构建标签和 Golang 一样
//go:build linux && amd64

package main
```


### 34.2 条件编译

不支持


### 34.3 编译器指令

```GoScript
// 编译器指令和 Golang 一样
//go:generate stringer -type=Color
//go:embed static/*
let staticFiles embed.FS
//go:noinline
fun criticalFunc() { }
```

