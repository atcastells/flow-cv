import React, { useState } from "react";
import { QuickAction } from "@/features/ai/hooks";
import QuickActionsBar from "./QuickActionsBar";
import FileAttachmentArea from "./FileAttachmentArea";
import MessageInput from "./MessageInput";

interface InputAreaProps {
  onSendMessage: (content: string, files?: File[] | null) => void;
  isLoading: boolean;
  onQuickAction: (action: QuickAction) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, onQuickAction }) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSendMessage = () => {
    if (content.trim() || files.length > 0) {
      onSendMessage(content.trim(), files.length > 0 ? files : null);
      setContent("");
      setFiles([]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  return (
    <div className="border-t p-4 bg-background space-y-4">
      {/* Quick Actions Bar */}
      <QuickActionsBar onActionClick={onQuickAction} />
      
      {/* File Attachments */}
      <FileAttachmentArea
        files={files}
        onRemoveFile={handleRemoveFile}
        onRemoveAllFiles={handleRemoveAllFiles}
        isLoading={isLoading}
      />

      {/* Message Input */}
      <MessageInput
        content={content}
        onChange={setContent}
        onSend={handleSendMessage}
        onFileSelect={handleFileChange}
        isLoading={isLoading}
        hasFiles={files.length > 0}
      />
    </div>
  );
};

export default InputArea;
