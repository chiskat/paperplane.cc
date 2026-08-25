import { allArticles } from 'content-collections'

export const articleList =
  process.env.NODE_ENV === 'development'
    ? allArticles
    : allArticles.filter(article => !article.draft)
