import { conversations, createConversation } from '@grammyjs/conversations';
import { FileAdapter } from '@grammyjs/storage-file';
import { env } from 'bun';
import { Bot, session } from 'grammy';
import { onMessageText } from './bot_commands/message';
import { setSettings } from './bot_commands/settings';
import { startCommand } from './bot_commands/start';
import { setRating } from './conversation/set_rating';
import type { MyContext, SessionData } from './types';

const bot = new Bot<MyContext>(env.TOKEN!);

function initial(): SessionData {
  return { rating: 'safe', tags: 'girl' };
}

bot.use(session({ initial, storage: new FileAdapter<SessionData>({ dirName: 'sessions' }) }));
bot.use(conversations());
bot.use(createConversation(setRating));
bot.command('start', startCommand);
bot.on('message:text', onMessageText);
bot.on('callback_query:data', setSettings);
bot.catch(async err => {
  if (err.message.includes('failed to get HTTP URL content')) {
    const msg = ['telegram не удалось скачать изображение по ссылке:', err.ctx.session.url];
    await err.ctx.reply(msg.join('\n'));
    return;
  }

  console.error(err.message);
});

export async function startPolling() {
  await bot.api.setMyShortDescription('Отправляет случайное изображение с nekosapi.com');
  await bot.api.setMyDescription('Отправляет случайное изображение с nekosapi.com');
  await bot.api.setMyCommands([{ command: 'start', description: 'Показать клавиатуру' }]);

  bot.start();
  console.log('Бот запустился');
}
