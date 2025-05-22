const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const { Bot } = require("grammy");
const { dialogs, message, chats } = require("telegram/client");
const { NewMessage } = require("telegram/events");
const myId = 1302985298;

const apiId = 17106420;
const apiHash = '44f5f62677f0a4b9d634abf6afd3200e';
const sessionFail = './session.txt';
const BotTOken = '8198051736:AAE_zFJndV23gfhCZcPxo2AqG4G5ySvvw1o';
const chatsId = [-1002387711459, -1002519673103]
const kWords = ["4", "5",];
const botUsername = "SasSpamBot"
const chats1 =[ -1002387711459]
const chats2 = [-1002519673103]

async function main() {
  let sessionStr = '';
  if (fs.existsSync(sessionFail)) {
    sessionStr = fs.readFileSync(sessionFail, 'utf8').trim();
  }
  const tempClient = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, {
    connectionRetries: 5,
  });

  await tempClient.start({
    phoneNumber: async () => await input.text('нмер тел'),
    password: async () => await input.text('password'),
    phoneCode: async () => await input.text('youre code in telegram'),
    onError: (error) => console.log('error', error),
  })

  sessionStr = tempClient.session.save()
  fs.writeFileSync(sessionFail, sessionStr)
  console.log('строка создана');

  const client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  const dialogs = await client.getDialogs();
  console.log(`мои диалоги: ${dialogs.length}`);

  const bot = new Bot(BotTOken);
  bot.command("start", async (ctx) => {
    await ctx.reply("отправь собщ для спама");
  });

  bot.command("send", async (ctx) => {
    const messageForspam = ctx.message.text.toString().split(" ").slice(1).join(" ")
    if (!messageForspam) {
      return ctx.reply("error")
    }

    for (const chatId of chatsId) {
      try {
        await client.sendMessage(chatId, { message: messageForspam });
        console.log('спам завершился');
      } catch (error) {
        console.error('erorr');
      }
    }

    await ctx.reply(" спам завершился");
  });
  bot.on('message', async (ctx) => {
    await ctx.reply('не знаю что ты напмсал')
  })

  client.addEventHandler(async (event) => {
    const msg = event.message;
    const chatId = msg.chatId.value;
    if (!chatsId.includes(Number(chatId))) return;

    const sender = await msg.getSender();
    if (sender.username.toLowerCase() === botUsername.toLowerCase()) {
      return;
    }

    const text = msg.message.toLowerCase();
    if (!text) return;

    const hasKeyword = kWords.some(word => text.includes(word));
    if (!hasKeyword) return;

    let senderName;

    if (sender?.firstName) {
      senderName = sender.firstName;
    } else {
      senderName = "Неизвестный пользователь";
    }
    const logUser = `Пользователь: ${senderName}, Сообщение: ${msg.message}`;
    try {
        await bot.api.sendMessage(chatId.toString(), logUser);
      } catch (error) {
        console.error("error send chsts", error.message);
      } 
  }, new NewMessage({}));                

  bot.start();
}

main()
