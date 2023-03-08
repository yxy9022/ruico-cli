/**
 * Created by yangxy on 2021/12/09.
 * 统一代码格式化风格
 * 官方配置选项： https://prettier.io/docs/en/options.html
 * prettier规则优先级 `.editorconfig` > `prettier configuration files` > `setting.json`
 */
module.exports = {
  printWidth: 120, // 超过换行字符数（ 默认:80 ）
  semi: true, // 是否在行尾加分号（ 默认:true ）
  singleQuote: true, // 单引号（ 默认:false ）
  trailingComma: 'none', // 末尾不需要逗号（ 默认:es5 ）
  arrowParens: 'avoid', // 箭头函数只有一个参数的时候不带圆括号（ 默认:always ）
  htmlWhitespaceSensitivity: 'ignore', // 空格被认为是不敏感的（ 默认:css ）
  vueIndentScriptAndStyle: true,
  // tabWidth: 2,
  // useTabs: false,
  // quoteProps: 'as-needed',
  // jsxSingleQuote: false,
  // bracketSpacing: true,
  // bracketSameLine: false,

  // embeddedLanguageFormatting: 'auto'
  endOfLine: 'auto'
};
