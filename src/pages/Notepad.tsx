// src/pages/Notepad.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { NotepadNote, ImageOverlay, ImageOverlayWithState } from '../types';
import {
  Save, Upload, Download, Undo, Redo, Eraser, Pen,
  ZoomIn, ZoomOut, X, Sparkles, Type, AlignLeft, Camera, Trash2
} from 'lucide-react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import SignatureCanvas from 'react-signature-canvas';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { saveNotepadNote, getNotepadNote } from '../utils/storage';
import { exportCanvasToImage, exportToPDF, saveToDevice } from '../utils/export';
import {
  convertPathsToInkStrokes,
  recognizeHandwriting,
  type RecognitionFullResult,
} from '../utils/handwriting';
import { azureConfig, isAzureConfigured } from '../config/azure';

function NotepadContent() {
  const { date } = useParams<{ date: string }>();
  const selectedDate = date ? new Date(date) : new Date();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // ---------- State ----------
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [recognizedText, setRecognizedText] = useState('');
  const [showRecognizedText, setShowRecognizedText] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isAligning, setIsAligning] = useState(false);
  const [images, setImages] = useState<ImageOverlayWithState[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // ---------- Refs ----------
  const canvasRef = useRef<ReactSketchCanvasRef | null>(null);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const alignTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- Load Note ----------
  useEffect(() => {
    const timer = setTimeout(() => loadNote(), 100);
    return () => clearTimeout(timer);
  }, [dateStr]);

  const loadNote = async () => {
    const note = await getNotepadNote(dateStr);
    if (!note) return;

    setMode(note.mode);
    setTemplateUrl(note.templateUrl || null);
    setImages(note.images || []);

    if (note.canvasData && canvasRef.current) {
      try {
        canvasRef.current.loadPaths(JSON.parse(note.canvasData));
      } catch (e) { console.error(e); }
    }

    if (note.signature && signatureRef.current) {
      const img = new Image();
      img.src = note.signature;
      img.onload = () => {
        const ctx = signatureRef.current?.getCanvas().getContext('2d');
        ctx?.drawImage(img, 0, 0);
      };
    }
  };

  // ---------- Save ----------
  const handleSave = async () => {
    if (!canvasRef.current) return;
    const paths = await canvasRef.current.exportPaths();
    const signature = signatureRef.current?.toDataURL() || undefined;
  
    // Strip runtime-only fields before saving
    const cleanImages: ImageOverlay[] = images.map(({ isDragging, isResizing, resizeHandle, originalX, originalY, originalWidth, originalHeight, ...rest }) => rest);
  
    const note: NotepadNote = {
      id: `note-${dateStr}`,
      date: dateStr,
      mode,
      templateUrl: templateUrl || undefined,
      canvasData: JSON.stringify(paths),
      signature,
      images: cleanImages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveNotepadNote(note);
    alert('Note saved!');
  };

  // ---------- Export ----------
  const handleExport = async (fmt: 'png' | 'pdf') => {
    if (!canvasRef.current) return;
    try {
      const imgSrc = await canvasRef.current.exportImage('png');
      const img = new Image();
      img.src = imgSrc;
      await new Promise(r => img.onload = r);

      const out = document.createElement('canvas');
      const ctx = out.getContext('2d')!;
      out.width = img.width;
      out.height = img.height + (signatureRef.current ? 150 : 0);

      if (mode === 'default') {
        ctx.fillStyle = '#faf9f6';
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let y = 40; y < out.height; y += 32) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(out.width, y); ctx.stroke();
        }
      } else if (templateUrl) {
        const tmpl = new Image();
        tmpl.crossOrigin = 'anonymous';
        tmpl.src = templateUrl;
        await new Promise(r => tmpl.onload = r);
        ctx.drawImage(tmpl, 0, 0, out.width, out.height - (signatureRef.current ? 150 : 0));
      }

      ctx.drawImage(img, 0, 0);

      for (const imgOverlay of images) {
        const imgEl = new Image();
        imgEl.src = imgOverlay.url;
        await new Promise(r => imgEl.onload = r);
        ctx.drawImage(imgEl, imgOverlay.x, imgOverlay.y, imgOverlay.width, imgOverlay.height);
      }

      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        const sig = new Image();
        sig.src = signatureRef.current.toDataURL();
        await new Promise(r => sig.onload = r);
        ctx.drawImage(sig, 20, out.height - 120, 200, 100);
      }

      const blob = fmt === 'png'
        ? await exportCanvasToImage(out)
        : await exportToPDF(out);
      await saveToDevice(blob, `notepad-${dateStr}.${fmt}`);
      alert(`Exported as ${fmt.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      alert('Export failed');
    }
  };

  // ---------- Template Upload ----------
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setTemplateUrl(ev.target?.result as string);
      setMode('custom');
    };
    reader.readAsDataURL(file);
  };

  // ---------- Camera ----------
  const handleCamera = () => {
    cameraInputRef.current?.setAttribute('capture', 'environment');
    cameraInputRef.current?.click();
  };

  const insertImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const maxW = 600, maxH = 800;
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w *= ratio; h *= ratio;
      }
      const x = (794 - w) / 2;
      const y = (1123 - h) / 2;
  
      const overlay: ImageOverlayWithState = {
        id: `img-${Date.now()}`,
        url,
        x, y, width: w, height: h,
      };
      setImages(prev => [...prev, overlay]);
      setSelectedImageId(overlay.id);
      URL.revokeObjectURL(url);
    };
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) insertImage(file);
  };

  // ---------- Paste from Clipboard ----------
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.includes('image')) {
          const file = item.getAsFile();
          if (file) insertImage(file);
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // ---------- Image Interaction ----------
  const startImageDrag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const img = images.find(i => i.id === id);
    if (!img) return;
    setImages(prev => prev.map(i => i.id === id ? { ...i, isDragging: true, originalX: i.x, originalY: i.y } : i));
    setSelectedImageId(id);
  };

  const startImageResize = (id: string, handle: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r', e: React.MouseEvent) => {
    e.stopPropagation();
    const img = images.find(i => i.id === id);
    if (!img) return;
    setImages(prev => prev.map(i => i.id === id ? {
      ...i,
      isResizing: true,
      resizeHandle: handle,
      originalX: i.x,
      originalY: i.y,
      originalWidth: i.width,
      originalHeight: i.height,
    } : i));
    setSelectedImageId(id);
  };

  const moveImage = useCallback((e: MouseEvent) => {
    const selected = images.find(i => i.isDragging || i.isResizing);
    if (!selected) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;

    setImages(prev => prev.map(i => {
      if (i.id !== selected.id) return i;
      if (i.isDragging) return { ...i, x: i.originalX! + dx, y: i.originalY! + dy };
      if (i.isResizing) {
        const h = i.resizeHandle!;
        let newW = i.originalWidth!, newH = i.originalHeight!, newX = i.originalX!, newY = i.originalY!;
        if (h.includes('r')) newW += dx;
        if (h.includes('l')) { newW -= dx; newX += dx; }
        if (h.includes('b')) newH += dy;
        if (h.includes('t')) { newH -= dy; newY += dy; }
        if (newW < 50) newW = 50;
        if (newH < 50) newH = 50;
        return { ...i, x: newX, y: newY, width: newW, height: newH };
      }
      return i;
    }));
  }, [images]);

  const endImageInteraction = () => {
    setImages(prev => prev.map(i => ({
      ...i,
      isDragging: false,
      isResizing: false,
      resizeHandle: undefined,
      originalX: undefined,
      originalY: undefined,
      originalWidth: undefined,
      originalHeight: undefined,
    })));
  };

  useEffect(() => {
    if (images.some(i => i.isDragging || i.isResizing)) {
      document.addEventListener('mousemove', moveImage);
      document.addEventListener('mouseup', endImageInteraction);
      return () => {
        document.removeEventListener('mousemove', moveImage);
        document.removeEventListener('mouseup', endImageInteraction);
      };
    }
  }, [images, moveImage]);

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
    if (selectedImageId === id) setSelectedImageId(null);
  };

  const renderImages = () => {
    return images.map(img => {
      const isSelected = selectedImageId === img.id;
      return (
        <div
          key={img.id}
          className="absolute border-2 border-dashed border-blue-500 cursor-move"
          style={{
            left: img.x,
            top: img.y,
            width: img.width,
            height: img.height,
            backgroundImage: `url(${img.url})`,
            backgroundSize: 'cover',
            boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.5)' : 'none',
          }}
          onMouseDown={(e) => startImageDrag(img.id, e)}
        >
          {isSelected && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {(['tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r'] as const).map(h => (
                <div
                  key={h}
                  className="absolute bg-white border-2 border-blue-500 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    top: h.includes('t') ? 0 : h.includes('b') ? '100%' : '50%',
                    left: h.includes('l') ? 0 : h.includes('r') ? '100%' : '50%',
                  }}
                  onMouseDown={(e) => startImageResize(img.id, h, e)}
                />
              ))}
            </>
          )}
        </div>
      );
    });
  };

  // ---------- Line Snap ----------
  const getLineYs = (h: number) => Array.from({ length: Math.floor(h / 32) }, (_, i) => 40 + i * 32);
  const nearestLineY = (target: number, ys: number[]) => ys.reduce((a, b) => Math.abs(b - target) < Math.abs(a - target) ? b : a);

  const scheduleAlignment = () => {
    if (alignTimerRef.current) clearTimeout(alignTimerRef.current);
    alignTimerRef.current = setTimeout(handleAlignToLines, 2000);
  };

  const handleAlignToLines = async () => {
    if (!canvasRef.current || mode !== 'default' || !isAzureConfigured()) return;
    setIsAligning(true);
    try {
      const canvasEl = canvasContainerRef.current?.querySelector('canvas');
      if (!canvasEl) return;
      const w = canvasEl.width || 794;
      const h = canvasEl.height || 1123;
      const lineYs = getLineYs(h);
      const paths = await canvasRef.current.exportPaths();
      const strokes = convertPathsToInkStrokes(paths, w, h);
      const full = await recognizeHandwriting(strokes, azureConfig.language, azureConfig.apiKey, azureConfig.endpoint);
      if (!full?.raw?.recognitionUnits?.length) return;

      const idToIdx = new Map<number, number>();
      paths.forEach((_, i) => idToIdx.set(i + 1, i));
      const adjusted = [...paths];

      full.raw.recognitionUnits.forEach((unit: any) => {
        if (unit.category !== 'line') return;
        const bb = unit.boundingRectangle || unit.boundingBox;
        const avgY = bb.y + bb.height / 2;
        const targetY = nearestLineY(avgY, lineYs);
        const deltaY = targetY - avgY;
        (unit.strokeIds || []).forEach((sid: number) => {
          const idx = idToIdx.get(sid);
          if (idx === undefined) return;
          adjusted[idx].paths?.forEach((sp: any) => {
            sp.path = sp.path.map((p: any) => ({ ...p, y: p.y + deltaY }));
          });
        });
      });

      canvasRef.current.clearCanvas();
      await canvasRef.current.loadPaths(adjusted);
    } catch (e) { console.error(e); } finally { setIsAligning(false); }
  };

  const handleRecognize = async () => {
    if (!canvasRef.current || !isAzureConfigured()) return;
    setIsRecognizing(true);
    try {
      const canvasEl = canvasContainerRef.current?.querySelector('canvas');
      const w = canvasEl?.width || 794;
      const h = canvasEl?.height || 1123;
      const paths = await canvasRef.current.exportPaths();
      const strokes = convertPathsToInkStrokes(paths, w, h);
      const full = await recognizeHandwriting(strokes, azureConfig.language, azureConfig.apiKey, azureConfig.endpoint);
      if (full?.result?.recognizedText) {
        setRecognizedText(full.result.recognizedText);
        setShowRecognizedText(true);
      }
    } catch (e) { console.error(e); } finally { setIsRecognizing(false); }
  };

  // ---------- Pan ----------
  const startPan = (x: number, y: number) => {
    setIsPanning(true);
    setLastPanPoint({ x, y });
  };
  const movePan = (x: number, y: number) => {
    if (!isPanning) return;
    const dx = x - lastPanPoint.x;
    const dy = y - lastPanPoint.y;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    setLastPanPoint({ x, y });
  };
  const endPan = () => setIsPanning(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notepad</h1>
          <p className="text-gray-600 mt-1">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Save className="w-5 h-5" /> Save
        </button>
      </div>

      {/* Mode */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
        <button onClick={() => { setMode('default'); setTemplateUrl(null); }} className={`px-4 py-2 rounded-lg font-medium ${mode === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Default</button>
        <button onClick={() => setMode('custom')} className={`px-4 py-2 rounded-lg font-medium ${mode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Custom</button>
        {mode === 'custom' && (
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-5 h-5" /> Upload
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleTemplateUpload} className="hidden" />
          </label>
        )}
        {templateUrl && mode === 'custom' && (
          <button onClick={() => setTemplateUrl(null)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
            <X className="w-5 h-5" /> Remove
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button onClick={() => setIsDrawing(true)} className={`p-2 rounded-lg ${isDrawing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`} title="Pen"><Pen className="w-5 h-5" /></button>
          <button onClick={() => setIsDrawing(false)} className={`p-2 rounded-lg ${!isDrawing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`} title="Eraser"><Eraser className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-2">
          <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
        </div>

        <div className="flex items-center gap-2">
          <input type="range" min="1" max="20" value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)} className="w-24" />
          <span className="text-sm w-8">{strokeWidth}px</span>
        </div>

        <div className="flex gap-2 border-l pl-4">
          <button onClick={() => canvasRef.current?.undo()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Undo className="w-5 h-5" /></button>
          <button onClick={() => canvasRef.current?.redo()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Redo className="w-5 h-5" /></button>
          <button onClick={() => confirm('Clear all?') && canvasRef.current?.clearCanvas()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Eraser className="w-5 h-5" /></button>
        </div>

        {mode === 'default' && (
          <>
            <div className="flex items-center gap-2 border-l pl-4">
              <button onClick={handleRecognize} disabled={isRecognizing || !isAzureConfigured()} className={`p-2 rounded-lg ${isRecognizing ? 'bg-gray-300' : isAzureConfigured() ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400'}`}><Sparkles className="w-5 h-5" /></button>
              {isRecognizing && <span className="text-sm">Recognizing…</span>}
            </div>
            <div className="flex items-center gap-2 border-l pl-4">
              <button onClick={handleAlignToLines} disabled={isAligning || !isAzureConfigured()} className={`p-2 rounded-lg ${isAligning ? 'bg-gray-300' : isAzureConfigured() ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400'}`}><AlignLeft className="w-5 h-5" /></button>
              {isAligning && <span className="text-sm">Aligning…</span>}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 border-l pl-4">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><ZoomOut className="w-5 h-5" /></button>
          <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><ZoomIn className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-2 border-l pl-4">
          <button onClick={handleCamera} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Camera className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2 border-l pl-4 ml-auto">
          <button onClick={() => handleExport('png')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Download className="w-4 h-4" /> PNG</button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Download className="w-4 h-4" /> PDF</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasContainerRef}
        className="bg-gray-100 rounded-lg shadow-lg p-4 overflow-auto touch-none"
        style={{ minHeight: '600px', maxHeight: '90vh' }}
        onMouseDown={e => (e.button === 1 || (e.button === 0 && e.ctrlKey)) && startPan(e.clientX, e.clientY)}
        onMouseMove={e => movePan(e.clientX, e.clientY)}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onTouchStart={e => e.touches.length === 2 && startPan(
          (e.touches[0].clientX + e.touches[1].clientX) / 2,
          (e.touches[0].clientY + e.touches[1].clientY) / 2
        )}
        onTouchMove={e => e.touches.length === 2 && movePan(
          (e.touches[0].clientX + e.touches[1].clientX) / 2,
          (e.touches[0].clientY + e.touches[1].clientY) / 2
        )}
        onTouchEnd={endPan}
        onWheel={e => (e.ctrlKey || e.metaKey) && (e.preventDefault(), setZoom(z => Math.max(0.5, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1)))))}
      >
        <div
          className="relative mx-auto"
          style={{
            width: `${794 * zoom}px`,
            height: `${1123 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isPanning ? 'none' : 'transform .1s',
          }}
        >
          {mode === 'default' ? (
            <div className="paper-bg bg-paper rounded shadow-inner relative" style={{ width: 794, height: 1123, padding: 32 }}>
              <ReactSketchCanvas
                ref={canvasRef}
                width="794"
                height="1123"
                strokeColor={isDrawing ? strokeColor : '#ffffff'}
                canvasColor="transparent"
                strokeWidth={strokeWidth}
                eraserWidth={strokeWidth * 5}
                style={{ border: 'none', position: 'absolute', inset: 0 }}
                onChange={() => mode === 'default' && scheduleAlignment()}
              />
            </div>
          ) : (
            <div className="relative bg-white rounded shadow-inner" style={{ width: 794, height: 1123 }}>
              {templateUrl && <img src={templateUrl} alt="template" className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 rounded" />}
              <ReactSketchCanvas
                ref={canvasRef}
                width="794"
                height="1123"
                strokeColor={isDrawing ? strokeColor : '#ffffff'}
                canvasColor="transparent"
                strokeWidth={strokeWidth}
                eraserWidth={strokeWidth * 5}
                style={{ border: 'none', position: 'absolute', inset: 0, zIndex: 1 }}
              />
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none">{renderImages()}</div>
        </div>
      </div>

      {/* Hidden Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleTemplateUpload} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />

      {/* Recognized Text */}
      {showRecognizedText && recognizedText && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Type className="w-5 h-5 text-blue-600" /> Recognized Text</h3>
            <button onClick={() => setShowRecognizedText(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border"><p className="whitespace-pre-wrap">{recognizedText}</p></div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { navigator.clipboard.writeText(recognizedText); alert('Copied!'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Copy</button>
            <button onClick={() => setShowRecognizedText(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
          </div>
        </div>
      )}

      {/* Signature */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Signature</h3>
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{ className: 'signature-canvas w-full', width: 500, height: 200 }}
            backgroundColor="white"
            penColor="#000000"
          />
          <div className="flex gap-2 mt-4">
            <button onClick={() => signatureRef.current?.clear()} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notepad() {
  return (
    <ErrorBoundary fallback={<div className="p-8 text-red-600">Error loading Notepad</div>}>
      <NotepadContent />
    </ErrorBoundary>
  );
}