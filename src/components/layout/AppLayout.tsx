import { Link, useLocation } from "react-router"
import { Home, Trophy, Calendar, Settings, LogOut } from "lucide-react"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import UserAuthSection from "@/components/auth/UserAuthSection"
import { useStore } from "@/store"
import { api } from "@/lib/api/api"
import type { CredentialResponse } from "@react-oauth/google"
import { GoogleLogin } from "@react-oauth/google"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"


// Menu items for navigation
const data = {
  navigation: [
    {
      title: "Inicio",
      url: "/",
      icon: Home,
    },
    {
      title: "Clasificación",
      url: "/leaderboard", 
      icon: Trophy,
    },
  ],
  // You can add more sections here later
  settings: [
    {
      title: "Configuración",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar() {
  const location = useLocation()
  const { user, isAuthenticated, logout, error, login } = useStore()
  const [loginDialog, setLoginDialog] = useState(false)

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      const authResponse = await api.verifyUser(
        credentialResponse.credential || ""
      );
      console.log("Auth response:", authResponse);

      const userForStore = {
        user: authResponse.user,
        accessToken: authResponse.access_token,
      };

      console.log("User for store:", userForStore);
      login(userForStore);
      setLoginDialog(false); // Close dialog on successful login
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  🏆
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Prode App</span>
                  <span className="truncate text-xs">Predictions & Fun</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isAuthenticated && user ? (
              <Popover>
                <PopoverTrigger>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <Avatar className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <AvatarImage src={user.user?.avatar || ""} className="rounded-lg"/>
                      <AvatarFallback className="rounded-lg">{user.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.user?.name || "User"}</span>
                      <span className="truncate text-xs">{user.user?.email || ""}</span>
                    </div>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="end">
                  <Button variant="default" onClick={handleLogout} className="w-full">
                    Cerrar sesión
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Dialog open={loginDialog} onOpenChange={setLoginDialog}>
                <DialogTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      👤
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Guest</span>
                      <span className="truncate text-xs">Click to log in</span>
                    </div>
                  </SidebarMenuButton>
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
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 