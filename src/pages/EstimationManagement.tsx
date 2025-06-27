
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EstimationStats {
  totalEstimations: number;
  averageCost: number;
  pendingEstimations: number;
  completedEstimations: number;
  totalRevenue: number;
}

interface Estimation {
  id: string;
  client_id: string;
  car_id: string;
  total_cost: number;
  submission_status: string;
  created_at: string;
  clients: {
    full_name: string;
  } | null;
  cars: {
    make: string;
    model: string;
    license_plate: string;
  } | null;
}

const EstimationManagement = () => {
  const [stats, setStats] = useState<EstimationStats>({
    totalEstimations: 0,
    averageCost: 0,
    pendingEstimations: 0,
    completedEstimations: 0,
    totalRevenue: 0
  });
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEstimationData();
  }, []);

  const fetchEstimationData = async () => {
    try {
      // Fetch estimations with client and car data
      const { data: estimationsData, error: estimationsError } = await supabase
        .from('evaluations')
        .select(`
          id,
          client_id,
          car_id,
          total_cost,
          submission_status,
          created_at,
          clients:client_id (
            full_name
          ),
          cars:car_id (
            make,
            model,
            license_plate
          )
        `)
        .order('created_at', { ascending: false });

      if (estimationsError) {
        console.error('Error fetching estimations:', estimationsError);
        throw estimationsError;
      }

      setEstimations(estimationsData || []);

      // Calculate statistics
      const total = estimationsData?.length || 0;
      const completed = estimationsData?.filter(e => e.submission_status === 'approved').length || 0;
      const pending = estimationsData?.filter(e => e.submission_status === 'submitted').length || 0;
      const totalRevenue = estimationsData?.reduce((sum, e) => sum + (e.total_cost || 0), 0) || 0;
      const averageCost = total > 0 ? totalRevenue / total : 0;

      setStats({
        totalEstimations: total,
        averageCost,
        pendingEstimations: pending,
        completedEstimations: completed,
        totalRevenue
      });

    } catch (error: any) {
      console.error('Error fetching estimation data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'estimation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewEstimation = () => {
    navigate('/nouvelle-estimation');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Brouillon</span>;
      case 'submitted':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">En attente</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Approuvé</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Rejeté</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des estimations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Estimations
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble et gestion des estimations de dommages
          </p>
        </div>
        <Button onClick={handleNewEstimation} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle Estimation</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Estimations</p>
                <p className="text-2xl font-bold">{stats.totalEstimations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Coût Moyen</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">En Attente</p>
                <p className="text-2xl font-bold">{stats.pendingEstimations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Complétées</p>
                <p className="text-2xl font-bold">{stats.completedEstimations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Revenus Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Liste des Estimations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estimations.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucune estimation trouvée</p>
              <Button onClick={handleNewEstimation} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer la première estimation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimations.map((estimation) => (
                  <TableRow key={estimation.id}>
                    <TableCell>
                      {estimation.clients?.full_name || 'Client non renseigné'}
                    </TableCell>
                    <TableCell>
                      {estimation.cars ? 
                        `${estimation.cars.make} ${estimation.cars.model} (${estimation.cars.license_plate})` 
                        : 'Véhicule non renseigné'
                      }
                    </TableCell>
                    <TableCell>
                      {estimation.total_cost ? formatCurrency(estimation.total_cost) : 'Non défini'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(estimation.submission_status)}
                    </TableCell>
                    <TableCell>
                      {new Date(estimation.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimationManagement;
