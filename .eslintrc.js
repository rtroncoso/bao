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
      ]
    }
  ],
  'parser': '@typescript-eslint/parser',
  'plugins': [
    'react',
    '@typescript-eslint'
  ],
  'rules': {
    '@typescript-eslint/no-empty-function': 'warn',
    'react/display-name': 'off',
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};
