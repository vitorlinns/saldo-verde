import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      'react/react-in-jsx-scope': 'off'
    }
  }
];

export default eslintConfig;
