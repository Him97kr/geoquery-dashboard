module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node"],
  },
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/tests/**/*.test.[jt]s?(x)"],
  setupFiles: ["<rootDir>/jest.polyfills.cjs", "jest-canvas-mock"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", {
      babelrc: false,
      configFile: false,
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
      plugins: ["babel-plugin-transform-vite-meta-env"],
    }],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transformIgnorePatterns: [
    "/node_modules/(?!(d3|d3-[a-z-]+|internmap|delaunator|robust-predicates|topojson-client)/)",
  ],
  moduleFileExtensions: ["js", "jsx", "json"],
  clearMocks: true,
};