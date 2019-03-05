module.exports = {
    "env": {
        "browser": true,
        "es6": true,
    },
    "extends": ["airbnb"],
    "parserOptions": {
        "ecmaVersion": 9,
        "sourceType": "module"
    },
    "settings": {
        "import/resolver": {
            "babel-module": {}
        }
    },
    "rules": {
        "new-cap": 0,
        "no-bitwise": 0,
        "no-console": 0,
        "no-confusing-arrow": 0,
        "no-plusplus": 0,
        "no-param-reassign": 0,
        "no-unused-vars": 0,
        "no-underscore-dangle": 0,
        "no-useless-constructor": 0,
        "no-restricted-properties": 0,
        "no-restricted-syntax": 0,
        "no-return-assign": 0,
        "import/named": 0,
        "import/newline-after-import": 0,
        "import/no-cycle": 0,
        "import/no-named-default": 0,
        "import/no-mutable-exports": 0,
        "require-yield": 0,
        "class-methods-use-this": 0,
        "comma-dangle": 0,
        "object-curly-newline": 0,
        "operator-linebreak": 0,
        "indent": [
            "error",
            2
        ],
        "max-len": [
          "error",
          120
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        quotes: [
          "error",
          "single",
          { "allowTemplateLiterals": true }
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
