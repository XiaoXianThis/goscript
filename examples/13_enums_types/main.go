package main

import (
	"fmt"
	"math"
)

// 枚举 → iota
type Color int

const (
	ColorRed Color = iota
	ColorGreen
	ColorBlue
)

// Distinct Type → Go named type
type UserID int64
type Meters float64
type Seconds float64

// 字面量类型 → type + const
type Direction string

const (
	DirectionNorth Direction = "north"
	DirectionSouth Direction = "south"
	DirectionEast  Direction = "east"
	DirectionWest  Direction = "west"
)

// 联合类型 → any (编译器保证类型安全)
type JsonValue = any

// 结构类型（值语义）→ Go struct
type Point struct {
	X float64
	Y float64
}

type Size struct {
	Width  float64
	Height float64
}

// 交叉类型 → struct embedding
type Rect struct {
	Point
	Size
}

func (p Point) DistanceTo(other Point) float64 {
	dx := p.X - other.X
	dy := p.Y - other.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func (p Point) String() string {
	return fmt.Sprintf("(%g, %g)", p.X, p.Y)
}

// class → pointer type
type MutableCounter struct {
	count int
}

func NewMutableCounter() *MutableCounter {
	return &MutableCounter{count: 0}
}

func (c *MutableCounter) Increment() { c.count++ }
func (c *MutableCounter) Get() int   { return c.count }

type ImmutablePoint struct {
	X float64
	Y float64
	Z float64
}

func main() {
	c := ColorRed
	var name string
	switch c {
	case ColorRed:
		name = "Red"
	case ColorGreen:
		name = "Green"
	case ColorBlue:
		name = "Blue"
	}
	fmt.Printf("Color: %s\n", name)

	id := UserID(42)
	distance := Meters(100.5)
	duration := Seconds(3.14)
	fmt.Printf("ID: %d, Distance: %g, Duration: %g\n", id, distance, duration)

	raw := int64(id)
	fmt.Printf("Raw ID: %d\n", raw)

	dir := DirectionNorth
	fmt.Printf("Direction: %s\n", dir)

	p1 := Point{X: 1.0, Y: 2.0}
	p2 := p1
	p2.X = 10.0
	fmt.Printf("p1: %s\n", p1.String())
	fmt.Printf("p2: %s\n", p2.String())

	origin := Point{X: 0.0, Y: 0.0}
	target := Point{X: 3.0, Y: 4.0}
	fmt.Printf("Distance: %g\n", origin.DistanceTo(target))

	printJson := func(v any) {
		switch v := v.(type) {
		case string:
			fmt.Printf("String: %s\n", v)
		case int:
			fmt.Printf("Int: %d\n", v)
		case float64:
			fmt.Printf("Float: %g\n", v)
		case bool:
			fmt.Printf("Bool: %v\n", v)
		default:
			fmt.Println("Complex type")
		}
	}
	printJson("hello")
	printJson(42)
	printJson(3.14)

	counter := NewMutableCounter()
	counter.Increment()
	counter.Increment()
	counter.Increment()
	fmt.Printf("Counter: %d\n", counter.Get())

	pt := ImmutablePoint{X: 1.0, Y: 2.0, Z: 3.0}
	fmt.Printf("3D Point: (%g, %g, %g)\n", pt.X, pt.Y, pt.Z)
}
