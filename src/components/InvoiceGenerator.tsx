
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

  const generatePDFContent = () => {
    return {
      invoiceNumber,
      date: new Date().toLocaleDateString('fr-FR'),
      company: {
        name: 'Cabek',
        address: 'Espace Paquet, 5 Angle Rue Mohamed Smiha et Rue Pierre Parent',
        floor: '5ème Etage, Bureau 511, Casablanca',
        phone: '+212 522-458989',
        country: 'Maroc'
      },
      damages,
      subtotal: totalCost,
      tax: taxAmount,
      total: totalWithTax,
      vehicleInfo
    };
  };

  const handleDownload = () => {
    const pdfContent = generatePDFContent();
    
    // Create a comprehensive text content for download
    const textContent = `
=== FACTURE D'ESTIMATION DES DOMMAGES ===
Cabek
Espace Paquet, 5 Angle Rue Mohamed Smiha et Rue Pierre Parent
5ème Etage, Bureau 511, Casablanca, Maroc
Téléphone: +212 522-458989

Numéro de facture: ${pdfContent.invoiceNumber}
Date: ${pdfContent.date}

Informations du véhicule:
- Photos analysées: ${pdfContent.vehicleInfo.images}
- Date d'analyse: ${pdfContent.vehicleInfo.analysisDate}
- Niveau de confiance: ${pdfContent.vehicleInfo.confidence}%

Détails des dommages:
${pdfContent.damages.map((damage, index) => `
${index + 1}. ${damage.type}
   Description: ${damage.description}
   Localisation: ${damage.location}
   Gravité: ${damage.severity}
   Confiance: ${damage.confidence}%
   Coût: ${damage.estimatedCost.toFixed(2)} DH
`).join('')}

Sous-total: ${pdfContent.subtotal.toFixed(2)} DH
TVA (20%): ${pdfContent.tax.toFixed(2)} DH
Total TTC: ${pdfContent.total.toFixed(2)} DH

Note importante: Cette estimation est basée sur l'analyse IA des photos fournies.
Un examen supplémentaire par un expert peut être nécessaire pour confirmer les réparations et les coûts.

L'estimation est valable 30 jours à compter de la date d'émission.
    `;

    // Create and download the file
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture_Cabek_${invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Facture téléchargée:', pdfContent);
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
                <span>Facture d'estimation des dommages</span>
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
              <h3 className="font-semibold text-gray-900 mb-2">Émis par:</h3>
              <div className="text-gray-600">
                <p className="font-medium">Cabek</p>
                <p>Service d'évaluation par IA</p>
                <p>Espace Paquet, 5 Angle Rue Mohamed Smiha</p>
                <p>et Rue Pierre Parent, 5ème Etage</p>
                <p>Bureau 511, Casablanca, Maroc</p>
                <p>Téléphone: +212 522-458989</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Informations du véhicule:</h3>
              <div className="text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4" />
                  <span>Photos analysées: {vehicleInfo.images}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date d'analyse: {vehicleInfo.analysisDate}</span>
                </div>
                <p>Niveau de confiance IA: {vehicleInfo.confidence}%</p>
              </div>
            </div>
          </div>

          {/* Damages Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Détails des dommages détectés</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">Description</th>
                    <th className="border border-gray-300 p-3 text-left">Localisation</th>
                    <th className="border border-gray-300 p-3 text-center">Gravité</th>
                    <th className="border border-gray-300 p-3 text-center">Confiance</th>
                    <th className="border border-gray-300 p-3 text-right">Montant (DH)</th>
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
                  <span>Sous-total:</span>
                  <span>{totalCost.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%):</span>
                  <span>{taxAmount.toFixed(2)} DH</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total TTC:</span>
                  <span>{totalWithTax.toFixed(2)} DH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note importante:</strong> Cette estimation est basée sur l'analyse IA des photos fournies. 
              Un examen supplémentaire par un expert peut être nécessaire pour confirmer les réparations et les coûts.
            </p>
            <p>L'estimation est valable 30 jours à compter de la date d'émission.</p>
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
          <span>Télécharger le fichier</span>
        </Button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
