import { DATA_LIMITS } from '@/constants/app';
import { shuffle } from '@/lib/shuffle';
import { supabase } from '@/lib/supabase';
import { articleFromGNews, type Article } from '@/types/article';
import type { Row } from '@/types/row';

import { ApiError } from './errors';

// Port of lib/services/gnews_service.dart. Calls the `news` Edge Function
// (supabase/functions/news), which keeps the GNews API key on the server.

const TRUSTED_SOURCES = [
  'who.int',
  'cdc.gov',
  'mayoclinic.org',
  'webmd.com',
  'healthline.com',
  'medicalnewstoday.com',
  'bbc.com',
  'bbc.co.uk',
  'nih.gov',
  'cancer.org',
  'cancer.gov',
  'cancerresearchuk.org',
  'nhs.uk',
  'health.harvard.edu',
  'hopkinsmedicine.org',
  'clevelandclinic.org',
  'reuters.com',
  'apnews.com',
  'sciencedaily.com',
  'nature.com',
  'thelancet.com',
  'medscape.com',
  'everydayhealth.com',
  'prevention.com',
  'ncbi.nlm.nih.gov',
];

/** Articles making unsafe medical claims are filtered out. */
const DANGEROUS_KEYWORDS = [
  'cure cancer',
  'miracle cure',
  'alternative cure',
  'stop chemo',
  'avoid chemotherapy',
  'chemo kills',
  'cancer hoax',
  'natural cure',
  'secret cure',
  'big pharma conspiracy',
];

/** "Cancer" is also a zodiac sign; horoscope articles are filtered out. */
const HOROSCOPE_KEYWORDS = [
  'horoscope',
  'zodiac',
  'astrology',
  'tarot',
  'aries',
  'taurus',
  'gemini',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
  'daily horoscope',
  'love horoscope',
  'cancer horoscope',
  'cancer zodiac',
  'june 21',
  'july 22',
  'star sign',
  'birth chart',
  'astrological',
  'moon sign',
  'sun sign',
  'rising sign',
  'cosmic',
];

export function isFromTrustedSource(url: string): boolean {
  const lower = url.toLowerCase();
  return TRUSTED_SOURCES.some((source) => lower.includes(source));
}

export function isSafeContent(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return ![...DANGEROUS_KEYWORDS, ...HOROSCOPE_KEYWORDS].some((keyword) => text.includes(keyword));
}

type NewsRequest =
  { type: 'search'; q: string; max: number } | { type: 'top-headlines'; max: number };

async function fetchFromNewsFunction(body: NewsRequest): Promise<Article[]> {
  const { data, error } = await supabase.functions.invoke<{ articles: Row[] }>('news', { body });
  if (error) throw new ApiError(`Failed to load news: ${error.message}`, error);
  return (data?.articles ?? []).map(articleFromGNews);
}

/** Cancer news, trusted sources first, randomized. */
export async function fetchCancerArticles(maxResults = 3, query = 'cancer'): Promise<Article[]> {
  const all = await fetchFromNewsFunction({
    type: 'search',
    q: query,
    max: DATA_LIMITS.newsArticlesMax,
  });
  const safe = all.filter((article) => isSafeContent(article.title, article.description));
  const trusted = shuffle(safe.filter((article) => isFromTrustedSource(article.url)));
  const others = shuffle(safe.filter((article) => !isFromTrustedSource(article.url)));

  const result = [...trusted];
  if (result.length < maxResults) {
    result.push(...others.slice(0, maxResults - result.length));
  }
  return result.slice(0, maxResults);
}

/** Top health headlines, preferring trusted sources. */
export async function fetchHealthHeadlines(maxResults = 3): Promise<Article[]> {
  const all = await fetchFromNewsFunction({
    type: 'top-headlines',
    max: DATA_LIMITS.newsArticlesMax,
  });
  const safe = all.filter((article) => isSafeContent(article.title, article.description));
  const trusted = safe.filter((article) => isFromTrustedSource(article.url));
  return shuffle(trusted.length > 0 ? trusted : safe).slice(0, maxResults);
}
