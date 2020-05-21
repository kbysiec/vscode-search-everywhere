export const configuration: { [key: string]: any } = {
  searchEverywhere: {
    include: ["**/*.{js,ts}"],
    exclude: ["**/node_modules/**"],
    shouldDisplayNotificationInStatusBar: true,
  },
  customSection: {
    exclude: ["**/customFolder/**"],
  },
};
