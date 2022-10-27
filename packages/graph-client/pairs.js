"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const graph_config_1 = require("@sushiswap/graph-config");
const crossChainPairs = async (root, args, context, info) => {
    return Promise.all(args.chainIds
        .filter((chainId) => graph_config_1.SUSHISWAP_ENABLED_NETWORKS.includes(chainId))
        .map((chainId) => {
        return context.SushiSwap.Query.pairs({
            root,
            args,
            context: {
                ...context,
                chainId,
                subgraphName: graph_config_1.SUSHISWAP_SUBGRAPH_NAME[chainId],
                subgraphHost: graph_config_1.SUBGRAPH_HOST[chainId],
            },
            info,
        }).then((pairs) => {
            return pairs.map((pair) => ({ ...pair, chainId }));
        });
    })).then((pairs) => pairs.flat());
};
exports.resolvers = {
    Pair: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
    Query: {
        crossChainPairs,
    },
};
