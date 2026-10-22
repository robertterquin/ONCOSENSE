import { optionalString, stringOr, type Row } from './row';

/** A news article from the `news` Edge Function (GNews format) or a saved bookmark. */
export type Article = {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  sourceName: string;
};

/** Maps a GNews article (`image`, `source.name`). */
export function articleFromGNews(row: Row): Article {
  const source = row.source as Row | undefined;
  return {
    title: stringOr(row, 'title', ''),
    description: stringOr(row, 'description', ''),
    url: stringOr(row, 'url', ''),
    imageUrl: optionalString(row, 'image'),
    publishedAt: stringOr(row, 'publishedAt', ''),
    sourceName:
      (source && optionalString(source, 'name')) ?? stringOr(row, 'sourceName', 'Unknown'),
  };
}

/** "2 min read", at 200 words per minute of the description. */
export function articleReadTime(article: Article): string {
  const wordCount = article.description.split(' ').length;
  return `${Math.ceil(wordCount / 200)} min read`;
}
