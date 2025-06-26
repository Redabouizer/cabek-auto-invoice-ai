
import { useState } from 'react';
import { FileText, Download, Printer, Calendar, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface InvoiceGeneratorProps {
  analysisResults: {
    damages: any[];
    totalCost: number;
    vehicleInfo: {
      images: number;
      analysisDate: string;
      confidence: number;
    };
  };
}

const InvoiceGenerator = ({ analysisResults }: InvoiceGeneratorProps) => {
  const [invoiceNumber] = useState(`CABEK-${Date.now().toString().slice(-6)}`);
  const { damages, totalCost, vehicleInfo } = analysisResults;
  
  const taxRate = 0.20; // 20% TVA
  const taxAmount = totalCost * taxRate;
  const totalWithTax = totalCost + taxAmount;

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    const invoiceData = {
      invoiceNumber,
      date: new Date().toLocaleDateString('fr-FR'),
      damages,
      subtotal: totalCost,
      tax: taxAmount,
      total: totalWithTax
    };
    
    console.log('Téléchargement de la facture:', invoiceData);
    alert('Fonctionnalité de téléchargement PDF à implémenter');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <Card className="print:shadow-none">
        <CardHeader className="bg-blue-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <FileText className="h-8 w-8" />
                <span>Devis d'Évaluation</span>
              </CardTitle>
              <p className="text-blue-100 mt-2">Analyse IA des dommages automobiles</p>
            </div>
            <div className="text-right">
              <p className="text-sm">N° {invoiceNumber}</p>
              <p className="text-sm">Date: {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Company Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Établi par:</h3>
              <div className="text-gray-600">
                <p className="font-medium">Cabek</p>
                <p>Service d'évaluation IA</p>
                <p>123 Rue de l'Innovation</p>
                <p>75000 Paris, France</p>
                <p>Tel: +33 1 23 45 67 89</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Informations du Véhicule:</h3>
              <div className="text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4" />
                  <span>Photos analysées: {vehicleInfo.images}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date d'analyse: {vehicleInfo.analysisDate}</span>
                </div>
                <p>Confiance IA: {vehicleInfo.confidence}%</p>
              </div>
            </div>
          </div>

          {/* Damages Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Détail des Dommages Détectés</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">Description</th>
                    <th className="border border-gray-300 p-3 text-left">Localisation</th>
                    <th className="border border-gray-300 p-3 text-center">Sévérité</th>
                    <th className="border border-gray-300 p-3 text-center">Confiance</th>
                    <th className="border border-gray-300 p-3 text-right">Montant (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {damages.map((damage, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">
                        <div>
                          <p className="font-medium">{damage.type}</p>
                          <p className="text-sm text-gray-600">{damage.description}</p>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3">{damage.location}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          damage.severity === 'Léger' ? 'bg-green-100 text-green-800' :
                          damage.severity === 'Modéré' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {damage.severity}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">{damage.confidence}%</td>
                      <td className="border border-gray-300 p-3 text-right font-medium">
                        {damage.estimatedCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total HT:</span>
                  <span>{totalCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%):</span>
                  <span>{taxAmount.toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total TTC:</span>
                  <span>{totalWithTax.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note importante:</strong> Cette estimation est basée sur une analyse par intelligence artificielle des photos fournies. 
              Un diagnostic complémentaire par un expert peut être nécessaire pour confirmer les réparations et les coûts.
            </p>
            <p>Devis valable 30 jours à compter de la date d'émission.</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2">
          <Printer className="h-4 w-4" />
          <span>Imprimer</span>
        </Button>
        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Télécharger PDF</span>
        </Button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
