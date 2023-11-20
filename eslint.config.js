import upleveled from 'eslint-config-upleveled';

/** @type {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray} */
const config = [
  ...upleveled,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];

export default config;
