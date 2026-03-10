# GoScript 语法歧义分析与修改建议

本文档列出 GoScript 语法定义中存在的所有歧义、矛盾和待明确的问题，并为每项提供多个修改方案供选择。

> 请在每个问题的方案后标注你的选择，或写下你自己的方案。

---

## 目录

- [P0 级：解析器无法工作的致命歧义](#p0-级解析器无法工作的致命歧义)
  - [问题 1：`{ }` 语义过载](#问题-1--语义过载)
  - [问题 2：`||` 既是逻辑 OR 又是空值合并](#问题-2-既是逻辑-or-又是空值合并)
  - [问题 3：泛型 `<>` 与比较运算符冲突](#问题-3泛型--与比较运算符冲突)
  - [问题 4：内置集合函数无括号调用](#问题-4内置集合函数无括号调用)
  - [问题 5：错误处理尾随闭包与普通 Lambda 无法区分](#问题-5错误处理尾随闭包与普通-lambda-无法区分)
  - [问题 6：函数返回类型为结构类型时与函数体冲突](#问题-6函数返回类型为结构类型时与函数体冲突)
- [P1 级：设计自相矛盾](#p1-级设计自相矛盾)
  - [问题 7：扩展方法 — "不支持"与实际语法矛盾](#问题-7扩展方法--不支持与实际语法矛盾)
  - [问题 8："不支持多值返回"与 Go 互操作矛盾](#问题-8不支持多值返回与-go-互操作矛盾)
  - [问题 9：`inf` 与 `type` 功能重叠且字段语法不同](#问题-9inf-与-type-功能重叠且字段语法不同)
  - [问题 10：`type` 关键字一词多义](#问题-10type-关键字一词多义)
- [P2 级：语法不一致需要统一](#p2-级语法不一致需要统一)
  - [问题 11：for 循环初始化语法不一致](#问题-11for-循环初始化语法不一致)
  - [问题 12：字段定义的冒号 vs 空格不统一](#问题-12字段定义的冒号-vs-空格不统一)
  - [问题 13：`===` 运算符未定义](#问题-13-运算符未定义)
  - [问题 14：if 表达式的括号规则不明确](#问题-14if-表达式的括号规则不明确)
  - [问题 15：`when` 中 `is` 匹配的绑定变量不明确](#问题-15when-中-is-匹配的绑定变量不明确)
  - [问题 16：for-in 解构的顺序未定义](#问题-16for-in-解构的顺序未定义)
  - [问题 17：Channel 的 `send`/`recv` 身份不明确](#问题-17channel-的-sendrecv-身份不明确)
  - [问题 18：import 别名语法可能混淆](#问题-18import-别名语法可能混淆)
- [P3 级：定义缺失 / 需要补充](#p3-级定义缺失--需要补充)
  - [问题 19：`Void` 类型未定义](#问题-19void-类型未定义)
  - [问题 20：类字段的可变性未明确](#问题-20类字段的可变性未明确)
  - [问题 21：`throw` 编译到 Go 的策略未定义](#问题-21throw-编译到-go-的策略未定义)
  - [问题 22：联合类型 / 交叉类型编译到 Go 的策略未定义](#问题-22联合类型--交叉类型编译到-go-的策略未定义)
  - [问题 23：原始字符串中 `$` 插值行为未明确](#问题-23原始字符串中--插值行为未明确)
  - [问题 24：解构别名语法与 import 别名语法冲突风格](#问题-24解构别名语法与-import-别名语法冲突风格)
  - [问题 25：`return { x: 10 }` 的类型不明确](#问题-25return--x-10--的类型不明确)

---

## P0 级：解析器无法工作的致命歧义

---

### 问题 1：`{ }` 语义过载

**当前语法中 `{ }` 被用于至少 7 种用途：**

```
{ ... }   → 函数体/代码块
{ ... }   → Lambda:          { x: Int -> x * 2 }
{ ... }   → Map 字面量:       {"a": 1, "b": 2}
{ ... }   → 结构类型定义:     type User = { name: String }
{ ... }   → object 实例化体:  object User { name: "Alice" }
{ ... }   → 错误处理闭包:     divide(10,0) { err -> print(err) }
{ ... }   → 匿名对象返回:     return { x: 10, y: 20 }
```

**致命歧义示例：**

```GoScript
// 解析器看到 { "a": ... 无法判断是 Map 还是 Lambda 的开头
val m = {"a": 1, "b": 2}         // Map?
val f = { a: Int -> a * 2 }      // Lambda?
// 两者开头都是 { identifier/literal :

// 函数返回 Map 还是开始了一个代码块？
fun foo() {
    return {"a": 1}   // return 一个 Map? 还是 return; 然后进入 block?
}
```

#### 方案 A：Map 字面量加前缀标记

给 Map 字面量加专用语法，`{ }` 只用于代码块/Lambda：

```GoScript
// Map 使用 #{ } 或 mapOf { }
val m = #{"a": 1, "b": 2}
val m = mapOf("a" to 1, "b" to 2)

// { } 回归纯粹的块/Lambda
val f = { a: Int -> a * 2 }
```

#### 方案 B：Map 使用方括号或构造函数

```GoScript
// Map 用 [key: value] 或函数构造
val m = Map["a": 1, "b": 2]
val m = mapOf { "a": 1, "b": 2 }  // 这里 mapOf 明确是函数调用

// { } 只用于块/Lambda
```

#### 方案 C：统一所有结构化字面量用显式构造

```GoScript
// 所有集合类型都通过函数构造，不使用字面量 { }
val m = mapOf("a" to 1, "b" to 2)
val list = listOf(1, 2, 3)
val set = setOf(1, 2, 3)

// type 定义改用不同的语法
type User = (
    name: String
    points: Int
)

// { } 只用于代码块和 Lambda
```

#### 方案 D：只保留 type 的 `{ }`，其他用不同语法

```GoScript
// Map 和 匿名对象 用 #{ }
val m = #{"a": 1, "b": 2}
return #{x: 10, y: 20}

// type 定义保留 { }（因为在 type = 之后，解析器可区分）
type User = {
    name: String
}

// Lambda 保留 { }（因为有 -> 标记可区分）
val f = { x: Int -> x * 2 }
```

> **你的选择**：____

---

### 问题 2：`||` 既是逻辑 OR 又是空值合并

**当前语法：**

```GoScript
// §3.3 — 逻辑运算符
a || b   // 逻辑 OR，要求 a 和 b 都是 Bool

// §23.1 — 空值默认值
val len = name?.length || 0   // 如果 name 为 null，用 0
```

**歧义：** `name?.length` 返回 `Int?`，而 `||` 要求操作数是 `Bool`。如果 `name?.length` 结果是 `0`（合法值），按 JS 的 falsy 逻辑会错误地返回右侧。两种语义用同一个符号，解析器和类型检查器都无法判断意图。

#### 方案 A：引入 `??` 空值合并运算符（Swift / TypeScript 风格）

```GoScript
val len = name?.length ?? 0     // 空值合并
val ok = a || b                 // 逻辑 OR（仅 Bool）
```

#### 方案 B：引入 `?:` Elvis 运算符（Kotlin 风格）

```GoScript
val len = name?.length ?: 0     // 空值合并
val ok = a || b                 // 逻辑 OR（仅 Bool）
```

#### 方案 C：引入 `or` 关键字做空值合并

```GoScript
val len = name?.length or 0     // 空值合并
val ok = a || b                 // 逻辑 OR
```

> **你的选择**：__A__

---

### 问题 3：泛型 `<>` 与比较运算符冲突

**当前语法：**

```GoScript
let ch = channelOf<Int> 3
fun map<T,U>(items T[], callback (T)->U) U[]
```

**歧义：** 解析器看到 `channelOf<Int>` 时，可能将其解析为 `(channelOf < Int) > ...`，即两个比较表达式。

这是所有使用 `<>` 做泛型的语言都面临的经典问题。

#### 方案 A：保留 `<>`，用解析器上下文消歧

保留 `<>` 语法，在解析器中通过规则消歧：
- 标识符后紧跟 `<`（无空格）时视为泛型
- 需要在解析器实现中做特殊处理

```GoScript
// 泛型（标识符紧跟 <）
channelOf<Int>(3)
Map<String, Int>

// 比较（有空格或不在标识符后）
a < b
x < y && y > z
```

#### 方案 B：使用 `[T]` 做泛型（Go 风格）

```GoScript
let ch = channelOf[Int](3)
fun map[T, U](items T[], callback (T)->U) U[]
type Stack[T] = { items T[] }
```

#### 方案 C：使用 `::<>` 做泛型（Rust turbofish 风格）

在需要显式泛型参数时使用 `::<>`，定义时仍用 `<>`：

```GoScript
// 定义时用 <>
fun map<T, U>(items T[], callback (T)->U) U[]

// 调用时用 ::
let ch = channelOf::<Int>(3)
// 或大多数情况靠推断，不写泛型参数
let ch = channelOf(3)
```

> **你的选择**：__A__

---

### 问题 4：内置集合函数无括号调用

**当前语法：**

```GoScript
let list Int[] = listOf<Int[]> [1,2,3]       // 无括号
let ch = channelOf<Int>                       // 无括号无参
let ch = channelOf<Int> 3                     // 无括号有参
val set = setOf [1, 2, 3]                     // 无括号
```

**歧义：**
- `channelOf<Int> 3` → `(channelOf < Int) > 3`？
- `setOf [1,2,3]` → `setOf` 是变量，`[1,2,3]` 是索引操作？
- `listOf<Int[]>` 的泛型参数是 `Int[]`（数组类型），语义上应该是 `Int`

#### 方案 A：统一使用括号调用

所有函数调用一律用 `()`，和普通函数一致：

```GoScript
let list = listOf(1, 2, 3)                    // 自动推断类型
let list Int[] = listOf<Int>(1, 2, 3)          // 显式泛型
let ch = channelOf<Int>()                      // 无缓冲
let ch = channelOf<Int>(3)                     // 有缓冲
val set = setOf(1, 2, 3)
val m = mapOf("a" to 1, "b" to 2)
```

#### 方案 B：使用语言内置语法而非函数

不作为函数调用，而是用专门的语法关键字：

```GoScript
let list = [1, 2, 3]                          // 数组直接用 []
let ch = chan Int                              // channel 用 chan 关键字
let ch = chan Int, 3                           // 有缓冲
val set = set { 1, 2, 3 }                     // set 用关键字
val m = map { "a": 1, "b": 2 }               // map 用关键字
```

#### 方案 C：混合方案 — 常用的给专用语法，其他用函数

```GoScript
let list = [1, 2, 3]                          // 数组字面量
let ch = chan<Int>()                           // channel 函数式
let ch = chan<Int>(3)                          // 有缓冲
val set = setOf(1, 2, 3)                      // 函数式
val m = mapOf("a" to 1, "b" to 2)            // 函数式
```

> **你的选择**：____

---

### 问题 5：错误处理尾随闭包与普通 Lambda 无法区分

**当前语法：**

```GoScript
// 错误处理闭包
let result = divide(10, 0) { err -> print("出现错误：$err") }

// 普通尾随 Lambda（Kotlin 风格）
items.filter { it > 3 }
items.map { it * 2 }
```

**歧义：** 解析器看到 `expr { ... }` 时，无法判断 `{ ... }` 是错误处理闭包还是普通尾随 Lambda 参数。

```GoScript
// 这是错误处理还是传了一个额外 Lambda？
let result = someFunc(arg) { x -> x * 2 }
```

#### 方案 A：错误处理强制用 `catch` 关键字

```GoScript
// 错误处理 — 必须有 catch
let result = divide(10, 0) catch { err -> print(err) }
let result = divide(10, 0) catch onError

// 尾随 Lambda — 没有 catch
items.filter { it > 3 }
```

#### 方案 B：错误处理用 `try`-`catch` 块

```GoScript
let result = try divide(10, 0) catch { err ->
    print(err)
}

// 不处理，向外传递
let result = try divide(10, 0)

// 尾随 Lambda 保持不变
items.filter { it > 3 }
```

#### 方案 C：错误处理用 `!` 或 `?` 后缀标记

```GoScript
// ? 返回默认值 / 传播错误
let result = divide(10, 0)?
let result = divide(10, 0) ?? 0.0

// ! 忽略错误（panic if error）
let result = divide(10, 0)!

// catch 显式处理
let result = divide(10, 0) catch { err -> print(err) }

// 尾随 Lambda 保持不变
items.filter { it > 3 }
```

> **你的选择**：____

---

### 问题 6：函数返回类型为结构类型时与函数体冲突

**当前语法：**

```GoScript
// type 可以是 { name: String }
type User = { name: String }

// 那函数返回 User 类型时没问题：
fun getUser() User { return ... }

// 但如果内联写结构类型作为返回类型：
fun getUser() { name: String } {    // ← 两个连续的 { }
    return ...                       // 解析器无法分清
}
```

**歧义：** 解析器看到 `fun getUser()` 后遇到 `{`，无法判断这是返回类型的开始还是函数体的开始。

#### 方案 A：禁止内联结构类型作返回类型

返回类型必须是命名类型，不能内联 `{ ... }`：

```GoScript
// 必须先定义 type，再引用
type UserInfo = { name: String, age: Int }
fun getUser() UserInfo { ... }

// 不允许：
// fun getUser() { name: String } { ... }
```

#### 方案 B：返回类型前加冒号或箭头

用 `:` 或 `->` 分隔参数列表和返回类型，这样解析器有明确的标记：

```GoScript
// 冒号方案
fun getUser(): { name: String } { ... }
fun add(a Int, b Int): Int { ... }

// 箭头方案
fun getUser() -> { name: String } { ... }
fun add(a Int, b Int) -> Int { ... }
```

#### 方案 C：结构类型定义改用 `( )` 而非 `{ }`

```GoScript
type User = (name: String, age: Int)

fun getUser() (name: String) {   // 不会与 { 冲突
    return ...
}
```

> **你的选择**：____

---

## P1 级：设计自相矛盾

---

### 问题 7：扩展方法 — "不支持"与实际语法矛盾

**矛盾：**

§32 明确写 "不支持"。但 §8.2 定义了这样的语法：

```GoScript
// 方法写在类外面 ← 这就是扩展方法
fun Person.greet() {
    return "hello, $name"
}
```

§11.2 也用了：

```GoScript
fun Stack<T>.push(item T) { ... }
fun Stack<T>.pop() T { ... }
```

#### 方案 A：承认支持扩展方法，删除"不支持"声明

将 §32 改为"支持"，并保留 `fun Type.method()` 语法。

#### 方案 B：不支持扩展方法，所有方法必须写在类内部

删除 §8.2 中 `fun Person.greet()` 的语法，所有方法只能在 `class` 体内定义：

```GoScript
class Person(name String, age Int) {
    fun greet() = "hello, $name"
}

// 不允许 fun Person.greet()
```

但这会导致 §11.2 的泛型类型方法无法定义（因为 `type` 没有类体）。需要额外设计。

#### 方案 C：限定范围 — 只允许对本模块内的类型定义外部方法

```GoScript
// 允许：本模块定义的类
fun Person.greet() = "hello, $name"

// 不允许：外部导入的类型
// fun String.myMethod() = ...    ← 编译错误
```

> **你的选择**：____

---

### 问题 8："不支持多值返回"与 Go 互操作矛盾

**矛盾：**

§25 说"GoScript 不支持多值返回"，但同时展示：

```GoScript
let [file] = os.Open(path)
let [file] = os.Open(path) catch { err -> print(err) }
```

`os.Open` 在 Go 中返回 `(*os.File, error)`。用 `[file]` 接收 — 这实质上就是在处理多返回值。而且 `*os.File` 和 `error` 是不同类型，不能放在一个同类型数组里。

#### 方案 A：GoScript 函数不支持多返回值，但 Go 互操作有专门映射规则

```GoScript
// GoScript 自己的函数 — 不支持多返回值
fun getInfo() = { name: "Alice", age: 30 }

// 调用 Go 函数 — 编译器自动将最后一个 error 返回值映射到 catch
let file = os.Open(path) catch { err -> print(err) }
// 不需要 [file]，编译器知道 os.Open 返回 (File, error)，
// 自动把非 error 返回值赋给 file，error 给 catch

// 如果 Go 函数返回多个非 error 值（如 (int, bool)）
let (count, ok) = someGoFunc()    // 用元组解构
```

#### 方案 B：统一支持多返回值

既然要和 Go 互操作，干脆支持：

```GoScript
fun divide(a Float, b Float) (Float, Error?) {
    if b == 0 {
        return 0.0, Error("division by zero")
    }
    return a / b, null
}

let (result, err) = divide(10, 0)
if err != null { print(err) }
```

#### 方案 C：Go 多返回值自动转为对象

```GoScript
// Go 的 os.Open(name) → (*File, error)
// GoScript 中自动变为返回一个匿名对象
let result = os.Open(path)
// result.value → *File
// result.error → error

// 用解构简化
let { value: file, error: err } = os.Open(path)
```

> **你的选择**：____

---

### 问题 9：`inf` 与 `type` 功能重叠且字段语法不同

**当前语法：**

```GoScript
// inf 定义（空格分隔）
inf Dog {
    name String
    age Int
    jump ()->Void
}

// type 定义（冒号分隔）
type User = {
    name: String
    points: Int
}
```

**问题：**
1. 两者都定义了"一组字段的结构化类型"，功能重叠
2. 字段语法不同 — `inf` 用 `name String`，`type` 用 `name: String`
3. 什么时候用 `inf`，什么时候用 `type`？

#### 方案 A：合并为一个概念 — 只用 `type`

删除 `inf` 关键字，统一用 `type`：

```GoScript
// 结构类型
type Dog = {
    name: String
    age: Int
    jump: () -> Void
}

// 类型继承用 &
type C = A & { valueC: Int }

// 联合类型
type Number = Int | Float

// 实例化
let dog = Dog {
    name: "Cutyy",
    age: 2,
    jump: { print("jumping") },
}
```

#### 方案 B：保留两者，明确划分职责

`inf` 用于定义行为契约（有方法），`type` 用于定义数据结构（只有字段），并统一字段语法：

```GoScript
// inf — 行为接口，必须有方法
inf Jumpable {
    jump() Void
}

// type — 数据结构
type User = {
    name String       // 统一用空格
    points Int
}

// class 实现接口
class Dog(name String, age Int) : Jumpable {
    fun jump() { print("$name is jumping") }
}
```

#### 方案 C：保留两者，`inf` 映射 Go interface，`type` 映射 Go struct

```GoScript
// inf → 编译为 Go interface（只能有方法签名）
inf Stringer {
    toString() String
}

// type → 编译为 Go struct（有字段）
type Point = {
    x Float
    y Float
}

// 统一字段语法为空格
```

> **你的选择**：____

---

### 问题 10：`type` 关键字一词多义

`type` 当前用于至少 4 种不同用途：

```GoScript
type User = { name: String }          // 结构类型
type Number = Int | Float             // 联合类型
type Direction = "n" | "s" | "e"      // 字面量类型
type UserID = Int64                   // 新类型 (distinct type)
type Person = Named & Aged            // 交叉类型
type Stack<T> = { items: T[] }        // 泛型类型
```

**问题：** `type UserID = Int64` 的语义是"新类型"（§31.2 说不能与 Int64 互换），还是"别名"？语法形式完全相同，用户无法区分。

#### 方案 A：全部统一为 `type`，都是新类型

`type X = Y` 始终创建新类型。如果 Y 是简单类型就是 distinct type，如果是复合表达式（`|`、`&`、`{}`）就是复合类型：

```GoScript
type UserID = Int64               // distinct type，不能与 Int64 互换
type Number = Int | Float         // 新的联合类型
type User = { name: String }     // 新的结构类型
```

#### 方案 B：用不同关键字区分

```GoScript
// newtype — 创建 distinct type
newtype UserID = Int64

// type — 类型别名/组合
type Number = Int | Float
type User = { name: String }
type Person = Named & Aged
```

#### 方案 C：用不同语法区分

```GoScript
// distinct type 不用 =
type UserID Int64                 // 新类型

// 类型别名/组合用 =
type Number = Int | Float         // 组合类型
type User = { name: String }     // 结构类型
```

> **你的选择**：____

---

## P2 级：语法不一致需要统一

---

### 问题 11：for 循环初始化语法不一致

**当前语法在两处写法不同：**

```GoScript
// §5.2
for i=0; i<10; i++ { }          // 用 =

// §5.5
outer: for i := 0; i < 10; i++ {   // 用 :=
```

而 GoScript 声明变量用 `let`，赋值用 `=`，没有 `:=` 语法。`i=0` 看起来是赋值给已存在的 `i`，不是声明。

#### 方案 A：用 `let` 声明循环变量

```GoScript
for let i = 0; i < 10; i++ { }
outer: for let i = 0; i < 10; i++ { }
```

#### 方案 B：for 循环初始化子句隐式声明变量（类似 Go）

```GoScript
// 在 for 初始化中，= 自动声明新变量（不需要 let）
for i = 0; i < 10; i++ { }
// i 的作用域限于 for 循环内
```

#### 方案 C：使用 `in` + 区间替代 C 风格 for

```GoScript
// 移除 C 风格 for，全部用 for-in
for i in 0..10 { }               // 0 到 9
for i in 0..=10 { }              // 0 到 10
// 保留条件循环
for condition { }
```

> **你的选择**：____

---

### 问题 12：字段定义的冒号 vs 空格不统一

**当前状态：**

| 上下文 | 语法 | 例子 |
|--------|------|------|
| `class` 字段/参数 | 空格 | `name String` |
| `inf` 字段 | 空格 | `name String` |
| `type` 字段 | 冒号 | `name: String` |
| 函数参数 | 空格 | `a Int, b Int` |
| Lambda 参数 | 冒号 | `x: Int -> ...` |
| 命名实参 | 冒号 | `name: "Alice"` |
| `object` 字段赋值 | 冒号 | `name: "Cutyy"` |
| 解构别名 | 空格 | `{ a renamedA }` |

**问题：** "名字 类型"有时用空格有时用冒号，不统一。

#### 方案 A：全部统一为空格（Go 风格）

名字和类型之间一律用空格：

```GoScript
// 变量声明
let x Int = 10

// 函数参数
fun add(a Int, b Int) Int { }

// Lambda 参数
val f = { x Int -> x * 2 }

// class
class Person(name String, age Int)

// inf
inf Dog { name String }

// type — 也改为空格
type User = {
    name String
    points Int
}
```

命名实参和字段赋值（key: value）保留冒号，因为这是赋值语义而非声明语义：

```GoScript
let p = Person(name: "Tom", age: 10)     // 赋值，保留冒号
let dog = object Dog { name: "Cutyy" }   // 赋值，保留冒号
```

#### 方案 B：全部统一为冒号（TypeScript / Swift 风格）

名字和类型之间一律用冒号：

```GoScript
let x: Int = 10
fun add(a: Int, b: Int): Int { }
val f = { x: Int -> x * 2 }
class Person(name: String, age: Int)
inf Dog { name: String }
type User = { name: String }
```

但这样 Lambda 参数 `{ x: Int -> ... }` 中的 `:` 和函数体分隔符 `->` 在一起会更密集。

#### 方案 C：声明用空格，赋值/实参用冒号（当前主流方向，只需修复 type 和 lambda）

保持当前大部分一致，只修复两个偏差：

```GoScript
// 修复 1：type 字段改用空格
type User = {
    name String        // 空格，和 class/inf 一致
    points Int
}

// 修复 2：Lambda 参数改用空格
val f = { x Int -> x * 2 }    // 空格，和函数参数一致
```

> **你的选择**：____

---

### 问题 13：`===` 运算符未定义

**当前语法：**

```GoScript
if typeof x === "String" { }
```

§3 只定义了 `==` 和 `!=`，没有 `===`。

#### 方案 A：删除 `===`，统一用 `==`

GoScript 是强类型语言，不需要区分"宽松相等"和"严格相等"：

```GoScript
if typeof x == "String" { }
```

#### 方案 B：删除 `typeof`，只保留 `is`

```GoScript
// typeof 不符合 Go 的类型系统思维
// 用 is 替代所有类型检查
if x is String { }
if x is Person { }
```

#### 方案 C：保留 `typeof`，但用 `==` 而非 `===`

```GoScript
if typeof x == "String" { }
if x is Person { }
// typeof 返回类型名称的字符串
```

> **你的选择**：____

---

### 问题 14：if 表达式的括号规则不明确

**当前语法：**

```GoScript
// 语句形式 — "括号可选"
if x > 0 {
    a = 1
}

// 表达式形式
val msg = if (x > 0) "positive" else "negative"
```

**歧义：** 如果括号可选，那么 `val msg = if x > 0 "positive" else "negative"` 是否合法？解析器无法确定 condition 在哪结束。

#### 方案 A：表达式形式强制括号

```GoScript
// 语句形式 — 括号可选，因为有 { } 标记边界
if x > 0 { a = 1 }
if (x > 0) { a = 1 }

// 表达式形式 — 强制括号，因为没有 { }
val msg = if (x > 0) "positive" else "negative"
// val msg = if x > 0 "positive" else "negative"  ← 不合法
```

#### 方案 B：表达式形式也用 `{ }` 包裹分支

```GoScript
// 语句和表达式统一用 { }
val msg = if x > 0 { "positive" } else { "negative" }
// 括号始终可选
```

#### 方案 C：表达式形式用不同语法（三元运算符）

```GoScript
// if 只做语句，不做表达式
if x > 0 { a = 1 }

// 表达式用 when 或三元
val msg = when { x > 0 -> "positive", else -> "negative" }
// 或
val msg = x > 0 ? "positive" : "negative"
```

> **你的选择**：____

---

### 问题 15：`when` 中 `is` 匹配的绑定变量不明确

**当前语法：**

```GoScript
val result = when x {
    is String -> print("string: $value")   // $value 从哪来？
    else -> print("other")
}
```

`$value` 没有被定义。匹配变量是 `x`，但 `$x` 在 `is String` 分支中应该已经自动窄化为 `String` 类型。

#### 方案 A：直接用原变量名，自动智能转型（Kotlin 风格）

```GoScript
val result = when x {
    is String -> print("string: $x")   // x 在此分支自动为 String
    else -> print("other")
}
```

#### 方案 B：显式绑定新变量名

```GoScript
val result = when x {
    is String s -> print("string: $s")     // 绑定为 s
    is Int n -> print("number: $n")        // 绑定为 n
    else -> print("other")
}
```

#### 方案 C：两者都支持

```GoScript
val result = when x {
    is String -> print("$x")        // 不绑定，用原名（自动窄化）
    is Int n -> print("$n")         // 绑定新名
    else -> print("other")
}
```

> **你的选择**：____

---

### 问题 16：for-in 解构的顺序未定义

**当前语法两处写法不同：**

```GoScript
// §5.2
for i in items { }              // 单变量，是 value 还是 index？

// §11.1
for item, index in items { }    // 双变量，顺序是 value,index
```

但 Go 中是 `for index, value := range items`，即 index 在前。

#### 方案 A：value 在前（与 Go 相反，但更直觉）

```GoScript
for item in items { }                    // 只取 value
for item, index in items { }             // value, index
for value, key in myMap { }              // value, key
```

#### 方案 B：index 在前（与 Go 一致）

```GoScript
for item in items { }                    // 只取 value（特殊简写）
for index, item in items { }             // index, value
for key, value in myMap { }              // key, value
```

#### 方案 C：用解构语法明确命名

```GoScript
for item in items { }                    // 单值
for (index, item) in items { }           // 括号明确
for (key, value) in myMap { }
// 用 _ 忽略
for (_, item) in items { }
```

> **你的选择**：____

---

### 问题 17：Channel 的 `send`/`recv` 身份不明确

**当前语法：**

```GoScript
ch send 123
let value = recv ch
```

**问题：** `send` 和 `recv` 是关键字还是标识符？如果是关键字，用户不能用它们做变量名。如果是标识符，`ch send 123` 会被解析为三个表达式。

#### 方案 A：作为关键字保留

```GoScript
// send 和 recv 是保留关键字
ch send 123
let value = recv ch
```

#### 方案 B：使用运算符（接近 Go 风格）

```GoScript
ch <- 123                   // 发送
let value = <-ch            // 接收
```

#### 方案 C：使用方法调用

```GoScript
ch.send(123)
let value = ch.recv()       // 或 ch.receive()
```

#### 方案 D：混合 — 发送用运算符，接收用方法

```GoScript
ch <- 123                   // 发送（Go 风格）
let value = ch.recv()       // 接收（方法风格）
```

> **你的选择**：____

---

### 问题 18：import 别名语法可能混淆

**当前语法：**

```GoScript
import { Println print, Sprintf sprintf } "fmt"
```

**问题：** `Println print` 用空格表示"将 Println 导入为 print"，没有 `as` 关键字。那么 `Println print` 是一个带别名的导入，还是两个独立的导入？

#### 方案 A：加 `as` 关键字

```GoScript
import { Println as print, Sprintf as sprintf } from "fmt"
```

#### 方案 B：保留当前语法但换用箭头

```GoScript
import { Println -> print, Sprintf -> sprintf } from "fmt"
```

#### 方案 C：保留当前空格分隔，但改变整体结构

```GoScript
// from 在前，更像自然语言
from "fmt" import { Println print, Sprintf sprintf }
from "fmt" import Println
```

#### 方案 D：保留当前语法不变

空格分隔足够明确：`{ 原名 别名, 原名 别名 }`，因为类型名和别名总是成对出现。

> **你的选择**：____

---

## P3 级：定义缺失 / 需要补充

---

### 问题 19：`Void` 类型未定义

**当前语法：**

```GoScript
inf Dog {
    jump ()->Void
}
```

§2（基本数据类型）中没有 `Void`。

#### 方案 A：定义 `Void` 为内置类型

`Void` 代表无返回值，等价于 Go 中不写返回类型。

```GoScript
fun doSomething() Void { }    // 等价于 fun doSomething() { }
jump ()->Void                 // 函数类型，无返回值
```

#### 方案 B：用 `()` 或空来表示无返回值（不引入 Void）

```GoScript
// 函数类型中省略返回类型表示无返回值
jump ()->()
// 或
jump () -> _
```

#### 方案 C：沿用 Go 的做法 — 没有返回类型就是 void

```GoScript
jump Fun()              // 或用 Fun 关键字标记函数类型
// 有返回值
callback Fun(Int) Int
```

> **你的选择**：____

---

### 问题 20：类字段的可变性未明确

**当前语法：**

```GoScript
class Person {
    name String
    age Int = 0
    weight Float?
}
```

字段没有 `let`/`val` 前缀。它们默认可变还是不可变？能否混用？

#### 方案 A：默认可变，用 `val` 标记不可变

```GoScript
class Person {
    name String          // 可变（默认）
    val id Int           // 不可变
    private age Int      // 可变 + 私有
}
```

#### 方案 B：默认不可变，用 `var`/`let` 标记可变

```GoScript
class Person {
    name String          // 不可变（默认）
    var age Int          // 可变
    private var weight Float?  // 可变 + 私有
}
```

#### 方案 C：强制显式标注

```GoScript
class Person {
    val name String      // 必须写 val 或 let
    let age Int = 0
}
```

> **你的选择**：____

---

### 问题 21：`throw` 编译到 Go 的策略未定义

**当前语法：**

```GoScript
fun divide(a Float, b Float) Float {
    if b == 0 {
        throw "division by zero"
    }
    return a / b
}
```

Go 没有异常机制。`throw` 应该编译为什么？

#### 方案 A：`throw` 编译为 `panic`

```go
// 编译结果
func divide(a, b float64) float64 {
    if b == 0 {
        panic("division by zero")
    }
    return a / b
}
```

简单直接，但 Go 社区不鼓励用 panic 做正常错误处理。

#### 方案 B：`throw` 自动改写函数签名，编译为 error 返回

GoScript 编译器自动将含 `throw` 的函数转为返回 `(T, error)`：

```go
// divide 被编译为
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```

调用侧的 `catch` 自动处理 error。

#### 方案 C：不用 `throw`，改用 Go 风格的显式错误

```GoScript
// 不支持 throw，函数必须显式返回错误
fun divide(a Float, b Float) (Float, Error?) {
    if b == 0 {
        return 0.0, Error("division by zero")
    }
    return a / b, null
}
```

> **你的选择**：____

---

### 问题 22：联合类型 / 交叉类型编译到 Go 的策略未定义

**当前语法：**

```GoScript
type StringOrNumber = String | Number
type Person = Named & Aged
type Direction = "north" | "south" | "east" | "west"
```

Go 不支持联合类型和交叉类型。

#### 方案 A：联合类型编译为 interface，交叉类型编译为嵌入 struct

```go
// type StringOrNumber = String | Number → Go interface
type StringOrNumber interface {
    isStringOrNumber()
}
// 生成辅助方法让 String 和 Number 实现该接口

// type Person = Named & Aged → Go struct 嵌入
type Person struct {
    Named
    Aged
}

// type Direction = "north" | ... → Go string + 运行时校验
type Direction string
const (
    DirectionNorth Direction = "north"
    DirectionSouth Direction = "south"
    // ...
)
```

#### 方案 B：简化 — 联合类型编译为 `any`，编译器生成类型断言

```go
// type StringOrNumber = String | Number
// 在 Go 中用 any，但编译器在使用点生成类型断言
func process(x any) {
    switch v := x.(type) {
    case string: // ...
    case int: // ...
    }
}
```

#### 方案 C：暂不支持联合类型和交叉类型（降低实现复杂度）

先做核心功能，高级类型系统后续迭代。

> **你的选择**：____

---

### 问题 23：原始字符串中 `$` 插值行为未明确

**当前语法：**

```GoScript
// 双引号字符串 — 支持 $插值
let s = "Hello $name!"

// 反引号字符串 — 也支持 $插值？
val s = `
    |SELECT * FROM users
    |WHERE age > $minAge
`
```

Go 的反引号字符串是纯原始字符串（不处理任何转义）。GoScript 的反引号字符串是否也支持 `$` 插值？如果支持，那它就不是"原始字符串"了。

#### 方案 A：反引号不插值（纯原始字符串）

```GoScript
// 反引号 — 原始字符串，$ 是字面字符
let sql = `SELECT * FROM users WHERE age > $minAge`   // $minAge 是字面文本

// 双引号 — 支持插值
let sql = "SELECT * FROM users WHERE age > $minAge"    // $minAge 被替换
```

#### 方案 B：反引号也支持插值（模板字符串）

```GoScript
// 两种字符串都支持 $插值
let s = "Hello $name"
let sql = `SELECT * FROM users WHERE age > $minAge`

// 需要字面 $ 时用 \$ 转义
let price = `Price: \$100`
```

#### 方案 C：用不同的字面量区分

```GoScript
// 双引号 — 插值字符串
let s = "Hello $name"

// 反引号 — 原始字符串（不插值）
let raw = `no $interpolation here`

// 三引号或特殊前缀 — 多行插值字符串
let sql = """
    SELECT * FROM users
    WHERE age > $minAge
"""
```

> **你的选择**：____

---

### 问题 24：解构别名语法与 import 别名语法冲突风格

**当前语法：**

```GoScript
// 解构别名（§20）— 原名在前，别名在后，空格分隔
let { a renamedA, b renamedB } = obj

// import 别名（§16）— 原名在前，别名在后，空格分隔
import { Println print } "fmt"
```

两者格式一致（`原名 别名`），这本身是好的。但如果你在问题 18 中选了 `as` 关键字做 import 别名，那解构别名也应该统一：

#### 方案 A：都用 `as`

```GoScript
let { a as renamedA, b as renamedB } = obj
import { Println as print } from "fmt"
```

#### 方案 B：都用空格（保持当前）

```GoScript
let { a renamedA, b renamedB } = obj
import { Println print } "fmt"
```

#### 方案 C：解构用 `:`，import 用 `as`（不同场景不同语法）

```GoScript
let { a: renamedA, b: renamedB } = obj      // 像 JS
import { Println as print } from "fmt"       // 像 JS/Python
```

> **你的选择**：____

---

### 问题 25：`return { x: 10 }` 的类型不明确

**当前语法（§25）：**

```GoScript
fun getInfo() {
    return {
        x: 10,
        y: 20,
    }
}
let { x, y } = getInfo()
```

**问题：** `{ x: 10, y: 20 }` 是什么类型？

- 匿名结构体？Go 可以有匿名 struct，但用起来不方便
- Map？那 key 是 string 类型 (`"x"`, `"y"`)？
- 需要先定义 type 然后引用？

#### 方案 A：必须先定义 type，不允许匿名结构体返回

```GoScript
type Info = {
    x Int
    y Int
}

fun getInfo() Info {
    return Info { x: 10, y: 20 }
}
```

#### 方案 B：支持匿名结构体，编译器自动生成 Go struct

```GoScript
// GoScript 允许
fun getInfo() { x: Int, y: Int } {
    return { x: 10, y: 20 }
}

// 编译器自动生成：
// type __anon_struct_1 struct { X int; Y int }
```

（但这与问题 6 的函数体/返回类型歧义冲突）

#### 方案 C：返回 class 实例或 Map

```GoScript
// 返回 class
class Info(x Int, y Int)
fun getInfo() Info = Info(x: 10, y: 20)

// 或者返回 Map
fun getInfo() Map<String, Int> {
    return mapOf("x" to 10, "y" to 20)
}
```

> **你的选择**：____

---

## 附录：快速决策参考表

在此处标注你对每个问题的选择：

| 问题 | 简述 | 选择 |
|------|------|------|
| #1 | `{ }` 语义过载 | |
| #2 | `\|\|` 双重含义 | |
| #3 | 泛型 `<>` vs 比较 | |
| #4 | 内置函数无括号 | |
| #5 | 错误闭包 vs Lambda | |
| #6 | 结构返回类型 vs 函数体 | |
| #7 | 扩展方法矛盾 | |
| #8 | 多返回值矛盾 | |
| #9 | `inf` vs `type` 重叠 | |
| #10 | `type` 一词多义 | |
| #11 | for 初始化语法 | |
| #12 | 冒号 vs 空格 | |
| #13 | `===` 未定义 | |
| #14 | if 表达式括号 | |
| #15 | when/is 绑定变量 | |
| #16 | for-in 顺序 | |
| #17 | send/recv 身份 | |
| #18 | import 别名语法 | |
| #19 | Void 类型 | |
| #20 | 类字段可变性 | |
| #21 | throw 编译策略 | |
| #22 | 联合/交叉类型编译 | |
| #23 | 原始字符串插值 | |
| #24 | 解构别名语法 | |
| #25 | return { } 类型 | |
