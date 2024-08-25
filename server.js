const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Record } = require("./models");
const recordsRouter = require("./routes/records");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api/records", recordsRouter);

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Необработанная ошибка:", err);
  res.status(500).json({ error: "Внутренняя ошибка сервера." });
});

// Получение всех записей
app.get("/api/records", async (req, res) => {
  try {
    const records = await Record.findAll();
    res.json(records);
  } catch (error) {
    console.error("Ошибка при получении записей:", error);
    res.status(500).json({ error: "Ошибка сервера при получении записей." });
  }
});

// Создание новой записи
app.post("/api/records", async (req, res) => {
  try {
    const { date, weight, animal } = req.body;

    // Проверка обязательных полей
    if (!date || !weight || !animal) {
      return res
        .status(400)
        .json({ error: "Все поля обязательны для заполнения." });
    }

    // Валидация веса
    if (isNaN(weight) || weight <= 0) {
      return res
        .status(400)
        .json({ error: "Вес должен быть положительным числом." });
    }

    // Проверка допустимых значений для animal
    const validAnimals = ["cat", "dog", "hamster"];
    if (!validAnimals.includes(animal)) {
      return res.status(400).json({ error: "Некорректный тип животного." });
    }

    // Создание записи
    const newRecord = await Record.create({ date, weight, animal });
    res.json(newRecord);
  } catch (error) {
    console.error("Ошибка при создании записи:", error);
    res.status(500).json({ error: "Ошибка сервера при создании записи." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
