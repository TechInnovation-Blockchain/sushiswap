"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("@graphql-tools/merge");
const bentobox_1 = require("./bentobox");
const blocks_1 = require("./blocks");
const deprecated_1 = require("./deprecated");
const pairs_1 = require("./pairs");
const resolvers = [bentobox_1.resolvers, blocks_1.resolvers, pairs_1.resolvers, deprecated_1.resolvers];
module.exports = (0, merge_1.mergeResolvers)(resolvers);
