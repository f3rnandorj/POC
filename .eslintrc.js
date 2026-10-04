module.exports = {
  root: true,
  extends: ["@react-native", "plugin:@tanstack/query/recommended"],
  parserOptions: {
    requireConfigFile: false,
  },
  rules: {
    quotes: ["error", "double"],
    "react-native/no-inline-styles": "off",
  },
  plugins: ["import"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "import/order": [
          "error",
          {
            groups: ["external", "builtin", "internal", "parent", "sibling"],
            pathGroups: [
              {
                pattern: "react+(|-native)",
                group: "external",
                position: "before",
              },
              {
                pattern:
                  "@+(api|assets|domain|components|screens|routes|theme|config|hooks|infra|utils|constants|types)",
                group: "internal",
                position: "before",
              },
              {
                pattern: "./",
                group: "internal",
                position: "before",
              },
            ],
            pathGroupsExcludedImportTypes: ["react+(|-native)"],
            alphabetize: {
              order: "asc",
              caseInsensitive: true,
            },
            "newlines-between": "always",
          },
        ],
      },
    },
  ],
};
