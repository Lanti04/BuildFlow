// src/utils/handwriting.ts
// ------------------------------------------------------------
// Handwriting Recognition using Azure Ink Recognizer API
// ------------------------------------------------------------

export interface InkStroke {
  id: number;
  points: Array<{
    x: number;
    y: number;
    timestamp?: number;
  }>;
}

/* ---------- Azure payload types ---------- */
export interface AzureInkPoint {
  x: number;
  y: number;
  timeOffset?: number;
}
export interface AzureInkStroke {
  id: number;
  points: AzureInkPoint[];
}

/* ---------- Public result (what the UI already expects) ---------- */
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

/* ---------- Full Azure response (only exported for the notepad) ---------- */
export interface RecognitionFullResult {
  /** The same shape the UI already uses */
  result: RecognitionResult;
  /** Everything Azure gave us – lines, stroke ids, confidence, … */
  raw: any;
}

/* ---------- Convert canvas paths → Azure format ---------- */
export function convertPathsToInkStrokes(
  paths: any[],
  canvasWidth: number,
  canvasHeight: number
): AzureInkStroke[] {
  const strokes: AzureInkStroke[] = [];
  let strokeId = 1; // Azure expects **positive integers**, starting at 1

  paths.forEach((path) => {
    // react-sketch-canvas gives us `paths` → each entry has a `paths` array
    if (Array.isArray(path.paths)) {
      path.paths.forEach((strokePath: any) => {
        const points: AzureInkPoint[] = [];
        let timeOffset = 0;

        if (Array.isArray(strokePath.path)) {
          strokePath.path.forEach((point: any) => {
            // Azure wants coordinates in **0-1** range
            const normalizedX = point.x / canvasWidth;
            const normalizedY = point.y / canvasHeight;

            points.push({
              x: normalizedX,
              y: normalizedY,
              timeOffset,
            });

            timeOffset += 16; // ~60 fps
          });
        }

        if (points.length > 0) {
          strokes.push({
            id: strokeId++,
            points,
          });
        }
      });
    }
  });

  return strokes;
}

/* ---------- Call Azure Ink Recognizer (full result) ---------- */
export async function recognizeHandwriting(
  strokes: AzureInkStroke[],
  language: string = 'en-US',
  apiKey?: string,
  endpoint?: string
): Promise<RecognitionFullResult | null> {
  if (!apiKey || !endpoint) {
    console.warn('Azure Ink Recognizer API key or endpoint not configured');
    return null;
  }

  try {
    // ------------------------------------------------------------
    // 1. Submit the ink
    // ------------------------------------------------------------
    const submitResponse = await fetch(
      `${endpoint}/inkrecognizer/v1.0-preview/recognize`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': apiKey,
        },
        body: JSON.stringify({
          language,
          strokeGroups: [{ strokes: strokes.map((s) => s.id) }],
          strokes,
        }),
      }
    );

    if (!submitResponse.ok) {
      const err = await submitResponse.text();
      console.error('Azure submit error:', err);
      return null;
    }

    const operationLocation = submitResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      console.error('No Operation-Location header');
      return null;
    }

    // ------------------------------------------------------------
    // 2. Poll until we get a result
    // ------------------------------------------------------------
    const maxAttempts = 30;
    let attempts = 0;
    let statusData: any;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;

      const statusResp = await fetch(operationLocation, {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      });
      statusData = await statusResp.json();

      if (statusData.status === 'Succeeded') break;
      if (statusData.status === 'Failed') {
        console.error('Recognition failed:', statusData);
        return null;
      }
    }

    if (!statusData || statusData.status !== 'Succeeded') {
      console.error('Recognition timed out');
      return null;
    }

    // ------------------------------------------------------------
    // 3. Build the *public* result the UI already knows
    // ------------------------------------------------------------
    const units = statusData.recognitionUnits || [];
    const words: RecognitionResult['words'] = [];
    let fullText = '';

    units.forEach((unit: any) => {
      if (unit.category === 'inkWord') {
        const txt = unit.recognizedText || '';
        fullText += txt + ' ';

        // Azure gives a quadrilateral; we approximate a rectangle
        const bb = unit.boundingRectangle || unit.boundingBox;
        words.push({
          text: txt,
          boundingBox: {
            x: bb?.x ?? 0,
            y: bb?.y ?? 0,
            width: bb?.width ?? 0,
            height: bb?.height ?? 0,
          },
        });
      }
    });

    const publicResult: RecognitionResult = {
      recognizedText: fullText.trim(),
      words,
    };

    // ------------------------------------------------------------
    // 4. Return **both** the public shape *and* the raw payload
    // ------------------------------------------------------------
    return {
      result: publicResult,
      raw: statusData, // <-- everything you need for line-snapping
    };
  } catch (err) {
    console.error('Azure Ink Recognizer exception:', err);
    return null;
  }
}

/* ---------- OPTIONAL: MyScript placeholder (unchanged) ---------- */
export interface MyScriptConfig {
  applicationKey: string;
  hmacKey: string;
}
export async function recognizeHandwritingMyScript(
  _strokes: InkStroke[],
  _config: MyScriptConfig
): Promise<string | null> {
  console.warn('MyScript integration not yet implemented');
  return null;
}