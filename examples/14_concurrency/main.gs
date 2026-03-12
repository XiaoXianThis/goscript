package main

import "fmt"
import "sync"
import "time"

// 并发求和：将数组分段，每段在 goroutine 中计算
fun concurrentSum(nums Int[]) -> Int {
    val chunkSize = 1000
    val chunks = nums.length / chunkSize
    let ch = chan<Int>(chunks + 1)

    for let i = 0; i < nums.length; i += chunkSize {
        val start = i
        val end = if i + chunkSize > nums.length { nums.length } else { i + chunkSize }
        val chunk = nums[start..<end]

        go {
            let sum = 0
            for n in chunk {
                sum += n
            }
            ch <- sum
        }
    }

    let total = 0
    val numChunks = (nums.length + chunkSize - 1) / chunkSize
    for _ in 0..<numChunks {
        total += <-ch
    }
    return total
}

// 生产者-消费者模式
fun producer(ch chan<Int>, count Int) {
    for i in 0..<count {
        ch <- i
    }
    close(ch)
}

fun consumer(id Int, ch chan<Int>, done chan<Bool>) {
    for item in ch {
        fmt.Println("Consumer $id got: $item")
    }
    done <- true
}

// select 示例
fun selectDemo() {
    let ch1 = chan<String>(1)
    let ch2 = chan<String>(1)

    go {
        time.Sleep(time.Millisecond * 100)
        ch1 <- "one"
    }

    go {
        time.Sleep(time.Millisecond * 50)
        ch2 <- "two"
    }

    // 等待两个结果
    for _ in 0..<2 {
        select {
            case v <- ch1 -> { fmt.Println("Received from ch1: $v") }
            case v <- ch2 -> { fmt.Println("Received from ch2: $v") }
        }
    }
}

// WaitGroup 示例
fun waitGroupDemo() {
    let wg = sync.WaitGroup()
    val tasks = ["task-a", "task-b", "task-c", "task-d"]

    for task in tasks {
        wg.Add(1)
        go {
            defer { wg.Done() }
            fmt.Println("Processing: $task")
            time.Sleep(time.Millisecond * 50)
            fmt.Println("Completed: $task")
        }
    }

    wg.Wait()
    fmt.Println("All tasks done")
}

// Mutex 保护共享状态
fun mutexDemo() {
    let mu = sync.Mutex()
    let count = 0
    let wg = sync.WaitGroup()

    for _ in 0..<100 {
        wg.Add(1)
        go {
            defer { wg.Done() }
            mu.Lock()
            count++
            mu.Unlock()
        }
    }

    wg.Wait()
    fmt.Println("Final count: $count")
}

fun main() {
    // 基本 goroutine
    let done = chan<Bool>()
    go {
        fmt.Println("Hello from goroutine!")
        done <- true
    }
    <-done

    // Channel 通信
    let ch = chan<Int>(3)
    ch <- 10
    ch <- 20
    ch <- 30
    fmt.Println(<-ch)
    fmt.Println(<-ch)
    fmt.Println(<-ch)

    // 并发求和
    let nums = Int[](capacity: 5000)
    for i in 0..<5000 {
        nums.push(i)
    }
    fmt.Println("Concurrent sum: ${concurrentSum(nums)}")

    // select
    selectDemo()

    // WaitGroup
    waitGroupDemo()

    // Mutex
    mutexDemo()
}
