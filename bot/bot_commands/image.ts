import { env } from 'bun';
import { getNekosRandomImage } from '../../image_api/anime/nekos/mod';
import { getE621RandomImage } from '../../image_api/furry/e621/mod';
import type { MyContext } from '../types';
import { logUserAction, mdEscape } from '../utils';

export async function imageCommandAnime(ctx: MyContext) {
  const image = await getNekosRandomImage({ rating: ctx.session.rating, tags: ctx.session.tags });

  logUserAction(ctx, '⛩️ Получить изображение [Anime]');

  if (image !== null) {
    const description = [
      `*Автор*: ${image.artist_name ?? 'не указан'}`,
      `*Теги*: ${mdEscape(image.tags.join(', '))}`,
      `*Рейтинг*: \`${ctx.session.rating}\``,
    ];

    await ctx.replyWithChatAction('upload_photo');
    await ctx.replyWithPhoto(image.url, {
      caption: description.join('\n'),
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  await ctx.reply('Не удалось получить ссылку на изображение :(');
}

export async function imageCommandFurry(ctx: MyContext) {
  const post = await getE621RandomImage('fox', env.PROXY!);
  logUserAction(ctx, '🦊 Получить изображение [Furry]');

  if (post !== null) {
    const { artist } = post?.tags;
    const description = [
      artist.length == 1 ? `*Автор*: ${artist[0]}` : `*Авторы*: ${artist.join(', ')}`,
      `*Теги*: ${mdEscape(post.tags.general.join(', '))}`,
      `*Рейтинг*: \`${post.rating}\``,
      `[Ссылка на изображение](https://e621.net/posts/${post.id})`,
    ];

    await ctx.replyWithChatAction('upload_photo');
    await ctx.replyWithPhoto(post.file.url, {
      caption: description.join('\n'),
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  await ctx.reply('Не удалось получить ссылку на изображение :(');
}
