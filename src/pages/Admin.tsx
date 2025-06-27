import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, Settings, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminPasswordVerification from '@/components/AdminPasswordVerification';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  role: 'admin' | 'user';
}

const Admin = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  
  // Form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'admin' | 'user'
  });

  const [passwordVerification, setPasswordVerification] = useState({
    isOpen: false,
    action: '',
    callback: () => {}
  });

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at
        `);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles);

      // Fetch roles for each user
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      console.log('Roles fetched:', roles);

      // Combine profiles with roles
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user'
        };
      }) || [];

      console.log('Users with roles:', usersWithRoles);
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordVerification = (action: string, callback: () => void) => {
    setPasswordVerification({
      isOpen: true,
      action,
      callback
    });
  };

  const handlePasswordVerified = () => {
    passwordVerification.callback();
    setPasswordVerification({
      isOpen: false,
      action: '',
      callback: () => {}
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    requestPasswordVerification('créer un nouvel utilisateur', async () => {
      setLoading(true);

      try {
        console.log('Creating user:', newUser.email);
        
        // Use regular signUp method
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newUser.email,
          password: newUser.password,
          options: {
            data: {
              first_name: newUser.firstName,
              last_name: newUser.lastName
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          throw authError;
        }

        console.log('User created:', authData);

        // If user was created successfully and we need to assign admin role
        if (newUser.role === 'admin' && authData.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: 'admin' })
            .eq('user_id', authData.user.id);

          if (roleError) {
            console.error('Error updating role:', roleError);
          }
        }

        toast({
          title: "Utilisateur créé",
          description: `L'utilisateur ${newUser.email} a été créé avec succès. Un email de confirmation a été envoyé.`,
        });

        // Reset form
        setNewUser({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'user'
        });
        setShowAddUser(false);
        
        // Refresh users list
        setTimeout(() => {
          fetchUsers();
        }, 1000);
      } catch (error: any) {
        console.error('Error creating user:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de créer l'utilisateur",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`)) {
      return;
    }

    requestPasswordVerification(`supprimer l'utilisateur ${email}`, async () => {
      try {
        console.log('Deleting user:', userId);
        
        // Delete from profiles table (this will cascade to user_roles)
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) {
          console.error('Error deleting user:', error);
          throw error;
        }

        toast({
          title: "Utilisateur supprimé",
          description: `L'utilisateur ${email} a été supprimé`,
        });

        fetchUsers();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur",
          variant: "destructive",
        });
      }
    });
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    requestPasswordVerification(`modifier le rôle de l'utilisateur`, async () => {
      try {
        console.log('Updating role for user:', userId, 'to:', newRole);
        
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating role:', error);
          throw error;
        }

        toast({
          title: "Rôle mis à jour",
          description: `Le rôle de l'utilisateur a été mis à jour`,
        });

        fetchUsers();
      } catch (error: any) {
        console.error('Error updating role:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le rôle",
          variant: "destructive",
        });
      }
    });
  };

  if (userRole !== 'admin') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
        <p className="text-gray-600">Vous n'avez pas les droits d'administrateur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h2>
        <p className="text-gray-600">Administration des comptes utilisateurs</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Ajouter un utilisateur</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddUser ? (
              <Button 
                onClick={() => setShowAddUser(true)}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nouveau utilisateur
              </Button>
            ) : (
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Création...' : 'Créer'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddUser(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Liste des utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Chargement...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun utilisateur trouvé</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : 'Nom non renseigné'
                          }
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={(value: 'admin' | 'user') => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminPasswordVerification
        isOpen={passwordVerification.isOpen}
        onClose={() => setPasswordVerification({ isOpen: false, action: '', callback: () => {} })}
        onVerified={handlePasswordVerified}
        action={passwordVerification.action}
      />
    </div>
  );
};

export default Admin;
