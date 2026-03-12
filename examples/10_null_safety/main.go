package main

import "fmt"

type Address struct {
	City string
	Zip  *string
}

func NewAddress(city string, zip *string) *Address {
	return &Address{City: city, Zip: zip}
}

type User struct {
	Name    string
	Age     int
	Address *Address
}

func NewUser(name string, age int, address *Address) *User {
	return &User{Name: name, Age: age, Address: address}
}

func main() {
	nameVal := "Alice"
	name := &nameVal
	var empty *string = nil

	// 可选链
	if name != nil {
		fmt.Println(len(*name))
	} else {
		fmt.Println(nil)
	}
	if empty != nil {
		fmt.Println(len(*empty))
	} else {
		fmt.Println("<nil>")
	}

	// 空值合并
	displayName := "Anonymous"
	if name != nil {
		displayName = *name
	}
	displayEmpty := "No name"
	if empty != nil {
		displayEmpty = *empty
	}
	fmt.Println(displayName)
	fmt.Println(displayEmpty)

	// 非空断言
	l := len(*name)
	fmt.Printf("Name length: %d\n", l)

	// 深层可选链
	zip200000 := "200000"
	user1 := NewUser("Bob", 30, NewAddress("Shanghai", &zip200000))
	user2 := NewUser("Charlie", 25, nil)

	if user1.Address != nil {
		fmt.Println(user1.Address.City)
	}
	if user2.Address != nil {
		fmt.Println(user2.Address.City)
	} else {
		fmt.Println("<nil>")
	}

	city := "Unknown"
	if user2.Address != nil {
		city = user2.Address.City
	}
	fmt.Println(city)

	zipStr := "N/A"
	if user1.Address != nil && user1.Address.Zip != nil {
		zipStr = *user1.Address.Zip
	}
	fmt.Println(zipStr)

	// 可空数组元素 → []*int
	one, three, five := 1, 3, 5
	items := []*int{&one, nil, &three, nil, &five}
	for _, item := range items {
		v := 0
		if item != nil {
			v = *item
		}
		fmt.Printf("%d ", v)
	}
	fmt.Println()

	// 可空数组 → *[]int
	var arr *[]int = nil
	arrLen := 0
	if arr != nil {
		arrLen = len(*arr)
	}
	fmt.Println(arrLen)

	// 智能转型 → type switch
	printLength := func(x any) {
		switch v := x.(type) {
		case string:
			fmt.Printf("String length: %d\n", len(v))
		case int:
			fmt.Printf("Int value: %d\n", v)
		default:
			fmt.Println("Unknown type")
		}
	}

	printLength("hello")
	printLength(42)
	printLength(true)

	describe := func(x any) string {
		switch v := x.(type) {
		case string:
			return fmt.Sprintf("String of length %d", len(v))
		case int:
			return fmt.Sprintf("Int: %d", v)
		case bool:
			return fmt.Sprintf("Bool: %v", v)
		case *User:
			return fmt.Sprintf("User: %s", v.Name)
		default:
			return "Unknown"
		}
	}

	fmt.Println(describe("test"))
	fmt.Println(describe(123))
	fmt.Println(describe(user1))
}
