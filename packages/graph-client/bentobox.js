"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const graph_config_1 = require("@sushiswap/graph-config");
const crossChainRebases = async (root, args, context, info) => {
    return Promise.all(args.chainIds
        .filter((chainId) => chainId in graph_config_1.BENTOBOX_SUBGRAPH_NAME)
        .map((chainId) => {
        return context.BentoBox.Query.rebases({
            root,
            args,
            context: {
                ...context,
                chainId,
                subgraphName: graph_config_1.BENTOBOX_SUBGRAPH_NAME[chainId],
                subgraphHost: graph_config_1.SUBGRAPH_HOST[chainId],
            },
            info,
        }).then((rebases) => {
            return rebases.filter(Boolean).map((rebase) => ({ ...rebase, chainId }));
        });
    })).then((rebases) => rebases.flat());
};
exports.resolvers = {
    Rebase: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
    Query: {
        crossChainRebases,
    },
};
