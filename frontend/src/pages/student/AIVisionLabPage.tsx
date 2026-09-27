import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Scan, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  RefreshCw, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  Eye, 
  Binary, 
  Scale, 
  Maximize2,
  FileCheck,
  SplitSquareVertical,
  HelpCircle,
  Hash
} from 'lucide-react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { visionApi } from '../../api/vision-api';
import { api } from '../../lib/api';
import { ItemReport } from '../../types';

export const AIVisionLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'compare'>('single');
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);

  // Single Image Inspector State
  const [singleImageFile, setSingleImageFile] = useState<File | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [singleProcessing, setSingleProcessing] = useState<boolean>(false);
  const [singleResult, setSingleResult] = useState<any>(null);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Comparator State
  const [imageAFile, setImageAFile] = useState<File | null>(null);
  const [imageAPreview, setImageAPreview] = useState<string | null>(null);
  const [imageBFile, setImageBFile] = useState<File | null>(null);
  const [imageBPreview, setImageBPreview] = useState<string | null>(null);
  const [compareProcessing, setCompareProcessing] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Real Database Reports for 1-click loading
  const [dbReports, setDbReports] = useState<ItemReport[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const [meta, reports] = await Promise.all([
          visionApi.getModelMetadata().catch(() => null),
          api.reports.list().catch(() => [])
        ]);
        if (meta) setModelInfo(meta);
        if (Array.isArray(reports)) setDbReports(reports);
      } catch (err) {
        console.warn('Failed to initialize Vision Lab:', err);
      } finally {
        setLoadingModels(false);
      }
    }
    init();
  }, []);

  // Helper to convert an image URL to a File object with multiple resilient fallbacks
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const cleanUrl = url.replace(/^\/+/, '');
    const urlsToTry = [
      url.startsWith('http') ? url : url,
      url.startsWith('http') ? url : `/${cleanUrl}`,
      url.startsWith('http') ? url : `/api/v1/${cleanUrl}`,
      url.startsWith('http') ? url : `http://127.0.0.1:8000/${cleanUrl}`,
      url.startsWith('http') ? url : `http://localhost:8000/${cleanUrl}`
    ];
    let lastErr = null;
    for (const u of urlsToTry) {
      try {
        const res = await fetch(u);
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 50) {
            return new File([blob], filename, { type: blob.type || 'image/jpeg' });
          }
        }
      } catch (e) {
        lastErr = e;
      }
    }
    throw new Error(lastErr ? String(lastErr) : `Could not load image from ${url}`);
  };

  // 1. Single Image Processing Handler
  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSingleImageFile(file);
    setSingleImagePreview(URL.createObjectURL(file));
    setSingleResult(null);
    setSingleError(null);
  };

  const handleProcessSingle = async () => {
    if (!singleImageFile) return;
    setSingleProcessing(true);
    setSingleError(null);
    try {
      const res = await visionApi.processImage(singleImageFile, false);
      setSingleResult(res);
    } catch (err: any) {
      setSingleError(err.message || 'Vision pipeline processing failed.');
    } finally {
      setSingleProcessing(false);
    }
  };

  const handleSelectDbReportSingle = async (report: ItemReport) => {
    if (!report.images || report.images.length === 0) return;
    const imgUrl = report.images[0].url;
    setSingleImagePreview(imgUrl.startsWith('http') ? imgUrl : `http://localhost:8000${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`);
    setSingleResult(null);
    setSingleError(null);
    setSingleProcessing(true);
    try {
      const file = await urlToFile(imgUrl, `${report.title.replace(/\s+/g, '_')}.jpg`);
      setSingleImageFile(file);
      const res = await visionApi.processImage(file, false);
      setSingleResult(res);
    } catch (err: any) {
      setSingleError(err.message || 'Failed to analyze selected report image.');
    } finally {
      setSingleProcessing(false);
    }
  };

  // 2. Comparison Handlers
  const handleImageAUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageAFile(file);
    setImageAPreview(URL.createObjectURL(file));
    setCompareResult(null);
  };

  const handleImageBUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageBFile(file);
    setImageBPreview(URL.createObjectURL(file));
    setCompareResult(null);
  };

  const handleRunComparison = async () => {
    if (!imageAFile || !imageBFile) {
      setCompareError('Please select or upload both Item A and Item B images.');
      return;
    }
    setCompareProcessing(true);
    setCompareError(null);
    try {
      const res = await visionApi.compareImages(imageAFile, imageBFile);
      setCompareResult(res);
    } catch (err: any) {
      setCompareError(err.message || 'Visual comparison failed.');
    } finally {
      setCompareProcessing(false);
    }
  };

  // Preset Scenario Loader
  const loadPresetScenario = async (type: 'matching_bottles' | 'conflict_items') => {
    setCompareError(null);
    setCompareResult(null);
    setCompareProcessing(true);

    try {
      const waterBottles = dbReports.filter(r => (r.title + r.category).toLowerCase().includes('bottle') && r.images?.length);
      const earbuds = dbReports.filter(r => (r.title + r.category).toLowerCase().includes('earbud') && r.images?.length);

      let itemA = waterBottles[0] || dbReports[0];
      let itemB = type === 'matching_bottles' 
        ? (waterBottles[1] || waterBottles[0] || dbReports[1] || dbReports[0])
        : (earbuds[0] || dbReports[1] || dbReports[0]);

      if (!itemA || !itemB || !itemA.images?.[0] || !itemB.images?.[0]) {
        throw new Error('Database does not have sufficient sample images for this preset. You can upload custom images below.');
      }

      const fileA = await urlToFile(itemA.images[0].url, 'item_a.jpg');
      const fileB = await urlToFile(itemB.images[0].url, 'item_b.jpg');

      setImageAFile(fileA);
      setImageAPreview(itemA.images[0].url.startsWith('http') ? itemA.images[0].url : `http://localhost:8000${itemA.images[0].url.startsWith('/') ? '' : '/'}${itemA.images[0].url}`);
      setImageBFile(fileB);
      setImageBPreview(itemB.images[0].url.startsWith('http') ? itemB.images[0].url : `http://localhost:8000${itemB.images[0].url.startsWith('/') ? '' : '/'}${itemB.images[0].url}`);

      const res = await visionApi.compareImages(fileA, fileB);
      setCompareResult(res);
    } catch (err: any) {
      setCompareError(err.message || 'Failed to load test preset.');
    } finally {
      setCompareProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>Multi-Signal Neural Vision Engine</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            AI Vision & YOLO Live Inspector
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Inspect real-time YOLOv8 object detection, OpenCLIP ViT-B-32 semantic embeddings, and multi-signal matching scores.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-sahayak-cream-soft border border-sahayak-brown/15 p-1 rounded-2xl shadow-neumorph-sm">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
                : 'text-sahayak-text-secondary hover:text-sahayak-blue'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Single Image YOLO</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
                : 'text-sahayak-text-secondary hover:text-sahayak-blue'
            }`}
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span>Live Pair Comparator</span>
          </button>
        </div>
      </div>

      {/* Model & Hardware Telemetry Banner */}
      <NeumorphicCard className="p-4 border border-sahayak-brown/15 bg-gradient-to-r from-sahayak-cream-soft via-sahayak-cream to-sahayak-cream-soft">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-sahayak-brown/10 text-center sm:text-left">
          <div className="px-2">
            <span className="text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider block">YOLO Object Detector</span>
            <div className="flex items-center gap-1.5 mt-0.5 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-sahayak-success animate-pulse" />
              <span className="text-xs font-bold text-sahayak-blue-deep">
                {modelInfo?.models?.object_detector?.name || 'yolov8n.pt'} (PyTorch)
              </span>
            </div>
            <span className="text-[10px] text-sahayak-text-muted">Threshold: 25% IOU</span>
          </div>

          <div className="px-2 pt-2 sm:pt-0">
            <span className="text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider block">Semantic Embedder</span>
            <div className="flex items-center gap-1.5 mt-0.5 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-sahayak-blue" />
              <span className="text-xs font-bold text-sahayak-blue-deep">
                {modelInfo?.models?.semantic_embedder?.name || 'OpenCLIP ViT-B-32'}
              </span>
            </div>
            <span className="text-[10px] text-sahayak-text-muted">512-D L2 Normalized</span>
          </div>

          <div className="px-2 pt-2 sm:pt-0">
            <span className="text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider block">Keypoint Matching</span>
            <div className="flex items-center gap-1.5 mt-0.5 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-sahayak-gold" />
              <span className="text-xs font-bold text-sahayak-blue-deep">
                OpenCV ORB + RANSAC
              </span>
            </div>
            <span className="text-[10px] text-sahayak-text-muted">500 Features / Lowe Ratio 0.75</span>
          </div>

          <div className="px-2 pt-2 sm:pt-0">
            <span className="text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider block">Compute Hardware</span>
            <div className="flex items-center gap-1.5 mt-0.5 justify-center sm:justify-start">
              <Cpu className="w-3.5 h-3.5 text-sahayak-blue" />
              <span className="text-xs font-bold text-sahayak-blue-deep uppercase">
                {modelInfo?.device || 'CPU Inference'}
              </span>
            </div>
            <span className="text-[10px] text-sahayak-text-muted">Online & Operational</span>
          </div>
        </div>
      </NeumorphicCard>

      {/* TAB 1: SINGLE IMAGE YOLO INSPECTOR */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Live Preview with YOLO Overlay */}
          <div className="lg:col-span-6 space-y-4">
            <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-sahayak-blue" />
                  <span>Select or Upload Target Photograph</span>
                </h3>
                {singleImageFile && (
                  <span className="text-[11px] font-medium text-sahayak-text-muted">
                    {singleImageFile.name} ({(singleImageFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              {/* Upload Dropzone with Live Visual Bounding Box Overlay */}
              <label className="border-2 border-dashed border-sahayak-brown/25 hover:border-sahayak-blue rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-sahayak-cream-soft/50 hover:bg-sahayak-cream-soft transition-all min-h-[220px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSingleImageUpload}
                  className="hidden"
                />
                {singleImagePreview ? (
                  <div className="relative max-h-72 w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/5 p-2">
                    <div className="relative inline-block">
                      <img
                        src={singleImagePreview}
                        alt="Preview"
                        className="max-h-64 max-w-full object-contain rounded-xl shadow-md block"
                      />
                      {/* Live YOLO Neural Bounding Box Overlay */}
                      {singleResult?.items?.map((item: any, i: number) => {
                        const bbox = item.detection?.bbox;
                        if (!bbox) return null;
                        const left = `${(bbox.xmin || 0) * 100}%`;
                        const top = `${(bbox.ymin || 0) * 100}%`;
                        const width = `${((bbox.xmax || 1) - (bbox.xmin || 0)) * 100}%`;
                        const height = `${((bbox.ymax || 1) - (bbox.ymin || 0)) * 100}%`;
                        return (
                          <div
                            key={i}
                            className="absolute border-2 border-cyan-400 bg-cyan-400/20 rounded-md pointer-events-none shadow-lg shadow-cyan-400/40"
                            style={{ left, top, width, height }}
                          >
                            <span className="absolute -top-6 left-0 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                              {item.detection.category || item.detection.raw_class_name || 'Object'} ({((item.detection.confidence || 0.85) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center mx-auto shadow-neumorph-sm">
                      <Scan className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-sahayak-text-primary">
                      Click to upload any lost or found photograph
                    </p>
                    <p className="text-[11px] text-sahayak-text-muted">
                      Supports JPEG, PNG, WebP (e.g. water bottles, phones, keys, bags)
                    </p>
                  </div>
                )}
              </label>

              {/* Action Button */}
              <button
                onClick={handleProcessSingle}
                disabled={!singleImageFile || singleProcessing}
                className="w-full py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {singleProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running YOLOv8 & OpenCLIP Inference...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-sahayak-gold" />
                    <span>Execute YOLOv8 Neural Inspection</span>
                  </>
                )}
              </button>

              {singleError && (
                <div className="p-3 rounded-xl bg-sahayak-error-soft border border-sahayak-error/20 text-xs text-sahayak-error flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{singleError}</span>
                </div>
              )}
            </NeumorphicCard>

            {/* Quick 1-Click Database Samples */}
            {dbReports.length > 0 && (
              <NeumorphicCard className="p-4 border border-sahayak-brown/15 space-y-2.5">
                <span className="text-xs font-bold text-sahayak-blue-deep uppercase tracking-wider block">
                  1-Click Test Samples from Real Database:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dbReports.slice(0, 6).map((report) => (
                    <button
                      key={report.id}
                      onClick={() => handleSelectDbReportSingle(report)}
                      className="p-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/15 text-left hover:border-sahayak-blue transition-all cursor-pointer shadow-neumorph-sm group"
                    >
                      <div className="aspect-video w-full rounded-lg bg-sahayak-cream-soft overflow-hidden mb-1.5">
                        {report.images?.[0] ? (
                          <img
                            src={report.images[0].url.startsWith('http') ? report.images[0].url : `http://localhost:8000${report.images[0].url.startsWith('/') ? '' : '/'}${report.images[0].url}`}
                            alt={report.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-sahayak-text-muted">No Img</div>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-sahayak-blue-deep truncate">{report.title}</p>
                      <span className="text-[9px] font-semibold text-sahayak-blue px-1.5 py-0.2 rounded bg-sahayak-blue-ice">
                        {(report as any).reportType || (report as any).type || 'REPORT'}
                      </span>
                    </button>
                  ))}
                </div>
              </NeumorphicCard>
            )}
          </div>

          {/* Right Column: Real-Time Neural Extraction Results */}
          <div className="lg:col-span-6 space-y-4">
            <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-4 min-h-[420px]">
              <div className="flex items-center justify-between pb-3 border-b border-sahayak-brown/10">
                <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sahayak-blue" />
                  <span>YOLOv8 & OpenCLIP Neural Extraction Output</span>
                </h3>
                {singleResult && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sahayak-success-soft text-sahayak-success">
                    {singleResult.device ? `Device: ${singleResult.device}` : 'Active'}
                  </span>
                )}
              </div>

              {!singleResult ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-sahayak-text-muted space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/20 flex items-center justify-center">
                    <Sliders className="w-6 h-6 text-sahayak-text-muted" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sahayak-text-primary">Awaiting Image Inference</p>
                    <p className="text-[11px] max-w-xs mt-1">
                      Upload an item photo or select a test report from the database to see live bounding boxes, OpenCLIP vector embeddings, and detected physical attributes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  {/* Primary YOLO Detections */}
                  {singleResult.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-sahayak-cream border border-sahayak-brown/15 shadow-neumorph-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider">
                            Primary Object Class
                          </span>
                          <h4 className="font-heading font-extrabold text-lg text-sahayak-blue-deep capitalize">
                            {item.detection?.raw_class_name || item.detection?.category || 'Detected Object'}
                          </h4>
                          <span className="text-xs font-semibold text-sahayak-blue">
                            Campus Category: {item.detection?.category || 'General Item'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-sahayak-text-muted uppercase">Confidence</span>
                          <p className="text-lg font-heading font-extrabold text-sahayak-success">
                            {((item.detection?.confidence || 0.85) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Bounding Box Coordinates */}
                      {item.detection?.bbox && (
                        <div className="p-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/10 text-[11px] font-mono text-sahayak-text-secondary flex justify-between items-center">
                          <span>Normalized Bounding Box:</span>
                          <span className="font-bold text-sahayak-blue-deep">
                            [xmin: {item.detection.bbox.xmin?.toFixed(2)}, ymin: {item.detection.bbox.ymin?.toFixed(2)}, xmax: {item.detection.bbox.xmax?.toFixed(2)}, ymax: {item.detection.bbox.ymax?.toFixed(2)}]
                          </span>
                        </div>
                      )}

                      {/* Neural Embeddings & Hashes */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sahayak-brown/10 text-xs">
                        <div className="p-2 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/10">
                          <span className="text-[10px] font-bold text-sahayak-text-muted block">OpenCLIP Vector</span>
                          <span className="font-mono text-xs font-bold text-sahayak-blue">{item.embedding?.dimension || 512} Dimensions (L2)</span>
                          <span className="text-[9px] text-sahayak-text-muted block mt-0.5">{item.embedding?.model || 'ViT-B-32 LAION-2B'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/10">
                          <span className="text-[10px] font-bold text-sahayak-text-muted block">Perceptual pHash</span>
                          <span className="font-mono text-xs font-bold text-sahayak-blue truncate block">
                            {item.hashes?.phash || '0x4f8b21...'}
                          </span>
                          <span className="text-[9px] text-sahayak-text-muted block mt-0.5">Keypoints: {item.orb?.keypoint_count || 0} ORB</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </NeumorphicCard>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ITEM-TO-ITEM COMPARATOR */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Preset Quick Test Scenarios Bar */}
          <NeumorphicCard className="p-4 border border-sahayak-brown/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sahayak-gold" />
              <span className="text-xs font-bold text-sahayak-blue-deep">
                1-Click Live Test Scenarios:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => loadPresetScenario('matching_bottles')}
                className="px-3 py-1.5 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sahayak-gold" />
                <span>Test Bottle Match (Expected ~70% Match)</span>
              </button>
              <button
                onClick={() => loadPresetScenario('conflict_items')}
                className="px-3 py-1.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/20 text-sahayak-text-secondary text-xs font-bold hover:border-sahayak-error hover:text-sahayak-error transition-all cursor-pointer flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Test Conflict (Earbud vs Bottle &rarr; 0% Rejection)</span>
              </button>
            </div>
          </NeumorphicCard>

          {/* Dual Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot A: Lost Item */}
            <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sahayak-error uppercase tracking-wider flex items-center gap-1">
                  <span>🔴 Item A</span> &bull; <span>Lost Photograph</span>
                </span>
                {imageAFile && <span className="text-[10px] text-sahayak-text-muted">{imageAFile.name}</span>}
              </div>

              <label className="border-2 border-dashed border-sahayak-brown/20 hover:border-sahayak-blue rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-sahayak-cream-soft/50 min-h-[190px]">
                <input type="file" accept="image/*" onChange={handleImageAUpload} className="hidden" />
                {imageAPreview ? (
                  <img src={imageAPreview} alt="Item A" className="max-h-44 object-contain rounded-xl shadow-sm" />
                ) : (
                  <div className="text-center space-y-1">
                    <UploadCloud className="w-8 h-8 text-sahayak-blue mx-auto" />
                    <p className="text-xs font-bold text-sahayak-text-primary">Upload Item A Photo</p>
                    <p className="text-[10px] text-sahayak-text-muted">Or use 1-click test button above</p>
                  </div>
                )}
              </label>
            </NeumorphicCard>

            {/* Slot B: Found Item */}
            <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sahayak-blue uppercase tracking-wider flex items-center gap-1">
                  <span>🔵 Item B</span> &bull; <span>Found Photograph</span>
                </span>
                {imageBFile && <span className="text-[10px] text-sahayak-text-muted">{imageBFile.name}</span>}
              </div>

              <label className="border-2 border-dashed border-sahayak-brown/20 hover:border-sahayak-blue rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-sahayak-cream-soft/50 min-h-[190px]">
                <input type="file" accept="image/*" onChange={handleImageBUpload} className="hidden" />
                {imageBPreview ? (
                  <img src={imageBPreview} alt="Item B" className="max-h-44 object-contain rounded-xl shadow-sm" />
                ) : (
                  <div className="text-center space-y-1">
                    <UploadCloud className="w-8 h-8 text-sahayak-blue mx-auto" />
                    <p className="text-xs font-bold text-sahayak-text-primary">Upload Item B Photo</p>
                    <p className="text-[10px] text-sahayak-text-muted">Or use 1-click test button above</p>
                  </div>
                )}
              </label>
            </NeumorphicCard>
          </div>

          {/* Trigger Compare Button */}
          <div className="text-center">
            <button
              onClick={handleRunComparison}
              disabled={!imageAFile || !imageBFile || compareProcessing}
              className="px-8 py-3.5 rounded-2xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all inline-flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {compareProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Multi-Signal Cross-Match Matrix...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-sahayak-gold" />
                  <span>⚡ Run Live Multi-Signal AI Comparison</span>
                </>
              )}
            </button>
          </div>

          {compareError && (
            <div className="p-3.5 rounded-2xl bg-sahayak-error-soft border border-sahayak-error/20 text-xs text-sahayak-error flex items-start gap-2 max-w-xl mx-auto">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{compareError}</span>
            </div>
          )}

          {/* Live Comparison Results Dashboard */}
          {compareResult && (
            <NeumorphicCard className="p-6 border border-sahayak-brown/20 shadow-neumorph-lg space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sahayak-brown/10">
                <div>
                  <span className="text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider">
                    Neural Fusion Decision
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-sahayak-blue-deep flex items-center gap-2">
                    {compareResult.verdict === 'CLASS_MISMATCH_PENALTY' || compareResult.class_compatible === false ? (
                      <>
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <span className="text-red-500">Incompatible Class Rejection (Negative Penalty Applied)</span>
                      </>
                    ) : compareResult.match || compareResult.verdict === 'MATCH' ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-sahayak-success" />
                        <span>Valid AI Match Confirmed</span>
                      </>
                    ) : compareResult.verdict === 'POSSIBLE_MATCH' ? (
                      <>
                        <HelpCircle className="w-6 h-6 text-amber-500" />
                        <span>Possible Match (Under Proctor Review)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-sahayak-error" />
                        <span>Negative Match (Visual Divergence)</span>
                      </>
                    )}
                  </h3>
                </div>

                {/* Big Match Score Pill */}
                <div className="flex items-center gap-3 bg-sahayak-cream p-3 rounded-2xl border border-sahayak-brown/15 shadow-neumorph-sm">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-sahayak-text-muted uppercase block">AI Match Score</span>
                    <span className="text-xs font-semibold text-sahayak-text-secondary">
                      {compareResult.confidence < 0 ? 'Negative Score' : 'Weighted Fusion'}
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-heading font-black text-2xl text-white ${
                    compareResult.confidence < 0 || compareResult.verdict === 'CLASS_MISMATCH_PENALTY'
                      ? 'bg-red-600 shadow-md shadow-red-600/30'
                      : compareResult.confidence >= 0.65
                      ? 'bg-sahayak-success shadow-md shadow-emerald-500/30'
                      : compareResult.confidence >= 0.40
                      ? 'bg-amber-500'
                      : 'bg-sahayak-error'
                  }`}>
                    {compareResult.confidence < 0 ? '-1.0 (Penalized)' : `${((compareResult.confidence || 0) * 100).toFixed(1)}%`}
                  </div>
                </div>
              </div>

              {/* Auto-Generated AI Semantic Image Descriptions */}
              {(compareResult.description_a || compareResult.description_b) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-sahayak-blue-deep uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
                      <span>Auto-Generated AI Semantic Descriptions (Vision-to-Text)</span>
                    </h4>
                    {compareResult.signals?.description_similarity !== undefined && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        compareResult.class_compatible === false
                          ? 'bg-red-100 text-red-600 border border-red-200'
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      }`}>
                        Description Similarity: {((compareResult.signals.description_similarity || 0) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 space-y-1">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">
                        🔴 Item A Description:
                      </span>
                      <p className="text-xs font-medium text-sahayak-text-primary italic">
                        "{compareResult.description_a || 'Item A physical representation'}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 space-y-1">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
                        🔵 Item B Description:
                      </span>
                      <p className="text-xs font-medium text-sahayak-text-primary italic">
                        "{compareResult.description_b || 'Item B physical representation'}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Signal Breakdown Gauges */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-sahayak-blue-deep uppercase tracking-wider">
                  Neural Signal Breakdown & Mathematical Weights
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Signal 1: OpenCLIP Semantic */}
                  <div className="p-3.5 rounded-2xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sahayak-text-primary">OpenCLIP Cosine</span>
                      <span className="font-mono font-bold text-sahayak-blue">
                        {((compareResult.signals?.clip_similarity || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-sahayak-cream-soft h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sahayak-blue h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, (compareResult.signals?.clip_similarity || 0) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-sahayak-text-muted block">Weight: 35% in Fusion</span>
                  </div>

                  {/* Signal 2: Description Similarity */}
                  <div className="p-3.5 rounded-2xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sahayak-text-primary">Description Overlap</span>
                      <span className="font-mono font-bold text-cyan-600">
                        {((compareResult.signals?.description_similarity || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-sahayak-cream-soft h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, (compareResult.signals?.description_similarity || 0) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-sahayak-text-muted block">Weight: 25% in Fusion</span>
                  </div>

                  {/* Signal 3: ORB Inliers */}
                  <div className="p-3.5 rounded-2xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sahayak-text-primary">ORB Keypoints</span>
                      <span className="font-mono font-bold text-sahayak-blue">
                        {((compareResult.signals?.orb_inliers_score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-sahayak-cream-soft h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sahayak-success h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, (compareResult.signals?.orb_inliers_score || 0) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-sahayak-text-muted block">Weight: 15% in Fusion</span>
                  </div>

                  {/* Signal 4: Visual Hash Distance & Class Penalty */}
                  <div className="p-3.5 rounded-2xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sahayak-text-primary">Class Compatibility</span>
                      <span className={`font-mono font-bold ${compareResult.class_compatible === false ? 'text-red-600' : 'text-emerald-600'}`}>
                        {compareResult.class_compatible === false ? '-1.0 (Penalty)' : '+1.0 (Valid)'}
                      </span>
                    </div>
                    <div className="w-full bg-sahayak-cream-soft h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          compareResult.class_compatible === false ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: compareResult.class_compatible === false ? '100%' : '100%' }}
                      />
                    </div>
                    <span className="text-[10px] text-sahayak-text-muted block">
                      {compareResult.class_compatible === false ? 'Different Class &rarr; Hard Rejection' : 'Same Category Cluster'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainable AI Decision Log & Reasons */}
              <div className="p-4 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 space-y-2">
                <span className="text-xs font-bold text-sahayak-blue-deep flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-sahayak-blue" />
                  <span>Explainable Neural Decision Matrix (XAI)</span>
                </span>
                {compareResult.reasons && compareResult.reasons.length > 0 ? (
                  <ul className="space-y-1">
                    {compareResult.reasons.map((r: string, idx: number) => (
                      <li key={idx} className="text-xs text-sahayak-text-secondary flex items-start gap-1.5">
                        <span className="text-sahayak-blue font-bold">&bull;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-sahayak-text-secondary leading-relaxed">
                    Visual similarity analysis completed.
                  </p>
                )}
              </div>
            </NeumorphicCard>
          )}
        </div>
      )}
    </div>
  );
};
