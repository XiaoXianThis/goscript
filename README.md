喜欢Kotlin语法糖，又馋Go的小巧，JVM太重了，打算试验一下能不能把Kotlin的语法应用到Go的生态上，就像TypeScript编译成JavaScript那样，做一门可以编译成Go的语言。目前还在计划和设计阶段，目前只是初步定义了语法规范，**无实现版本**，作者能力也有限，能不能完成也尚未可知。计划使用 TypeScript + Langium 实现转译。

如果弃坑，就当是美梦一场。

# GoScript

**GoScript** 是一门编译到 Go 的高级语言。语法借鉴 Kotlin/Swift 的表达力，编译输出地道的 Go 代码，与 Go 生态无缝互操作。

## 设计原则

- **表达力**：`let`/`val`、字符串插值、`when`、if 表达式、尾随 Lambda 等现代语法
- **空值安全**：可空类型 `?`、可选链 `?.`、空值合并 `??`，编译期可检查
- **错误处理**：源码用 `throw`/`catch`/`try`，编译为 Go 的 `(T, error)` 返回值
- **零成本抽象**：编译到标准 Go，无运行时、无 VM，直接享受 Go 工具链与生态

## 快速开始

```bash
bun install
bun run index.ts
```

## GoScript vs Go：小例子对比

下面用几个小例子展示 GoScript 在语法和设计上的优势。

### 1. 变量声明：`let` / `val` 更清晰


| GoScript            | Go                       |
| ------------------- | ------------------------ |
| `let x = 10` 可变     | `x := 10` 或 `var x = 10` |
| `val PI = 3.14` 不可变 | `const PI = 3.14`（仅基本类型） |


```gos
// GoScript：语义一目了然
let count = 0
val name = "GoScript"
```

```go
// Go
var count = 0
const name = "GoScript"
```

---

### 2. 字符串插值：告别 fmt.Sprintf


| GoScript             | Go                                |
| -------------------- | --------------------------------- |
| `"Hello, $name!"`    | `fmt.Sprintf("Hello, %s!", name)` |
| `"Result: ${a + b}"` | `fmt.Sprintf("Result: %d", a+b)`  |


```gos
// GoScript
let name = "World"
print("Hello, $name! 1+2 = ${1 + 2}")
```

```go
// Go
name := "World"
fmt.Printf("Hello, %s! 1+2 = %d\n", name, 1+2)
```

---

### 3. if 是表达式：直接赋值


| GoScript                                                | Go                  |
| ------------------------------------------------------- | ------------------- |
| `val msg = if x > 0 { "positive" } else { "negative" }` | 需要临时变量 + 多行 if-else |


```gos
// GoScript：if 有返回值
val msg = if x > 0 { "positive" } else { "negative" }
```

```go
// Go：必须写成语句
var msg string
if x > 0 {
    msg = "positive"
} else {
    msg = "negative"
}
```

---

### 4. when：强大的模式匹配


| GoScript               | Go                              |
| ---------------------- | ------------------------------- |
| `when` 支持值匹配、类型匹配、无参条件 | `switch` 主要是值匹配，类型用 type switch |


```gos
// GoScript：when 既是语句也是表达式
val result = when x {
    1 -> "one"
    2, 3 -> "two or three"
    is String -> "string: $x"
    else -> "other"
}

val kind = when {
    x > 0 -> "positive"
    x < 0 -> "negative"
    else -> "zero"
}
```

```go
// Go：switch 表达式需要 Go 1.22+，且无类型匹配语法糖
var result string
switch x := x.(type) {
case int:
    switch x {
    case 1: result = "one"
    case 2, 3: result = "two or three"
    default: result = "other"
    }
case string:
    result = "string: " + x
default:
    result = "other"
}
```

---

### 5. 错误处理：throw / catch，编译成 (T, error)


| GoScript                     | Go                 |
| ---------------------------- | ------------------ |
| `throw` / `catch` / `try` 写法 | 满屏 `if err != nil` |


```gos
// GoScript：逻辑清晰，编译为标准 Go 错误返回
fun divide(a Float, b Float) -> Float {
    if b == 0.0 { throw Error("division by zero") }
    return a / b
}

let result = divide(10.0, 2.0) catch { err ->
    print("Error: $err")
    0.0
}
```

```go
// Go
func divide(a, b float64) (float64, error) {
    if b == 0 { return 0, errors.New("division by zero") }
    return a / b, nil
}
result, err := divide(10.0, 2.0)
if err != nil {
    fmt.Println("Error:", err)
    result = 0.0
}
```

---

### 6. 空值安全：可选链与空值合并


| GoScript              | Go                                              |
| --------------------- | ----------------------------------------------- |
| `user?.address?.city` | 手动判 nil 或写辅助函数                                  |
| `name ?? "Anonymous"` | `if name != nil { *name } else { "Anonymous" }` |


```gos
// GoScript：可空类型 + 可选链 + ??
let name String? = null
val len = name?.length ?? 0
val city = user?.address?.city?.uppercase() ?? "unknown"
```

```go
// Go：指针 + 多处 nil 检查
var name *string = nil
var len int
if name != nil {
    len = len(*name)
} else {
    len = 0
}
var city string
if user != nil && user.Address != nil && user.Address.City != nil {
    city = strings.ToUpper(*user.Address.City)
} else {
    city = "unknown"
}
```

---

### 7. 类：主构造函数一行搞定


| GoScript                             | Go              |
| ------------------------------------ | --------------- |
| `class Person(name String, age Int)` | struct + 手写构造函数 |


```gos
// GoScript：主构造函数 + 方法
class Person(name String, age Int) {
    fun greet() -> String = "Hello, $name!"
    fun isAdult() -> Bool = age >= 18
}
let p = Person(name: "Alice", age: 30)
```

```go
// Go
type Person struct {
    Name string
    Age  int
}
func (p Person) Greet() string { return "Hello, " + p.Name + "!" }
func (p Person) IsAdult() bool { return p.Age >= 18 }
p := Person{Name: "Alice", Age: 30}
```

---

### 8. 集合与 Lambda：尾随闭包 + 方法链


| GoScript                                  | Go            |
| ----------------------------------------- | ------------- |
| `items.filter { it > 2 }.map { it * it }` | for 循环 + 临时切片 |


```gos
// GoScript：尾随 Lambda，it 隐式参数
let nums = [1, 2, 3, 4, 5]
let result = nums
    .filter { it > 2 }
    .map { it * it }
    .sum()
```

```go
// Go：通常要写循环或引入泛型 + 回调
var result int
for _, v := range nums {
    if v > 2 {
        result += v * v
    }
}
// 或用 slices / 第三方库的 Map/Filter
```

---

## 更多特性一览

- **泛型**：`fun map<T, U>(items T[], f (T) -> U) -> U[]`
- **接口**：隐式实现（鸭子类型），与 Go interface 一致
- **枚举**：`enum Color { Red; Green; Blue }`
- **并发**：`go` 块、channel，映射到 goroutine 与 channel
- **扩展方法**：`fun String.isNotEmpty() -> Bool`
- **defer**：`defer { cleanup() }` 编译为 `defer cleanup()`

完整语法见 [GoScript 语法规范](./GoScript语法规范.md)。

## 项目状态

本项目为 **GoScript 语法与规范** 的参考实现与文档仓库。编译器实现进行中，欢迎参与设计与讨论。

## 技术栈

- [Bun](https://bun.sh) — 开发与脚本运行

---

*GoScript — 写起来像 Kotlin，跑起来是 Go。*