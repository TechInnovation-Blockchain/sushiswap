module.exports = {
  overrides: [
    {
      files: ['*.js'],
      extends: ['eslint:recommended'],
    },
    {
      files: ['*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      extends: ['plugin:@graphql-eslint/schema-recommended', 'plugin:@graphql-eslint/operations-recommended'],
      parserOptions: {
        operations: ['deprecated.graphql', 'bar.graphql', 'blocks.graphql', 'bentobox.graphql', 'sushiswap.graphql'],
        schema: '.graphclient/schema.graphql',
      },
      rules: {
        '@graphql-eslint/require-id-when-available': ['error', { fieldName: '_id' }],
        '@graphql-eslint/unique-fragment-name': 'error',
        '@graphql-eslint/no-anonymous-operations': 'error',
        '@graphql-eslint/naming-convention': ['error'],
        '@graphql-eslint/no-case-insensitive-enum-values-duplicates': ['error'],
        '@graphql-eslint/require-description': ['error', { FieldDefinition: true }],
      },
    },
  ],
}
