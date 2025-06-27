
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationTrackerProps {
  onLocationUpdate: (location: {lat: number, lng: number, address: string}) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ onLocationUpdate }) => {
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par ce navigateur");
      toast({
        title: "Erreur",
        description: "La géolocalisation n'est pas supportée",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get address from coordinates using reverse geocoding
          // In a real application, you would use a proper geocoding service
          const address = await reverseGeocode(latitude, longitude);
          
          const locationData = {
            lat: latitude,
            lng: longitude,
            address: address
          };
          
          setLocation(locationData);
          onLocationUpdate(locationData);
          
          toast({
            title: "Localisation obtenue",
            description: "Position géographique enregistrée avec succès",
          });
        } catch (error) {
          console.error('Error getting address:', error);
          const locationData = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          
          setLocation(locationData);
          onLocationUpdate(locationData);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = "Impossible d'obtenir la localisation";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai d'attente dépassé";
            break;
        }
        
        setError(errorMessage);
        toast({
          title: "Erreur de géolocalisation",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Simulate reverse geocoding - in real app, use Google Maps API or similar
    // For demo purposes, return coordinates as address
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  };

  useEffect(() => {
    // Automatically get location when component mounts
    getCurrentLocation();
  }, []);

  return (
    <div className="space-y-4">
      <Card className={`${location ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="p-6">
          <div className="text-center">
            {isLoading ? (
              <div>
                <Navigation className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Récupération de la localisation...
                </h3>
                <p className="text-gray-600">
                  Veuillez autoriser l'accès à votre position
                </p>
              </div>
            ) : location ? (
              <div>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Localisation enregistrée
                </h3>
                <p className="text-green-700 mb-4">
                  {location.address}
                </p>
                <div className="text-sm text-green-600 space-y-1">
                  <p>Latitude: {location.lat.toFixed(6)}</p>
                  <p>Longitude: {location.lng.toFixed(6)}</p>
                </div>
              </div>
            ) : (
              <div>
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Localisation requise
                </h3>
                <p className="text-gray-600 mb-4">
                  La géolocalisation est nécessaire pour valider l'estimation
                </p>
                {error && (
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                )}
              </div>
            )}
            
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading}
              variant={location ? "outline" : "default"}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {location ? "Actualiser la position" : "Obtenir ma position"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Pourquoi la localisation ?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Validation de l'emplacement de l'estimation</li>
            <li>• Conformité réglementaire</li>
            <li>• Traçabilité des interventions</li>
            <li>• Amélioration de la précision des rapports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTracker;
