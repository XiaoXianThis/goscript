package main

import (
	"fmt"
	"sync"
	"time"
)

func concurrentSum(nums []int) int {
	chunkSize := 1000
	ch := make(chan int, len(nums)/chunkSize+1)

	for i := 0; i < len(nums); i += chunkSize {
		start := i
		end := i + chunkSize
		if end > len(nums) {
			end = len(nums)
		}
		chunk := nums[start:end]

		go func() {
			sum := 0
			for _, n := range chunk {
				sum += n
			}
			ch <- sum
		}()
	}

	total := 0
	numChunks := (len(nums) + chunkSize - 1) / chunkSize
	for i := 0; i < numChunks; i++ {
		total += <-ch
	}
	return total
}

func producer(ch chan int, count int) {
	for i := 0; i < count; i++ {
		ch <- i
	}
	close(ch)
}

func consumer(id int, ch chan int, done chan bool) {
	for item := range ch {
		fmt.Printf("Consumer %d got: %d\n", id, item)
	}
	done <- true
}

func selectDemo() {
	ch1 := make(chan string, 1)
	ch2 := make(chan string, 1)

	go func() {
		time.Sleep(100 * time.Millisecond)
		ch1 <- "one"
	}()

	go func() {
		time.Sleep(50 * time.Millisecond)
		ch2 <- "two"
	}()

	for i := 0; i < 2; i++ {
		select {
		case v := <-ch1:
			fmt.Printf("Received from ch1: %s\n", v)
		case v := <-ch2:
			fmt.Printf("Received from ch2: %s\n", v)
		}
	}
}

func waitGroupDemo() {
	var wg sync.WaitGroup
	tasks := []string{"task-a", "task-b", "task-c", "task-d"}

	for _, task := range tasks {
		wg.Add(1)
		go func(t string) {
			defer wg.Done()
			fmt.Printf("Processing: %s\n", t)
			time.Sleep(50 * time.Millisecond)
			fmt.Printf("Completed: %s\n", t)
		}(task)
	}

	wg.Wait()
	fmt.Println("All tasks done")
}

func mutexDemo() {
	var mu sync.Mutex
	count := 0
	var wg sync.WaitGroup

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()
			count++
			mu.Unlock()
		}()
	}

	wg.Wait()
	fmt.Printf("Final count: %d\n", count)
}

func main() {
	done := make(chan bool)
	go func() {
		fmt.Println("Hello from goroutine!")
		done <- true
	}()
	<-done

	ch := make(chan int, 3)
	ch <- 10
	ch <- 20
	ch <- 30
	fmt.Println(<-ch)
	fmt.Println(<-ch)
	fmt.Println(<-ch)

	nums := make([]int, 0, 5000)
	for i := 0; i < 5000; i++ {
		nums = append(nums, i)
	}
	fmt.Printf("Concurrent sum: %d\n", concurrentSum(nums))

	selectDemo()

	waitGroupDemo()

	mutexDemo()
}
