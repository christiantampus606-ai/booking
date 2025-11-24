import React, { useState } from 'react';
import { AdVariation, AdFormat } from '../types';

interface ResultCardProps {
  variation: AdVariation;
  index: number;
  format: AdFormat;
}

const ResultCard: React.FC<ResultCardProps> = ({ variation, index, format }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedCtaIndex, setCopiedCtaIndex] = useState<number | null>(null);

  const handleCopyFull = () => {
    const textToCopy = `HEADLINES:\n${variation.headlines.join('\n')}\n\nCOPY:\n${variation.bodyCopy}\n\nCTAS:\n${variation.ctas.join('\n')}\n\nVISUAL:\n${variation.visualDescription}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleCopyHeadline = (headline: string, idx: number) => {
    navigator.clipboard.writeText(headline);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyCta = (cta: string, idx: number) => {
    navigator.clipboard.writeText(cta);
    setCopiedCtaIndex(idx);
    setTimeout(() => setCopiedCtaIndex(null), 2000);
  };

  const isVideo = format === AdFormat.Video || format === AdFormat.Story;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col h-full hover:border-brand-500 transition-colors duration-300">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex flex-col">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-1">
            <span className="bg-brand-600 text-xs px-2 py-1 rounded text-white">Option {index + 1}</span>
            </h3>
            <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-300">{variation.toneUsed} Tone</span>
                <span className="text-slate-600">•</span>
                <span className="text-brand-300 font-medium">{variation.frameworkUsed}</span>
            </div>
        </div>
        
        <button
          onClick={handleCopyFull}
          className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          {copiedFull ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy All
            </>
          )}
        </button>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-6">
        {/* Headlines / Hooks */}
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">5 Headlines / Hooks</p>
          <div className="space-y-2">
            {variation.headlines.map((headline, idx) => (
              <div 
                key={idx}
                onClick={() => handleCopyHeadline(headline, idx)}
                className="group relative bg-slate-700/30 hover:bg-slate-700 rounded p-2 cursor-pointer transition-colors border border-transparent hover:border-slate-600"
              >
                 <p className="text-sm font-bold text-white leading-tight pr-6">{headline}</p>
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIndex === idx ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body Copy */}
        <div className="flex-grow">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Primary Text</p>
          <p className="text-slate-300 whitespace-pre-line">{variation.bodyCopy}</p>
        </div>

        {/* CTAs */}
        <div>
           <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Call To Action Options</p>
           <div className="flex flex-wrap gap-2">
             {variation.ctas.map((cta, i) => (
               <button
                 key={i}
                 onClick={() => handleCopyCta(cta, i)}
                 className="relative group inline-block bg-slate-700 hover:bg-slate-600 text-brand-300 px-3 py-1 rounded text-sm font-medium border border-slate-600 transition-colors"
               >
                 {cta}
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-700">
                    {copiedCtaIndex === i ? 'Copied!' : 'Copy'}
                 </div>
               </button>
             ))}
           </div>
        </div>

        {/* Visual / Script */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50">
          <p className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-2 flex items-center gap-2">
            {isVideo ? (
              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Video Script / Storyboard</>
            ) : (
              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Visual Concept</>
            )}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">{variation.visualDescription}</p>
        </div>

        {/* Rationale */}
        <div className="border-t border-slate-700 pt-4">
           <p className="text-xs text-slate-500 italic">
             <span className="font-semibold text-slate-400">Why this works: </span>
             {variation.rationale}
           </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;