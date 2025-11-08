import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Save, Upload, Download, Undo, Redo, Eraser, Pen, ZoomIn, ZoomOut, X, Sparkles, Type } from 'lucide-react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import SignatureCanvas from 'react-signature-canvas';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { saveNotepadNote, getNotepadNote } from '../utils/storage';
import { exportCanvasToImage, exportToPDF, saveToDevice, saveToPhotos } from '../utils/export';
import { isNative } from '../utils/native';
import { NotepadNote } from '../types';
import { convertPathsToInkStrokes, recognizeHandwriting } from '../utils/handwriting';
import { azureConfig, isAzureConfigured } from '../config/azure';

function NotepadContent() {
  const { date } = useParams<{ date: string }>();
  const selectedDate = date ? new Date(date) : new Date();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const canvasRef = useRef<ReactSketchCanvasRef | null>(null);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showRecognizedText, setShowRecognizedText] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  const loadNote = async () => {
    const note = await getNotepadNote(dateStr);
    if (note) {
      setMode(note.mode);
      setTemplateUrl(note.templateUrl || null);
      if (note.canvasData && canvasRef.current) {
        try {
          const paths = JSON.parse(note.canvasData);
          canvasRef.current.loadPaths(paths);
        } catch (error) {
          console.error('Error loading canvas data:', error);
        }
      }
      if (note.signature && signatureRef.current) {
        const img = new Image();
        img.src = note.signature;
        img.onload = () => {
          const ctx = signatureRef.current?.getCanvas().getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        };
      }
    }
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;

    const paths = await canvasRef.current.exportPaths();
    const signature = signatureRef.current?.toDataURL() || undefined;

    const note: NotepadNote = {
      id: `note-${dateStr}`,
      date: dateStr,
      mode,
      templateUrl: templateUrl || undefined,
      canvasData: JSON.stringify(paths),
      signature,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveNotepadNote(note);
    alert('Note saved successfully!');
  };

  const handleExport = async (exportFormat: 'png' | 'pdf') => {
    if (!canvasRef.current) return;

    try {
      // Export canvas
      const canvas = await canvasRef.current.exportImage('png');
      const img = new Image();
      img.src = canvas;

      img.onload = async () => {
        // Create a canvas with signature
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        exportCanvas.width = img.width;
        exportCanvas.height = img.height + (signatureRef.current ? 150 : 0);

        // Draw background (paper or template)
        if (mode === 'default') {
          ctx.fillStyle = '#faf9f6';
          ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
          // Draw lines
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 1;
          for (let y = 40; y < exportCanvas.height; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(exportCanvas.width, y);
            ctx.stroke();
          }
        } else if (templateUrl) {
          const templateImg = new Image();
          templateImg.crossOrigin = 'anonymous';
          templateImg.src = templateUrl;
          await new Promise((resolve) => {
            templateImg.onload = () => {
              ctx.drawImage(templateImg, 0, 0, exportCanvas.width, exportCanvas.height - (signatureRef.current ? 150 : 0));
              resolve(null);
            };
          });
        }

        // Draw main canvas
        ctx.drawImage(img, 0, 0);

        // Draw signature if exists
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
          const signatureData = signatureRef.current.toDataURL();
          const sigImg = new Image();
          sigImg.src = signatureData;
          await new Promise((resolve) => {
            sigImg.onload = () => {
              const sigHeight = 100;
              const sigY = exportCanvas.height - sigHeight - 20;
              ctx.drawImage(sigImg, 20, sigY, 200, sigHeight);
              resolve(null);
            };
          });
        }

        // Export
        if (exportFormat === 'png') {
          const blob = await exportCanvasToImage(exportCanvas);
          await saveToDevice(blob, `notepad-${dateStr}.png`);
        } else {
          const blob = await exportToPDF(exportCanvas);
          await saveToDevice(blob, `notepad-${dateStr}.pdf`);
        }

        alert(`Exported as ${exportFormat.toUpperCase()}!`);
      };
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export note');
    }
  };

  // Load note when date changes
  useEffect(() => {
    // Small delay to ensure canvas is mounted
    const timer = setTimeout(() => {
      loadNote();
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setTemplateUrl(url);
      setMode('custom');
    };
    reader.readAsDataURL(file);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleClear = () => {
    if (confirm('Clear all drawings?')) {
      canvasRef.current?.clearCanvas();
    }
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers for iPad
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pan
      setIsPanning(true);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      setLastPanPoint({
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      });
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentX = (touch1.clientX + touch2.clientX) / 2;
      const currentY = (touch1.clientY + touch2.clientY) / 2;
      
      const deltaX = currentX - lastPanPoint.x;
      const deltaY = currentY - lastPanPoint.y;
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: currentX, y: currentY });
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta);
    }
  };

  const handleRecognizeHandwriting = async () => {
    if (!canvasRef.current || !isAzureConfigured()) {
      alert('Azure Ink Recognizer not configured. Please set VITE_AZURE_INK_RECOGNIZER_KEY and VITE_AZURE_INK_RECOGNIZER_ENDPOINT in your .env file.');
      return;
    }

    if (mode === 'custom') {
      alert('Handwriting recognition is only available in Default mode.');
      return;
    }

    setIsRecognizing(true);
    setRecognizedText('');

    try {
      // Get canvas dimensions
      const canvasElement = canvasContainerRef.current?.querySelector('canvas');
      if (!canvasElement) {
        throw new Error('Canvas not found');
      }

      const canvasWidth = canvasElement.width || 794; // A4 width in pixels at 96 DPI
      const canvasHeight = canvasElement.height || 1123; // A4 height in pixels at 96 DPI

      // Export paths
      const paths = await canvasRef.current.exportPaths();
      
      // Convert to Azure format
      const strokes = convertPathsToInkStrokes(paths, canvasWidth, canvasHeight);

      if (strokes.length === 0) {
        alert('No strokes to recognize. Please draw something first.');
        setIsRecognizing(false);
        return;
      }

      // Call recognition API
      const result = await recognizeHandwriting(
        strokes,
        azureConfig.language,
        azureConfig.apiKey,
        azureConfig.endpoint
      );

      if (result && result.recognizedText) {
        setRecognizedText(result.recognizedText);
        setShowRecognizedText(true);
      } else {
        alert('Could not recognize handwriting. Please try again.');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      alert('Error recognizing handwriting. Please check your API configuration.');
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notepad</h1>
          <p className="text-gray-600 mt-1">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={() => {
            setMode('default');
            setTemplateUrl(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'default'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Default Notepad
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Custom Template
        </button>
        {mode === 'custom' && (
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
            <Upload className="w-5 h-5" />
            Upload Template
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleTemplateUpload}
              className="hidden"
            />
          </label>
        )}
        {templateUrl && mode === 'custom' && (
          <button
            onClick={() => setTemplateUrl(null)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <X className="w-5 h-5" />
            Remove Template
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawing(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDrawing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Pen"
          >
            <Pen className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsDrawing(false)}
            className={`p-2 rounded-lg transition-colors ${
              !isDrawing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Color:</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Width:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 w-8">{strokeWidth}px</span>
        </div>

        <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
          <button
            onClick={handleUndo}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        {mode === 'default' && (
          <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
            <button
              onClick={handleRecognizeHandwriting}
              disabled={isRecognizing || !isAzureConfigured()}
              className={`p-2 rounded-lg transition-colors ${
                isRecognizing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isAzureConfigured()
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={isAzureConfigured() ? 'Recognize Handwriting' : 'Azure Ink Recognizer not configured'}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            {isRecognizing && (
              <span className="text-sm text-gray-600">Recognizing...</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-l border-gray-300 pl-4 ml-auto">
          <button
            onClick={async () => {
              if (isNative) {
                try {
                  if (!canvasRef.current) return;
                  const canvas = await canvasRef.current.exportImage('png');
                  const img = new Image();
                  img.src = canvas;
                  img.onload = async () => {
                    const exportCanvas = document.createElement('canvas');
                    const ctx = exportCanvas.getContext('2d');
                    if (!ctx) return;
                    exportCanvas.width = img.width;
                    exportCanvas.height = img.height + (signatureRef.current ? 150 : 0);
                    ctx.fillStyle = '#faf9f6';
                    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
                    ctx.drawImage(img, 0, 0);
                    if (signatureRef.current && !signatureRef.current.isEmpty()) {
                      const sigData = signatureRef.current.toDataURL();
                      const sigImg = new Image();
                      sigImg.src = sigData;
                      await new Promise((resolve) => {
                        sigImg.onload = () => {
                          ctx.drawImage(sigImg, 20, exportCanvas.height - 120, 200, 100);
                          resolve(null);
                        };
                      });
                    }
                    exportCanvas.toBlob(async (blob) => {
                      if (blob) {
                        await saveToPhotos(blob, `notepad-${dateStr}.png`);
                        alert('Saved to Photos app!');
                      }
                    }, 'image/png');
                  };
                } catch (error) {
                  console.error('Error saving to Photos:', error);
                  handleExport('png');
                }
              } else {
                handleExport('png');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            {isNative ? 'Save to Photos' : 'PNG'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={canvasContainerRef}
        className="bg-gray-100 rounded-lg shadow-lg p-4 overflow-auto touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ 
          cursor: isPanning ? 'grabbing' : 'default',
          minHeight: '600px',
          maxHeight: '90vh',
        }}
      >
        <div
          className="relative mx-auto"
          style={{
            width: `${794 * zoom}px`,
            height: `${1123 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.1s',
          }}
        >
          {mode === 'default' ? (
            <div 
              className="paper-bg bg-paper rounded shadow-inner relative"
              style={{ 
                width: '794px', 
                height: '1123px',
                padding: '32px',
              }}
            >
              <ReactSketchCanvas
                ref={canvasRef}
                width="794"
                height="1123"
                strokeColor={isDrawing ? strokeColor : '#ffffff'}
                canvasColor="transparent"
                strokeWidth={strokeWidth}
                eraserWidth={strokeWidth * 5}
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          ) : (
            <div 
              className="relative bg-white rounded shadow-inner"
              style={{ 
                width: '794px', 
                height: '1123px',
              }}
            >
              {templateUrl && (
                <img
                  src={templateUrl}
                  alt="Template"
                  className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-0 rounded"
                  style={{ width: '794px', height: '1123px' }}
                />
              )}
              <ReactSketchCanvas
                ref={canvasRef}
                width="794"
                height="1123"
                strokeColor={isDrawing ? strokeColor : '#ffffff'}
                canvasColor="transparent"
                strokeWidth={strokeWidth}
                eraserWidth={strokeWidth * 5}
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recognized Text Panel */}
      {showRecognizedText && recognizedText && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Type className="w-5 h-5 text-blue-600" />
              Recognized Text
            </h3>
            <button
              onClick={() => setShowRecognizedText(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap">{recognizedText}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(recognizedText);
                alert('Text copied to clipboard!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy Text
            </button>
            <button
              onClick={() => setShowRecognizedText(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Signature Area */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'signature-canvas w-full',
              width: 500,
              height: 200,
            }}
            backgroundColor="white"
            penColor="#000000"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => signatureRef.current?.clear()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notepad() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error loading Notepad</h2>
            <p className="text-red-600 mb-4">
              There was an error loading the notepad component. Please check the browser console for details.
            </p>
            <p className="text-sm text-gray-600">
              Common issues:
              <ul className="list-disc list-inside mt-2">
                <li>Canvas library not loaded properly</li>
                <li>Browser compatibility issue</li>
                <li>JavaScript error in component</li>
              </ul>
            </p>
          </div>
        </div>
      }
    >
      <NotepadContent />
    </ErrorBoundary>
  );
}

