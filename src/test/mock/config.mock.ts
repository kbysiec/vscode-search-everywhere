export const configuration: { [key: string]: any } = {
  searchEverywhere: {
    include: ["**/*.{js,ts}"],
    exclude: ["**/node_modules/**"],
    shouldDisplayNotificationInStatusBar: true,
    shouldInitOnStartup: true,
    shouldHighlightSymbol: true,
  },
  customSection: {
    exclude: ["**/customFolder/**"],
  },
};
