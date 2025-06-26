
import { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DamageAnalysisProps {
  images: File[];
  onAnalysisComplete: (results: any) => void;
}

const DamageAnalysis = ({ images, onAnalysisComplete }: DamageAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [detectedDamages, setDetectedDamages] = useState<any[]>([]);

  const analysisSteps = [
    'Chargement des images...',
    'Détection des contours du véhicule...',
    'Analyse des déformations...',
    'Identification des rayures...',
    'Évaluation des impacts...',
    'Classification des dommages...',
    'Calcul des coûts estimés...',
    'Génération du rapport...'
  ];

  const mockDamages = [
    {
      type: 'Rayure profonde',
      location: 'Portière avant droite',
      severity: 'Modéré',
      confidence: 92,
      estimatedCost: 450,
      description: 'Rayure de 15cm sur la peinture, nécessite ponçage et peinture'
    },
    {
      type: 'Bosse',
      location: 'Aile arrière gauche',
      severity: 'Léger',
      confidence: 88,
      estimatedCost: 320,
      description: 'Déformation légère du métal, débosselage sans peinture'
    },
    {
      type: 'Phare endommagé',
      location: 'Avant du véhicule',
      severity: 'Important',
      confidence: 95,
      estimatedCost: 280,
      description: 'Fissure sur le phare avant droit, remplacement nécessaire'
    },
    {
      type: 'Éraflure',
      location: 'Pare-chocs avant',
      severity: 'Léger',
      confidence: 85,
      estimatedCost: 180,
      description: 'Éraflures superficielles sur le pare-chocs plastique'
    }
  ];

  useEffect(() => {
    const runAnalysis = async () => {
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStep(analysisSteps[i]);
        setProgress((i + 1) / analysisSteps.length * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      }
      
      setDetectedDamages(mockDamages);
      setAnalysisComplete(true);
      
      // Wait a bit before calling completion
      setTimeout(() => {
        onAnalysisComplete({
          damages: mockDamages,
          totalCost: mockDamages.reduce((sum, damage) => sum + damage.estimatedCost, 0),
          vehicleInfo: {
            images: images.length,
            analysisDate: new Date().toLocaleDateString('fr-FR'),
            confidence: 90
          }
        });
      }, 1000);
    };

    runAnalysis();
  }, [images, onAnalysisComplete]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'léger': return 'text-green-600 bg-green-100';
      case 'modéré': return 'text-yellow-600 bg-yellow-100';
      case 'important': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'léger': return CheckCircle;
      case 'modéré': return AlertCircle;
      case 'important': return AlertCircle;
      default: return Wrench;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-900">{currentStep}</h3>
        </div>
        
        <div className="max-w-md mx-auto">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% terminé</p>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisComplete && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <h3 className="text-xl font-semibold text-green-900">Analyse Terminée</h3>
            <p className="text-gray-600">
              {detectedDamages.length} dommage(s) détecté(s) sur {images.length} photo(s)
            </p>
          </div>

          <div className="grid gap-4">
            {detectedDamages.map((damage, index) => {
              const SeverityIcon = getSeverityIcon(damage.severity);
              
              return (
                <Card key={index} className="overflow-hidden border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <SeverityIcon className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">{damage.type}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(damage.severity)}`}>
                            {damage.severity}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Localisation:</strong> {damage.location}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {damage.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Confiance IA: {damage.confidence}%
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {damage.estimatedCost}€
                        </p>
                        <p className="text-xs text-gray-500">Estimation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-blue-900">Coût Total Estimé</h4>
                  <p className="text-sm text-blue-700">
                    Basé sur l'analyse IA de {images.length} photo(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {detectedDamages.reduce((sum, damage) => sum + damage.estimatedCost, 0)}€
                  </p>
                  <p className="text-sm text-blue-700">HT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DamageAnalysis;
