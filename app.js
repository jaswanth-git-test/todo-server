const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const format = require("date-fns/format");

const dbPath = path.join(__dirname, "todoApplication.db");

let db;

app.use(express.json());

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running in http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

app.get("/todos/", async (req, res) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = req.query;

  const getQuery = `
    select * from todo 
    where status like '%${status}%' 
      and priority like '%${priority}%' 
      and category like '%${category}%'
      and todo like '%${search_q}%'
  `;
  try {
    const dbResponse = await db.all(getQuery);
    console.log(dbResponse);
    console.log(req.query);
    res.send(dbResponse);
  } catch (e) {
    res.status(401).send(e.message);
  }
});

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getQuery = `
      select * from todo 
      where id = "${todoId}"
    `;
  try {
    const dbResponse = await db.get(getQuery);
    res.status(200).send(dbResponse);
  } catch (e) {
    res.status(401);
    console.log(e.message);
  }
});

app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  const getQuery = `
      select * from todo 
      where due_date = "${date}"
    `;
  try {
    const dbResponse = await db.get(getQuery);
    res.status(200).send(dbResponse);
  } catch (e) {
    res.status(401).status(e.message);
  }
});

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;
  console.log(format(new Date(dueDate), "yyyy-MM-dd"));
  const postQuery = `
    insert into todo(id,todo,priority,status,category,due_date)
    values
    (
        "${id}",
         "${todo}",
         "${priority}",
         "${status}",
         "${category}",
         "${format(new Date(dueDate), "yyyy-MM-dd")}"
    )
  `;
  try {
    const dbResponse = await db.run(postQuery);
    console.log(dbResponse);
    res.status(200).send("Todo Successfully");
  } catch (e) {
    res.status(401).send(e.message);
  }
});

// app.put("/todos/:todoId/",async(req,res)=>{
//     const {todoId} = req.params;
//     const update =
//     const putQuery = `
//       update todo
//       set
//     `
// })

module.exports = app;
