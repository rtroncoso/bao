module.exports = {
  'root': true,
  'env': {
    'node': true,
    'browser': true,
    'es2021': true
  },
  'globals': {
    'Promise': 'readonly'
  },
  'overrides': [
    {
      'files': ['*.ts', '*.tsx'],
      'extends': [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier',
      ],
      'rules': {
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        'react/display-name': 'off'
      }
    }
  ],
  'parser': '@typescript-eslint/parser',
  'plugins': [
    'react',
    '@typescript-eslint'
  ]
};
