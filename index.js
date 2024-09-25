const TelegramApi = require('node-telegram-bot-api');
const token = process.env.TOKEN || '8031333963:AAFbtrnP2w2L1cngHQRrdqyKg87bBnC9cY8';
const { gameOptions, againOptions } = require('./option.js');
const bot = new TelegramApi(token, { polling: true });

const chats = {};

const gameStart = async (chatId) => {
  await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты попробуй ее отгадать!`);
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай!", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Начать диалог" },
    { command: "/info", description: "Информация о себе" },
    { command: "/game", description: 'Запустить игру "Угадайка"' }
  ]);
};

bot.on('message', async msg => {

  console.log(msg);

  const text = msg.text;
  const chatId = msg.chat.id;
  const username = msg.from.first_name;
  const login = msg.chat.username;
  const premium = msg.from.is_premium;

  if (text === "/start") {
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
    return gameStart(chatId);
  }
  return bot.sendMessage(chatId, 'Команда не найдена!');
});

bot.on('callback_query', async msg => {
  const data = msg.data;
  const chatId = msg.message.chat.id;

  if (data === "/again") {
    return gameStart(chatId);
  }

  if (data == chats[chatId]) {
    return await bot.sendMessage(chatId, `Ты выбрал цифру: ${chats[chatId]} - Поздравляю, ты угадал!`, againOptions);
  } else {
    return await bot.sendMessage(chatId, `Увы, ты выбрал цифру: ${data}, а Бот загадал: ${chats[chatId]}.`, againOptions);
  }
});
};

start();