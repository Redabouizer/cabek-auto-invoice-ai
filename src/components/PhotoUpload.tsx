
import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PhotoUploadProps {
  onImagesUploaded: (images: File[]) => void;
}

const PhotoUpload = ({ onImagesUploaded }: PhotoUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFiles = useCallback((files: FileList) => {
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    setUploadedFiles(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 10); // Limit to 10 images
    });
  }, []);

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
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const proceedWithAnalysis = () => {
    if (uploadedFiles.length > 0) {
      onImagesUploaded(uploadedFiles);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadedFiles.length > 0 ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 ${dragActive ? 'text-blue-500' : 'text-gray-400'} transition-colors`}>
            <Upload className="w-full h-full" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              اسحب صورك هنا أو انقر للاختيار
            </p>
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG حتى 10 ميجابايت • حد أقصى 10 صور
            </p>
          </div>
          
          <Button type="button" variant="outline" className="mt-4">
            اختر الملفات
          </Button>
        </div>
      </div>

      {/* Upload Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">نصائح للحصول على أفضل النتائج:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• التقط صوراً واضحة ومضاءة جيداً</li>
          <li>• صور جميع زوايا السيارة المتضررة</li>
          <li>• اشمل لقطات مقربة للمناطق المتضررة</li>
          <li>• تجنب الصور المشوشة أو المظلمة</li>
        </ul>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>الصور المحملة ({uploadedFiles.length})</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`رفع ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-1 text-xs text-gray-600 truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={proceedWithAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <ImageIcon className="h-5 w-5 ml-2" />
              تحليل الصور ({uploadedFiles.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
