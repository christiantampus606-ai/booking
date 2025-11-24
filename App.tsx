import React, { useState } from 'react';
import { Platform, AdFormat, CopywritingFramework, CampaignData, GeneratedResponse, UrlAnalysisResponse } from './types';
import { generateAdCreatives, analyzeProductUrl } from './services/geminiService';
import StepIndicator from './components/StepIndicator';
import ResultCard from './components/ResultCard';

const INITIAL_DATA: CampaignData = {
  goal: '',
  audience: '',
  keyBenefits: '',
  productUrl: '',
  platform: Platform.Facebook,
  format: AdFormat.Image,
  aspectRatio: '1:1',
  tone: 'Professional',
  framework: CopywritingFramework.AI_RECOMMENDED,
  inspirationImage: null,
  inspirationImageBase64: undefined
};

const PREDEFINED_TONES = [
  'Professional',
  'Conversational',
  'Playful',
  'Urgent',
  'Inspirational',
  'Humorous',
  'Empathetic',
  'Authoritative',
  'Luxurious',
  'Minimalist'
];

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CampaignData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<UrlAnalysisResponse | null>(null);
  const [result, setResult] = useState<GeneratedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine visible steps based on whether we have a URL analysis phase
  // We'll manage internal 'step' state numbers:
  // 1: Strategy
  // 2: Insights Review (Optional)
  // 3: Creative Details
  // 4: Results
  
  const getSteps = () => {
    if (analysisResult) {
      return ['Strategy', 'Review Insights', 'Creative Details'];
    }
    return ['Strategy', 'Creative Details'];
  };

  // Map internal step number to display step number
  const getCurrentDisplayStep = () => {
    if (step === 1) return 1;
    if (step === 2) return analysisResult ? 2 : 2; // Technically if skipped, we are at step 2
    if (step === 3) return analysisResult ? 3 : 2; 
    return 4; // Results
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          inspirationImage: file,
          inspirationImageBase64: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setData(prev => ({
          ...prev,
          inspirationImage: null,
          inspirationImageBase64: undefined
      }));
  };

  const handleInitialNext = async () => {
    if (!data.goal) return; // Basic validation

    if (data.productUrl && !analysisResult) {
      // Trigger analysis
      setAnalyzingUrl(true);
      setError(null);
      try {
        const analysis = await analyzeProductUrl(data.productUrl);
        setAnalysisResult(analysis);
        
        // Auto-populate fields if they are empty or user wants to use insights
        setData(prev => ({
            ...prev,
            keyBenefits: analysis.keyBenefits.join('\n'), // Pre-fill benefits
            audience: prev.audience || analysis.audience,
            tone: prev.tone === 'Professional' ? analysis.tone : prev.tone // Only override default
        }));

        setStep(2); // Go to Insights Review
      } catch (err) {
        console.error(err);
        setError("Could not analyze URL. Continuing without analysis.");
        setStep(3); // Skip to creative details if fail
      } finally {
        setAnalyzingUrl(false);
      }
    } else {
      // No URL, skip to Creative Details (Step 3 in logic)
      setStep(3);
    }
  };

  const confirmInsights = () => {
    setStep(3);
  };

  const backToStrategy = () => {
    setStep(1);
    setAnalysisResult(null); // Reset analysis if going back to start
  };

  const backToInsights = () => {
     if (analysisResult) {
         setStep(2);
     } else {
         setStep(1);
     }
  };

  const handleSubmit = async () => {
    setStep(4); // Move to results
    setLoading(true);
    setError(null);
    try {
      const response = await generateAdCreatives(data);
      setResult(response);
    } catch (err) {
      setError("Failed to generate creative. Please check your API Key or try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setAnalysisResult(null);
    setData(INITIAL_DATA);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">AdGenius AI</span>
          </div>
          {step > 1 && (
            <button onClick={reset} className="text-sm text-slate-400 hover:text-white transition-colors">
              New Campaign
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Step Indicator (only show during setup) */}
        {step <= 3 && <StepIndicator currentStep={step === 3 && !analysisResult ? 2 : step} steps={getSteps()} />}

        <div className="max-w-3xl mx-auto">
          
          {/* Step 1: Core Strategy */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Define Strategy</h2>
                <p className="text-slate-400">Start by telling us what you want to promote.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Campaign Goal</label>
                  <input
                    type="text"
                    name="goal"
                    value={data.goal}
                    onChange={handleInputChange}
                    placeholder="e.g., Drive sales for our new organic coffee line"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Product URL (Optional)</label>
                    <input
                      type="text"
                      name="productUrl"
                      value={data.productUrl}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com/product"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter a URL to auto-generate benefits & audience.</p>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                     <input
                        type="text"
                        name="audience"
                        value={data.audience}
                        onChange={handleInputChange}
                        placeholder="e.g., Remote workers, 25-40"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                  </div>
                </div>
                
                {!data.productUrl && (
                    <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Key Benefits</label>
                    <textarea
                        name="keyBenefits"
                        value={data.keyBenefits}
                        onChange={handleInputChange}
                        placeholder="What is the main value? (e.g., Saves 2 hours a day, Eco-friendly materials). Focus on benefits over features."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all h-24 resize-none"
                    />
                    </div>
                )}
              </div>

              <button
                onClick={handleInitialNext}
                disabled={!data.goal || analyzingUrl}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg shadow-lg shadow-brand-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {analyzingUrl ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing URL...
                    </>
                ) : data.productUrl ? (
                    "Analyze URL & Continue"
                ) : (
                    "Next: Creative Details"
                )}
              </button>
            </div>
          )}

          {/* Step 2: URL Analysis Confirmation (Only if URL was provided) */}
          {step === 2 && analysisResult && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Insights Detected</h2>
                    <p className="text-slate-400">We analyzed {data.productUrl}. Review and refine the insights below.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Summary</h3>
                    <p className="text-slate-400 italic mb-4">{analysisResult.summary}</p>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-400 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Detected Benefits (Editable)
                            </label>
                            <textarea
                                name="keyBenefits"
                                value={data.keyBenefits}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 h-32"
                            />
                            <p className="text-xs text-slate-500 mt-2">We extracted these benefits. Feel free to tweak them.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Refined Audience</label>
                                <input
                                    type="text"
                                    name="audience"
                                    value={data.audience}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Detected Tone</label>
                                <input
                                    type="text"
                                    name="tone"
                                    value={data.tone}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-slate-300 mb-1">Visual Style Note</label>
                             <p className="text-sm text-slate-400">{analysisResult.visualStyle}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                     <button
                        onClick={backToStrategy}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-4 rounded-lg transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={confirmInsights}
                        className="flex-[2] bg-brand-600 hover:bg-brand-500 text-white font-semibold py-4 rounded-lg shadow-lg shadow-brand-900/20 transition-all"
                    >
                        Confirm & Continue
                    </button>
                </div>
              </div>
          )}

          {/* Step 3: Creative Details */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Creative Details</h2>
                <p className="text-slate-400">Fine-tune the format and style of your ads.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Platform</label>
                  <select
                    name="platform"
                    value={data.platform}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.values(Platform).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ad Format</label>
                  <select
                    name="format"
                    value={data.format}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.values(AdFormat).map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Copywriting Framework</label>
                  <select
                    name="framework"
                    value={data.framework}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.values(CopywritingFramework).map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Select a structure or let AI decide.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio / Size</label>
                  <input
                    type="text"
                    name="aspectRatio"
                    value={data.aspectRatio}
                    onChange={handleInputChange}
                    placeholder="e.g., 1080x1080, 9:16"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-300 mb-2">Desired Tone</label>
                   <div className="flex flex-wrap gap-2 mb-3">
                      {PREDEFINED_TONES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setData(prev => ({ ...prev, tone: t }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            data.tone === t
                              ? 'bg-brand-600 border-brand-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                    <input
                    type="text"
                    name="tone"
                    value={data.tone}
                    onChange={handleInputChange}
                    placeholder="Select a tone above or type your own (e.g., Witty, Sarcastic)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Inspiration Image Section */}
                <div className="md:col-span-2 mt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Visual Inspiration (Optional)</label>
                    <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-6 hover:border-brand-500 transition-colors group cursor-pointer relative">
                         <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         />
                         {data.inspirationImageBase64 ? (
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                    <img 
                                        src={data.inspirationImageBase64} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-white font-medium text-sm">Image Uploaded</p>
                                    <p className="text-slate-500 text-xs">Click to change</p>
                                </div>
                                <button 
                                    onClick={removeImage}
                                    className="relative z-20 px-3 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center justify-center py-2">
                                <svg className="w-8 h-8 text-slate-500 group-hover:text-brand-400 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-slate-400 text-sm text-center">Click to upload an inspiration image</p>
                            </div>
                         )}
                    </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                 <button
                  onClick={backToInsights}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-4 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-[2] bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold py-4 rounded-lg shadow-lg shadow-brand-900/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Generate Magic
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Loading & Results */}
        {step === 4 && (
            <div className="w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Crafting your Campaign</h3>
                        <p className="text-slate-400 text-center max-w-md animate-pulse">
                            Analyzing audience data...<br/>
                            Selecting perfect copywriting framework...<br/>
                            Generating 5 punchy hooks per concept...
                        </p>
                    </div>
                ) : error ? (
                    <div className="text-center p-12 bg-red-900/20 border border-red-800 rounded-xl">
                        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
                        <p className="text-red-200 mb-6">{error}</p>
                        <button onClick={reset} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white">Your Campaign Assets</h2>
                                <p className="text-slate-400">Generated for {data.platform} • {data.format}</p>
                            </div>
                            <button onClick={reset} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-all">
                                Start Over
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {result?.variations.map((variation, idx) => (
                                <ResultCard 
                                    key={idx} 
                                    variation={variation} 
                                    index={idx}
                                    format={data.format}
                                />
                            ))}
                        </div>

                        <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                            <h4 className="text-lg font-semibold text-slate-300 mb-2">Not quite right?</h4>
                            <p className="text-slate-500 mb-4">Tweaking your input tone or adding an inspiration image can drastically change the results.</p>
                            <button onClick={() => setStep(3)} className="text-brand-400 hover:text-brand-300 font-medium">
                                Edit Campaign Details &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;