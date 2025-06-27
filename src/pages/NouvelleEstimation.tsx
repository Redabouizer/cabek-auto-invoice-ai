
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import EstimationForm from '@/components/EstimationForm';
import Header from '@/components/Header';

const NouvelleEstimation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Plus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Nouvelle Estimation</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Créez une nouvelle estimation de dommages en remplissant les informations du client, 
            du véhicule, de l'assurance et en téléchargeant les photos des dommages.
          </p>
        </div>

        <EstimationForm />
        
        {/* Information Card */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <FileText className="h-5 w-5" />
              <span>Processus d'estimation automatisé</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Analyse IA</h4>
                <p className="text-sm">Les photos sont analysées automatiquement pour détecter et évaluer les dommages</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Données véhicule</h4>
                <p className="text-sm">Les informations du véhicule sont récupérées via API externe avec la plaque d'immatriculation</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Géolocalisation</h4>
                <p className="text-sm">La position GPS est enregistrée pour valider l'emplacement de l'estimation</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Facture PDF</h4>
                <p className="text-sm">Une facture détaillée est générée automatiquement après validation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NouvelleEstimation;
