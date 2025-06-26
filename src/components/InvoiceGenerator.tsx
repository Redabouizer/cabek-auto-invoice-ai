
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
      date: new Date().toLocaleDateString('ar-MA'),
      company: {
        name: 'كابك - Cabek',
        address: 'فضاء الباكيت، 5 زاوية شارع محمد السميحة وشارع بيير بارنت',
        floor: 'الطابق الخامس، مكتب 511، الدار البيضاء',
        phone: '+212 522-458989',
        country: 'المغرب'
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
=== فاتورة تقدير الأضرار ===
شركة كابك - Cabek
فضاء الباكيت، 5 زاوية شارع محمد السميحة وشارع بيير بارنت
الطابق الخامس، مكتب 511، الدار البيضاء، المغرب
الهاتف: +212 522-458989

رقم الفاتورة: ${pdfContent.invoiceNumber}
التاريخ: ${pdfContent.date}

معلومات السيارة:
- عدد الصور المحللة: ${pdfContent.vehicleInfo.images}
- تاريخ التحليل: ${pdfContent.vehicleInfo.analysisDate}
- مستوى الثقة: ${pdfContent.vehicleInfo.confidence}%

تفاصيل الأضرار:
${pdfContent.damages.map((damage, index) => `
${index + 1}. ${damage.type}
   الوصف: ${damage.description}
   الموقع: ${damage.location}
   الشدة: ${damage.severity}
   مستوى الثقة: ${damage.confidence}%
   التكلفة: ${damage.estimatedCost.toFixed(2)} درهم
`).join('')}

الإجمالي الفرعي: ${pdfContent.subtotal.toFixed(2)} درهم
الضريبة (20%): ${pdfContent.tax.toFixed(2)} درهم
الإجمالي شامل الضريبة: ${pdfContent.total.toFixed(2)} درهم

ملاحظة مهمة: هذا التقدير مبني على تحليل الذكاء الاصطناعي للصور المقدمة.
قد يكون هناك حاجة لفحص إضافي من قبل خبير لتأكيد الإصلاحات والتكاليف.

التقدير صالح لمدة 30 يوماً من تاريخ الإصدار.
    `;

    // Create and download the file
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `فاتورة_كابك_${invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('تم تحميل الفاتورة:', pdfContent);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Invoice Header */}
      <Card className="print:shadow-none">
        <CardHeader className="bg-blue-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-2 space-x-reverse">
                <FileText className="h-8 w-8" />
                <span>فاتورة تقدير الأضرار</span>
              </CardTitle>
              <p className="text-blue-100 mt-2">تحليل الذكاء الاصطناعي لأضرار السيارات</p>
            </div>
            <div className="text-right">
              <p className="text-sm">رقم {invoiceNumber}</p>
              <p className="text-sm">التاريخ: {new Date().toLocaleDateString('ar-MA')}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Company Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">صادر عن:</h3>
              <div className="text-gray-600">
                <p className="font-medium">كابك - Cabek</p>
                <p>خدمة التقييم بالذكاء الاصطناعي</p>
                <p>فضاء الباكيت، 5 زاوية شارع محمد السميحة</p>
                <p>وشارع بيير بارنت، الطابق الخامس</p>
                <p>مكتب 511، الدار البيضاء، المغرب</p>
                <p>الهاتف: +212 522-458989</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">معلومات السيارة:</h3>
              <div className="text-gray-600 space-y-1">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Car className="h-4 w-4" />
                  <span>الصور المحللة: {vehicleInfo.images}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ التحليل: {vehicleInfo.analysisDate}</span>
                </div>
                <p>مستوى ثقة الذكاء الاصطناعي: {vehicleInfo.confidence}%</p>
              </div>
            </div>
          </div>

          {/* Damages Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">تفاصيل الأضرار المكتشفة</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-3 text-right">الوصف</th>
                    <th className="border border-gray-300 p-3 text-right">الموقع</th>
                    <th className="border border-gray-300 p-3 text-center">الشدة</th>
                    <th className="border border-gray-300 p-3 text-center">الثقة</th>
                    <th className="border border-gray-300 p-3 text-left">المبلغ (درهم)</th>
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
                          damage.severity === 'خفيف' ? 'bg-green-100 text-green-800' :
                          damage.severity === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {damage.severity}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">{damage.confidence}%</td>
                      <td className="border border-gray-300 p-3 text-left font-medium">
                        {damage.estimatedCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-start">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>الإجمالي الفرعي:</span>
                  <span>{totalCost.toFixed(2)} درهم</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة (20%):</span>
                  <span>{taxAmount.toFixed(2)} درهم</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي شامل الضريبة:</span>
                  <span>{totalWithTax.toFixed(2)} درهم</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-sm text-gray-600">
            <p className="mb-2">
              <strong>ملاحظة مهمة:</strong> هذا التقدير مبني على تحليل الذكاء الاصطناعي للصور المقدمة. 
              قد يكون هناك حاجة لفحص إضافي من قبل خبير لتأكيد الإصلاحات والتكاليف.
            </p>
            <p>التقدير صالح لمدة 30 يوماً من تاريخ الإصدار.</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 space-x-reverse print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2 space-x-reverse">
          <Printer className="h-4 w-4" />
          <span>طباعة</span>
        </Button>
        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 space-x-reverse">
          <Download className="h-4 w-4" />
          <span>تحميل الملف</span>
        </Button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
