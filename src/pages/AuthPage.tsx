import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from 'lucide-react';
import axios from 'axios';

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }

    try {
     const response = await axios.post('/api/auth/login', {
  email: loginEmail,
  password: loginPassword,
});

      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      toast({
        title: 'Login successful',
        description: `Welcome, ${loginEmail}`,
      });

      if (role === 'admin') {
        navigate('/');
      } else if (role === 'user') {
        navigate('/facturation');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <svg viewBox="0 0 24 24" width="48" height="48" className="text-blue-600">
              <path fill="currentColor" d="M19.5,6c-1.3-1.3-3-2-4.8-2c-1.8,0-3.5,0.7-4.8,2L8.5,7.3l1.4,1.4l1.4-1.4c1.7-1.7,4.3-1.7,6,0c1.7,1.7,1.7,4.3,0,6l-1.4,1.4l1.4,1.4l1.4-1.4C20.2,13,21,11.3,21,9.5C21,8.1,20.4,6.9,19.5,6z M15.5,11.7L10.3,16.9c-0.4,0.4-1,0.4-1.4,0s-0.4-1,0-1.4l5.2-5.2c0.4-0.4,1-0.4,1.4,0S15.8,11.3,15.5,11.7z M7.5,15.5c-1.7-1.7-1.7-4.3,0-6c0.8-0.8,1.8-1.2,2.8-1.2c1,0,2.1,0.4,2.8,1.2l1.4,1.4l1.4-1.4l-1.4-1.4c-1.3-1.3-3-2-4.8-2c-1.8,0-3.5,0.7-4.8,2C3.6,9.5,3,11.2,3,13c0,1.8,0.7,3.5,2,4.8l1.4,1.4l1.4-1.4L7.5,15.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">RWS</h1>
          <p className="text-gray-600">Business management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              Log in to your account to access the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
               <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="text"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Log in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
