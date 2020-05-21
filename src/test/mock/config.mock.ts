export const configuration: { [key: string]: any } = {
  searchEverywhere: {
    include: ["**/*.{js,ts}"],
    exclude: ["**/node_modules/**"],
  },
  customSection: {
    exclude: ["**/customFolder/**"],
  },
};
