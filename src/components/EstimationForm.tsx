
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
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                        <Input placeholder="Gris" {...field} />
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
                          placeholder="80000" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                      <FormLabel>Numéro VIN</FormLabel>
                      <FormControl>
                        <Input placeholder="VF1LB1B0H46123456" {...field} />
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
                  <span>Localisation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationTracker onLocationUpdate={setLocation} />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Télécharger Photos */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-6 w-6 text-blue-600" />
                  <span>Téléchargement des Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoUploadSection onImagesUploaded={setUploadedImages} />
              </CardContent>
            </Card>
          )}

          {/* Step 5: Analyse IA */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <span>Analyse IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                {!isAnalyzing && !analysisComplete && (
                  <div className="space-y-4">
                    <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Prêt pour l'analyse IA</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Notre intelligence artificielle va analyser les photos téléchargées pour détecter et évaluer automatiquement les dommages.
                    </p>
                    <Button 
                      onClick={() => {
                        setIsAnalyzing(true);
                        // Simulate AI analysis
                        setTimeout(() => {
                          setIsAnalyzing(false);
                          setAnalysisComplete(true);
                          setDamageAnalysis({
                            confidence: '92%',
                             damages: [
                               { type: 'Rayure profonde', location: 'Portière avant droite', severity: 'Modéré', cost: 4500 },
                               { type: 'Bosse', location: 'Aile arrière gauche', severity: 'Léger', cost: 3200 },
                               { type: 'Phare endommagé', location: 'Avant du véhicule', severity: 'Important', cost: 2800 },
                               { type: 'Éraflure', location: 'Pare-chocs avant', severity: 'Léger', cost: 1800 }
                             ],
                             totalCost: 12300
                          });
                          toast({
                            title: "Analyse terminée",
                            description: "L'IA a détecté et analysé les dommages avec 92% de confiance",
                          });
                        }, 3000);
                      }}
                      disabled={uploadedImages.length === 0}
                      className="px-8 py-3"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Analyser les Photos ({uploadedImages.length})
                    </Button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-4">
                    <Loader className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
                    <h3 className="text-xl font-semibold">Analyse IA en cours</h3>
                    <p className="text-gray-600">
                      Notre intelligence artificielle analyse les dommages détectés sur les photos...
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '68%'}}></div>
                    </div>
                    <p className="text-sm text-gray-500">Évaluation des impacts...</p>
                  </div>
                )}

                {analysisComplete && damageAnalysis && (
                  <div className="text-left space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full mb-4">
                        <Brain className="h-5 w-5 mr-2" />
                        Analyse Terminée - Confiance IA: {damageAnalysis.confidence}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Dommages Détectés</h4>
                      <div className="space-y-3">
                        {damageAnalysis.damages.map((damage: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                            <div>
                              <p className="font-medium">{damage.type}</p>
                              <p className="text-sm text-gray-600">{damage.location}</p>
                              <span className={`inline-block px-2 py-1 text-xs rounded ${
                                damage.severity === 'Léger' ? 'bg-green-100 text-green-800' :
                                damage.severity === 'Modéré' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {damage.severity}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{damage.cost} DH</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Coût Total Estimé:</span>
                          <span className="text-xl font-bold text-blue-600">{damageAnalysis.totalCost} DH</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="damageSeverity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sévérité des dommages *</FormLabel>
                            <FormControl>
                              <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                {...field}
                              >
                                <option value="léger">Léger</option>
                                <option value="modéré">Modéré</option>
                                <option value="grave">Grave</option>
                                <option value="total">Perte totale</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="damageDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description détaillée des dommages *</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Décrivez en détail les dommages observés..."
                              {...field}
                              defaultValue="Analyse IA: Rayure profonde sur portière avant droite, bosse sur aile arrière gauche, phare endommagé à l'avant, éraflure sur pare-chocs avant."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Génération Facture */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <span>Génération Facture</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                {!invoiceGenerated ? (
                  <div className="space-y-4">
                    <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Facture d'estimation des réparations</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Génération automatique de la facture basée sur l'analyse IA.
                    </p>
                    <Button 
                      onClick={() => {
                        setInvoiceGenerated(true);
                        toast({
                          title: "Facture générée",
                          description: "La facture d'estimation a été générée avec succès",
                        });
                      }}
                      disabled={!analysisComplete}
                      className="px-8 py-3"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Générer la Facture
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full mb-4">
                      <FileText className="h-5 w-5 mr-2" />
                      Facture Générée
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg">Devis d'Évaluation</h4>
                        <span className="text-sm text-gray-600">N° CABEK-241901</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Photos analysées:</span>
                          <span>{uploadedImages.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date d'analyse:</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confiance IA:</span>
                          <span>{damageAnalysis?.confidence || '92%'}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-blue-300 mt-4 pt-4">
                        <h5 className="font-semibold mb-2">Détail des Dommages Détectés</h5>
                        {damageAnalysis?.damages.map((damage: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm py-1">
                            <span>{damage.type}</span>
                            <span>{damage.cost} DH</span>
                          </div>
                        ))}
                        
                        <div className="border-t border-blue-300 mt-2 pt-2">
                          <div className="flex justify-between font-bold">
                            <span>Sous-total HT:</span>
                             <span>{damageAnalysis?.totalCost || 12300} DH</span>
                           </div>
                           <div className="flex justify-between text-sm">
                             <span>TVA (20%):</span>
                             <span>{Math.round((damageAnalysis?.totalCost || 12300) * 0.2)} DH</span>
                           </div>
                           <div className="flex justify-between font-bold text-lg border-t border-blue-300 mt-1 pt-1">
                             <span>Total TTC:</span>
                             <span>{Math.round((damageAnalysis?.totalCost || 12300) * 1.2)} DH</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          window.print();
                          toast({
                            title: "Impression lancée",
                            description: "La fenêtre d'impression va s'ouvrir",
                          });
                        }}
                      >
                        Imprimer
                      </Button>
                      <Button
                        onClick={() => {
                          // Generate PDF logic here
                          const formData = form.getValues();
                          const pdfContent = `
DEVIS D'ÉVALUATION N° CABEK-241901

CLIENT: ${formData.clientName}
TÉLÉPHONE: ${formData.clientPhone}
ADRESSE: ${formData.clientAddress}
EMAIL: ${formData.clientEmail || 'Non renseigné'}

VÉHICULE: ${formData.make} ${formData.model} ${formData.year}
PLAQUE: ${formData.licensePlate}
COULEUR: ${formData.color || 'Non renseignée'}

ASSURANCE: ${formData.insuranceCompany}
POLICE N°: ${formData.insurancePolicyNumber}

DÉTAIL DES DOMMAGES:
${damageAnalysis?.damages.map((d: any) => `- ${d.type} (${d.location}): ${d.cost} DH`).join('\n') || ''}

SOUS-TOTAL HT: ${damageAnalysis?.totalCost || 12300} DH
TVA (20%): ${Math.round((damageAnalysis?.totalCost || 12300) * 0.2)} DH
TOTAL TTC: ${Math.round((damageAnalysis?.totalCost || 12300) * 1.2)} DH

Date: ${new Date().toLocaleDateString()}
Confiance IA: ${damageAnalysis?.confidence || '92%'}
                          `;
                          
                          const blob = new Blob([pdfContent], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `devis-${formData.licensePlate}-${new Date().toISOString().split('T')[0]}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                          
                          toast({
                            title: "PDF téléchargé",
                            description: "Le devis a été téléchargé avec succès",
                          });
                        }}
                      >
                        Télécharger PDF
                      </Button>
                    </div>
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
