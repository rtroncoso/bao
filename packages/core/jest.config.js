module.exports = {
  displayName: 'core',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testRegex: '.*(/__tests__/.*|(.|/)(test|spec)).(ts|js)x?$',
  moduleNameMapper: {
    '^.+\\.(css|less|scss|svg)$': 'babel-jest',
  },
  testURL: 'http://localhost/',
};