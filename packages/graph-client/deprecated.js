"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
exports.resolvers = {
    deprecated_Pair: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
    deprecated_Token: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
    deprecated_LiquidityPosition: {
        chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    },
};
