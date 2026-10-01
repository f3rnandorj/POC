module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@api': './src/api',
          '@domain': './src/domain',
          '@components': './src/components',
          '@screens': './src/screens',
          '@routes': './src/routes',
          '@theme': './src/theme',
          '@config': './src/config',
          '@hooks': './src/hooks',
          '@infra': './src/infra',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@types': './src/types',
        },
      },
    ],
  ],
};
