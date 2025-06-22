interface User {
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

const user: User = {
  name: "TypeScript",
  age: 10
};

console.log(greetUser(user));

export { User, greetUser }; 