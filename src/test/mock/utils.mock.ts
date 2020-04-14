export const getConfigurationChangeEvent = (flag: boolean) => ({
  affectsConfiguration: () => flag,
});
