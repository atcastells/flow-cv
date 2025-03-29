import React, { useState, useRef } from "react"; // Added useRef
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Paperclip, X } from "lucide-react";

// Correct the prop type to expect File[] or undefined/null
interface InputAreaProps {
  onSendMessage: (content: string, files?: File[] | null) => void; // Match ChatWindow's expectation
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for resetting file input

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      // Convert FileList to array and append - Consider limits later if needed
      const newFiles = Array.from(selectedFiles);
      // You might want to limit the number of files or total size here
      setFiles(prev => [...prev, ...newFiles]);
    }
     // Clear the input value after selection to allow re-selecting the same file
     if (event.target) {
        event.target.value = ''; 
     }
  };

  const handleSendMessageClick = () => {
    // Only send if there's content or files
    if (content.trim() || files.length > 0) {
      // Pass the managed File array
      onSendMessage(content.trim(), files.length > 0 ? files : null); // Pass null if empty
      
      // Clear state after sending
      setContent("");
      setFiles([]);
      
      // Reset file input visually using ref
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    // If removing the last file, maybe clear the input ref too?
    if (files.length === 1 && fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeAllFiles = () => {
    setFiles([]);
    // Reset file input visually
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t p-4 bg-background"> {/* Added bg */}
      {/* Display selected files */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-col gap-2 max-h-28 overflow-y-auto px-1 py-1 border rounded-md"> {/* Scrollable container */}
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-muted/50 rounded p-2"> {/* Use unique key */}
              <span className="text-sm text-muted-foreground truncate max-w-[85%]"> {/* Adjust max-width */}
                {file.type.startsWith('image/') && ( // Simple image preview
                    <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name} 
                        className="h-6 w-6 mr-2 inline-block object-cover rounded" 
                        onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)} // Clean up URL object
                    />
                )}
                {file.name} ({(file.size / 1024).toFixed(1)}KB)
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeFile(index)} 
                className="h-6 w-6 p-0 flex-shrink-0" // Prevent button shrinking
                aria-label={`Remove ${file.name}`}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {/* Keep remove all button outside the scrollable area if preferred */}
        </div>
      )}
       {files.length > 1 && ( // Show remove all only if more than one file exists
            <Button 
              variant="outline" 
              size="sm" 
              onClick={removeAllFiles} 
              className="mb-2 text-xs h-auto py-1" // Adjust styling
              disabled={isLoading}
            >
              Eliminar todos ({files.length})
            </Button>
        )}

      {/* Text input area */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Escribe tu mensaje o adjunta un archivo..." // Updated placeholder
          className="resize-none pr-24 pl-10" // Increased padding right for buttons, left for attach
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessageClick(); // Changed function name for clarity
            }
          }}
        />
        {/* Attach button inside Textarea container */}
         <label 
            htmlFor="file-upload" 
            className={cn(
                "absolute left-3 bottom-3 cursor-pointer p-1 rounded-full hover:bg-muted",
                isLoading ? "opacity-50 cursor-not-allowed" : ""
            )}
            aria-disabled={isLoading}
         >
            <Paperclip className={cn("h-5 w-5", files.length > 0 ? "text-primary" : "text-muted-foreground")} />
            <input
              ref={fileInputRef} // Attach ref
              id="file-upload"
              type="file"
              multiple // Keep multiple if desired, parent component will handle first image
              accept="image/*,application/pdf" // Accept images and PDFs
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
         </label>
         {/* Send button inside Textarea container */}
        <div className="absolute right-3 bottom-3 flex items-center">
          <Button 
            onClick={handleSendMessageClick} // Changed function name
            disabled={isLoading || (!content.trim() && files.length === 0)}
            size="sm" // Make button slightly smaller
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;