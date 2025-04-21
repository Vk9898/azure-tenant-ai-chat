import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { FC, useRef } from "react";
import { Button } from "../../button";
import { InputImageStore, useInputImage } from "./input-image-store";

export const ImageInput: FC = () => {
  const { base64Image, previewImage } = useInputImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const resetFileInput = () => {
    InputImageStore.Reset();
  };

  return (
    <div className="flex gap-2" data-slot="image-input">
      {previewImage && (
        <div className="relative overflow-hidden rounded-xs w-[35px] h-[35px] border-2 border-border" data-slot="preview-image-container">
          <Image 
            src={previewImage} 
            alt="Preview" 
            fill={true}
            data-slot="preview-image" 
          />
          <button
            className="absolute right-1 top-1 bg-background/20 rounded-xs p-[2px] min-w-[16px] min-h-[16px] flex items-center justify-center"
            onClick={resetFileInput}
            aria-label="Remove image from chat input"
            data-slot="remove-image-button"
          >
            <X size={12} className="stroke-background" />
          </button>
        </div>
      )}
      <input
        type="hidden"
        name="image-base64"
        value={base64Image}
        onChange={(e) => InputImageStore.UpdateBase64Image(e.target.value)}
        data-slot="image-base64-input"
      />
      <input
        type="file"
        accept="image/*"
        name="image"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => InputImageStore.OnFileChange(e)}
        data-slot="image-file-input"
      />
      <Button
        size="icon"
        variant="ghost"
        type="button"
        onClick={handleButtonClick}
        aria-label="Add an image to the chat input"
        className="rounded-xs min-h-10 min-w-10"
        data-slot="image-upload-button"
      >
        <ImageIcon size={20} />
      </Button>
    </div>
  );
};
