// Azure Ink Recognizer Configuration
// Get your API key and endpoint from Azure Portal: https://portal.azure.com
// Create a Cognitive Services resource and enable Ink Recognizer

export const azureConfig = {
  apiKey: import.meta.env.VITE_AZURE_INK_RECOGNIZER_KEY || '',
  endpoint: import.meta.env.VITE_AZURE_INK_RECOGNIZER_ENDPOINT || '',
  language: 'en-US', // Supported: en-US, en-GB, zh-CN, zh-TW, ja-JP, ko-KR, etc.
};

export function isAzureConfigured(): boolean {
  return !!(azureConfig.apiKey && azureConfig.endpoint);
}

