const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const { Record } = require("../models");

// Создание новой записи с валидацией
router.post(
  "/",
  [
    check("date")
      .isISO8601()
      .withMessage("Некорректный формат даты.")
      .not()
      .isEmpty()
      .withMessage("Дата обязательна.")
      .custom((value) => {
        const today = new Date().toISOString().split("T")[0];
        if (value > today) {
          throw new Error("Дата не может быть больше текущей.");
        }
        return true;
      }),
    check("weight")
      .isInt({ min: 1, max: 10000 })
      .withMessage(
        "Вес должен быть положительным целым числом и не больше 10000 грамм."
      )
      .not()
      .isEmpty()
      .withMessage("Вес обязателен."),
    check("animal")
      .isIn(["cat", "dog", "hamster"])
      .withMessage("Некорректный тип животного.")
      .not()
      .isEmpty()
      .withMessage("Тип животного обязателен."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { date, weight, animal } = req.body;
      const newRecord = await Record.create({ date, weight, animal });
      res.json(newRecord);
    } catch (error) {
      console.error("Ошибка при создании записи:", error);
      res.status(500).json({ error: "Ошибка сервера при создании записи." });
    }
  }
);

// Маршрут для редактирования записи
router.put(
  "/:id",
  [
    check("date")
      .isISO8601()
      .withMessage("Некорректный формат даты.")
      .not()
      .isEmpty()
      .withMessage("Дата обязательна."),
    check("weight")
      .isInt({ min: 1 })
      .withMessage("Вес должен быть положительным целым числом.")
      .not()
      .isEmpty()
      .withMessage("Вес обязателен."),
    check("animal")
      .isIn(["cat", "dog", "hamster"])
      .withMessage("Некорректный тип животного.")
      .not()
      .isEmpty()
      .withMessage("Тип животного обязателен."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { date, weight, animal } = req.body;

      const record = await Record.findByPk(id);
      if (!record) {
        return res.status(404).json({ error: "Запись не найдена." });
      }

      // Обновление записи
      record.date = date;
      record.weight = weight;
      record.animal = animal;
      await record.save();

      res.json(record);
    } catch (error) {
      console.error("Ошибка при обновлении записи:", error);
      res.status(500).json({ error: "Ошибка сервера при обновлении записи." });
    }
  }
);

// Маршрут для удаления записи
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Record.findByPk(id);
    if (!record) {
      return res.status(404).json({ error: "Запись не найдена." });
    }

    // Удаление записи
    await record.destroy();
    res.json({ message: "Запись успешно удалена." });
  } catch (error) {
    console.error("Ошибка при удалении записи:", error);
    res.status(500).json({ error: "Ошибка сервера при удалении записи." });
  }
});

module.exports = router;
