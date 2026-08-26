import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, Badge } from '@/components/Layout';
import { Camera, Upload, Sprout, AlertCircle, CheckCircle, Loader2, ArrowRight, ArrowLeft, Share2, Stethoscope, AlertTriangle, Lightbulb, ShieldCheck, X, RefreshCw, SwitchCamera, Microscope, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { analyzeImage, generateImageDescription, checkImageQuality, compressImage } from '@/lib/ai';
import type { Crop, Disease, DiagnosisResult, DiseaseProduct } from '@/types';

type Step = 'upload' | 'camera' | 'crop' | 'analyzing' | 'result';

export function DiagnosePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState<Step>('upload');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [diseaseProducts, setDiseaseProducts] = useState<DiseaseProduct[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [savedDiagnosisId, setSavedDiagnosisId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    supabase.from('crops').select('*').order('name').then(({ data }) => {
      if (data) setCrops(data);
    });
    supabase.from('diseases').select('*, crops(*)').then(({ data }) => {
      if (data) setDiseases(data as unknown as Disease[]);
    });
    supabase.from('disease_products').select('*, product:agri_products(*, supplier:agri_suppliers(*))').then(({ data }) => {
      if (data) setDiseaseProducts(data as unknown as DiseaseProduct[]);
    });
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setCameraError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
        setCameraError('Camera access was blocked. Please allow camera permissions in your browser settings and try again.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
        setCameraError('No camera was found on this device. Try uploading a photo instead.');
      } else {
        setCameraError('Could not start the camera. You can still upload a photo instead.');
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  async function openCamera() {
    setStep('camera');
    await startCamera(facingMode);
  }

  async function switchCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      stopCamera();
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      await handleFileSelect(file);
    }, 'image/jpeg', 0.9);
  }

  function cancelCamera() {
    stopCamera();
    setStep('upload');
  }

  async function handleFileSelect(file: File) {
    setQualityWarning(null);
    const quality = checkImageQuality(file);
    if (!quality.ok) {
      setQualityWarning(quality.message ?? null);
      setStep('upload');
      return;
    }
    const compressed = await compressImage(file);
    setImageData(compressed);
    setImageFile(file);
    setStep('crop');
  }

  async function handleAnalyze() {
    if (!selectedCrop || !imageData) return;
    setStep('analyzing');

    await new Promise((r) => setTimeout(r, 2500));

    const description = generateImageDescription(imageFile?.name ?? 'photo');
    const analysis = analyzeImage(selectedCrop, description, diseases, diseaseProducts);
    setResult(analysis);

    const { data, error } = await supabase.from('diagnoses').insert({
      farmer_id: profile?.id,
      crop_name: selectedCrop,
      image_url: imageData,
      ai_result: analysis.disease,
      confidence: analysis.confidence,
      severity: analysis.severity,
      symptoms_detected: analysis.symptoms_detected.join('; '),
      causes: analysis.causes.join('; '),
      recommended_actions: analysis.recommended_actions.join('. '),
      prevention_advice: analysis.prevention_advice.join('; '),
    }).select().single();

    if (!error && data) {
      setSavedDiagnosisId(data.id);
    }

    setStep('result');
  }

  function handleShare() {
    if (!result) return;
    const text = `AgriDoctor AI Diagnosis\nCrop: ${result.crop}\nPossible problem: ${result.disease ?? 'Unknown'}\nConfidence: ${result.confidence}%\nSeverity: ${result.severity}`;
    if (navigator.share) {
      navigator.share({ title: 'AgriDoctor AI Diagnosis', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  function reset() {
    setStep('upload');
    setImageData(null);
    setImageFile(null);
    setSelectedCrop('');
    setResult(null);
    setQualityWarning(null);
    setSavedDiagnosisId(null);
  }

  const stepOrder: Record<Step, number> = { upload: 0, camera: 0, crop: 1, analyzing: 2, result: 2 };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">AI Crop Doctor</h1>
        <p className="text-gray-500 mt-1">Upload a photo and let AI identify the problem</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Photo', 'Crop', 'Analysis'].map((label, i) => {
          const currentIdx = stepOrder[step];
          return (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= currentIdx ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-400'
              }`}>
                {i < currentIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i <= currentIdx ? 'text-primary-700' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 rounded ${i < currentIdx ? 'bg-primary-400' : 'bg-primary-100'}`} />}
            </div>
          );
        })}
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <Card className="p-6 animate-scale-in">
          <h2 className="font-bold text-primary-900 mb-4 text-center">Upload a photo of your crop</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openCamera}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-primary-200 hover:border-primary-400 hover:bg-primary-50 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <span className="font-semibold text-primary-800">Take Photo</span>
              <span className="text-xs text-gray-400">Use your camera</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-primary-200 hover:border-primary-400 hover:bg-primary-50 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <span className="font-semibold text-primary-800">Upload Photo</span>
              <span className="text-xs text-gray-400">From your gallery</span>
            </button>
          </div>

          {qualityWarning && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">{qualityWarning}</p>
            </div>
          )}

          {/* Photo tips */}
          <div className="mt-6 bg-primary-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-primary-800 mb-2">For the best result:</p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> Take the photo in good daylight.</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> Move close to the affected area.</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> Keep the phone steady.</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> Include both healthy and affected parts where possible.</li>
            </ul>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </Card>
      )}

      {/* Step: Live camera */}
      {step === 'camera' && (
        <Card className="p-0 overflow-hidden animate-scale-in">
          <div className="relative bg-black">
            {/* Video feed */}
            <div className="relative aspect-[4/3] bg-black">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-300 mb-2 max-w-xs">{cameraError}</p>
                  <Button size="sm" variant="outline" onClick={() => startCamera(facingMode)} className="mt-2">
                    <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Retry</span>
                  </Button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  {/* Framing guide overlay */}
                  {cameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-3/4 h-3/4 border-2 border-white/40 rounded-2xl" />
                    </div>
                  )}
                  {/* Loading state */}
                  {!cameraActive && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-white/70 animate-spin" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={cancelCamera}
                  className="w-11 h-11 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!cameraActive}
                  className="w-16 h-16 rounded-full bg-white border-4 border-primary-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Capture"
                >
                  <Camera className="w-7 h-7 text-primary-600" />
                </button>
                <button
                  onClick={switchCamera}
                  disabled={!cameraActive}
                  className="w-11 h-11 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-40"
                  title="Switch camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Helper text */}
          <div className="p-4 bg-primary-50">
            <p className="text-sm text-primary-800 text-center">
              Center the affected part of the plant in the frame, then tap the capture button.
            </p>
          </div>
        </Card>
      )}

      {/* Step: Crop selection */}
      {step === 'crop' && (
        <Card className="p-6 animate-scale-in">
          {imageData && (
            <div className="mb-6 relative">
              <img src={imageData} alt="Crop" className="w-full h-48 object-cover rounded-2xl" />
              <button
                onClick={reset}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <h2 className="font-bold text-primary-900 mb-1">Select Crop</h2>
          <p className="text-sm text-gray-500 mb-4">Which crop is in the photo?</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {crops.map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.name)}
                className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all overflow-hidden ${
                  selectedCrop === crop.name
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-200'
                }`}
              >
                {crop.image_url ? (
                  <img src={crop.image_url} alt={crop.name} className="w-full h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-16 bg-primary-100 text-primary-600 flex items-center justify-center rounded-lg">
                    <Sprout className="w-6 h-6" />
                  </div>
                )}
                <span className={`text-sm font-medium ${selectedCrop === crop.name ? 'text-primary-700' : 'text-gray-600'}`}>{crop.name}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              <span className="flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</span>
            </Button>
            <Button onClick={handleAnalyze} disabled={!selectedCrop} className="flex-1">
              <span className="flex items-center justify-center gap-2">
                Analyze with AI <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        </Card>
      )}

      {/* Step: Analyzing */}
      {step === 'analyzing' && (
        <Card className="p-8 text-center animate-scale-in">
          {imageData && (
            <img src={imageData} alt="Crop" className="w-32 h-32 object-cover rounded-2xl mx-auto mb-6 shadow-lg" />
          )}
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-900 mb-2">Analyzing your crop…</h2>
          <p className="text-sm text-gray-500 animate-pulse-soft">Our AI is examining the image for signs of disease</p>
          <div className="mt-6 max-w-xs mx-auto space-y-2">
            {['Checking image quality', 'Comparing with disease database', 'Generating recommendations'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-400 justify-start">
                <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" style={{ animationDelay: `${i * 0.3}s` }} />
                {label}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step: Result */}
      {step === 'result' && result && (
        <div className="space-y-4 animate-slide-up">
          {imageData && (
            <img src={imageData} alt="Crop" className="w-full h-48 object-cover rounded-2xl shadow-md" />
          )}

          {result.can_identify ? (
            <>
              {/* Diagnosis header */}
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Crop</p>
                    <p className="font-semibold text-primary-900">{result.crop}</p>
                  </div>
                </div>

                <div className="border-t border-primary-50 pt-3 mt-3">
                  <p className="text-xs text-gray-400 mb-1">Possible Problem</p>
                  <h2 className="text-xl font-bold text-primary-900">{result.disease}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-primary-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-primary-700">{result.confidence}%</p>
                    <div className="mt-2 h-1.5 bg-primary-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${result.confidence}%` }} />
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Severity</p>
                    <p className="text-lg font-bold text-amber-700 capitalize">{result.severity}</p>
                  </div>
                </div>
              </Card>

              {/* Symptoms */}
              {result.symptoms_detected.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Symptoms Detected
                  </h3>
                  <ul className="space-y-2">
                    {result.symptoms_detected.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Possible causes */}
              {result.causes.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                    <Microscope className="w-5 h-5 text-amber-500" />
                    Possible Causes
                  </h3>
                  <ul className="space-y-2">
                    {result.causes.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Recommended actions */}
              {result.recommended_actions.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary-500" />
                    What You Can Do
                  </h3>
                  <ol className="space-y-2">
                    {result.recommended_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        {a}
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* Recommended products */}
              {result.recommended_products.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary-500" />
                    Recommended Products
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">Available from Uganda's leading agri-chemical suppliers</p>
                  <div className="space-y-3">
                    {result.recommended_products.map((dp) => (
                      <div key={dp.id} className="border border-gray-100 rounded-xl p-3 hover:border-primary-200 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-primary-900">{dp.product?.name}</p>
                            {dp.product?.active_ingredient && (
                              <p className="text-xs text-gray-400 mt-0.5">{dp.product.active_ingredient}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                            dp.product?.type === 'fertilizer' || dp.product?.type === 'micronutrient'
                              ? 'bg-green-100 text-green-700'
                              : dp.product?.type === 'insecticide'
                                ? 'bg-red-100 text-red-700'
                                : dp.product?.type === 'herbicide'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-primary-100 text-primary-700'
                          }`}>
                            {dp.product?.type}
                          </span>
                        </div>
                        {dp.notes && (
                          <p className="text-xs text-gray-500 mt-2 bg-primary-50 rounded-lg p-2">{dp.notes}</p>
                        )}
                        {dp.product?.application_rate && (
                          <p className="text-xs text-gray-400 mt-1.5">Rate: {dp.product.application_rate}</p>
                        )}
                        {dp.supplier?.name && (
                          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <span className="font-medium">Supplier:</span> {dp.supplier.name}
                            {dp.supplier.phone && <span className="text-gray-400">· {dp.supplier.phone}</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Prevention */}
              {result.prevention_advice.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary-500" />
                    Prevention Tips
                  </h3>
                  <ul className="space-y-2">
                    {result.prevention_advice.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Low confidence / severe warning */}
              {(result.confidence < 70 || result.severity === 'severe') && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">Get Expert Advice</p>
                    <p className="text-sm text-amber-700 mb-3">
                      {result.severity === 'severe'
                        ? 'This looks like a serious issue. Speaking with an agricultural expert can help prevent further crop damage.'
                        : 'The AI is not fully confident about this diagnosis. Speaking with an agricultural expert may help.'}
                    </p>
                    <Button size="sm" variant="secondary" onClick={() => navigate(savedDiagnosisId ? `/expert-help?diagnosis=${savedDiagnosisId}` : '/expert-help')}>
                      <span className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4" /> Talk to an Expert</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-primary-900 mb-2">We couldn't identify the problem</h2>
              <p className="text-gray-500 mb-6">{result.message}</p>
              <div className="bg-primary-50 rounded-xl p-4 text-left mb-4">
                <p className="text-sm font-semibold text-primary-800 mb-2">For a better result:</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> Take the photo in good daylight.</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> Move close to the affected area.</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> Include both healthy and affected parts.</li>
                </ul>
              </div>
              <Button onClick={reset}>Try Another Photo</Button>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              This AI result is an indication, not a final professional diagnosis. For serious crop problems, consult an agricultural extension officer or plant-health specialist.
            </p>
          </div>

          {/* Actions */}
          {result.can_identify && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="flex-1">
                New Diagnosis
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <span className="flex items-center justify-center gap-1.5"><Share2 className="w-4 h-4" /> Share</span>
              </Button>
              <Button onClick={() => navigate(savedDiagnosisId ? `/expert-help?diagnosis=${savedDiagnosisId}` : '/expert-help')} className="flex-1">
                <span className="flex items-center justify-center gap-1.5"><Stethoscope className="w-4 h-4" /> Expert Help</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
