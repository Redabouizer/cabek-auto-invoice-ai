
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminPasswordVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  action: string; // Description of the action being performed
}

const AdminPasswordVerification: React.FC<AdminPasswordVerificationProps> = ({
  isOpen,
  onClose,
  onVerified,
  action
}) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!password) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre mot de passe",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Utilisateur non trouvé');
      }

      // Verify password by attempting to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (error) {
        toast({
          title: "Mot de passe incorrect",
          description: "Le mot de passe saisi est incorrect",
          variant: "destructive",
        });
        return;
      }

      // Password verified successfully
      onVerified();
      onClose();
      setPassword('');
      
      toast({
        title: "Vérification réussie",
        description: "Action autorisée",
      });
    } catch (error: any) {
      console.error('Password verification error:', error);
      toast({
        title: "Erreur de vérification",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vérification de sécurité</AlertDialogTitle>
          <AlertDialogDescription>
            Pour {action}, veuillez confirmer votre mot de passe administrateur.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="admin-password">Mot de passe</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Saisissez votre mot de passe"
            className="mt-2"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleVerify}
            disabled={isVerifying || !password}
          >
            {isVerifying ? 'Vérification...' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminPasswordVerification;
