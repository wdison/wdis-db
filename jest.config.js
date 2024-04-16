module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePaths: ['<rootDir>/src'],
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.[tj]s?$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig-cjs.json',
          },
        ],
      },
};
