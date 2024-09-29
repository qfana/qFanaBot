const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config();
const token = process.env.TOKEN;
const { gameOptions, againOptions } = require('./components/option.js');
const bot = new TelegramApi(token, { polling: true });
const userConroller = require("./controllers/userConroller.js");
const express = require('express');
const pool = require('./config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log('Connected to the database:', res.rows);
  }
});

const chats = {};
const games = {};

const gameStart = async (chatId) => {
  if (games[chatId]) {
    games[chatId].forEach((id) => {
      bot.deleteMessage(chatId, id);
    });
  }
  games[chatId] = [];
  let message = await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты попробуй ее отгадать!`);
  games[chatId] = [message.message_id];

  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  message = await bot.sendMessage(chatId, "Отгадывай!", gameOptions);
  games[chatId].push(message.message_id);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Начать диалог" },
    { command: "/info", description: "Информация о себе" },
    { command: "/game", description: 'Запустить игру "Угадайка"' }
  ]);
};

bot.on('message', async msg => {

  // console.log(msg);

  const text = msg.text;
  const chatId = msg.chat.id;
  const username = msg.from.first_name;
  const login = msg.chat.username;
  const premium = msg.from.is_premium;

  if (text === "/start") {
    userConroller.createUser(msg);
    return bot.sendMessage(chatId, `Привет ${username}, это бот куфаны!`);
  }
  if (text === "/info") {

    await bot.sendSticker(chatId, 'https://data.chpic.su/stickers/s/SHinobu124/SHinobu124_016.webp');

    return bot.sendMessage(chatId, `Информация о тебе:
  Ник: ${username};
  Логин: ${login};
  ИД переписки: ${chatId};
  Премиум: ${premium};
  Сообщение: ${text};
  `);

  }
  if (text === "/game") {
    // await games.push(msg.message_id);
    return gameStart(chatId);
  }
  if (text === "/takeadmin") {

    const check = await userConroller.checkAdmin(msg);
    if (check) {
      return await bot.sendMessage(chatId, `Ты уже админ`);
    }
    userConroller.makeAdmin(msg);

    return await bot.sendMessage(chatId, `Админка была выдана пользователю: ${username}!`);

  }
});

bot.on('callback_query', async msg => {
  await bot.answerCallbackQuery(msg.id);
  const data = msg.data;
  const chatId = msg.message.chat.id;

  if (data === "/again") {
    return gameStart(chatId);
  }

  if (data == chats[chatId]) {

    const message = await bot.sendMessage(chatId, `Ты выбрал цифру: ${chats[chatId]} - Поздравляю, ты угадал!`, againOptions);
    games[chatId].push(message.message_id);
    console.log(message);


    return message;

  } else {

    const message = await bot.sendMessage(chatId, `Увы, ты выбрал цифру: ${data}, а Бот загадал: ${chats[chatId]}.`, againOptions);
    games[chatId].push(message.message_id);

    return message;

  }
});


start();

// editMessageText