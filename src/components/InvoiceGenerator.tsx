
import { useState } from 'react';
import { FileText, Download, Printer, Calendar, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('FACTURE D\'ESTIMATION DES DOMMAGES', 20, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Numéro: ${invoiceNumber}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 42);
    
    // Company info
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('CABEK', 20, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Service d\'évaluation par IA', 20, 68);
    doc.text('Espace Paquet, 5 Angle Rue Mohamed Smiha', 20, 76);
    doc.text('et Rue Pierre Parent, 5ème Etage', 20, 84);
    doc.text('Bureau 511, Casablanca, Maroc', 20, 92);
    doc.text('Téléphone: +212 522-458989', 20, 100);
    
    // Vehicle info
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Informations du véhicule:', 120, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Photos analysées: ${vehicleInfo.images}`, 120, 70);
    doc.text(`Date d'analyse: ${vehicleInfo.analysisDate}`, 120, 78);
    doc.text(`Niveau de confiance IA: ${vehicleInfo.confidence}%`, 120, 86);
    
    // Damages section
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Détails des dommages détectés:', 20, 120);
    
    let yPos = 135;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    damages.forEach((damage, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${damage.type}`, 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Description: ${damage.description}`, 25, yPos);
      yPos += 6;
      doc.text(`Localisation: ${damage.location}`, 25, yPos);
      yPos += 6;
      doc.text(`Gravité: ${damage.severity}`, 25, yPos);
      yPos += 6;
      doc.text(`Confiance: ${damage.confidence}%`, 25, yPos);
      yPos += 6;
      doc.text(`Coût: ${damage.estimatedCost.toFixed(2)} DH`, 25, yPos);
      yPos += 12;
    });
    
    // Totals section
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos += 10;
    doc.line(120, yPos, 190, yPos); // Line separator
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Sous-total:', 120, yPos);
    doc.text(`${totalCost.toFixed(2)} DH`, 170, yPos);
    yPos += 8;
    
    doc.text('TVA (20%):', 120, yPos);
    doc.text(`${taxAmount.toFixed(2)} DH`, 170, yPos);
    yPos += 8;
    
    doc.line(120, yPos, 190, yPos); // Line separator
    yPos += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total TTC:', 120, yPos);
    doc.text(`${totalWithTax.toFixed(2)} DH`, 170, yPos);
    
    // Footer
    yPos += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Note importante: Cette estimation est basée sur l\'analyse IA des photos fournies.', 20, yPos);
    yPos += 5;
    doc.text('Un examen supplémentaire par un expert peut être nécessaire pour confirmer les réparations et les coûts.', 20, yPos);
    yPos += 8;
    doc.text('L\'estimation est valable 30 jours à compter de la date d\'émission.', 20, yPos);
    
    // Save the PDF
    doc.save(`Facture_Cabek_${invoiceNumber}.pdf`);
    console.log('Facture PDF générée et téléchargée');
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
        <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Télécharger PDF</span>
        </Button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
