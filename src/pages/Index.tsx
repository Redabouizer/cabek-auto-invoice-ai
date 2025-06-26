
import { useState } from 'react';
import { Car, Camera, FileText, Upload, Brain, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PhotoUpload from '@/components/PhotoUpload';
import DamageAnalysis from '@/components/DamageAnalysis';
import InvoiceGenerator from '@/components/InvoiceGenerator';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState(null);

  const steps = [
    { 
      id: 0, 
      title: 'تحميل الصور', 
      icon: Camera,
      description: 'قم بتحميل صور أضرار السيارة'
    },
    { 
      id: 1, 
      title: 'تحليل الذكاء الاصطناعي', 
      icon: Brain,
      description: 'الذكاء الاصطناعي يحلل الأضرار المكتشفة'
    },
    { 
      id: 2, 
      title: 'إنشاء الفاتورة', 
      icon: FileText,
      description: 'إنشاء تلقائي للفاتورة'
    }
  ];

  const handleImagesUploaded = (images: File[]) => {
    setUploadedImages(images);
    if (images.length > 0) {
      setCurrentStep(1);
    }
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <img 
                src="/lovable-uploads/c39ccd54-0cd2-48f3-8b28-5e25a7db42de.png" 
                alt="Cabek Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">كابك لتقييم السيارات</h1>
                <p className="text-sm text-gray-600">نظام ذكي لتقييم أضرار السيارات</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
              <Car className="h-6 w-6" />
              <span className="font-medium">نسخة الذكاء الاصطناعي</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 space-x-reverse mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              
              return (
                <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`flex flex-col items-center space-y-2 ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                    <div className={`
                      p-3 rounded-full border-2 transition-all duration-300
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                        isActive ? 'bg-blue-500 border-blue-500 text-white' : 
                        'bg-gray-100 border-gray-300 text-gray-400'}
                    `}>
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <div className="text-center">
                      <p className={`font-medium text-sm ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 max-w-32">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${currentStep > index ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-300`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center space-x-2 space-x-reverse">
                  <Upload className="h-8 w-8 text-blue-600" />
                  <span>تحميل الصور</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  يرجى تحميل صور السيارة المتضررة من جميع الزوايا للحصول على تحليل دقيق.
                </p>
              </CardHeader>
              <CardContent>
                <PhotoUpload onImagesUploaded={handleImagesUploaded} />
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center space-x-2 space-x-reverse">
                  <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
                  <span>تحليل الذكاء الاصطناعي جاري</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  الذكاء الاصطناعي يحلل الأضرار المكتشفة في الصور.
                </p>
              </CardHeader>
              <CardContent>
                <DamageAnalysis 
                  images={uploadedImages} 
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && analysisResults && (
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center space-x-2 space-x-reverse">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <span>الفاتورة المُنشأة</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  فاتورة تقدير الإصلاحات المبنية على تحليل الذكاء الاصطناعي.
                </p>
              </CardHeader>
              <CardContent>
                <InvoiceGenerator analysisResults={analysisResults} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reset Button */}
        {currentStep > 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentStep(0);
                setUploadedImages([]);
                setAnalysisResults(null);
              }}
              className="bg-white hover:bg-gray-50"
            >
              تقييم جديد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
