package main

import "fmt"

// class → Go struct + pointer methods
type Person struct {
	Name string
	Age  int
}

func NewPerson(name string, age int) *Person {
	return &Person{Name: name, Age: age}
}

func (p *Person) Greet() string {
	return fmt.Sprintf("Hi, I'm %s, age %d", p.Name, p.Age)
}

func (p *Person) IsAdult() bool { return p.Age >= 18 }

type User struct {
	Name string
	Id   int // val → conceptually immutable
	age  int // private → lowercase
}

func NewUser(id int, name string, age int) *User {
	return &User{Id: id, Name: name, age: age}
}

func (u *User) GetAge() int { return u.age }

type Config struct {
	Host string
	Port int
}

func NewConfig(host string, port int) *Config {
	if port < 0 || port > 65535 {
		panic(fmt.Sprintf("invalid port: %d", port))
	}
	return &Config{Host: host, Port: port}
}

func (c *Config) Address() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

type Employee struct {
	*Person
	Company string
}

func NewEmployee(person *Person, company string) *Employee {
	return &Employee{Person: person, Company: company}
}

func (e *Employee) Info() string {
	return fmt.Sprintf("%s at %s", e.Greet(), e.Company)
}

func modifyPerson(p *Person) {
	p.Name = "Modified"
}

func main() {
	p := NewPerson("Alice", 30)
	fmt.Println(p.Greet())
	fmt.Println(p.IsAdult())

	p1 := NewPerson("Bob", 25)
	p2 := p1
	p2.Name = "Charlie"
	fmt.Println(p1.Name) // "Charlie"

	modifyPerson(p1)
	fmt.Println(p1.Name) // "Modified"

	user := NewUser(1, "Dave", 28)
	fmt.Printf("%s (id=%d), age=%d\n", user.Name, user.Id, user.GetAge())

	cfg := NewConfig("localhost", 8080)
	fmt.Println(cfg.Address())

	emp := NewEmployee(NewPerson("Eve", 35), "Acme")
	fmt.Println(emp.Info())
	fmt.Println(emp.Greet())
}
