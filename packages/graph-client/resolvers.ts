import { mergeResolvers } from '@graphql-tools/merge'

import { resolvers as bentobox } from './bentobox'
import { resolvers as blocks } from './blocks'
import { resolvers as deprecated } from './deprecated'
import { resolvers as pairs } from './pairs'

const resolvers = [bentobox, blocks, pairs, deprecated]

module.exports = mergeResolvers(resolvers)
