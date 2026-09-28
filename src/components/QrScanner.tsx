import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Upload,
  Camera,
  CameraOff,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Tag
} from 'lucide-react';
import { ScanResult } from '../types';
import { ResultCard } from './ResultCard';
import {
  decodeQrFromImageFile,
  decodeQrFromImageData,
  analyzeQrPayload,
  SAMPLE_QR_PRESETS,
  generateQrDataUrl,
  SampleQrPreset
} from '../utils/qrEngine';

interface QrScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onScanComplete }) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decodedContent, setDecodedContent] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  // Pre-rendered sample QR image cache
  const [sampleQrs, setSampleQrs] = useState<(SampleQrPreset & { imgUrl?: string })[]>(SAMPLE_QR_PRESETS);

  // Load sample QR preview images
  useEffect(() => {
    let isMounted = true;
    async function loadSamples() {
      const updated = await Promise.all(
        SAMPLE_QR_PRESETS.map(async (sample) => {
          const imgUrl = await generateQrDataUrl(sample.payload);
          return { ...sample, imgUrl };
        })
      );
      if (isMounted) setSampleQrs(updated);
    }
    loadSamples();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle image upload from file input or drag-and-drop
  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setUploadedImagePreview(previewUrl);

    try {
      const decoded = await decodeQrFromImageFile(file);
      setDecodedContent(decoded);
      await evaluateDecodedPayload(decoded);
    } catch (err: any) {
      setError(err?.message || 'Failed to detect or decode QR code.');
      setDecodedContent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Evaluate decoded text/URL via backend API with fallback
  const evaluateDecodedPayload = async (payload: string) => {
    try {
      const response = await fetch('/api/scan/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      });

      if (response.ok) {
        const scanRes: ScanResult = await response.json();
        setResult(scanRes);
        onScanComplete(scanRes);
      } else {
        const fallback = analyzeQrPayload(payload);
        setResult(fallback);
        onScanComplete(fallback);
      }
    } catch {
      const fallback = analyzeQrPayload(payload);
      setResult(fallback);
      onScanComplete(fallback);
    }
  };

  // Handle clicking a sample preset QR
  const handleSelectSample = async (sample: SampleQrPreset) => {
    setLoading(true);
    setError(null);
    setUploadedImagePreview(sample.dataUrl || (sample as any).imgUrl || null);
    setDecodedContent(sample.payload);
    await evaluateDecodedPayload(sample.payload);
    setLoading(false);
  };

  // Webcam scanning logic
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err) {
      setError('Unable to access camera. Please allow camera permissions or upload an image.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsCameraActive(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = decodeQrFromImageData(imageData);

      if (decoded) {
        // QR detected!
        stopCamera();
        setDecodedContent(decoded);
        setUploadedImagePreview(canvas.toDataURL());
        evaluateDecodedPayload(decoded);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleClear = () => {
    stopCamera();
    setDecodedContent(null);
    setResult(null);
    setUploadedImagePreview(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">QR Code Scanner</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detect "Quishing" (QR phishing) and fraudulent barcodes by safely decoding payloads before opening links.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => {
              stopCamera();
              setActiveMode('upload');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeMode === 'upload' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Image Upload</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('camera');
              startCamera();
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeMode === 'camera' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Webcam / Camera</span>
          </button>
        </div>
      </div>

      {/* Preset Sample QRs */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Test Sample QRs (Click to Decode & Scan)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sampleQrs.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-lg p-1 border border-slate-100 group-hover:scale-105 transition-transform flex items-center justify-center">
                {sample.imgUrl ? (
                  <img src={sample.imgUrl} alt={sample.title} className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">{sample.title}</span>
              <span className={`text-[10px] font-semibold mt-0.5 px-2 py-0.5 rounded-full ${
                sample.expectedRisk === 'High Risk'
                  ? 'bg-rose-100 text-rose-700'
                  : sample.expectedRisk === 'Suspicious'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}>
                {sample.expectedRisk}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scanner Views */}
      {activeMode === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-8 bg-slate-50/50 hover:bg-indigo-50/20 text-center transition-all cursor-pointer relative"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="max-w-sm mx-auto space-y-3 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Drag & drop your QR image here, or <span className="text-indigo-600">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PNG, JPG, JPEG, WEBP screenshots & photos
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center text-white relative overflow-hidden">
          <div className="max-w-md mx-auto space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-700">
              <video
                ref={videoRef}
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning visual overlay frame */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-cyan-400 rounded-xl relative animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              {isCameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-slate-800">Decoding & Inspecting QR Code...</p>
          <p className="text-xs text-slate-500">Extracting payload and executing security heuristics</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Decoded Content Banner */}
      {decodedContent && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Decoded QR Content</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Type: {result?.qrDetails?.contentType || 'Payload'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {uploadedImagePreview && (
              <img
                src={uploadedImagePreview}
                alt="QR Preview"
                className="w-24 h-24 object-contain rounded-xl border border-slate-200 p-1 bg-slate-50 shrink-0"
              />
            )}
            <div className="flex-1 w-full">
              <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-xs rounded-xl break-all max-h-28 overflow-y-auto border border-slate-800">
                {decodedContent}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                The payload has been isolated and scanned for suspicious domains, credential lures, and attack vectors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && <ResultCard result={result} onClear={handleClear} />}
    </div>
  );
};
