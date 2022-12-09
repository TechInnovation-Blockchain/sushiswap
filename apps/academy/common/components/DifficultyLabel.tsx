import { CircleIcon, classNames } from '@sushiswap/ui'
import { DIFFICULTY_ELEMENTS } from 'common/helpers'
import { FC } from 'react'

import { ArticleEntity } from '.mesh'

interface DifficultyLabel {
  article: ArticleEntity
  isCard?: boolean
}
export const DifficultyLabel: FC<DifficultyLabel> = ({ article, isCard }) => {
  const difficultyColor =
    article?.attributes?.difficulty?.data?.attributes?.slug &&
    DIFFICULTY_ELEMENTS[article.attributes?.difficulty?.data?.attributes?.slug as keyof typeof DIFFICULTY_ELEMENTS]
      .color
  return (
    <div className="flex items-center gap-1.5">
      <CircleIcon width={8} height={8} stroke={difficultyColor as string} fill={difficultyColor as string} />
      <span className={classNames(isCard ? 'text-xs font-medium' : 'text-xs font-medium sm:text-sm sm:font-normal')}>
        {article.attributes?.difficulty?.data?.attributes?.label}
      </span>
    </div>
  )
}
