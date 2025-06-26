
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
    
    // Header with gradient effect (using rectangles for layering)
    doc.setFillColor(41, 128, 185); // Blue gradient start
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFillColor(52, 152, 219); // Blue gradient end
    doc.rect(0, 0, 210, 35, 'F');
    
    // Company Logo Circle
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 20, 10, 'F');
    doc.setFillColor(41, 128, 185);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('LOGO', 18, 23);
    
    // Header Title
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('ESTIMATION AUTOMOBILE', 45, 18);
    
    // Subtitle
    doc.setFontSize(12);
    doc.text('Expertise Intelligente par IA', 45, 28);
    
    // Invoice details box
    doc.setFillColor(236, 240, 241);
    doc.rect(140, 45, 60, 30, 'F');
    doc.setDrawColor(189, 195, 199);
    doc.rect(140, 45, 60, 30, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('N° ESTIMATION', 145, 52);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(invoiceNumber, 145, 58);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('DATE', 145, 65);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date().toLocaleDateString('fr-FR'), 145, 71);
    
    // Company info section
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('CABEK AUTOMOBILE', 20, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('Espace Paquet, 5 Angle Rue Mohamed Smiha', 20, 63);
    doc.text('et Rue Pierre Parent, 5ème Etage', 20, 69);
    doc.text('Bureau 511, Casablanca, Maroc', 20, 75);
    doc.text('Téléphone: +212 522-458989', 20, 81);
    doc.text('Email: contact@cabek.ma', 20, 87);
    
    // Decorative line
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(2);
    doc.line(20, 95, 190, 95);
    
    // Table header with gradient
    doc.setFillColor(52, 152, 219);
    doc.rect(20, 105, 170, 12, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPTION DU DOMMAGE', 25, 113);
    doc.text('QTÉ', 115, 113);
    doc.text('PRIX UNITAIRE', 135, 113);
    doc.text('TOTAL', 170, 113);
    
    // Table content with alternating colors
    let yPos = 125;
    doc.setTextColor(0, 0, 0);
    
    damages.forEach((damage, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPos - 8, 170, 10, 'F');
      }
      
      doc.setFontSize(9);
      doc.text(damage.type, 25, yPos);
      doc.text('1', 118, yPos);
      doc.text(`${damage.estimatedCost.toFixed(2)} DH`, 140, yPos);
      doc.text(`${damage.estimatedCost.toFixed(2)} DH`, 165, yPos);
      yPos += 10;
    });
    
    // Add empty rows for professional look
    for (let i = damages.length; i < 8; i++) {
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPos - 8, 170, 10, 'F');
      }
      doc.text('-', 25, yPos);
      doc.text('-', 118, yPos);
      doc.text('-', 140, yPos);
      doc.text('0.00 DH', 165, yPos);
      yPos += 10;
    }
    
    // Totals section with background
    yPos += 5;
    doc.setFillColor(236, 240, 241);
    doc.rect(120, yPos - 5, 70, 25, 'F');
    doc.setDrawColor(189, 195, 199);
    doc.rect(120, yPos - 5, 70, 25, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('SOUS-TOTAL', 125, yPos);
    doc.text(`${totalCost.toFixed(2)} DH`, 165, yPos);
    yPos += 6;
    
    doc.text('TVA (20%)', 125, yPos);
    doc.text(`${taxAmount.toFixed(2)} DH`, 165, yPos);
    yPos += 6;
    
    // Total with emphasis
    doc.setFillColor(41, 128, 185);
    doc.rect(120, yPos - 3, 70, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL TTC', 125, yPos + 2);
    doc.text(`${totalWithTax.toFixed(2)} DH`, 165, yPos + 2);
    
    // Footer section
    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('Conditions générales:', 20, yPos);
    yPos += 6;
    doc.setFontSize(8);
    doc.text('• Cette estimation est valable 30 jours à compter de la date d\'émission', 20, yPos);
    yPos += 4;
    doc.text('• Les prix sont exprimés en dirhams marocains (DH) toutes taxes comprises', 20, yPos);
    yPos += 4;
    doc.text('• Cette estimation a été générée par intelligence artificielle', 20, yPos);
    
    // Professional footer
    yPos += 15;
    doc.setFillColor(52, 73, 94);
    doc.rect(0, yPos, 210, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('CABEK - Expertise Automobile Intelligente | www.cabek.ma | contact@cabek.ma', 20, yPos + 8);
    
    // Save the PDF
    doc.save(`Estimation_Cabek_${invoiceNumber}.pdf`);
    console.log('Estimation PDF professionnelle générée et téléchargée');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Professional Invoice Preview */}
      <Card className="print:shadow-none max-w-4xl mx-auto overflow-hidden">
        <CardContent className="p-0">
          {/* Blue Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/c39ccd54-0cd2-48f3-8b28-5e25a7db42de.png" 
                    alt="Cabek Logo" 
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">ESTIMATION AUTOMOBILE</h1>
                  <p className="text-blue-100 text-lg">Expertise Intelligente par IA</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-right">
                <div className="text-sm text-blue-100">N° ESTIMATION</div>
                <div className="text-xl font-bold">{invoiceNumber}</div>
                <div className="text-sm text-blue-100 mt-2">DATE</div>
                <div className="font-semibold">{new Date().toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </div>
          
          {/* Company Info Section */}
          <div className="bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-blue-600 mb-3">CABEK AUTOMOBILE</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Espace Paquet, 5 Angle Rue Mohamed Smiha</div>
                  <div>et Rue Pierre Parent, 5ème Etage</div>
                  <div>Bureau 511, Casablanca, Maroc</div>
                  <div>Téléphone: +212 522-458989</div>
                  <div>Email: contact@cabek.ma</div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500">Analyse effectuée le</div>
                  <div className="font-semibold">{vehicleInfo.analysisDate}</div>
                  <div className="text-sm text-gray-500 mt-2">Niveau de confiance</div>
                  <div className="font-semibold text-green-600">{vehicleInfo.confidence}%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Professional Table */}
          <div className="p-6">
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <div className="grid grid-cols-4 gap-4 p-4 font-semibold">
                  <div>DESCRIPTION DU DOMMAGE</div>
                  <div className="text-center">QTÉ</div>
                  <div className="text-center">PRIX UNITAIRE</div>
                  <div className="text-right">TOTAL</div>
                </div>
              </div>
              
              {/* Table Rows */}
              <div className="bg-white">
                {damages.map((damage, index) => (
                  <div key={index} className={`grid grid-cols-4 gap-4 p-4 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <div>
                      <div className="font-medium text-gray-900">{damage.type}</div>
                      <div className="text-sm text-gray-600">{damage.description}</div>
                    </div>
                    <div className="text-center">1</div>
                    <div className="text-center">{damage.estimatedCost.toFixed(2)} DH</div>
                    <div className="text-right font-medium">{damage.estimatedCost.toFixed(2)} DH</div>
                  </div>
                ))}
                
                {/* Empty rows for professional spacing */}
                {Array.from({ length: Math.max(0, 5 - damages.length) }).map((_, index) => (
                  <div key={`empty-${index}`} className={`grid grid-cols-4 gap-4 p-4 border-b border-gray-100 ${(damages.length + index) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="text-gray-400">-</div>
                    <div className="text-center text-gray-400">-</div>
                    <div className="text-center text-gray-400">-</div>
                    <div className="text-right text-gray-400">0.00 DH</div>
                  </div>
                ))}
              </div>
              
              {/* Totals Section */}
              <div className="bg-gray-50 border-t border-gray-200">
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="col-span-3 text-right font-semibold text-gray-700">SOUS-TOTAL</div>
                    <div className="text-right font-semibold">{totalCost.toFixed(2)} DH</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="col-span-3 text-right font-semibold text-gray-700">TVA (20%)</div>
                    <div className="text-right font-semibold">{taxAmount.toFixed(2)} DH</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-lg border-t pt-2">
                    <div className="col-span-3 text-right font-bold text-blue-600">TOTAL TTC</div>
                    <div className="text-right font-bold text-blue-600">{totalWithTax.toFixed(2)} DH</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional Footer */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Conditions générales:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cette estimation est valable 30 jours à compter de la date d'émission</li>
                <li>• Les prix sont exprimés en dirhams marocains (DH) toutes taxes comprises</li>
                <li>• Cette estimation a été générée par intelligence artificielle</li>
              </ul>
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
