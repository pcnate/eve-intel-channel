module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'globals': {
    'angular': false,
    'module': false,
    'require': false,
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'warn',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'warn',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-unused-vars': [
      'warn',
      { 'args': 'after-used' },
    ],
    'no-console': [
      'warn',
      { 'allow': ['warn'] },
    ]
  }
};
