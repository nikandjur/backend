import { prisma } from '../../db.js'

interface SearchResult {
	id: string
	title: string
	content: string | null
	highlighted_title: string
	highlighted_content: string
	author: {
		id: string
		name: string
	}
	tags: string[]
	relevance: number
}

export const searchService = {
	async searchPosts(
		query: string,
		limit: number = 50
	): Promise<SearchResult[]> {
		return await prisma.$queryRaw`
      SELECT 
        p.id,
        p.title,
        p.content,
        -- Подсветка совпадений в заголовке
        ts_headline(
          'russian', 
          p.title, 
          websearch_to_tsquery('russian', ${query}),
          'StartSel=<mark>, StopSel=</mark>'
        ) as highlighted_title,
        -- Подсветка совпадений в контенте
        ts_headline(
          'russian',
          COALESCE(p.content, ''),
          websearch_to_tsquery('russian', ${query}),
          'StartSel=<mark>, StopSel=</mark>, MaxFragments=2'
        ) as highlighted_content,
        -- Информация об авторе
        (
          SELECT json_build_object('id', u.id, 'name', u.name) 
          FROM "User" u 
          WHERE u.id = p."authorId"
        ) as author,
        -- Список тегов
        (
          SELECT json_agg(t.name) 
          FROM "Tag" t 
          JOIN "PostTag" pt ON t.id = pt."tagId" 
          WHERE pt."postId" = p.id
        ) as tags,
        -- Комбинированная релевантность (FTS + триграммы)
        GREATEST(
          COALESCE(
            ts_rank_cd(
              to_tsvector('russian', p.title || ' ' || COALESCE(p.content, '')),
              websearch_to_tsquery('russian', ${query})
            ), 
            0
          ),
          COALESCE(similarity(p.title, ${query}), 0),
          COALESCE(similarity(p.content, ${query}), 0)
        ) as relevance
      FROM "Post" p
      WHERE 
        -- Полнотекстовый поиск
        to_tsvector('russian', p.title || ' ' || COALESCE(p.content, '')) @@ 
          websearch_to_tsquery('russian', ${query})
        -- Или поиск с опечатками (триграммы)
        OR p.title % ${query}
        OR p.content % ${query}
      ORDER BY relevance DESC
      LIMIT ${limit}
    `
	},
}
