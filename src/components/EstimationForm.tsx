import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Car, 
  Shield, 
  MapPin, 
  Camera,
  Save,
  Send,
  Brain,
  FileText,
  Upload,
  Loader
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PhotoUploadSection from './PhotoUploadSection';
import LocationTracker from './LocationTracker';

const estimationSchema = z.object({
  // Client Information
  clientName: z.string().min(2, 'Le nom du client est requis'),
  clientEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  clientPhone: z.string().min(8, 'Numéro de téléphone requis'),
  clientAddress: z.string().min(5, 'Adresse requise'),
  
  // Insurance Information
  insuranceCompany: z.string().min(2, 'Compagnie d\'assurance requise'),
  insurancePolicyNumber: z.string().min(3, 'Numéro de police requis'),
  insuranceContact: z.string().optional(),
  
  // Vehicle Information
  licensePlate: z.string().min(2, 'Plaque d\'immatriculation requise'),
  make: z.string().min(2, 'Marque requise'),
  model: z.string().min(2, 'Modèle requis'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  mileage: z.number().optional(),
  vin: z.string().optional(),
  
  // Damage Information
  damageDescription: z.string().min(10, 'Description des dommages requise'),
  damageSeverity: z.enum(['léger', 'modéré', 'grave', 'total']),
});

type EstimationFormData = z.infer<typeof estimationSchema>;

const EstimationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [damageAnalysis, setDamageAnalysis] = useState<any>(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<EstimationFormData>({
    resolver: zodResolver(estimationSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      insuranceCompany: '',
      insurancePolicyNumber: '',
      insuranceContact: '',
      licensePlate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      mileage: undefined,
      vin: '',
      damageDescription: '',
      damageSeverity: 'modéré'
    }
  });

  const steps = [
    { id: 0, title: 'Informations Client', icon: User },
    { id: 1, title: 'Assurance', icon: Shield },
    { id: 2, title: 'Véhicule', icon: Car },
    { id: 3, title: 'Localisation', icon: MapPin },
    { id: 4, title: 'Télécharger Photos', icon: Upload },
    { id: 5, title: 'Analyse IA', icon: Brain },
    { id: 6, title: 'Génération Facture', icon: FileText }
  ];

  // Auto-fetch vehicle data when license plate changes
  const handleLicensePlateChange = async (plate: string) => {
    if (plate.length >= 5) {
      try {
        // Simulate API call for vehicle data
        // In real implementation, call external API here
        const mockVehicleData = {
          make: 'Peugeot',
          model: '308',
          year: 2020,
          color: 'Blanc'
        };
        
        setVehicleData(mockVehicleData);
        form.setValue('make', mockVehicleData.make);
        form.setValue('model', mockVehicleData.model);
        form.setValue('year', mockVehicleData.year);
        form.setValue('color', mockVehicleData.color);
        
        toast({
          title: "Données du véhicule récupérées",
          description: `${mockVehicleData.make} ${mockVehicleData.model} ${mockVehicleData.year}`,
        });
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    }
  };

  const handleSubmit = async (data: EstimationFormData, isDraft = false) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une estimation",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Erreur",
        description: "La localisation est requise pour l'estimation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          full_name: data.clientName,
          email: data.clientEmail || null,
          phone: data.clientPhone,
          address: data.clientAddress,
          insurance_company: data.insuranceCompany,
          insurance_policy_number: data.insurancePolicyNumber,
          insurance_contact: data.insuranceContact || null,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create vehicle
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .insert({
          client_id: clientData.id,
          make: data.make,
          model: data.model,
          year: data.year,
          license_plate: data.licensePlate,
          color: data.color || null,
          mileage: data.mileage || null,
          vin: data.vin || null,
          api_fetched_data: vehicleData,
          fetch_date: vehicleData ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (carError) throw carError;

      // Create evaluation
      const { data: evaluationData, error: evaluationError } = await supabase
        .from('evaluations')
        .insert({
          client_id: clientData.id,
          car_id: carData.id,
          evaluator_id: user.id,
          damage_description: data.damageDescription,
          damage_severity: data.damageSeverity,
          location_latitude: location.lat,
          location_longitude: location.lng,
          location_address: location.address,
          submission_status: isDraft ? 'draft' : 'submitted',
          status: 'en_cours',
        })
        .select()
        .single();

      if (evaluationError) throw evaluationError;

      toast({
        title: isDraft ? "Brouillon sauvegardé" : "Estimation soumise",
        description: isDraft 
          ? "L'estimation a été sauvegardée en brouillon"
          : "L'estimation a été soumise avec succès",
      });

      // Reset form
      form.reset();
      setCurrentStep(0);
      setUploadedImages([]);
      setLocation(null);
      setVehicleData(null);

    } catch (error) {
      console.error('Error creating estimation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'estimation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: (keyof EstimationFormData)[] = [];
    
    switch (currentStep) {
      case 0: // Client Information
        fieldsToValidate = ['clientName', 'clientPhone', 'clientAddress'];
        break;
      case 1: // Insurance Information
        fieldsToValidate = ['insuranceCompany', 'insurancePolicyNumber'];
        break;
      case 2: // Vehicle Information
        fieldsToValidate = ['licensePlate', 'make', 'model', 'year'];
        break;
      case 5: // Analysis step
        fieldsToValidate = ['damageDescription', 'damageSeverity'];
        break;
    }
    
    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) {
        toast({
          title: "Champs requis manquants",
          description: "Veuillez remplir tous les champs marqués d'un astérisque (*)",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
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
                  <Icon className="h-5 w-5" />
                </div>
                <p className={`font-medium text-sm text-center ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > index ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-300`} />
              )}
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => handleSubmit(data, false))}>
          {/* Step 0: Client Information */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <span>Informations du Client</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ahmed Benali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ahmed.benali@email.ma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+212 6 12 34 56 78" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Avenue Hassan II, Casablanca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 1: Insurance Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span>Informations d'Assurance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compagnie d'assurance *</FormLabel>
                      <FormControl>
                        <Input placeholder="Wafa Assurance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insurancePolicyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de police *</FormLabel>
                      <FormControl>
                        <Input placeholder="WA123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceContact"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Contact assurance</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'agent ou numéro de contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Vehicle Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-6 w-6 text-blue-600" />
                  <span>Informations du Véhicule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plaque d'immatriculation *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345-ب-123" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleLicensePlateChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {vehicleData && (
                  <div className="md:col-span-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">Données récupérées automatiquement</p>
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dacia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle *</FormLabel>
                      <FormControl>
                        <Input placeholder="Logan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2020" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur</FormLabel>
                      <FormControl>
                        <Input placeholder="Rouge" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilométrage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Numéro de châssis (VIN)</FormLabel>
                      <FormControl>
                        <Input placeholder="WVWZZZ1KZ3W123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <span>Localisation du sinistre</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationTracker />
                {location && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">Localisation capturée:</p>
                    <p className="text-sm text-green-700">{location.address}</p>
                    <p className="text-xs text-green-600">
                      Coordonnées: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Photo Upload */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-blue-600" />
                  <span>Photos des dommages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoUploadSection />
              </CardContent>
            </Card>
          )}

          {/* Step 5: AI Analysis */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <span>Analyse IA des dommages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="damageDescription"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description des dommages *</FormLabel>
                        <FormControl>
                          <textarea 
                            className="w-full p-3 border border-gray-300 rounded-md"
                            rows={4}
                            placeholder="Décrivez en détail les dommages observés sur le véhicule..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="damageSeverity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gravité des dommages *</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full p-3 border border-gray-300 rounded-md"
                            {...field}
                          >
                            <option value="léger">Léger</option>
                            <option value="modéré">Modéré</option>
                            <option value="grave">Grave</option>
                            <option value="total">Total</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!uploadedImages.length) {
                        toast({
                          title: "Photos requises",
                          description: "Veuillez télécharger au moins une photo pour l'analyse",
                          variant: "destructive",
                        });
                        return;
                      }

                      setIsAnalyzing(true);
                      
                      // Simulate AI analysis
                      setTimeout(() => {
                        const mockAnalysis = {
                          damages: [
                            {
                              type: "Portière avant droite",
                              location: "AR-G",
                              severity: "modéré",
                              cost: 4500,
                              description: "Rayures et bosses importantes"
                            },
                            {
                              type: "Phare avant",
                              location: "AV-D",
                              severity: "grave",
                              cost: 2800,
                              description: "Phare cassé nécessitant remplacement"
                            },
                            {
                              type: "Pare-chocs avant",
                              location: "AV-C",
                              severity: "léger",
                              cost: 1200,
                              description: "Éraflures superficielles"
                            }
                          ],
                          totalCost: 8500,
                          recommendations: "Réparation recommandée dans les 30 jours"
                        };
                        
                        setDamageAnalysis(mockAnalysis);
                        setIsAnalyzing(false);
                        setAnalysisComplete(true);
                        
                        toast({
                          title: "Analyse terminée",
                          description: "L'IA a analysé les dommages avec succès",
                        });
                      }, 3000);
                    }}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      "Lancer l'analyse IA"
                    )}
                  </Button>

                  {damageAnalysis && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-3">Résultats de l'analyse IA</h3>
                      <div className="space-y-3">
                        {damageAnalysis.damages.map((damage: any, index: number) => (
                          <div key={index} className="p-3 bg-white border border-blue-100 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{damage.type}</p>
                                <p className="text-sm text-gray-600">Position: {damage.location}</p>
                                <p className="text-sm">{damage.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600">{damage.cost} DH</p>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  damage.severity === 'grave' ? 'bg-red-100 text-red-800' :
                                  damage.severity === 'modéré' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {damage.severity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-blue-200">
                          <p className="text-lg font-bold text-blue-800">
                            Coût total estimé: {damageAnalysis.totalCost} DH
                          </p>
                          <p className="text-sm text-blue-600 mt-1">{damageAnalysis.recommendations}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Invoice Generation */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <span>Génération du devis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisComplete && damageAnalysis ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-bold text-green-800 mb-2">Devis prêt à générer</h3>
                      <p className="text-green-700">
                        Coût total estimé: <span className="font-bold">{damageAnalysis.totalCost} DH</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          window.print();
                          toast({
                            title: "Impression",
                            description: "Document envoyé vers l'imprimante",
                          });
                        }}
                      >
                        Imprimer
                      </Button>
                      <Button
                        onClick={() => {
                          // Generate professional PDF matching the provided image format
                          import('jspdf').then(({ jsPDF }) => {
                            const doc = new jsPDF();
                            const formData = form.getValues();
                            const currentDate = new Date().toLocaleDateString('fr-FR');
                            const devisNumber = `DE${Date.now().toString().slice(-8)}-GAV1`;
                            
                            // Header with blue background like in image
                            doc.setFillColor(173, 216, 230); // Light blue
                            doc.rect(0, 0, 210, 40, 'F');
                            
                            // Company logo section (left)
                            doc.setFontSize(16);
                            doc.setFont(undefined, 'bold');
                            doc.setTextColor(0, 100, 200); // Blue color
                            doc.text('🏢 Sanlam', 10, 15);
                            
                            // Devis number (right)
                            doc.setFontSize(20);
                            doc.setTextColor(0, 0, 0);
                            doc.text(`Devis N° ${devisNumber}`, 105, 15);
                            
                            // Publication date and expert info
                            doc.setFontSize(10);
                            doc.text(`Date de publication  ${currentDate}`, 105, 25);
                            doc.text('Garagiste  OMAK S.A.R.L', 105, 30);
                            doc.text('Expert  CABEK', 105, 35);
                            
                            // Reset text color
                            doc.setTextColor(0, 0, 0);
                            
                            // ASSURÉ section with background
                            doc.setFillColor(173, 216, 230);
                            doc.rect(10, 45, 90, 8, 'F');
                            doc.setFontSize(12);
                            doc.setFont(undefined, 'bold');
                            doc.text('ASSURÉ', 12, 51);
                            
                            doc.setFontSize(9);
                            doc.setFont(undefined, 'normal');
                            doc.text('Nom', 12, 60);
                            doc.text(formData.clientName, 40, 60);
                            doc.text('Intermédiaire', 12, 67);
                            doc.text(formData.insuranceCompany, 40, 67);
                            doc.text('Date du sinistre', 12, 74);
                            doc.text(currentDate, 40, 74);
                            doc.text('N° du sinistre', 12, 81);
                            doc.text(formData.insurancePolicyNumber, 40, 81);
                            
                            doc.text('Souscripteur', 70, 60);
                            doc.text(formData.clientPhone, 70, 67);
                            doc.text('Police', 70, 74);
                            doc.text(formData.insurancePolicyNumber, 70, 81);
                            
                            // VÉHICULE section with background
                            doc.setFillColor(173, 216, 230);
                            doc.rect(105, 45, 95, 8, 'F');
                            doc.setFontSize(12);
                            doc.setFont(undefined, 'bold');
                            doc.text('VÉHICULE', 107, 51);
                            
                            doc.setFontSize(9);
                            doc.setFont(undefined, 'normal');
                            doc.text('Véhicule', 107, 60);
                            doc.text(`${formData.make}`, 130, 60);
                            doc.text('Matricule', 107, 67);
                            doc.text(formData.licensePlate, 130, 67);
                            doc.text('N° de châssis', 107, 74);
                            doc.text(formData.vin || 'N/A', 130, 74);
                            
                            doc.text('Puissance fiscale', 155, 60);
                            doc.text('6', 175, 60);
                            doc.text('Date MEC', 155, 67);
                            doc.text(`${formData.year}`, 175, 67);
                            doc.text('Motorisation', 155, 74);
                            doc.text('Diesel', 175, 74);
                            
                            // FOURNITURE section
                            let yPosition = 95;
                            doc.setFillColor(173, 216, 230);
                            doc.rect(10, yPosition, 190, 8, 'F');
                            doc.setFontSize(12);
                            doc.setFont(undefined, 'bold');
                            doc.text('FOURNITURE', 12, yPosition + 6);
                            
                            // Table headers for FOURNITURE
                            yPosition += 15;
                            doc.setFontSize(8);
                            doc.setFont(undefined, 'bold');
                            doc.text('Élément', 12, yPosition);
                            doc.text('Position', 50, yPosition);
                            doc.text('Type Pièce', 75, yPosition);
                            doc.text('Prix HT', 95, yPosition);
                            doc.text('Quantité', 115, yPosition);
                            doc.text('% Remise', 135, yPosition);
                            doc.text('Montant Remise', 155, yPosition);
                            doc.text('Prix Total HT', 175, yPosition);
                            doc.text('TVA', 190, yPosition);
                            doc.text('Prix TTC', 200, yPosition);
                            
                            // Line under headers
                            doc.line(10, yPosition + 2, 200, yPosition + 2);
                            
                            // Fourniture items
                            yPosition += 8;
                            doc.setFont(undefined, 'normal');
                            let totalFournitureHTAmount = 0;
                            let totalFournitureTTCAmount = 0;
                            let fournitureItemCount = 0;
                            
                            if (damageAnalysis?.damages) {
                              damageAnalysis.damages.forEach((damage: any) => {
                                if (damage.type.includes('phare') || damage.type.includes('Phare') || 
                                    damage.type.includes('pare-chocs') || damage.type.includes('capot') ||
                                    damage.type.includes('portière') || damage.type.includes('Portière')) {
                                  const prixHT = Math.round(damage.cost * 0.7); // 70% pour les pièces
                                  const tva = Math.round(prixHT * 0.2);
                                  const prixTTC = prixHT + tva;
                                  totalFournitureHTAmount += prixHT;
                                  totalFournitureTTCAmount += prixTTC;
                                  fournitureItemCount++;
                                  
                                  doc.text(damage.type, 12, yPosition);
                                  doc.text(damage.location, 50, yPosition);
                                  doc.text('REC', 75, yPosition);
                                  doc.text(`${prixHT},00`, 95, yPosition);
                                  doc.text('1', 115, yPosition);
                                  doc.text('-', 135, yPosition);
                                  doc.text('-', 155, yPosition);
                                  doc.text(`${prixHT},00`, 175, yPosition);
                                  doc.text('-', 190, yPosition);
                                  doc.text(`${prixTTC},00`, 200, yPosition);
                                  yPosition += 6;
                                }
                              });
                            }
                            
                            // Total Fourniture
                            doc.line(10, yPosition, 200, yPosition);
                            yPosition += 6;
                            doc.setFont(undefined, 'bold');
                            doc.text('TOTAL Fournitures', 12, yPosition);
                            doc.text(`${fournitureItemCount}`, 115, yPosition);
                            doc.text(`${totalFournitureHTAmount},00`, 175, yPosition);
                            doc.text(`${totalFournitureTTCAmount},00`, 200, yPosition);
                            
                            // MAIN D'OEUVRE section
                            yPosition += 15;
                            doc.setFillColor(173, 216, 230);
                            doc.rect(10, yPosition, 190, 8, 'F');
                            doc.setFontSize(12);
                            doc.text('MAIN D\'OEUVRE', 12, yPosition + 6);
                            
                            // Table headers for MAIN D'OEUVRE
                            yPosition += 15;
                            doc.setFontSize(8);
                            doc.text('Main d\'oeuvre', 12, yPosition);
                            doc.text('Position', 50, yPosition);
                            doc.text('Type MO', 75, yPosition);
                            doc.text('#Heures', 95, yPosition);
                            doc.text('Taux horaire', 115, yPosition);
                            doc.text('Prix Total HT', 140, yPosition);
                            doc.text('TVA', 165, yPosition);
                            doc.text('Prix Total TTC', 180, yPosition);
                            
                            doc.line(10, yPosition + 2, 200, yPosition + 2);
                            
                            // Main d'oeuvre items
                            yPosition += 8;
                            doc.setFont(undefined, 'normal');
                            let totalMainOeuvreHTAmount = 0;
                            let totalMainOeuvreTTCAmount = 0;
                            let heuresTotalAmount = 0;
                            
                            if (damageAnalysis?.damages) {
                              damageAnalysis.damages.forEach((damage: any) => {
                                const prixMO = Math.round(damage.cost * 0.3); // 30% pour la main d'œuvre
                                const heures = Math.ceil(prixMO / 70); // 70 DH par heure
                                const tva = Math.round(prixMO * 0.2);
                                const prixTTC = prixMO + tva;
                                totalMainOeuvreHTAmount += prixMO;
                                totalMainOeuvreTTCAmount += prixTTC;
                                heuresTotalAmount += heures;
                                
                                doc.text(damage.type, 12, yPosition);
                                doc.text(damage.location, 50, yPosition);
                                doc.text('Changement', 75, yPosition);
                                doc.text(`${heures},00`, 95, yPosition);
                                doc.text('70,00', 115, yPosition);
                                doc.text(`${prixMO},00`, 140, yPosition);
                                doc.text(`${tva},00`, 165, yPosition);
                                doc.text(`${prixTTC},00`, 180, yPosition);
                                yPosition += 6;
                              });
                            }
                            
                            // Total Main d'oeuvre
                            doc.line(10, yPosition, 200, yPosition);
                            yPosition += 6;
                            doc.setFont(undefined, 'bold');
                            doc.text('TOTAL Main d\'oeuvre', 12, yPosition);
                            doc.text(`${heuresTotalAmount},00`, 95, yPosition);
                            doc.text(`${totalMainOeuvreHTAmount},00`, 140, yPosition);
                            doc.text(`${Math.round(totalMainOeuvreHTAmount * 0.2)},00`, 165, yPosition);
                            doc.text(`${totalMainOeuvreTTCAmount},00`, 180, yPosition);
                            
                            // TOTAL GÉNÉRAL with table format
                            yPosition += 20;
                            
                            // Create table structure
                            doc.setFillColor(240, 240, 240);
                            doc.rect(50, yPosition, 150, 25, 'F');
                            doc.rect(50, yPosition, 150, 25, 'S');
                            
                            // Table headers
                            yPosition += 8;
                            doc.setFontSize(10);
                            doc.setFont(undefined, 'bold');
                            doc.text('Total HT', 110, yPosition);
                            doc.text('TVA', 140, yPosition);
                            doc.text('TTC', 170, yPosition);
                            
                            // TOTAL Fourniture row
                            yPosition += 6;
                            doc.setFont(undefined, 'normal');
                            doc.text('TOTAL Fourniture', 55, yPosition);
                            doc.text(`${totalFournitureHTAmount},00`, 110, yPosition);
                            doc.text(`${Math.round(totalFournitureHTAmount * 0.2)},00`, 140, yPosition);
                            doc.text(`${totalFournitureTTCAmount},00`, 170, yPosition);
                            
                            // TOTAL Main d'oeuvre row
                            yPosition += 6;
                            doc.text('TOTAL Main d\'oeuvre', 55, yPosition);
                            doc.text(`${totalMainOeuvreHTAmount},00`, 110, yPosition);
                            doc.text(`${Math.round(totalMainOeuvreHTAmount * 0.2)},00`, 140, yPosition);
                            doc.text(`${totalMainOeuvreTTCAmount},00`, 170, yPosition);
                            
                            // TOTAL Général row (highlighted)
                            yPosition += 6;
                            doc.setFont(undefined, 'bold');
                            doc.setFontSize(12);
                            const totalGeneralHTValue = totalFournitureHTAmount + totalMainOeuvreHTAmount;
                            const totalGeneralTVAValue = Math.round(totalGeneralHTValue * 0.2);
                            const totalGeneralTTCValue = totalFournitureTTCAmount + totalMainOeuvreTTCAmount;
                            
                            doc.text('TOTAL Général', 55, yPosition);
                            doc.text(`${totalGeneralHTValue},00`, 110, yPosition);
                            doc.text(`${totalGeneralTVAValue},00`, 140, yPosition);
                            doc.setTextColor(0, 100, 200); // Blue color for final total
                            doc.text(`${totalGeneralTTCValue},00`, 170, yPosition);
                            doc.setTextColor(0, 0, 0); // Reset color
                            
                            // Conversion en lettres
                            yPosition += 15;
                            doc.setFontSize(10);
                            doc.setFont(undefined, 'italic');
                            doc.text(`Arrêté le présent devis à la somme de : ${totalGeneralTTCValue} dirhams`, 20, yPosition);
                            
                            // OBSERVATIONS section
                            yPosition += 15;
                            doc.setFillColor(173, 216, 230);
                            doc.rect(10, yPosition, 190, 8, 'F');
                            doc.setFontSize(12);
                            doc.setFont(undefined, 'bold');
                            doc.text('OBSERVATIONS', 12, yPosition + 6);
                            
                            yPosition += 15;
                            doc.setFontSize(10);
                            doc.setFont(undefined, 'normal');
                            doc.text(formData.damageDescription || 'Aucune observation particulière', 12, yPosition, { maxWidth: 180 });
                            
                            // Save PDF
                            doc.save(`devis-${devisNumber}-${currentDate.replace(/\//g, '')}.pdf`);
                            
                            toast({
                              title: "PDF téléchargé",
                              description: "Le devis professionnel a été généré et téléchargé",
                            });
                          }).catch(() => {
                            toast({
                              title: "Erreur",
                              description: "Impossible de générer le PDF",
                              variant: "destructive",
                            });
                          });
                        }}
                      >
                        Télécharger PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Veuillez d'abord compléter l'analyse IA pour générer le devis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <div>
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {currentStep === steps.length - 1 && (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleSubmit(form.getValues(), true)}
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder brouillon
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    Soumettre l'estimation
                  </Button>
                </>
              )}
              
              {currentStep < steps.length - 1 && (
                <Button type="button" onClick={nextStep}>
                  Suivant
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EstimationForm;