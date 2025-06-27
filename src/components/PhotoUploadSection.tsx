
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadSectionProps {
  onImagesUploaded: (images: File[]) => void;
}

const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({ onImagesUploaded }) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFiles = (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length !== files.length) {
      toast({
        title: "Attention",
        description: "Seuls les fichiers image sont acceptés",
        variant: "destructive",
      });
    }

    if (imageFiles.length > 0) {
      const newImages = [...uploadedImages, ...imageFiles];
      setUploadedImages(newImages);
      onImagesUploaded(newImages);
      
      toast({
        title: "Photos ajoutées",
        description: `${imageFiles.length} photo(s) ajoutée(s) avec succès`,
      });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [uploadedImages]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  };

  const captureFromCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFiles(target.files);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Télécharger les photos des dommages
            </h3>
            <p className="text-gray-600 mb-4">
              Glissez-déposez vos photos ici ou cliquez pour sélectionner
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choisir des fichiers
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={captureFromCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                Prendre une photo
              </Button>
            </div>
            
            <input
              id="photo-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Photos téléchargées ({uploadedImages.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const img = new Image();
                        img.src = URL.createObjectURL(image);
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(`<img src="${img.src}" style="max-width:100%;max-height:100%;" />`);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Conseils pour les photos</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Prenez des photos de tous les angles du véhicule</li>
            <li>• Capturez les dommages en gros plan et en vue d'ensemble</li>
            <li>• Assurez-vous que les photos sont nettes et bien éclairées</li>
            <li>• Incluez des photos de l'intérieur si nécessaire</li>
            <li>• Maximum 10 photos recommandées</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUploadSection;
