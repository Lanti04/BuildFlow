// Handwriting Recognition using Azure Ink Recognizer API
// Note: Requires Azure Cognitive Services subscription and API key

export interface InkStroke {
  id: number;
  points: Array<{
    x: number;
    y: number;
    timestamp?: number;
  }>;
}

export interface AzureInkPoint {
  x: number;
  y: number;
  timeOffset?: number;
}

export interface AzureInkStroke {
  id: number;
  points: AzureInkPoint[];
}

export interface RecognitionResult {
  recognizedText: string;
  words: Array<{
    text: string;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

// Convert canvas paths to Azure Ink Recognizer format
export function convertPathsToInkStrokes(
  paths: any[],
  canvasWidth: number,
  canvasHeight: number
): AzureInkStroke[] {
  const strokes: AzureInkStroke[] = [];
  let strokeId = 0;
  let startTime = Date.now();

  paths.forEach((path) => {
    if (path.paths && path.paths.length > 0) {
      path.paths.forEach((strokePath: any) => {
        const points: AzureInkPoint[] = [];
        let timeOffset = 0;

        if (strokePath.path && strokePath.path.length > 0) {
          strokePath.path.forEach((point: any, index: number) => {
            // Normalize coordinates to 0-1 range (Azure requirement)
            const normalizedX = point.x / canvasWidth;
            const normalizedY = point.y / canvasHeight;

            points.push({
              x: normalizedX,
              y: normalizedY,
              timeOffset: timeOffset,
            });

            // Increment time offset (approximately 16ms per point for 60fps)
            timeOffset += 16;
          });
        }

        if (points.length > 0) {
          strokes.push({
            id: strokeId++,
            points: points,
          });
        }
      });
    }
  });

  return strokes;
}

// Call Azure Ink Recognizer API
export async function recognizeHandwriting(
  strokes: AzureInkStroke[],
  language: string = 'en-US',
  apiKey?: string,
  endpoint?: string
): Promise<RecognitionResult | null> {
  if (!apiKey || !endpoint) {
    console.warn('Azure Ink Recognizer API key or endpoint not configured');
    return null;
  }

  try {
    const response = await fetch(`${endpoint}/inkrecognizer/v1.0-preview/recognize`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: JSON.stringify({
        language: language,
        strokeGroups: [
          {
            strokes: strokes.map((stroke) => stroke.id),
          },
        ],
        strokes: strokes,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Ink Recognizer API error:', errorText);
      return null;
    }

    // Poll for results (Azure uses async recognition)
    const resultUrl = response.headers.get('Operation-Location');
    if (!resultUrl) {
      console.error('No operation location in response');
      return null;
    }

    // Poll until recognition is complete
    let recognitionComplete = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (!recognitionComplete && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(resultUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        },
      });

      const statusData = await statusResponse.json();

      if (statusData.status === 'Succeeded') {
        recognitionComplete = true;
        
        // Extract recognized text
        const recognitionUnits = statusData.recognitionUnits || [];
        const words: RecognitionResult['words'] = [];
        let fullText = '';

        recognitionUnits.forEach((unit: any) => {
          if (unit.category === 'inkWord') {
            const word = unit.recognizedText || '';
            fullText += word + ' ';
            words.push({
              text: word,
              boundingBox: {
                x: unit.boundingRectangle?.x || 0,
                y: unit.boundingRectangle?.y || 0,
                width: unit.boundingRectangle?.width || 0,
                height: unit.boundingRectangle?.height || 0,
              },
            });
          }
        });

        return {
          recognizedText: fullText.trim(),
          words: words,
        };
      } else if (statusData.status === 'Failed') {
        console.error('Recognition failed:', statusData);
        return null;
      }

      attempts++;
    }

    console.error('Recognition timeout');
    return null;
  } catch (error) {
    console.error('Error calling Azure Ink Recognizer API:', error);
    return null;
  }
}

// Alternative: MyScript Interactive Ink (client-side)
// This would require MyScript SDK integration
export interface MyScriptConfig {
  applicationKey: string;
  hmacKey: string;
}

export async function recognizeHandwritingMyScript(
  strokes: InkStroke[],
  config: MyScriptConfig
): Promise<string | null> {
  // MyScript integration would go here
  // Requires MyScript SDK: https://webdemo.myscript.com/
  console.warn('MyScript integration not yet implemented');
  return null;
}

