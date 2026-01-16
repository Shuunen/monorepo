// oxlint-disable id-length, no-magic-numbers, max-lines-per-function
import { useState } from "react";
import { getNbFiles } from "../utils/comparison.utils";
import { handleMultipleFilesUpload, handleSingleFileUpload, type ImageData, type ImageMetadata, isDragLeavingContainer } from "../utils/image.utils";

type UseDragDropReturn = {
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleLeftImageUpload: (e: { target: { files?: FileList | null } }) => void;
  handleRightImageUpload: (e: { target: { files?: FileList | null } }) => void;
  isDraggingLeft: boolean;
  isDraggingOver: boolean;
  nbDraggedFiles: number;
};

type UseDragDropCallbacks = {
  onContestStart: (images: ImageData[]) => void;
  onLeftImageUpdate: (image: string) => void;
  onLeftMetadataUpdate: (metadata: ImageMetadata) => void;
  onRightImageUpdate: (image: string) => void;
  onRightMetadataUpdate: (metadata: ImageMetadata) => void;
};

export function useDragDrop(callbacks: UseDragDropCallbacks): UseDragDropReturn {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [nbDraggedFiles, setNbDraggedFiles] = useState(0);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
    setNbDraggedFiles(getNbFiles(e.nativeEvent));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLeft(e.clientX < window.innerWidth / 2);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragLeavingContainer(e)) setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files.length === 1) {
      const file = files[0];
      if (isDraggingLeft)
        handleSingleFileUpload(file, {
          imageSide: "left",
          onImageUpdate: callbacks.onLeftImageUpdate,
          onMetadataUpdate: callbacks.onLeftMetadataUpdate,
        });
      else
        handleSingleFileUpload(file, {
          imageSide: "right",
          onImageUpdate: callbacks.onRightImageUpdate,
          onMetadataUpdate: callbacks.onRightMetadataUpdate,
        });
      return;
    }
    handleMultipleFilesUpload(files, {
      onContestStart: callbacks.onContestStart,
      onLeftImageUpdate: callbacks.onLeftImageUpdate,
      onLeftMetadataUpdate: callbacks.onLeftMetadataUpdate,
      onRightImageUpdate: callbacks.onRightImageUpdate,
      onRightMetadataUpdate: callbacks.onRightMetadataUpdate,
    });
  };

  const handleLeftImageUpload = (e: { target: { files?: FileList | null } }): void => {
    handleSingleFileUpload(e.target.files?.[0], {
      imageSide: "left",
      onImageUpdate: callbacks.onLeftImageUpdate,
      onMetadataUpdate: callbacks.onLeftMetadataUpdate,
    });
  };

  const handleRightImageUpload = (e: { target: { files?: FileList | null } }): void => {
    handleSingleFileUpload(e.target.files?.[0], {
      imageSide: "right",
      onImageUpdate: callbacks.onRightImageUpdate,
      onMetadataUpdate: callbacks.onRightMetadataUpdate,
    });
  };

  return {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleLeftImageUpload,
    handleRightImageUpload,
    isDraggingLeft,
    isDraggingOver,
    nbDraggedFiles,
  };
}
