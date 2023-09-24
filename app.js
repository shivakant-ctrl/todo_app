const express = require('express');
const bodyParser = require('body-parser');
const uniqid = require('uniqid'); 
const fs = require("fs");
const cors = require("cors");

// Create an instance of the Express application
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Read todos from todos.json file
function readTodos() {
  const todos = JSON.parse(fs.readFileSync("./todos.json"));
  return todos;
}

// Write to todos.json file
function writeTodos(updatedTodos) {
  fs.writeFileSync("./todos.json", JSON.stringify(updatedTodos));
}

// Get all todos
app.get("/todos", (req, res) => {
  const allTodos = readTodos();
  res.status(200).send(allTodos);
});

// Get todo by Id
app.get("/todos/:id", (req, res) => {
  const allTodos = readTodos();
  const requestedId = req.params.id;
  const matchingTodo = allTodos.find(todo => requestedId === todo.id);

  if (matchingTodo) {
    res.status(200).send(matchingTodo);
  } else {
    res.status(404).send("Todo with the requested ID was not found");
  }
});

// Create a new todo
app.post("/todos", (req, res) => {
  const allTodos = readTodos();
  const {title, description} = req.body;

  if (!title || !description) {
    res.status(400).send('Missing required information: title and/or description');
  } else {
    const newId = uniqid();
    const newTodo = {id: newId, title, description};
    allTodos.push(newTodo);
    // Push updated todos to todos.json file
    writeTodos(allTodos);
    res.status(201).send({id: newId});
  }
});

// Update title and description of todo by Id
app.put("/todos/:id", (req, res) => {
  const allTodos = readTodos();
  const requestedId = req.params.id;
  const {updatedTitle, updatedDescription} = req.body;

  if (!updatedTitle || !updatedDescription) {
    res.status(400).send('Missing required information: title and/or description');
  } else {
    const matchingTodo = allTodos.find(todo => requestedId === todo.id);
    if (!matchingTodo) {
      res.status(404).send("Todo with the requested ID was not found");
    } else {
      matchingTodo.title = updatedTitle;
      matchingTodo.description = updatedDescription;
      writeTodos(allTodos);
      res.status(200).send("Todo with the requested ID was updated successfully");
    }
  }
});

// Delete todo by Id
app.delete("/todos/:id", (req, res) => {
  const allTodos = readTodos();
  const requestedId = req.params.id;
  const todoIndex = allTodos.findIndex(todo => requestedId === todo.id);
  if (todoIndex !== -1) {
    allTodos.splice(todoIndex, 1);
    writeTodos(allTodos);
    res.status(200).send("Todo with the requested ID was deleted successfully");
  } else {
    res.status(404).send("Todo with the requested ID was not found");
  }
});

// Handle undefined routes with a 404 Not Found response
function handleUndefinedRoutes(req, res) {
  res.status(404).send("Route does not exist");
}

app.use(handleUndefinedRoutes);

// Start the Express server and listen on port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
