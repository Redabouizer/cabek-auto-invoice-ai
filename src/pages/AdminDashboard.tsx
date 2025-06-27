
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Car, 
  FileText, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalCars: number;
  totalEvaluations: number;
  pendingEvaluations: number;
  completedEvaluations: number;
  totalOtherData: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCars: 0,
    totalEvaluations: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    totalOtherData: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch cars count
      const { count: carsCount } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });

      // Fetch evaluations count
      const { count: evaluationsCount } = await supabase
        .from('evaluations')
        .select('*', { count: 'exact', head: true });

      // Fetch pending evaluations
      const { count: pendingCount } = await supabase
        .from('evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'en_cours');

      // Fetch completed evaluations
      const { count: completedCount } = await supabase
        .from('evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'complété');

      // Fetch other data count
      const { count: otherDataCount } = await supabase
        .from('other_data')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalCars: carsCount || 0,
        totalEvaluations: evaluationsCount || 0,
        pendingEvaluations: pendingCount || 0,
        completedEvaluations: completedCount || 0,
        totalOtherData: otherDataCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Voitures Enregistrées',
      value: stats.totalCars,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Évaluations',
      value: stats.totalEvaluations,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Évaluations en Cours',
      value: stats.pendingEvaluations,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Évaluations Complétées',
      value: stats.completedEvaluations,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Données Système',
      value: stats.totalOtherData,
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble des statistiques et de l'activité du système Cabek
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Activité Récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Système opérationnel</p>
                  <p className="text-sm text-gray-600">Toutes les fonctionnalités sont actives</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{stats.pendingEvaluations} évaluations en attente</p>
                  <p className="text-sm text-gray-600">Nécessitent une révision</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>Actions Recommandées</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-orange-400 bg-orange-50">
                <p className="font-medium text-orange-800">Révision des évaluations</p>
                <p className="text-sm text-orange-700">
                  {stats.pendingEvaluations} évaluations en attente de validation
                </p>
              </div>
              <div className="p-3 border-l-4 border-blue-400 bg-blue-50">
                <p className="font-medium text-blue-800">Maintenance système</p>
                <p className="text-sm text-blue-700">
                  Planifier la maintenance régulière des données
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
