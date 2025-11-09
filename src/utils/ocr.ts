// src/utils/ocr.ts
import { createWorker, Worker } from 'tesseract.js';

// Minimal runtime-compatible types (Tesseract's types are broken)
type TesseractWord = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

type TesseractResult = {
  data: {
    text: string;
    words: TesseractWord[];
  };
};

let worker: Worker | null = null;

const initWorker = async (): Promise<Worker> => {
  if (!worker) {
    worker = await createWorker('eng', 1, {
      logger: (m: any) => console.log('[Tesseract]', m.status, m.progress),
    });
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?()',
      preserve_interword_spaces: '1',
    });
  }
  return worker;
};

export const recognizeHandwriting = async (imageDataUrl: string): Promise<string> => {
  const worker = await initWorker();
  const result = await worker.recognize(imageDataUrl);
  const data = result as unknown as TesseractResult;
  return data.data.text.trim();
};

export const getTextLines = async (imageDataUrl: string): Promise<{ text: string; bbox: any }[]> => {
  const worker = await initWorker();
  const result = await worker.recognize(imageDataUrl);
  const data = result as unknown as TesseractResult;
  const words = data.data.words || [];
  return words.map((word) => ({
    text: word.text,
    bbox: word.bbox,
  }));
};