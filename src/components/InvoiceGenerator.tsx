
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
    
    // Professional header with blue gradient effect
    doc.setFillColor(28, 100, 180); // Professional blue
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFillColor(41, 128, 185); // Lighter blue for gradient effect
    doc.rect(0, 0, 210, 40, 'F');
    
    // Company Logo Circle with professional styling
    doc.setFillColor(255, 255, 255);
    doc.circle(30, 22, 12, 'F');
    doc.setFillColor(28, 100, 180);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('CABEK', 22, 25);
    
    // Professional Header Title
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text('ESTIMATION AUTOMOBILE', 50, 20);
    
    // Professional Subtitle
    doc.setFontSize(14);
    doc.text('Expertise Intelligente par IA', 50, 30);
    
    // Invoice details box with professional styling
    doc.setFillColor(245, 247, 250);
    doc.rect(135, 50, 70, 35, 'F');
    doc.setDrawColor(28, 100, 180);
    doc.setLineWidth(0.5);
    doc.rect(135, 50, 70, 35, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(28, 100, 180);
    doc.text('N° ESTIMATION', 140, 58);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(invoiceNumber, 140, 65);
    
    doc.setFontSize(10);
    doc.setTextColor(28, 100, 180);
    doc.text('DATE', 140, 72);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date().toLocaleDateString('fr-FR'), 140, 79);
    
    // Professional Company info section
    doc.setFontSize(16);
    doc.setTextColor(28, 100, 180);
    doc.text('CABEK AUTOMOBILE', 20, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('Espace Paquet, 5 Angle Rue Mohamed Smiha', 20, 68);
    doc.text('et Rue Pierre Parent, 5ème Etage', 20, 74);
    doc.text('Bureau 511, Casablanca, Maroc', 20, 80);
    doc.text('Téléphone: +212 522-458989', 20, 86);
    doc.text('Email: contact@cabek.ma', 20, 92);
    
    // Professional decorative line
    doc.setDrawColor(28, 100, 180);
    doc.setLineWidth(1.5);
    doc.line(20, 100, 190, 100);
    
    // Professional Table header
    doc.setFillColor(28, 100, 180);
    doc.rect(20, 110, 170, 15, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPTION DU DOMMAGE', 25, 120);
    doc.text('SÉVÉRITÉ', 105, 120);
    doc.text('PRIX UNITAIRE', 130, 120);
    doc.text('TOTAL (DH)', 165, 120);
    
    // Professional Table content
    let yPos = 135;
    doc.setTextColor(0, 0, 0);
    
    damages.forEach((damage, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Professional alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 251, 252);
        doc.rect(20, yPos - 10, 170, 12, 'F');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(20, yPos - 10, 170, 12, 'F');
      }
      
      // Add subtle borders
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      doc.setFontSize(10);
      // Damage type with better formatting
      doc.setTextColor(34, 34, 34);
      doc.text(damage.type, 25, yPos);
      
      // Severity indicator
      const severity = damage.severity || 'Moyen';
      if (severity === 'Élevé') {
        doc.setTextColor(220, 53, 69);
      } else if (severity === 'Faible') {
        doc.setTextColor(40, 167, 69);
      } else {
        doc.setTextColor(255, 193, 7);
      }
      doc.text(severity, 105, yPos);
      
      // Price formatting
      doc.setTextColor(34, 34, 34);
      doc.text(`${damage.estimatedCost.toFixed(2)}`, 135, yPos);
      doc.setTextColor(28, 100, 180);
      doc.text(`${damage.estimatedCost.toFixed(2)}`, 170, yPos);
      
      yPos += 12;
    });
    
    // Professional Totals section
    yPos += 10;
    doc.setFillColor(245, 247, 250);
    doc.rect(115, yPos - 5, 75, 30, 'F');
    doc.setDrawColor(28, 100, 180);
    doc.setLineWidth(0.5);
    doc.rect(115, yPos - 5, 75, 30, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    doc.text('SOUS-TOTAL', 120, yPos + 3);
    doc.setTextColor(34, 34, 34);
    doc.text(`${totalCost.toFixed(2)} DH`, 160, yPos + 3);
    yPos += 8;
    
    doc.setTextColor(52, 73, 94);
    doc.text('TVA (20%)', 120, yPos + 3);
    doc.setTextColor(34, 34, 34);
    doc.text(`${taxAmount.toFixed(2)} DH`, 160, yPos + 3);
    yPos += 8;
    
    // Professional Total with emphasis
    doc.setFillColor(28, 100, 180);
    doc.rect(115, yPos - 1, 75, 10, 'F');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL TTC', 120, yPos + 5);
    doc.text(`${totalWithTax.toFixed(2)} DH`, 160, yPos + 5);
    
    // AI Generation note only
    yPos += 25;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Cette estimation a été générée par intelligence artificielle', 20, yPos);
    
    // Professional footer
    yPos += 20;
    doc.setFillColor(28, 100, 180);
    doc.rect(0, yPos, 210, 20, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('CABEK - Expertise Automobile Intelligente | www.cabek.ma | contact@cabek.ma', 20, yPos + 12);
    
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
      <Card className="print:shadow-none max-w-4xl mx-auto overflow-hidden border-0 shadow-xl">
        <CardContent className="p-0">
          {/* Professional Blue Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                  <img 
                    src="/lovable-uploads/c39ccd54-0cd2-48f3-8b28-5e25a7db42de.png" 
                    alt="Cabek Logo" 
                    className="h-14 w-14 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-wide">ESTIMATION AUTOMOBILE</h1>
                  <p className="text-blue-100 text-xl mt-1">Expertise Intelligente par IA</p>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-right border border-white/20">
                <div className="text-sm text-blue-100 font-medium">N° ESTIMATION</div>
                <div className="text-2xl font-bold mt-1">{invoiceNumber}</div>
                <div className="text-sm text-blue-100 font-medium mt-3">DATE</div>
                <div className="text-lg font-semibold">{new Date().toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </div>
          
          {/* Professional Company Info Section */}
          <div className="bg-gradient-to-b from-gray-50 to-white p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-blue-700 mb-4">CABEK AUTOMOBILE</h3>
                <div className="text-gray-600 space-y-2 text-base">
                  <div className="font-medium">Espace Paquet, 5 Angle Rue Mohamed Smiha</div>
                  <div>et Rue Pierre Parent, 5ème Etage</div>
                  <div>Bureau 511, Casablanca, Maroc</div>
                  <div className="pt-2">
                    <div><strong>Téléphone:</strong> +212 522-458989</div>
                    <div><strong>Email:</strong> contact@cabek.ma</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 max-w-sm">
                  <div className="text-sm text-gray-500 font-medium">Analyse effectuée le</div>
                  <div className="text-lg font-bold text-gray-800">{vehicleInfo.analysisDate}</div>
                  <div className="text-sm text-gray-500 font-medium mt-3">Niveau de confiance</div>
                  <div className="text-lg font-bold text-green-600">{vehicleInfo.confidence}%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Professional Enhanced Table */}
          <div className="p-8">
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg">
              {/* Enhanced Table Header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                <div className="grid grid-cols-4 gap-6 p-6 font-bold text-lg">
                  <div>DESCRIPTION DU DOMMAGE</div>
                  <div className="text-center">SÉVÉRITÉ</div>
                  <div className="text-center">PRIX UNITAIRE</div>
                  <div className="text-right">TOTAL (DH)</div>
                </div>
              </div>
              
              {/* Enhanced Table Rows */}
              <div className="bg-white">
                {damages.map((damage, index) => (
                  <div key={index} className={`grid grid-cols-4 gap-6 p-6 border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{damage.type}</div>
                      <div className="text-gray-600 mt-1">{damage.description}</div>
                    </div>
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        damage.severity === 'Élevé' ? 'bg-red-100 text-red-700' :
                        damage.severity === 'Faible' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {damage.severity || 'Moyen'}
                      </span>
                    </div>
                    <div className="text-center font-semibold text-gray-700">{damage.estimatedCost.toFixed(2)} DH</div>
                    <div className="text-right font-bold text-blue-600 text-lg">{damage.estimatedCost.toFixed(2)} DH</div>
                  </div>
                ))}
              </div>
              
              {/* Professional Totals Section */}
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 border-t-2 border-blue-600">
                <div className="p-6 space-y-3">
                  <div className="grid grid-cols-4 gap-6 text-lg">
                    <div className="col-span-3 text-right font-bold text-gray-700">SOUS-TOTAL</div>
                    <div className="text-right font-bold text-gray-800">{totalCost.toFixed(2)} DH</div>
                  </div>
                  <div className="grid grid-cols-4 gap-6 text-lg">
                    <div className="col-span-3 text-right font-bold text-gray-700">TVA (20%)</div>
                    <div className="text-right font-bold text-gray-800">{taxAmount.toFixed(2)} DH</div>
                  </div>
                  <div className="border-t-2 border-blue-600 pt-3">
                    <div className="grid grid-cols-4 gap-6 text-2xl">
                      <div className="col-span-3 text-right font-bold text-blue-700">TOTAL TTC</div>
                      <div className="text-right font-bold text-blue-700">{totalWithTax.toFixed(2)} DH</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Generation Note */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm italic">
                Cette estimation a été générée par intelligence artificielle
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Action Buttons */}
      <div className="flex justify-center space-x-6 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2 px-6 py-3 text-lg border-2 hover:bg-gray-50">
          <Printer className="h-5 w-5" />
          <span>Imprimer</span>
        </Button>
        <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all">
          <Download className="h-5 w-5" />
          <span>Télécharger PDF</span>
        </Button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
