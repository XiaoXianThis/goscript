package main

import (
	"errors"
	"fmt"
	"os"
)

func divide(a, b float64) (float64, error) {
	if b == 0.0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

func validateAge(age int) error {
	if age < 0 {
		return errors.New("age cannot be negative")
	}
	if age > 150 {
		return errors.New("age is unrealistic")
	}
	return nil
}

type ValidationError struct {
	Field  string
	Reason string
}

func NewValidationError(field, reason string) *ValidationError {
	return &ValidationError{Field: field, Reason: reason}
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error [%s]: %s", e.Field, e.Reason)
}

func validateEmail(email string) (string, error) {
	if len(email) == 0 || !contains(email, "@") {
		return "", NewValidationError("email", "missing @")
	}
	return email, nil
}

func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

func processInput(a, b float64) (string, error) {
	result, err := divide(a, b)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("Result: %g", result), nil
}

func readConfig(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()
	buf := make([]byte, 1024)
	n, err := file.Read(buf)
	if err != nil {
		return "", err
	}
	return string(buf[:n]), nil
}

func main() {
	// catch — 就地处理
	r1, err := divide(10.0, 3.0)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		r1 = 0.0
	}
	fmt.Printf("10 / 3 = %g\n", r1)

	// catch — 错误回退
	r2, err := divide(10.0, 0.0)
	if err != nil {
		r2 = 0.0
	}
	fmt.Printf("10 / 0 = %g (fallback)\n", r2)

	// try! — 强制执行
	r3, err := divide(100.0, 5.0)
	if err != nil {
		panic(err)
	}
	fmt.Printf("100 / 5 = %g\n", r3)

	// catch 中使用 return
	safeDivide := func(a, b float64) float64 {
		result, err := divide(a, b)
		if err != nil {
			fmt.Printf("Cannot divide: %v\n", err)
			return 0.0
		}
		return result
	}
	fmt.Println(safeDivide(10.0, 0.0))

	// 自定义错误
	email, err := validateEmail("invalid-email")
	if err != nil {
		fmt.Println(err.Error())
		email = "default@example.com"
	}
	fmt.Printf("Email: %s\n", email)

	// try 传播
	msg, err := processInput(10.0, 0.0)
	if err != nil {
		msg = fmt.Sprintf("Failed: %s", err.Error())
	}
	fmt.Println(msg)

	// validateAge
	if err := validateAge(-5); err != nil {
		fmt.Printf("Age error: %s\n", err.Error())
	}

	// 读取文件
	content, err := readConfig("nonexistent.txt")
	if err != nil {
		content = "config not found"
	}
	fmt.Println(content)
}
