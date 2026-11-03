
// 1. Arrow Function
const add = (a: number, b: number): number => {
  return a + b;
};

console.log("Addition:", add(10, 20));

// 2. Object Destructuring
const student = {
  name: "Soniya",
  age: 20,
  course: "B.Tech CSE",
};

const { name, age, course } = student;

console.log("\nObject Destructuring:");
console.log(name);
console.log(age);
console.log(course);

// 3. Spread Operator
const numbers = [10, 20, 30];
const moreNumbers = [...numbers, 40, 50];

console.log("\nSpread Operator:");
console.log("Original Array:", numbers);
console.log("New Array:", moreNumbers);

// 4. map()
const doubledNumbers = numbers.map((num) => num * 2);

console.log("\nUsing map():");
console.log(doubledNumbers);

// 5. filter()
const evenNumbers = moreNumbers.filter((num) => num % 2 === 0);

console.log("\nUsing filter():");
console.log(evenNumbers);

// 6. Async/Await with Fetch API
const fetchUsers = async (): Promise<void> => {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();

    console.log("\nFetched Users:");
    console.log(users);
    console.log("\nTotal Users:", users.length);
  } catch (error) {
    console.log("Error:", error);
  }
};

fetchUsers();

// 7. TypeScript Interface
interface User {
  name: string;
  age: number;
}

// 8. Function Using Interface
const greetUser = (user: User): void => {
  console.log("\nUser Details:");
  console.log("Name:", user.name);
  console.log("Age:", user.age);
};

const user: User = {
  name: "Soniya",
  age: 20,
};

greetUser(user);
