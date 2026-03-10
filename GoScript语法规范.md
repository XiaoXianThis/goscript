# GoScript 语法规范

GoScript 是一门编译到 Go 的高级语言。本文档是 GoScript 的完整语法规范。

> **设计原则**：语法借鉴 Kotlin/Swift 的表达力，编译输出地道的 Go 代码，与 Go 生态无缝互操作。

---

## 目录

1. [变量与常量](#1-变量与常量)
2. [基本数据类型](#2-基本数据类型)
3. [运算符](#3-运算符)
4. [字符串](#4-字符串)
5. [控制流](#5-控制流)
6. [函数](#6-函数)
7. [闭包与 Lambda](#7-闭包与-lambda)
8. [类](#8-类)
9. [接口](#9-接口)
10. [类型定义](#10-类型定义)
11. [枚举](#11-枚举)
12. [泛型](#12-泛型)
13. [集合类型](#13-集合类型)
14. [空值安全](#14-空值安全)
15. [错误处理](#15-错误处理)
16. [模式匹配](#16-模式匹配)
17. [并发](#17-并发)
18. [模块与导入](#18-模块与导入)
19. [解构赋值](#19-解构赋值)
20. [延迟执行与资源管理](#20-延迟执行与资源管理)
21. [扩展方法](#21-扩展方法)
22. [注释与文档](#22-注释与文档)
23. [编译指令](#23-编译指令)
24. [不支持的特性](#24-不支持的特性)

---

## 1. 变量与常量

### 1.1 可变变量

```gos
let x = 10
let y = "hello"
```

### 1.2 不可变变量

```gos
val PI = 3.14159
val name = "GoScript"
```

`val` 声明后不可重新赋值。

### 1.3 显式类型标注

类型标注写在变量名后，用空格分隔（所有声明场景统一使用空格，不使用冒号）：

```gos
let x Int = 10
val msg String = "hello"
```

大多数情况下可省略类型，由编译器推断。

---

## 2. 基本数据类型

| GoScript 类型 | Go 映射 | 说明 |
|---------------|---------|------|
| `Int` | `int` | 平台相关整数 |
| `Int8` / `Int16` / `Int32` / `Int64` | `int8` ... | 固定宽度整数 |
| `UInt` / `UInt8` ... `UInt64` | `uint` ... | 无符号整数 |
| `Float` | `float32` | 32 位浮点 |
| `Float64` | `float64` | 64 位浮点 |
| `Bool` | `bool` | 布尔值 |
| `String` | `string` | 字符串 |
| `Char` | `rune` | Unicode 字符 |
| `Byte` | `byte` | 字节 |
| `Any` | `any` | 任意类型 |
| `Never` | — | 永不返回（见 §15） |

```gos
let age Int = 25
let pi Float64 = 3.14159
let flag Bool = true
let ch Char = 'A'
```

### 2.1 空值

可空类型用 `?` 后缀标记：

```gos
let name String? = null
let count Int? = null
```

非可空类型不能赋值为 `null`。详见 [§14 空值安全](#14-空值安全)。

---

## 3. 运算符

### 3.1 算术运算符

```gos
a + b    a - b    a * b    a / b    a % b
```

### 3.2 比较运算符

```gos
a == b   a != b
a < b    a > b
a <= b   a >= b
```

GoScript 是强类型语言，不存在宽松相等。只有 `==` 和 `!=`，没有 `===`。

### 3.3 逻辑运算符

```gos
a && b   // AND，操作数必须为 Bool
a || b   // OR，操作数必须为 Bool
!a       // NOT
```

`||` **仅用于** Bool 逻辑运算。空值合并使用 `??`（见 [§14](#14-空值安全)）。

### 3.4 位运算符

```gos
a & b    // AND
a | b    // OR
a ^ b    // XOR
a << n   // 左移
a >> n   // 右移
```

### 3.5 赋值运算符

```gos
x = 1
x += 1   x -= 1   x *= 2   x /= 2   x %= 2
x++      x--
```

### 3.6 类型检查运算符

```gos
x is String      // 类型检查，返回 Bool
x !is String     // 类型否定检查
```

没有 `typeof` 运算符。所有类型检查统一使用 `is`。

---

## 4. 字符串

### 4.1 普通字符串（支持插值和转义）

```gos
let s = "Hello $name! You are ${age + 1} years old."
let escaped = "line1\nline2\ttab"
```

- `$identifier` 插入变量值
- `${expression}` 插入表达式结果
- 支持 `\n` `\t` `\\` `\"` `\$` 等转义序列

### 4.2 原始字符串（不插值、不转义）

反引号字符串是纯原始字符串，与 Go 行为一致：

```gos
let raw = `SELECT * FROM users WHERE name = 'Alice'`
let multiline = `
    line 1
    line 2
    $this is literal text, not interpolation
`
```

反引号内的 `$` `\n` 等都是字面字符。

### 4.3 字符串方法

```gos
s.length
s.contains("hello")
s.split(",")
s.uppercase()
s.lowercase()
s.trim()
s.replace("old", "new")
```

---

## 5. 控制流

### 5.1 if / else

条件表达式的括号可选（因为 `{` 作为边界标记，解析器无歧义）：

```gos
if x > 0 {
    a = 1
} else if x < 0 {
    a = 2
} else {
    a = 3
}
```

**if 也是表达式**，作为表达式时分支必须用 `{ }`：

```gos
val msg = if x > 0 { "positive" } else { "negative" }

val result = if x > 100 {
    process(x)
    "big"
} else {
    "small"
}
```

### 5.2 for 循环

`for` 是唯一的循环关键字。

```gos
// for-in 遍历集合
for item in items { }

// for-in 同时获取 value 和 index（value 在前）
for item, index in items { }

// for-in 遍历 Map（value 在前，key 在后）
for value, key in myMap { }

// for-in 区间
for i in 0..<10 { }      // 0 到 9（不含 10）
for i in 0..=10 { }      // 0 到 10（含 10）

// C 风格 for（循环头内用 let 声明变量）
for let i = 0; i < 10; i++ { }

// 条件循环
for x > 0 { x-- }

// 无限循环
for { }
```

**for-in 规则**：
- 单变量时取 value
- 双变量时顺序为 `value, index`（数组）或 `value, key`（Map）
- 用 `_` 忽略不需要的值：`for _, index in items { }`
- for-in 的循环变量是不可变的（相当于 `val`）
- C 风格 for 的循环变量是可变的（因为需要 `i++`）

### 5.3 when

`when` 用于模式匹配和条件表达式，替代 switch：

```gos
// 有参数形式 — 匹配值
val result = when x {
    1 -> "one"
    2, 3 -> "two or three"
    is String -> "string: $x"    // x 自动窄化为 String
    else -> "other"
}

// 无参数形式 — 条件分支（替代三元运算符和 if-else 链）
val msg = when {
    x > 0 -> "positive"
    x < 0 -> "negative"
    else -> "zero"
}
```

`when` 既是语句也是表达式。作为表达式时必须有 `else` 分支。

### 5.4 break / continue / 标签

```gos
outer: for let i = 0; i < 10; i++ {
    for let j = 0; j < 10; j++ {
        if j == 5 { break outer }
        if j == 3 { continue }
    }
}
```

---

## 6. 函数

### 6.1 基本定义

返回类型用 `->` 分隔（解决函数体 `{` 与结构类型 `{` 的歧义）：

```gos
fun add(a Int, b Int) -> Int {
    return a + b
}

// 省略返回类型（编译器推断）
fun add(a Int, b Int) {
    return a + b
}

// 无返回值
fun greet(name String) {
    print("Hello, $name")
}
```

### 6.2 单表达式函数

```gos
fun add(a Int, b Int) -> Int = a + b
fun double(x Int) = x * 2
```

### 6.3 默认参数

```gos
fun greet(name String, greeting String = "Hello") {
    print("$greeting, $name!")
}
```

### 6.4 命名参数

```gos
greet(name: "Alice", greeting: "Hi")
```

### 6.5 可变参数

```gos
fun sum(nums ...Int) -> Int = nums.sum()
```

### 6.6 函数类型与高阶函数

函数类型写法：`(参数类型) -> 返回类型`

```gos
// 无返回值的函数类型
let callback () -> () = { print("done") }

// 有参数有返回值
let transform (Int) -> Int = { x Int -> x * 2 }

// 函数作为参数
fun apply(x Int, f (Int) -> Int) -> Int = f(x)

// 函数赋值
fun add(a Int, b Int) -> Int = a + b
let f = add
let g (Int, Int) -> Int = add
```

函数类型中，无返回值用 `()` 表示。函数声明中，无返回值直接省略 `-> ReturnType`。

---

## 7. 闭包与 Lambda

### 7.1 Lambda 表达式

Lambda 使用 `{ 参数 -> 函数体 }` 语法。参数类型标注用空格：

```gos
val double = { x Int -> x * 2 }
val sum = { a Int, b Int -> a + b }
```

### 7.2 隐式参数 `it`

单参数 Lambda 可以省略参数声明，用 `it` 引用：

```gos
items.filter { it > 3 }
items.map { it * 2 }
names.forEach { print(it) }
```

**嵌套规则**：嵌套 Lambda 中 `it` 指向最内层 Lambda 的参数。嵌套时建议使用显式参数名避免歧义：

```gos
items.map { item ->
    item.children.filter { it.age > 10 }
}
```

### 7.3 尾随 Lambda

当函数的最后一个参数是函数类型时，Lambda 可以写在括号外面：

```gos
items.filter { it > 3 }
items.map { it * it }
items.fold(0) { acc, item -> acc + item }
```

### 7.4 方法链

```gos
[1, 2, 3, 4, 5]
    .filter { it > 2 }
    .map { it * it }
    .sum()
```

---

## 8. 类

GoScript 中结构体和类是同一概念，统一用 `class` 关键字。

### 8.1 主构造函数

```gos
class Person(
    name String,
    age Int,
    weight Float?,
)

let p = Person(name: "Tom", age: 10)
```

### 8.2 类体与方法

```gos
class Person(name String, age Int) {
    fun greet() -> String {
        return "hello, $name"
    }

    fun isAdult() -> Bool = age >= 18
}
```

方法内部直接访问字段，不需要 `this`。有歧义时用 `this.field` 显式指定。

### 8.3 字段可变性

类字段默认可变。用 `val` 标记不可变字段：

```gos
class User {
    name String          // 可变（默认）
    val id Int           // 不可变，构造后不能修改
    private age Int      // 可变 + 私有
}
```

### 8.4 次构造函数

需要多个构造方式时，使用 `constructor`：

```gos
class Person {
    name String
    age Int = 0
    weight Float?

    constructor() {
        this.name = "None"
    }

    constructor(name String, age Int) {
        this.name = name
        this.age = age
    }
}
```

### 8.5 init 块

主构造函数之后执行的初始化逻辑：

```gos
class Person(name String, age Int) {
    init {
        if age < 0 { panic("age cannot be negative") }
    }
}
```

### 8.6 嵌入（组合）

嵌入使用匿名字段语法。嵌入类型的方法自动提升（与 Go embedding 一致）：

```gos
class Employee(
    Person,          // 嵌入：Person 的方法自动提升
    company String,
)

let emp = Employee(
    Person: Person(name: "Alice", age: 30),
    company: "Acme",
)
emp.greet()          // 调用 Person.greet()，自动提升
emp.Person.name      // 显式访问嵌入字段
```

非匿名字段只是普通字段，没有方法提升：

```gos
class Employee(
    person Person,    // 普通字段，不提升
    company String,
)
emp.person.greet()   // 必须通过 person 访问
```

### 8.7 可见性

```gos
class Person(
    name String,         // 默认公开
    private age Int,     // 私有
)
```

- 无修饰符：公开（包外可访问，编译到 Go 时首字母大写）
- `private`：仅包内可访问（编译到 Go 时首字母小写）

### 8.8 实例化

所有命名类型统一使用 `TypeName(field: value)` 语法实例化：

```gos
let p = Person(name: "Tom", age: 10)

// 按位置传参（如果类型定义了参数顺序）
let p = Person("Tom", 10)
```

---

## 9. 接口

接口定义行为契约，编译为 Go interface。使用 `interface` 关键字。

### 9.1 接口定义

接口只能包含方法签名，不能包含字段（与 Go interface 一致）：

```gos
interface Stringer {
    toString() -> String
}

interface ReadWriter {
    read(buf Byte[]) -> Int
    write(data Byte[]) -> Int
}
```

### 9.2 隐式实现

与 Go 一样，类只要实现了接口的所有方法，就自动满足该接口（鸭子类型）：

```gos
class Person(name String, age Int) {
    fun toString() -> String = "$name ($age)"
}

// Person 自动实现 Stringer，因为它有 toString() -> String
let s Stringer = Person(name: "Alice", age: 30)
```

### 9.3 接口组合

```gos
interface Reader {
    read(buf Byte[]) -> Int
}

interface Writer {
    write(data Byte[]) -> Int
}

interface ReadWriter -> Reader, Writer {
    // 可以添加额外方法
}
```

`->` 表示"继承自"。

### 9.4 匿名实现

使用 `object` 关键字创建接口的匿名实现：

```gos
let greeter = object Stringer {
    fun toString() -> String = "hello world"
}
```

编译器自动生成一个匿名 Go struct 实现该接口。

---

## 10. 类型定义

`type` 关键字用于定义命名类型。`type X = Y` 始终创建新类型（distinct type）。

### 10.1 结构类型

```gos
type Point = {
    x Float
    y Float
}

type User = {
    name String
    age Int
    email String?
}
```

结构类型字段使用空格分隔名字和类型（与 class 一致）。

实例化：

```gos
let p = Point(x: 1.0, y: 2.0)
let u = User(name: "Alice", age: 30, email: null)
```

> 编译为 Go struct。

### 10.2 联合类型

```gos
type StringOrNumber = String | Int | Float
type Result = Success | Failure
```

> 编译为 Go interface（带 marker 方法）。使用 `when` + `is` 做类型分支。

### 10.3 交叉类型

```gos
type Named = { name String }
type Aged = { age Int }
type Person = Named & Aged
```

> 编译为 Go struct 嵌入。

### 10.4 字面量类型

```gos
type Direction = "north" | "south" | "east" | "west"
```

> 编译为 Go `type Direction string` + `const` 枚举。

### 10.5 Distinct Type（新类型）

```gos
type UserID = Int64
type Meters = Float64
type Seconds = Float64
```

`UserID` 和 `Int64` 是不同类型，不能隐式互换。

类型转换使用函数式语法：

```gos
let id UserID = UserID(123)
let raw Int64 = Int64(id)
```

### 10.6 type 方法

type 的方法通过扩展方法语法定义（见 [§21](#21-扩展方法)）：

```gos
type Point = { x Float, y Float }

fun Point.distanceTo(other Point) -> Float {
    val dx = x - other.x
    val dy = y - other.y
    return Math.sqrt(dx * dx + dy * dy)
}
```

---

## 11. 枚举

### 11.1 简单枚举

```gos
enum Color {
    Red
    Green
    Blue
}

let c = Color.Red
```

> 编译为 Go `type Color int` + `iota` 常量。

### 11.2 关联值枚举

不支持。使用联合类型 + class 组合替代。

---

## 12. 泛型

### 12.1 泛型函数

泛型使用 `<>` 语法。解析器通过上下文消歧：标识符紧跟 `<`（无空格）视为泛型。

```gos
fun map<T, U>(items T[], transform (T) -> U) -> U[] {
    let result = U[]()
    for item in items {
        result.push(transform(item))
    }
    return result
}

// 调用（大多数情况可推断，不需写泛型参数）
let doubled = map(items) { it * 2 }

// 显式泛型参数
let doubled = map<Int, Int>(items) { it * 2 }
```

### 12.2 泛型类型

```gos
type Stack<T> = {
    items T[]
}

fun Stack<T>.push(item T) {
    items.push(item)
}

fun Stack<T>.pop() -> T? {
    return items.pop()
}
```

### 12.3 泛型类

```gos
class Box<T>(value T) {
    fun get() -> T = value
    fun map<U>(f (T) -> U) -> Box<U> = Box<U>(value: f(value))
}
```

### 12.4 泛型约束

约束写在泛型参数后面：

```gos
type Numeric = Int | Float | Float64

fun sum<T Numeric>(items T[]) -> T { }

interface Comparable<T> {
    compareTo(other T) -> Int
}

fun max<T Comparable<T>>(a T, b T) -> T {
    return if a.compareTo(b) > 0 { a } else { b }
}
```

---

## 13. 集合类型

### 13.1 数组 / 切片

```gos
// 字面量（类型推断）
let list = [1, 2, 3]

// 显式类型
let list Int[] = [1, 2, 3]

// 空数组
let list = Int[]()

// 预分配容量
let list = Int[](capacity: 100)
```

> 编译为 Go slice。

### 13.2 Map

Map 字面量使用 `#{ }` 语法（与代码块 `{ }` 区分）：

```gos
let m = #{"a": 1, "b": 2, "c": 3}
m["d"] = 4

// 显式类型
let m Map<String, Int> = #{"a": 1}

// 空 Map
let m = Map<String, Int>()

// 函数式构造
let m = mapOf("a" to 1, "b" to 2)
```

Map 访问返回可空类型：

```gos
let v Int? = m["key"]
let v = m["key"] ?? 0    // 带默认值
```

### 13.3 Set

```gos
let s = setOf(1, 2, 3)
let s Set<Int> = setOf(1, 2, 3)
let s = Set<Int>()
```

### 13.4 元组

不支持。使用 class 或 type 替代。

---

## 14. 空值安全

### 14.1 可空类型

类型加 `?` 后缀表示可空：

```gos
let name String? = null
let age Int? = 42
```

非可空类型不能赋值为 `null`：

```gos
let name String = null    // 编译错误
```

### 14.2 可选链

```gos
val len = name?.length
val city = user?.address?.city?.uppercase()
```

可选链中任一环节为 `null`，整个表达式返回 `null`。

### 14.3 空值合并运算符 `??`

```gos
val len = name?.length ?? 0
val displayName = user?.name ?? "Anonymous"
```

`??` 仅在左侧为 `null` 时返回右侧值。与 `||`（逻辑 OR，仅用于 Bool）完全不同。

### 14.4 非空断言 `!`

```gos
val len = name!.length    // name 为 null 时 panic
```

确信值不为 null 时使用。如果实际为 null，运行时 panic。

### 14.5 智能转型

`is` 检查后自动窄化类型：

```gos
fun process(x Any) {
    if x is String {
        print(x.length)    // x 自动窄化为 String
    }
}
```

---

## 15. 错误处理

GoScript 的错误处理设计为：**源码层面用 `throw` / `catch` / `try`，编译到 Go 时自动转换为 `(T, error)` 返回值模式。**

GoScript 用户不直接使用多返回值——编译器在幕后完成转换。

### 15.1 Error 类型

`Error` 是内置接口，映射到 Go 的 `error` interface：

```gos
interface Error {
    message() -> String
}
```

用内置构造函数创建错误：

```gos
Error("something went wrong")
```

### 15.2 throw

在函数中用 `throw` 抛出错误：

```gos
fun divide(a Float, b Float) -> Float {
    if b == 0.0 {
        throw Error("division by zero")
    }
    return a / b
}
```

> 编译为 Go：
> ```go
> func divide(a, b float64) (float64, error) {
>     if b == 0.0 {
>         return 0, errors.New("division by zero")
>     }
>     return a / b, nil
> }
> ```

包含 `throw` 的函数自动成为"可失败函数"。编译器自动在 Go 输出中添加 `error` 返回值。

### 15.3 调用可失败函数

调用可失败函数时，**必须**使用以下三种方式之一处理错误，否则编译报错：

#### catch — 就地处理

```gos
let result = divide(10.0, 0.0) catch { err ->
    print("Error: $err")
    0.0    // 提供回退值，类型必须与正常返回值一致
}
```

catch 块中也可以 `return` 退出当前函数：

```gos
let file = os.Open(path) catch { err ->
    print("Cannot open: $err")
    return
}
```

或用 `throw` 重新包装错误：

```gos
let file = os.Open(path) catch { err ->
    throw Error("failed to open $path: $err")
}
```

#### try — 向上传播

```gos
let result = try divide(10.0, 2.0)
```

如果 `divide` 出错，当前函数也自动变成可失败函数，错误向上传播。

> 编译为 Go：
> ```go
> result, err := divide(10.0, 2.0)
> if err != nil {
>     return ..., err
> }
> ```

#### `!` — 强制执行（出错则 panic）

```gos
let result = divide(10.0, 2.0)!
```

如果出错，程序 panic。用于确定不会出错的场景。

### 15.4 Go 互操作

Go 函数返回 `(T, error)` 时，GoScript 自动将其视为可失败函数：

```gos
// os.Open 在 Go 中返回 (*os.File, error)
let file = try os.Open("test.txt")
let file = os.Open("test.txt") catch { err -> return }
let file = os.Open("test.txt")!
```

Go 函数返回多个非 error 值时（如 `(int, bool)`），使用解构接收：

```gos
let (count, ok) = someGoFunc()
```

### 15.5 自定义错误

任何实现了 `Error` 接口的 class 都可以被 throw：

```gos
class ValidationError(field String, reason String) {
    fun message() -> String = "Validation failed for $field: $reason"
}

fun validate(email String) -> String {
    if !email.contains("@") {
        throw ValidationError(field: "email", reason: "missing @")
    }
    return email
}
```

### 15.6 Never 类型

`Never` 表示函数永不正常返回。用 `panic()` 终止程序：

```gos
fun fail(msg String) -> Never {
    panic(msg)
}
```

---

## 16. 模式匹配

### 16.1 when 表达式（有参数）

```gos
val result = when x {
    1 -> "one"
    2, 3 -> "two or three"
    in 4..10 -> "between 4 and 10"
    is String -> "string: $x"     // x 自动窄化为 String
    is Int -> "int: $x"           // x 自动窄化为 Int
    else -> "other"
}
```

> 编译为 Go 的 `switch` 或 type switch。

**智能转型规则**：在 `is Type` 分支内，原变量自动窄化为该类型，直接使用原变量名。

### 16.2 when 表达式（无参数）

无参形式中，每个分支是一个 Bool 条件，替代 if-else 链和三元运算符：

```gos
val level = when {
    score >= 90 -> "A"
    score >= 80 -> "B"
    score >= 70 -> "C"
    else -> "F"
}
```

### 16.3 when 作为语句

```gos
when x {
    1 -> print("one")
    2 -> {
        doSomething()
        print("two")
    }
    else -> print("other")
}
```

---

## 17. 并发

### 17.1 goroutine

```gos
go {
    print("running concurrently")
}

go {
    val result = compute()
    ch <- result
}
```

### 17.2 Channel

```gos
let ch = chan<Int>()       // 无缓冲 channel
let ch = chan<Int>(3)      // 缓冲大小为 3

ch <- 123                  // 发送
let value = <-ch           // 接收
```

发送和接收使用 `<-` 运算符，与 Go 一致。

### 17.3 select

```gos
select {
    <-ch1 -> { val v = <-ch1; process(v) }
    ch2 <- value -> { print("sent") }
    else -> { print("no communication") }
}
```

### 17.4 同步原语

通过 Go 标准库使用：

```gos
import "sync"

let mu = sync.Mutex()
mu.Lock()
// critical section
mu.Unlock()
```

---

## 18. 模块与导入

### 18.1 包声明

```gos
package main
package utils
```

### 18.2 导入

```gos
import "os"
import "fmt"
import "net/http"
```

### 18.3 别名导入

```gos
import f "fmt"
f.Println("hello")
```

### 18.4 按需导入

```gos
import { Println } "fmt"
import { Println print, Sprintf sprintf } "fmt"
```

别名使用空格分隔：`原名 别名`，因为总是成对出现，不会歧义。

### 18.5 Go 标准库调用

GoScript 直接调用 Go 的所有标准库和第三方库：

```gos
import "fmt"
import "net/http"

fmt.Println("Hello")
http.ListenAndServe(":8080", null)
```

---

## 19. 解构赋值

### 19.1 对象解构

```gos
let { name, age } = person
let { name myName, age myAge } = person    // 带别名（空格分隔）
```

### 19.2 数组解构

```gos
let [first, second] = array
let [head, ...rest] = array
```

### 19.3 Go 多返回值解构

```gos
let (value, ok) = myMap["key"]
let (n, err) = fmt.Println("hello")
```

---

## 20. 延迟执行与资源管理

### 20.1 defer

```gos
let file = os.Open(path) catch { err -> return }
defer { file.Close() }
```

与 Go 的 `defer` 语义一致：在函数返回前执行。

### 20.2 use（自动关闭）

```gos
File("test.txt").bufferedReader().use { reader ->
    reader.readLine()
}
```

`use` 方法在块结束后自动调用 `Close()`。

---

## 21. 扩展方法

支持为任意类型添加方法：

```gos
fun Person.greet() -> String {
    return "Hello, $name"
}

fun Stack<T>.push(item T) {
    items.push(item)
}
```

> 编译为 Go 的方法定义：`func (p Person) Greet() string { ... }`

### 21.1 作用域规则

扩展方法内部，receiver 的字段直接可访问（不需要前缀）。如果与外部变量名冲突，receiver 字段优先。用 `this.field` 显式指代 receiver 字段：

```gos
let name = "global"

fun Person.greet() -> String {
    return "Hello, $name"    // 这是 Person.name，不是外部的 name
}
```

### 21.2 限制

- 只能为本包定义的类型添加扩展方法
- 不能为外部导入的类型添加扩展方法

---

## 22. 注释与文档

### 22.1 单行注释

```gos
// 这是单行注释
```

### 22.2 多行注释

```gos
/* 这是
   多行注释 */
```

### 22.3 文档注释

```gos
/**
 * 计算两个数的和
 * @param a 第一个数
 * @param b 第二个数
 * @return 两数之和
 */
fun add(a Int, b Int) -> Int = a + b
```

---

## 23. 编译指令

GoScript 直接支持 Go 的编译指令：

```gos
//go:build linux && amd64

package main
```

```gos
//go:generate stringer -type=Color
//go:embed static/*
let staticFiles embed.FS
//go:noinline
fun criticalFunc() { }
```

---

## 24. 不支持的特性

以下特性 GoScript 明确不支持：

- **运算符重载** — 保持简单
- **属性 / 装饰器** — Go 没有对应概念
- **宏 / 元编程** — 超出转译器范围
- **async / await** — 使用 goroutine + channel
- **指针** — 编译器自动处理值/引用
- **所有权 / 借用** — 依赖 Go GC
- **RAII / 智能指针** — 依赖 Go GC，提供 `defer` 和 `use`
- **关联值枚举（ADT）** — 使用联合类型 + class 替代
- **解构模式匹配** — when 中不支持解构
- **if-let / while-let** — 使用 if + is 替代
- **管道运算符** — 使用方法链替代
- **内置测试框架** — 使用 Go 测试工具
- **条件编译** — 使用 Go build tags

---

## 附录 A：设计决策速查表

本文档解决了原始设计中的所有歧义和矛盾。以下是关键决策：

| 编号 | 问题 | 决策 |
|------|------|------|
| 1 | `{ }` 语义过载 | Map 用 `#{}`，type/lambda/代码块保留 `{}` |
| 2 | `\|\|` 双重含义 | `\|\|` 仅用于 Bool；空值合并用 `??` |
| 3 | 泛型 `<>` 歧义 | 保留 `<>`，解析器通过无空格规则消歧 |
| 4 | 集合构造语法 | 数组用 `[]` 字面量，其余用函数式 `mapOf()` / `setOf()` / `chan<T>()` |
| 5 | 错误处理 vs 尾随 Lambda | 错误处理用 `catch { }` / `try` / `!`，尾随 Lambda 无前缀 |
| 6 | 返回类型与函数体 `{` 冲突 | 返回类型用 `->` 分隔：`fun f() -> Type { }` |
| 7 | 扩展方法矛盾 | 支持扩展方法 `fun Type.method()` |
| 8 | 多返回值 vs Go 互操作 | GoScript 不暴露多返回值；`throw`/`catch` 自动映射 Go 的 `(T, error)` |
| 9 | `inf` vs `type` 重叠 | 分为 `interface`（行为契约）和 `type`（数据结构/类型组合） |
| 10 | `type` 一词多义 | `type X = Y` 始终创建新类型 |
| 11 | for 循环初始化 | C 风格 for 使用 `let` 声明：`for let i = 0; ...` |
| 12 | 冒号 vs 空格 | 类型声明统一用空格；赋值/命名参数用冒号 |
| 13 | `===` 未定义 | 删除 `typeof` 和 `===`，统一用 `is` |
| 14 | if 表达式括号 | if 表达式分支用 `{ }`：`if x > 0 { "a" } else { "b" }`；无三元运算符 |
| 15 | when/is 绑定变量 | 自动智能转型，用原变量名 |
| 16 | for-in 顺序 | value 在前：`for item, index in list` |
| 17 | Channel send/recv | 使用 `<-` 运算符（Go 风格） |
| 18 | import 别名 | 空格分隔：`import { Println print } "fmt"` |
| 19 | Void 类型 | 函数声明省略返回类型；函数类型用 `() -> ()` |
| 20 | 类字段可变性 | 默认可变，`val` 标记不可变 |
| 21 | throw 编译策略 | `throw` 编译为 error 返回值（编译器自动改写函数签名） |
| 22 | 联合/交叉类型编译 | 联合 → Go interface；交叉 → Go struct 嵌入 |
| 23 | 原始字符串插值 | 反引号不插值（纯原始字符串） |
| 24 | 解构别名语法 | 空格分隔：`let { a myA } = obj` |
| 25 | return {} 类型 | 不支持匿名对象，必须用 class 或 Map |

---

## 附录 B：错误处理体系设计说明

原始设计中存在的三角矛盾：

1. "不支持多返回值" ↔ "显式返回 `(T, Error?)`"（需要多返回值）
2. "try-catch" ↔ "不用 throw"（catch 什么？）
3. "Never 类型用 throw" ↔ "不支持 throw"

**本规范的解决方案**：

- GoScript **有** `throw` 关键字。用户在源码中用 `throw` 表达错误。
- 编译器自动将含 `throw` 的函数转换为 Go 的 `(T, error)` 返回模式。
- 调用侧用 `catch { }` 处理、`try` 传播、`!` 强制执行。
- GoScript 用户**不直接写**多返回值语法——编译器在幕后完成。
- `Never` 类型函数使用 `panic()` 而非 `throw`（因为永不返回，无处挂载 error）。
- Go 互操作：Go 函数的 `(T, error)` 自动映射为可失败函数。

这样，三个概念完全自洽：
- `throw` = 源码层抛错 → 编译为 error 返回
- `catch`/`try`/`!` = 源码层处理 → 编译为 `if err != nil` 检查
- 多返回值 = 用户不感知，编译器自动处理

---

## 附录 C：`{ }` 使用总结

`{ }` 在 GoScript 中有明确的使用边界，解析器可无歧义区分：

| 用途 | 语法 | 消歧依据 |
|------|------|----------|
| 代码块 / 函数体 | `fun f() { }` / `if x { }` | 在关键字或 `)` 或 `->` Type 之后 |
| Lambda | `{ x Int -> expr }` | 有 `->` 标记 |
| class 体 | `class X { }` | 在 class 声明之后 |
| interface 体 | `interface X { }` | 在 interface 声明之后 |
| type 结构体 | `type X = { }` | 在 `type X =` 之后 |
| when 体 | `when x { }` | 在 `when` 之后 |
| **Map 字面量** | `#{ }` | **有 `#` 前缀** |
| object 实例化 | `object Type { }` | 在 `object` 关键字之后 |

不再存在的歧义用法：
- ~~`{"a": 1}` 作为 Map~~ → 改为 `#{"a": 1}`
- ~~`return {x: 10}` 匿名对象~~ → 不支持，使用命名类型
