"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const graph_config_1 = require("@sushiswap/graph-config");
const date_fns_1 = require("date-fns");
const crossChainBlocks = async (root, args, context, info) => {
    return Promise.all(args.chainIds
        .filter((chainId) => chainId in graph_config_1.BLOCKS_SUBGRAPH_NAME)
        .map((chainId) => {
        return context.Blocks.Query.blocks({
            root,
            args,
            context: {
                ...context,
                chainId,
                subgraphName: graph_config_1.BLOCKS_SUBGRAPH_NAME[chainId],
                subgraphHost: graph_config_1.SUBGRAPH_HOST[chainId],
            },
            info,
        });
    })).then((blocks) => blocks.flat());
};
const oneDayBlocks = async (root, args, context, info) => {
    const date = (0, date_fns_1.startOfSecond)((0, date_fns_1.startOfMinute)((0, date_fns_1.startOfHour)((0, date_fns_1.subDays)(Date.now(), 1))));
    const start = (0, date_fns_1.getUnixTime)(date);
    const end = (0, date_fns_1.getUnixTime)((0, date_fns_1.addSeconds)(date, 600));
    const blocks = await crossChainBlocks(root, {
        ...args,
        where: { timestamp_gt: start, timestamp_lt: end },
    }, context, info);
    return blocks;
};
const twoDayBlocks = async (root, args, context, info) => {
    const date = (0, date_fns_1.startOfSecond)((0, date_fns_1.startOfMinute)((0, date_fns_1.startOfHour)((0, date_fns_1.subDays)(Date.now(), 2))));
    const start = (0, date_fns_1.getUnixTime)(date);
    const end = (0, date_fns_1.getUnixTime)((0, date_fns_1.addSeconds)(date, 600));
    const blocks = await crossChainBlocks(root, {
        ...args,
        where: { timestamp_gt: start, timestamp_lt: end },
    }, context, info);
    return blocks;
};
const oneWeekBlocks = async (root, args, context, info) => {
    const date = (0, date_fns_1.startOfSecond)((0, date_fns_1.startOfMinute)((0, date_fns_1.startOfHour)((0, date_fns_1.subDays)(Date.now(), 7))));
    const start = (0, date_fns_1.getUnixTime)(date);
    const end = (0, date_fns_1.getUnixTime)((0, date_fns_1.addSeconds)(date, 600));
    const blocks = await crossChainBlocks(root, {
        ...args,
        where: { timestamp_gt: start, timestamp_lt: end },
    }, context, info);
    return blocks;
};
const customBlocks = async (root, args, context, info) => {
    const start = args.timestamp;
    const end = start + 600;
    const blocks = await crossChainBlocks(root, {
        ...args,
        where: { timestamp_gt: start, timestamp_lt: end },
    }, context, info);
    return blocks;
};
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
    Block: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
    Rebase: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
    Query: {
        crossChainRebases,
        crossChainBlocks,
        oneDayBlocks,
        twoDayBlocks,
        oneWeekBlocks,
        customBlocks,
    },
};
