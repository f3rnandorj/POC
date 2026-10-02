/**
 * ESLint is the single gate for this repo: it carries the logic rules AND runs Prettier as a
 * rule (`plugin:prettier/recommended`), so `yarn lint` is the only thing that has to pass and
 * `yarn lint --fix` is the only thing that reformats. A second formatter writing on save is
 * what produced silent reflow churn in files nobody edited.
 */
module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  plugins: ['import', '@tanstack/query'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@tanstack/query/exhaustive-deps': 'error',
        'import/order': [
          'error',
          {
            groups: ['external', 'builtin', 'internal', 'parent', 'sibling'],
            pathGroups: [
              { pattern: 'react+(|-native)', group: 'external', position: 'before' },
              {
                pattern:
                  '@+(api|domain|components|screens|routes|theme|config|hooks|infra|utils|constants|types)',
                group: 'internal',
                position: 'before',
              },
              { pattern: './', group: 'internal', position: 'before' },
            ],
            pathGroupsExcludedImportTypes: ['react+(|-native)'],
            alphabetize: { order: 'asc', caseInsensitive: true },
            'newlines-between': 'always',
          },
        ],
      },
    },
  ],
};
