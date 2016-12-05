module.exports = {
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },

  "plugins": ["react"],

  "extends": "eslint:recommended",
  "parser": "babel-eslint",

  "ecmaFeatures": {
    "arrowFunctions": true,
    "binaryLiterals": true,
    "blockBindings": true,
    "classes": true,
    "defaultParams": true,
    "destructuring": true,
    "experimentalObjectRestSpread": true,
    "forOf": true,
    "generators": true,
    "modules": true,
    "objectLiteralComputedProperties": true,
    "objectLiteralDuplicateProperties": true,
    "objectLiteralShorthandMethods": true,
    "objectLiteralShorthandProperties": true,
    "octalLiterals": true,
    "regexUFlag": true,
    "regexYFlag": true,
    "spread": true,
    "superInFunctions": true,
    "templateStrings": true,
    "unicodeCodePointEscapes": true,
    "globalReturn": true,
    "jsx": true
  },

  "rules": {
    //
    //Possible Errors
    //
    // The following rules point out areas where you might have made mistakes.
    //
    "no-cond-assign": [2, "always"], // disallow assignment in conditional expressions
    "no-console": 0,
    //"no-console": 1, // disallow use of console (off by default in the node environment)
    "no-constant-condition": 1, // disallow use of constant expressions in conditions
    "no-control-regex": 2, // disallow control characters in regular expressions
    "no-debugger": 2, // disallow use of debugger
    "no-dupe-args": 2, // disallow duplicate arguments in functions
    "no-dupe-keys": 2, // disallow duplicate keys when creating object literals
    "no-duplicate-case": 2, // disallow a duplicate case label.
    "no-empty-character-class": 2, // disallow the use of empty character classes in regular expressions
    "no-empty": 2, // disallow empty statements
    "no-ex-assign": 2, // disallow assigning to the exception in a catch block
    "no-extra-boolean-cast": 2, // disallow double-negation boolean casts in a boolean context
    "no-extra-parens": [2, "functions"], // disallow unnecessary parentheses (off by default)
    "no-extra-semi": 2, // disallow unnecessary semicolons
    "no-func-assign": 2, // disallow overwriting functions written as function declarations
    "no-inner-declarations": 2, // disallow function or variable declarations in nested blocks
    "no-invalid-regexp": 2, // disallow invalid regular expression strings in the RegExp constructor
    "no-irregular-whitespace": 2, // disallow irregular whitespace outside of strings and comments
    "no-negated-in-lhs": 2, // disallow negation of the left operand of an in expression
    "no-obj-calls": 2, // disallow the use of object properties of the global object (Math and JSON) as functions
    "no-regex-spaces": 2, // disallow multiple spaces in a regular expression literal
    "no-sparse-arrays": 2, // disallow sparse arrays
    "no-unreachable": 2, // disallow unreachable statements after a return, throw, continue, or break statement
    "use-isnan": 2, // disallow comparisons with the value NaN
    "valid-jsdoc": 0, // Ensure JSDoc comments are valid (off by default)
    "valid-typeof": 2, // Ensure that the results of typeof are compared against a valid string
    // Avoid code that looks like two expressions but is actually one
    "no-unexpected-multiline": 0,


    //
    // Best Practices
    //
    // These are rules designed to prevent you from making mistakes.
    // They either prescribe a better way of doing something or help you avoid footguns.
    //
    "block-scoped-var": 2, // treat var statements as if they were block scoped (off by default).
    "complexity": [0, 11], // specify the maximum cyclomatic complexity allowed in a program (off by default)
    "consistent-return": 2, // require return statements to either always or never specify values
    "curly": [2, "multi-line"], // specify curly brace conventions for all control statements
    "default-case": 2, // require default case in switch statements (off by default)
    "dot-notation": [2, {"allowKeywords": true}], // encourages use of dot notation whenever possible
    "dot-location": 0, // enforces consistent newlines before or after dots
    "eqeqeq": 2, // require the use of === and !==
    "guard-for-in": 2, // make sure for-in loops have an if statement (off by default)
    "no-alert": 1, // disallow the use of alert, confirm, and prompt
    "no-caller": 2, // disallow use of arguments.caller or arguments.callee
    "no-case-declarations": 2, // disallow lexical declarations in case/default clauses
    "no-div-regex": 0, // disallow division operators explicitly at beginning of regular expression (off by default)
    "no-else-return": 2, // disallow else after a return in an if (off by default)
    "no-extra-label": 2, // unnecesary labels
    "no-eq-null": 2, // disallow comparisons to null without a type-checking operator (off by default)
    "no-eval": 2, // disallow use of eval()
    "no-extend-native": 2, // disallow adding to native types
    "no-extra-bind": 2, // disallow unnecessary function binding
    "no-fallthrough": 2, // disallow fallthrough of case statements
    "no-floating-decimal": 2, // disallow the use of leading or trailing decimal points in numeric literals (off by default)
    "no-implicit-coercion": 0, // disallow the type conversions with shorter notations
    "no-implied-eval": 2, // disallow use of eval()-like methods
    "no-invalid-this": 0, // disallow this keywords outside of classes or class-like objects
    "no-iterator": 2, // disallow usage of __iterator__ property
    "no-labels": [2, { 'allowLoop': false, 'allowSwitch': false } ], // disallow use of labels for anything other than loops and switches
    "no-lone-blocks": 2, // disallow unnecessary nested blocks
    "no-loop-func": 2, // disallow creation of functions within loops
    "no-multi-spaces": 1, // disallow use of multiple spaces
    "no-multi-str": 2, // disallow use of multiline strings
    "no-native-reassign": 2, // disallow reassignments of native objects
    "no-new": 2, // disallow use of new operator when not part of the assignment or comparison
    "no-new-func": 2, // disallow use of new operator for Function object
    "no-new-wrappers": 2, // disallows creating new instances of String,Number, and Boolean
    "no-octal": 2, // disallow use of octal literals
    "no-octal-escape": 2, // disallow use of octal escape sequences in string literals, such as var foo = "Copyright \251";
    "no-param-reassign": [2, { "props": true }], // disallow reassignment of function parameters (off by default)
    "no-process-env": 0, // disallow use of process.env (off by default)
    "no-proto": 2, // disallow usage of __proto__ property
    "no-redeclare": 2, // disallow declaring the same variable more then once
    "no-return-assign": 2, // disallow use of assignment in return statement
    "no-script-url": 2, // disallow use of javascript: urls.
    "no-self-compare": 2, // disallow comparisons where both sides are exactly the same (off by default)
    "no-sequences": 2, // disallow use of comma operator
    "no-throw-literal": 2, // restrict what can be thrown as an exception (off by default)
    "no-unused-expressions": 2, // disallow usage of expressions in statement position
    "no-void": 0, // disallow use of void operator (off by default)
    "no-warning-comments": [0, {"terms": ["todo", "fixme", "xxx"], "location": "start"}], // disallow usage of configurable warning terms in comments: e.g. TODO or FIXME
    "no-with": 2, // disallow use of the with statement
    "radix": 2, // require use of the second argument for parseInt() (off by default)
    "vars-on-top": 2, // requires to declare all vars on top of their containing scope (off by default)
    "wrap-iife": [2, "outside"], // require immediate function invocation to be wrapped in parentheses (off by default)
    "yoda": 2, // require or disallow Yoda conditions

    //
    // Strict Mode
    //
    // These rules relate to using strict mode.
    //
    "strict": [2, "never"], // babel inserts `'use strict';` for us

    //
    // Variables
    //
    // These rules have to do with variable declarations.
    //
    "init-declarations": 0, // enforce or disallow variable initializations at definition
    "no-catch-shadow": 0, // disallow the catch clause parameter name being the same as a variable in the outer scope (off by default in the node environment)
    "no-delete-var": 2, // disallow deletion of variables
    "no-implicit-globals": 0, // disallow var and named functions in global scope
    "no-label-var": 0, // disallow labels that share a name with a variable
    "no-self-assign": 2, // disallow self assignment
    "no-shadow-restricted-names": 2, // disallow shadowing of names such as arguments
    "no-shadow": 1, // disallow declaration of variables already declared in the outer scope
    "no-undef": 2, // disallow use of undeclared variables unless mentioned in a /*global */ block
    "no-undef-init": 0, // disallow use of undefined when initializing variables
    "no-undefined": 1, // disallow use of undefined variable (off by default)
    "no-unused-vars": [1, { "vars": "local", "args": "after-used" }], // disallow declaration of variables that are not used in the code
    "no-use-before-define": 2, // disallow use of variables before they are defined

    //
    //Stylistic Issues
    //
    // These rules are purely matters of style and are quite subjective.
    //
    "brace-style": [2, "1tbs", { "allowSingleLine": true }], // enforce one true brace style (off by default)
    //"camelcase": [2, { "properties": "never" }], // require camel case names
    "comma-spacing": [1, {"before": false, "after": true}], // enforce spacing before and after comma
    "comma-style": [2, "last"], // enforce one true comma style (off by default)
    "consistent-this": 0, // enforces consistent naming when capturing the current execution context (off by default)
    "eol-last": 2, // enforce newline at the end of file, with no multiple empty lines
    //"func-names": 1, // require function expressions to have a name (off by default)
    "func-style": 0, // enforces use of function declarations or expressions (off by default)
    "id-length": 0, // mininum and maximum linid length
    //"indent": [1, 2], // this option sets a specific tab width for your code (off by default)
    // specify whether double or single quotes should be used in JSX attributes
    // http://eslint.org/docs/rules/jsx-quotes
    "jsx-quotes": [2, "prefer-double"],
    "key-spacing": [1, {"beforeColon": false, "afterColon": true}], // enforces spacing between keys and values in object literal properties
    "keyword-spacing": [2, {
      "before": true,
      "after": true,
      "overrides": {
        "return": { "after": true },
        "throw": { "after": true },
        "case": { "after": true }
      }
    }], // require a space after and before certain keywords
    "lines-around-comment": 0, // enforces empty lines around comments
    "linebreak-style": [2, "unix"], // unix linebreaks
    "max-len": [1, 120, 2, {
      "ignoreUrls": true,
      "ignoreComments": true
    }], // specify the maximum length of a line in your program (off by default)
    "max-nested-callbacks": 0, // specify the maximum depth callbacks can be nested (off by default)
    "new-cap": 0, //[1, {"newIsCap": true, "capIsNew": false}], // require a capital letter for constructors
    "new-parens": 0, // disallow the omission of parentheses when invoking a constructor with no arguments
    "newline-after-var": 0, // allow/disallow an empty newline after var statement (off by default)
    "newline-before-return": 0,
    "no-array-constructor": 2, // disallow use of the Array constructor
    "no-continue": 0, // disallow use of the continue statement
    "no-inline-comments": 0, // disallow comments inline after code (off by default)
    "no-lonely-if": 0, // disallow if as the only statement in an else block (off by default)
    "no-mixed-spaces-and-tabs": 2, // disallow mixed spaces and tabs for indentation
    "no-multiple-empty-lines": [2, {"max": 2, "maxEOF": 1}], // disallow multiple empty lines and only one at the end of file (off by default)
    "no-nested-ternary": 2, // disallow nested ternary expressions (off by default)
    "no-new-object": 2, // disallow use of the Object constructor
    "no-spaced-func": 2, // disallow space between function identifier and application
    "no-ternary": 0, // disallow the use of ternary operators (off by default)
    "no-trailing-spaces": 2, // disallow trailing whitespace at the end of lines
    "no-underscore-dangle": 0, // disallow dangling underscores in identifiers
    // disallow the use of Boolean literals in conditional expressions
    // also, prefer `a || b` over `a ? a : b`
    // http://eslint.org/docs/rules/no-unneeded-ternary
    "no-unneeded-ternary": [2, { "defaultAssignment": false }],
    // disallow whitespace before properties
    // http://eslint.org/docs/rules/no-whitespace-before-property
    "no-whitespace-before-property": 2,
    // require padding inside curly braces
    "object-curly-spacing": [2, "always"],
    //"one-var": [2, "never"], // allow just one var statement per function (off by default)
    // require a newline around variable declaration
    // http://eslint.org/docs/rules/one-var-declaration-per-line
    "one-var-declaration-per-line": [2, "always"],
    "operator-assignment": 0, // require assignment operator shorthand where possible or prohibit it entirely (off by default)
    // enforce operators to be placed before or after line breaks
    "operator-linebreak": 0,
    "padded-blocks": [2, "never"], // enforce padding within blocks (off by default)
    "quote-props": [1, "as-needed", { "keywords": false, "unnecessary": true, "numbers": false }], // require quotes around object literal property names (off by default)
    // "quotes": [1, "single", "avoid-escape"], // specify whether double or single quotes should be used
    // require identifiers to match the provided regular expression
    "id-match": 0,
    "semi": [2, "always"], // require or disallow use of semicolons instead of ASI
    "sort-vars": 0, // sort variables within the same declaration block (off by default)
    "space-before-blocks": 2, // require or disallow space before blocks (off by default)
    "space-before-function-paren": [2, {"anonymous": "always", "named": "never"}], // require or disallow space before function opening parenthesis (off by default)
    "space-in-parens": [2, "never"], // require or disallow spaces inside parentheses (off by default)
    "space-infix-ops": 2, // require spaces around operators
    "space-unary-ops": 0, // Require or disallow spaces before/after unary operators (words on by default, nonwords off by default)
    // require or disallow a space immediately following the // or /* in a comment
    "spaced-comment": [2, "always", {
      "exceptions": ["-", "+"],
      "markers": ["=", "!"]           // space here to support sprockets directives
    }],
    "wrap-regex": 0, // require regex literals to be wrapped in parentheses (off by default)



    //
    // ECMAScript 6
    //
    // These rules are only relevant to ES6 environments and are off by default.
    //
    "no-var": 2, // require let or const instead of var (off by default)
    "generator-star-spacing": [2, "before"], // enforce the spacing around the * in generator functions (off by default)
    // disallow modifying variables of class declarations
    "no-class-assign": 0,

    //
    // Legacy
    //
    // The following rules are included for compatibility with JSHint and JSLint.
    // While the names of the rules may not match up with the JSHint/JSLint counterpart,
    // the functionality is the same.
    //
    "comma-dangle": [2, "never"], // disallow trailing commas in object literals
    "max-depth": [0, 4], // specify the maximum depth that blocks can be nested (off by default)
    "max-params": [0, 3], // limits the number of parameters that can be used in the function declaration. (off by default)
    "max-statements": [0, 10], // specify the maximum number of statement allowed in a function (off by default)
    "no-bitwise": 0, // disallow use of bitwise operators (off by default)
    "no-plusplus": 0, // disallow use of unary operators, ++ and -- (off by default)

    //
    // eslint-plugin-react
    //
    // React specific linting rules for ESLint
    //
    //"react/display-name": [0, { "ignoreTranspilerName": false }], // Prevent missing displayName in a React component definition
    //"react/jsx-quotes": [2, "double", "avoid-escape"], // Enforce quote style for JSX attributes
    // Enforce event handler naming conventions in JSX
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md
    "react/jsx-handler-names": [0, {
      "eventHandlerPrefix": "handle",
      "eventHandlerPropPrefix": "on",
    }],
    // Validate JSX has key prop when in array or iterator
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
    "react/jsx-key": 0,
    // Prevent usage of .bind() and arrow functions in JSX props
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md
    "react/jsx-no-bind": [1, {
      "ignoreRefs": true,
      "allowArrowFunctions": true,
      "allowBind": false,
    }],
    // Prevent duplicate props in JSX
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-duplicate-props.md
    "react/jsx-no-duplicate-props": [0, { "ignoreCase": false }],
    // Prevent usage of unwrapped JSX strings
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-literals.md
    "react/jsx-no-literals": 0,
    "react/jsx-no-undef": 2, // Disallow undeclared variables in JSX
    // Enforce PascalCase for user-defined JSX components
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md
    "react/jsx-pascal-case": 2,
    "react/jsx-sort-props": 0, // Enforce props alphabetical sorting
    "react/jsx-uses-react": 2, // Prevent React to be incorrectly marked as unused
    "react/jsx-uses-vars": 2, // Prevent variables used in JSX to be incorrectly marked as unused
    "react/no-did-mount-set-state": 2, // Prevent usage of setState in componentDidMount
    "react/no-did-update-set-state": 2, // Prevent usage of setState in componentDidUpdate
    "react/no-multi-comp": 0, // Prevent multiple component definition per file
    "react/no-unknown-property": 2, // Prevent usage of unknown DOM property
    //"react/prop-types": 2, // Prevent missing props validation in a React component definition
    "react/react-in-jsx-scope": 2, // Prevent missing React when using JSX
    "react/self-closing-comp": 2, // Prevent extra closing tags for components without children
    "react/wrap-multilines": 2 // Prevent missing parentheses around multilines JSX

    // "react/jsx-no-undef": 1,
    // "react/jsx-uses-react": 1,
    // "react/jsx-uses-vars": 1,
    // "react/no-did-mount-set-state": 1,
    // "react/no-did-update-set-state": 1,
    // "react/no-multi-comp": 1,
    // "react/no-unknown-property": 1,
    // "react/react-in-jsx-scope": 1,
    // "react/self-closing-comp": 1
  }
}
