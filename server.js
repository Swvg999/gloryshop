const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ArtyomProtas2006",
  database: "myapp_db",
});
db.connect((err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err);
  } else {
    console.log("Соединение с базой данных установлено");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Проверяем уникальность email и никнейма
  db.query(
    "SELECT email, username FROM users WHERE email = ? OR username = ?",
    [email, username],
    async (err, result) => {
      if (err) throw err;

      // Проверяем, существует ли email или никнейм
      const emailExists = result.some((row) => row.email === email);
      const usernameExists = result.some((row) => row.username === username);

      if (emailExists) {
        return res.status(400).json({ message: "Email уже зарегистрирован" });
      }

      if (usernameExists) {
        return res.status(400).json({ message: "Никнейм уже занят" });
      }

      // Если email и никнейм уникальны, хешируем пароль и добавляем пользователя
      const hashedPassword = await bcrypt.hash(password, 8);

      db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err, result) => {
          if (err) throw err;
          res.status(201).json({ message: "Пользователь зарегистрирован" });
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) throw err;

      if (result.length === 0) {
        return res.status(400).json({ message: "Неверный email или пароль" });
      }

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Неверный email или пароль" });
      }

      const token = jwt.sign({ id: user.id }, "your_jwt_secret", {
        expiresIn: "1h",
      });

      res.json({ message: "Логин успешен", token });
    }
  );
});
