package main

import "fmt"
import "os"

// 可失败函数: -> !Type
fun divide(a Float, b Float) -> !Float {
    if b == 0.0 {
        throw Error("division by zero")
    }
    return a / b
}

// 无返回值但可能失败: -> !
fun validateAge(age Int) -> ! {
    if age < 0 {
        throw Error("age cannot be negative")
    }
    if age > 150 {
        throw Error("age is unrealistic")
    }
}

// 自定义错误类型
class ValidationError(field String, reason String) {
    fun message() -> String = "validation error [$field]: $reason"
}

fun validateEmail(email String) -> !String {
    if !email.contains("@") {
        throw ValidationError(field: "email", reason: "missing @")
    }
    return email
}

// try 传播错误
fun processInput(a Float, b Float) -> !String {
    val result = try divide(a, b)
    return "Result: $result"
}

// 综合示例
fun readConfig(path String) -> !String {
    let file = try os.Open(path)
    defer { file.Close() }
    let buf = Byte[](capacity: 1024)
    let (n, _) = try file.Read(buf)
    return String(buf[0..<n])
}

fun main() {
    // catch — 就地处理
    val r1 = divide(10.0, 3.0) catch { err ->
        fmt.Println("Error: $err")
        0.0
    }
    fmt.Println("10 / 3 = $r1")

    // catch — 错误回退
    val r2 = divide(10.0, 0.0) catch { 0.0 }
    fmt.Println("10 / 0 = $r2 (fallback)")

    // try! — 强制执行（确信不会出错）
    val r3 = try! divide(100.0, 5.0)
    fmt.Println("100 / 5 = $r3")

    // catch 中使用 return
    fun safeDivide(a Float, b Float) -> Float {
        val result = divide(a, b) catch { err ->
            fmt.Println("Cannot divide: $err")
            return 0.0
        }
        return result
    }
    fmt.Println(safeDivide(10.0, 0.0))

    // 自定义错误
    val email = validateEmail("invalid-email") catch { err ->
        fmt.Println(err.message())
        "default@example.com"
    }
    fmt.Println("Email: $email")

    // try 传播
    val msg = processInput(10.0, 0.0) catch { err ->
        "Failed: ${err.message()}"
    }
    fmt.Println(msg)

    // validateAge
    validateAge(-5) catch { err ->
        fmt.Println("Age error: ${err.message()}")
    }

    // 读取文件
    val content = readConfig("nonexistent.txt") catch { err ->
        "config not found"
    }
    fmt.Println(content)
}
