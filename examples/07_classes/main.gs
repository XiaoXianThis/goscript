package main

import "fmt"

// 主构造函数
class Person(name String, age Int) {
    fun greet() -> String {
        return "Hi, I'm $name, age $age"
    }

    fun isAdult() -> Bool = age >= 18
}

// 字段可变性
class User {
    name String
    val id Int
    private age Int

    constructor(id Int, name String, age Int) {
        this.id = id
        this.name = name
        this.age = age
    }

    fun getAge() -> Int = age
}

// init 块
class Config(host String, port Int) {
    init {
        if port < 0 || port > 65535 {
            panic("invalid port: $port")
        }
    }

    fun address() -> String = "$host:$port"
}

// 嵌入（组合）
class Employee(
    Person,
    company String,
) {
    fun info() -> String {
        return "${greet()} at $company"
    }
}

// 引用语义演示
fun modifyPerson(p Person) {
    p.name = "Modified"
}

fun main() {
    // 基本用法
    let p = Person(name: "Alice", age: 30)
    fmt.Println(p.greet())
    fmt.Println(p.isAdult())

    // 引用语义：p1 和 p2 指向同一个对象
    let p1 = Person(name: "Bob", age: 25)
    let p2 = p1
    p2.name = "Charlie"
    fmt.Println(p1.name)  // "Charlie" — 引用语义

    // 传递给函数也是引用
    modifyPerson(p1)
    fmt.Println(p1.name)  // "Modified"

    // User 次构造函数
    let user = User(id: 1, name: "Dave", age: 28)
    fmt.Println("${user.name} (id=${user.id}), age=${user.getAge()}")

    // Config init 校验
    let cfg = Config(host: "localhost", port: 8080)
    fmt.Println(cfg.address())

    // 嵌入
    let emp = Employee(
        Person: Person(name: "Eve", age: 35),
        company: "Acme",
    )
    fmt.Println(emp.info())
    fmt.Println(emp.greet())  // Person.greet() 自动提升
}
