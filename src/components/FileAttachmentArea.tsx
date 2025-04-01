import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileAttachmentAreaProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onRemoveAllFiles: () => void;
  isLoading: boolean;
}

const FileAttachmentArea: React.FC<FileAttachmentAreaProps> = ({
  files,
  onRemoveFile,
  onRemoveAllFiles,
  isLoading,
}) => {
  if (files.length === 0) return null;

  return (
    <>
      <div className="mb-2 flex flex-col gap-2 max-h-28 overflow-y-auto px-1 py-1 border rounded-md">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-muted/50 rounded p-2">
            <span className="text-sm text-muted-foreground truncate max-w-[85%]">
              {file.type.startsWith('image/') && (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name} 
                  className="h-6 w-6 mr-2 inline-block object-cover rounded" 
                  onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              )}
              {file.name} ({(file.size / 1024).toFixed(1)}KB)
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemoveFile(index)} 
              className="h-6 w-6 p-0 flex-shrink-0"
              aria-label={`Remove ${file.name}`}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {files.length > 1 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRemoveAllFiles} 
          className="mb-2 text-xs h-auto py-1"
          disabled={isLoading}
        >
          Eliminar todos ({files.length})
        </Button>
      )}
    </>
  );
};

export default FileAttachmentArea;