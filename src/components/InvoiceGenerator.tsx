
import { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    
    // Red header background
    doc.setFillColor(175, 35, 35);
    doc.rect(0, 0, 210, 25, 'F');
    
    // Header text
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('ESTIMATION', 20, 18);
    
    // Date and estimate number on right
    doc.setFontSize(10);
    doc.text('DATE', 160, 10);
    doc.text(new Date().toLocaleDateString('fr-FR'), 160, 15);
    doc.text('N° ESTIMATION', 160, 20);
    doc.text(invoiceNumber, 160, 25);
    
    // Company info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('CABEK', 20, 40);
    doc.text('Espace Paquet, 5 Angle Rue Mohamed Smiha', 20, 46);
    doc.text('et Rue Pierre Parent, 5ème Etage', 20, 52);
    doc.text('Bureau 511, Casablanca, Maroc', 20, 58);
    doc.text('Téléphone: +212 522-458989', 20, 64);
    
    // Table header
    doc.setFillColor(175, 35, 35);
    doc.rect(20, 80, 170, 8, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPTION', 22, 86);
    doc.text('QTÉ', 110, 86);
    doc.text('PRIX UNITAIRE', 130, 86);
    doc.text('TOTAL', 165, 86);
    
    // Table content
    let yPos = 95;
    doc.setTextColor(0, 0, 0);
    
    damages.forEach((damage) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(damage.type, 22, yPos);
      doc.text('1', 112, yPos);
      doc.text(`${damage.estimatedCost.toFixed(2)}`, 132, yPos);
      doc.text(`${damage.estimatedCost.toFixed(2)}`, 167, yPos);
      yPos += 8;
    });
    
    // Totals
    yPos += 10;
    doc.text('SOUS-TOTAL', 130, yPos);
    doc.text(`${totalCost.toFixed(2)}`, 167, yPos);
    yPos += 6;
    
    doc.text('TVA (20%)', 130, yPos);
    doc.text(`${taxAmount.toFixed(2)}`, 167, yPos);
    yPos += 6;
    
    doc.text('TOTAL TTC', 130, yPos);
    doc.text(`${totalWithTax.toFixed(2)} DH`, 167, yPos);
    
    // Save the PDF
    doc.save(`Estimation_Cabek_${invoiceNumber}.pdf`);
    console.log('Estimation PDF générée et téléchargée');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Invoice */}
      <Card className="print:shadow-none max-w-4xl mx-auto">
        <CardContent className="p-0">
          {/* Red Header */}
          <div className="bg-red-700 text-white p-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">ESTIMATION</h1>
            </div>
            <div className="text-right">
              <div className="bg-gray-600 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-sm font-bold">LOGO</span>
              </div>
            </div>
          </div>
          
          {/* Header Info */}
          <div className="bg-gray-50 p-4 flex justify-between">
            <div></div>
            <div className="text-right text-sm">
              <div className="mb-2">
                <span className="font-semibold">DATE</span>
                <div>{new Date().toLocaleDateString('fr-FR')}</div>
              </div>
              <div>
                <span className="font-semibold">N° ESTIMATION</span>
                <div>{invoiceNumber}</div>
              </div>
            </div>
          </div>
          
          {/* Company Info */}
          <div className="p-6">
            <div className="text-sm text-gray-600 mb-8">
              <div className="font-semibold text-blue-600 mb-2">CABEK</div>
              <div>Espace Paquet, 5 Angle Rue Mohamed Smiha</div>
              <div>et Rue Pierre Parent, 5ème Etage</div>
              <div>Bureau 511, Casablanca, Maroc</div>
              <div>Téléphone: +212 522-458989</div>
            </div>
            
            {/* Table */}
            <div className="border border-gray-300">
              {/* Table Header */}
              <div className="bg-red-700 text-white grid grid-cols-4 gap-4 p-3 text-sm font-semibold">
                <div>DESCRIPTION</div>
                <div className="text-center">QTÉ</div>
                <div className="text-center">PRIX UNITAIRE</div>
                <div className="text-right">TOTAL</div>
              </div>
              
              {/* Table Rows */}
              {damages.map((damage, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200 text-sm">
                  <div>
                    <div className="font-medium">{damage.type}</div>
                    <div className="text-gray-600 text-xs">{damage.description}</div>
                  </div>
                  <div className="text-center">1</div>
                  <div className="text-center">{damage.estimatedCost.toFixed(2)}</div>
                  <div className="text-right">{damage.estimatedCost.toFixed(2)}</div>
                </div>
              ))}
              
              {/* Empty rows for spacing */}
              {Array.from({ length: Math.max(0, 5 - damages.length) }).map((_, index) => (
                <div key={`empty-${index}`} className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200 text-sm">
                  <div>&nbsp;</div>
                  <div>&nbsp;</div>
                  <div>&nbsp;</div>
                  <div className="text-right">0.00</div>
                </div>
              ))}
              
              {/* Totals */}
              <div className="bg-gray-50 p-3">
                <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                  <div className="col-span-3 text-right font-semibold">SOUS-TOTAL</div>
                  <div className="text-right">{totalCost.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                  <div className="col-span-3 text-right font-semibold">TVA (20%)</div>
                  <div className="text-right">{taxAmount.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm border-t pt-2">
                  <div className="col-span-3 text-right font-bold">TOTAL TTC</div>
                  <div className="text-right font-bold">{totalWithTax.toFixed(2)} DH</div>
                </div>
              </div>
            </div>
            
            {/* Footer Note */}
            <div className="mt-6 text-xs text-gray-600">
              <p>Remarques, notes ou durée de validité de l'estimation, durée du projet, estimations...</p>
            </div>
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
