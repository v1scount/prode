import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon, LogOut } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import type { User as UserType } from "@/store/slices/userSlice";

interface UserAuthSectionProps {
  isAuthenticated: boolean;
  user: UserType | null;
  error: string | null;
  onGoogleLogin: (credentialResponse: CredentialResponse) => Promise<void>;
  onLogout: () => void;
}

export default function UserAuthSection({
  isAuthenticated,
  user,
  error,
  onGoogleLogin,
  onLogout,
}: UserAuthSectionProps) {
  const [loginDialog, setLoginDialog] = useState(false);

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    await onGoogleLogin(credentialResponse);
    setLoginDialog(false);
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={user.user.avatar} />
          <AvatarFallback>{user.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-700">
          {user.user.name}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={loginDialog} onOpenChange={setLoginDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          <UserIcon className="h-4 w-4" />
          Iniciar sesión
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar sesión</DialogTitle>
          <DialogDescription>
            Inicia sesión con Google para guardar tus predicciones y
            competir con tus amigos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Google login failed");
              }}
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 