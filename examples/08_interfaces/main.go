package main

import "fmt"

type Shape interface {
	Area() float64
	Perimeter() float64
}

type Printable interface {
	ToString() string
}

type PrintableShape interface {
	Shape
	Printable
}

type Circle struct {
	Radius float64
}

func NewCircle(radius float64) *Circle {
	return &Circle{Radius: radius}
}

func (c *Circle) Area() float64      { return 3.14159 * c.Radius * c.Radius }
func (c *Circle) Perimeter() float64 { return 2.0 * 3.14159 * c.Radius }
func (c *Circle) ToString() string   { return fmt.Sprintf("Circle(r=%g)", c.Radius) }

type Rectangle struct {
	Width  float64
	Height float64
}

func NewRectangle(width, height float64) *Rectangle {
	return &Rectangle{Width: width, Height: height}
}

func (r *Rectangle) Area() float64      { return r.Width * r.Height }
func (r *Rectangle) Perimeter() float64 { return 2.0 * (r.Width + r.Height) }
func (r *Rectangle) ToString() string {
	return fmt.Sprintf("Rect(%gx%g)", r.Width, r.Height)
}

func printShapeInfo(s Shape) {
	fmt.Printf("Area: %g, Perimeter: %g\n", s.Area(), s.Perimeter())
}

func describe(s Shape) string {
	switch v := s.(type) {
	case *Circle:
		return fmt.Sprintf("A circle with area %g", v.Area())
	case *Rectangle:
		return fmt.Sprintf("A rectangle with area %g", v.Area())
	default:
		return "Unknown shape"
	}
}

type greeterImpl struct {
	msg string
}

func (g *greeterImpl) ToString() string { return g.msg }

func createGreeter(msg string) Printable {
	return &greeterImpl{msg: msg}
}

func main() {
	shapes := []Shape{
		NewCircle(5.0),
		NewRectangle(3.0, 4.0),
	}

	for _, shape := range shapes {
		printShapeInfo(shape)
		fmt.Println(describe(shape))
	}

	var s Shape = NewCircle(10.0)
	fmt.Printf("Circle area: %g\n", s.Area())

	if c, ok := s.(*Circle); ok {
		fmt.Printf("Radius: %g\n", c.Radius)
	}

	greeter := createGreeter("Hello from anonymous!")
	fmt.Println(greeter.ToString())
}
