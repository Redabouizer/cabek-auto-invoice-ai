import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Car, 
  FileText, 
  Settings, 
  User,
  BarChart3,
  Home
} from 'lucide-react';
import Header from '@/components/Header';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: BarChart3,
      path: '/admin',
      description: 'Vue d\'ensemble du système'
    },
    {
      id: 'profile',
      title: 'Profil Admin',
      icon: User,
      path: '/admin/profile',
      description: 'Paramètres du profil administrateur'
    },
    {
      id: 'evaluations',
      title: 'Gestion des Estimations',
      icon: FileText,
      path: '/admin/evaluations',
      description: 'Gérer et consulter les estimations'
    },
    {
      id: 'cars',
      title: 'Gestion des voitures',
      icon: Car,
      path: '/admin/cars',
      description: 'Gérer le parc automobile'
    },
    {
      id: 'users',
      title: 'Gestion des utilisateurs',
      icon: Users,
      path: '/admin/users',
      description: 'Gérer les comptes utilisateurs'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-80">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Menu Administration
                  </h2>
                </div>
                
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`
                          flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <Link to="/">
                    <Button variant="outline" size="sm" className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Retour à l'accueil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
