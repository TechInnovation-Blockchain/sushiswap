import { ArticleJsonLd, NextSeo } from 'next-seo'
import { FC } from 'react'

import { Article, Maybe } from '../../../.mesh'
import { getOptimizedMedia, isMediaVideo } from '../../../lib/media'

interface ArticleSeo {
  article?: Maybe<Article>
}

export const ArticleSeo: FC<ArticleSeo> = ({ article }) => {
  if (!article) return <></>

  const cover = getOptimizedMedia({ metadata: article.cover?.data?.attributes?.provider_metadata })
  const coverAlt = article.cover?.data?.attributes?.alternativeText

  const authors = article?.authors?.data?.map((author) => ({
    name: author?.attributes?.name,
    url: `https://twitter.com/${author?.attributes?.handle}`,
  }))

  return (
    <>
      <NextSeo
        title={article.title}
        description={article.description}
        // @ts-ignore
        openGraph={{
          ...(isMediaVideo(article?.cover?.data?.attributes?.provider_metadata)
            ? {
                videos: [{ url: cover }],
              }
            : {
                images: [{ url: cover, alt: coverAlt }],
              }),
          article: {
            publishedTime: article?.publishedAt as string,
            modifiedTime: article?.updatedAt as string,
            authors: authors?.map<string>((author) => author?.name as string),
            tags: article?.topics?.data?.reduce<string[]>((acc, el) => [...acc, el?.attributes?.name as string], []),
          },
        }}
        twitter={{
          cardType: isMediaVideo(article.cover?.data?.attributes?.provider_metadata) ? 'player' : 'summary_large_image',
        }}
      />
      <ArticleJsonLd
        type="Article"
        url={`https://sushi.com/academy/articles/${article.slug}`}
        title={article.title}
        description={article.description}
        authorName={authors}
        images={[cover]}
        datePublished={article.publishedAt}
        dateModified={article.updatedAt}
      />
    </>
  )
}

export default ArticleSeo
