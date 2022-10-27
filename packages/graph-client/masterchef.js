"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.crossChainChefUser = void 0;
const chain_1 = require("@sushiswap/chain");
const graph_config_1 = require("@sushiswap/graph-config");
const validate_1 = require("@sushiswap/validate");
const _graphclient_1 = require("./.graphclient");
const crossChainChefUser = async (root, args, context, info) => {
    const fetcher = async ({ chainId, subgraphName, subgraphHost, }) => {
        const sdk = (0, _graphclient_1.getBuiltGraphSDK)({ subgraphHost, subgraphName, chainId });
        const { first, skip, where, block } = args;
        return sdk.ChefUser({ first, skip, where: where ?? undefined, block: block ?? undefined }).then(({ users }) => {
            return users.map((user) => ({
                ...user,
                chainId,
                chainName: chain_1.chainName[chainId],
            }));
        });
    };
    return Promise.allSettled([
        ...(args.chainIds.includes(chain_1.ChainId.ETHEREUM)
            ? [graph_config_1.MASTERCHEF_V1_SUBGRAPH_NAME, graph_config_1.MASTERCHEF_V2_SUBGRAPH_NAME].map((subgraphName) => fetcher({ chainId: chain_1.ChainId.ETHEREUM, subgraphName, subgraphHost: graph_config_1.SUBGRAPH_HOST[chain_1.ChainId.ETHEREUM] }))
            : []),
        ...args.chainIds
            .filter((chainId) => chainId in graph_config_1.MINICHEF_SUBGRAPH_NAME)
            .map((chainId) => fetcher({ chainId, subgraphName: graph_config_1.MINICHEF_SUBGRAPH_NAME[chainId], subgraphHost: graph_config_1.SUBGRAPH_HOST[chainId] })),
    ]).then((promiseSettledResults) => {
        return promiseSettledResults
            .flat()
            .filter(validate_1.isPromiseFulfilled)
            .flatMap((promiseFulfilled) => promiseFulfilled.value);
        // return users.flat().reduce((previous, current) => {
        //   if (current.status === 'fulfilled' && current.value.length > 0) {
        //     previous.push(...current.value)
        //   }
        //   return previous
        // }, [] as Awaited<ReturnType<typeof fetcher>>)
    });
};
exports.crossChainChefUser = crossChainChefUser;
// const crossChainPairs: QueryResolvers['crossChainPairs'] = async (root, args, context, info): Promise<Pair[]> => {
//   return Promise.all<Pair[]>(
//     args.chainIds
//       .filter((chainId): chainId is typeof SUSHISWAP_ENABLED_NETWORKS[number] =>
//         SUSHISWAP_ENABLED_NETWORKS.includes(chainId)
//       )
//       .map((chainId) => {
//         return context.SushiSwap.Query.pairs({
//           root,
//           args,
//           context: {
//             ...context,
//             chainId,
//             subgraphName: SUSHISWAP_SUBGRAPH_NAME[chainId],
//             subgraphHost: SUBGRAPH_HOST[chainId],
//           },
//           info,
//         }).then((pairs) => {
//           return pairs.map((pair) => ({ ...pair, chainId }))
//         })
//       })
//   ).then((pairs) => pairs.flat())
// }
exports.resolvers = {
    Pair: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
    Query: {
        crossChainChefUser: exports.crossChainChefUser,
    },
};
