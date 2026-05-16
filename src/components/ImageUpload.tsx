import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  currentImage?: string;
  onRemove?: () => void;
  isUploading?: boolean;
}

export function ImageUpload({ onImageSelected, currentImage, onRemove, isUploading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();
  const triggerCamera = () => cameraInputRef.current?.click();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between ml-1">
        <label className="text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em]">Asset Visualization</label>
        {currentImage && !isUploading && (
          <button 
            type="button"
            onClick={onRemove}
            className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center space-x-1"
          >
            <X size={12} />
            <span>Remove</span>
          </button>
        )}
      </div>

      {currentImage ? (
        <div className="relative aspect-video rounded-[32px] overflow-hidden border border-black/5 group">
          <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
             <button 
               type="button"
               onClick={triggerFileSelect}
               className="p-4 bg-white rounded-full text-editorial-text hover:scale-110 transition-transform"
             >
               <Upload size={20} />
             </button>
             <button 
               type="button"
               onClick={triggerCamera}
               className="p-4 bg-white rounded-full text-editorial-text hover:scale-110 transition-transform"
             >
               <Camera size={20} />
             </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Synchronizing Archive...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="flex flex-col items-center justify-center space-y-3 p-8 border-2 border-dashed border-black/5 rounded-[32px] hover:border-primary/20 hover:bg-primary/5 transition-all group"
          >
            <div className="p-4 bg-white rounded-2xl shadow-sm text-editorial-text/20 group-hover:text-primary transition-colors">
              <Upload size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-editorial-text/40 group-hover:text-editorial-text">Gallery</span>
          </button>

          <button
            type="button"
            onClick={triggerCamera}
            disabled={isUploading}
            className="flex flex-col items-center justify-center space-y-3 p-8 border-2 border-dashed border-black/5 rounded-[32px] hover:border-primary/20 hover:bg-primary/5 transition-all group"
          >
            <div className="p-4 bg-white rounded-2xl shadow-sm text-editorial-text/20 group-hover:text-primary transition-colors">
              <Camera size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-editorial-text/40 group-hover:text-editorial-text">Camera</span>
          </button>
        </div>
      )}

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />
    </div>
  );
}
