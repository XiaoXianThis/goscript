package main

import (
	"fmt"
	"strings"
)

func main() {
	name := "GoScript"
	version := 1
	pi := 3.14159

	greeting := fmt.Sprintf("Hello, %s!", name)
	info := fmt.Sprintf("Version: %d, PI ≈ %g", version+1, pi)
	fmt.Println(greeting)
	fmt.Println(info)

	escaped := "line1\nline2\ttab"
	fmt.Println(escaped)

	price := "Price: $9.99"
	fmt.Println(price)

	raw := `SELECT * FROM users WHERE name = 'Alice'`
	fmt.Println(raw)

	multiline := `
        {
            "name": "GoScript",
            "version": 1
        }
    `
	fmt.Println(multiline)

	s := "  Hello, World!  "
	fmt.Println(strings.TrimSpace(s))
	fmt.Println(strings.ToUpper(s))
	fmt.Println(strings.ToLower(s))
	fmt.Println(strings.Contains(s, "World"))
	fmt.Println(strings.ReplaceAll(s, "World", "GoScript"))

	csv := "a,b,c,d"
	parts := strings.Split(csv, ",")
	fmt.Println(parts)
	fmt.Println(len(csv))
}
