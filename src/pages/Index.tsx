
import { useState } from 'react';
import { Car, Camera, FileText, Upload, Brain, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PhotoUpload from '@/components/PhotoUpload';
import DamageAnalysis from '@/components/DamageAnalysis';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const { userRole } = useAuth();

  const steps = [
    { 
      id: 0, 
      title: 'Télécharger les photos', 
      icon: Camera,
      description: 'Téléchargez les photos des dommages du véhicule'
    },
    { 
      id: 1, 
      title: 'Analyse IA', 
      icon: Brain,
      description: 'L\'IA analyse les dommages détectés'
    },
    { 
      id: 2, 
      title: 'Génération de facture', 
      icon: FileText,
      description: 'Génération automatique de la facture'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome message for different user roles */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {userRole === 'admin' ? 'Tableau de bord Administrateur' : 'Nouvelle Évaluation'}
          </h2>
          <p className="text-gray-600 mt-2">
            {userRole === 'admin' 
              ? 'Bienvenue dans le système d\'administration Cabek'
              : 'Commencez une nouvelle évaluation de dommages'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
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
                <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                  <Upload className="h-8 w-8 text-blue-600" />
                  <span>Téléchargement des photos</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Veuillez télécharger les photos du véhicule endommagé sous tous les angles pour obtenir une analyse précise.
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
                <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                  <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
                  <span>Analyse IA en cours</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  L'intelligence artificielle analyse les dommages détectés dans les photos.
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
                <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <span>Facture générée</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Facture d'estimation des réparations basée sur l'analyse de l'intelligence artificielle.
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
              Nouvelle évaluation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
