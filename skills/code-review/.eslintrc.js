module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 语法错误 (Blocker)
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    
    // 代码质量
    'complexity': ['warn', { max: 10 }],
    'max-depth': ['warn', { max: 4 }],
    'max-lines': ['warn', { max: 500 }],
    'max-params': ['warn', { max: 4 }],
    
    // 最佳实践
    'eqeqeq': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-return-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'radix': 'error',
    
    // 游戏开发专项
    'no-loop-func': 'warn',  // 循环中创建函数
    'no-magic-numbers': ['warn', {
      ignore: [0, 1, -1],
      ignoreArrayIndexes: true
    }],
    
    // 格式相关 (由 Prettier 处理)
    'indent': 'off',
    'quotes': 'off',
    'semi': 'off',
    'comma-dangle': 'off'
  },
  overrides: [
    {
      files: ['tests/**/*.js', '*.test.js'],
      rules: {
        'no-console': 'off',  // 测试允许 console
        'no-magic-numbers': 'off'
      }
    }
  ]
};
