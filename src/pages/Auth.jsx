import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Home, Building, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roles = [
  { role: 'owner', title: 'Property Owner', description: 'List your rooms and find tenants', icon: <Building className="w-8 h-8" /> },
  { role: 'tenant', title: 'Tenant', description: 'Find and rent a room', icon: <Home className="w-8 h-8" /> },
  { role: 'roommate_seeker', title: 'Roommate Seeker', description: 'Find compatible roommates', icon: <Users className="w-8 h-8" /> },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, signup, selectRole, isLoading, pendingUser } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'owner': navigate('/owner-dashboard'); break;
        default: navigate('/tenant-dashboard');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (pendingUser) setMode('role-select');
  }, [pendingUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (!success) {
      toast({ title: 'Login Failed', description: 'Invalid email or password. Try: admin@staynest.in, owner@example.com, or tenant@example.com', variant: 'destructive' });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Name Required', description: 'Please enter your name', variant: 'destructive' });
      return;
    }
    const success = await signup(email, password, name);
    if (!success) {
      toast({ title: 'Signup Failed', description: 'Email already exists or invalid data', variant: 'destructive' });
    }
  };

  const handleRoleSelect = (role) => {
    selectRole(role);
    toast({ title: 'Welcome!', description: `Your account has been created as ${role.replace('_', ' ')}.` });
  };

  if (mode === 'role-select') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Role</h1>
            <p className="text-muted-foreground">Select how you want to use CoLiving</p>
          </div>
          <div className="grid gap-4">
            {roles.map(({ role, title, description, icon }) => (
              <button key={role} onClick={() => handleRoleSelect(role)} className="bg-card rounded-xl p-6 card-elevated text-left flex items-center gap-5 hover:border-primary border-2 border-transparent transition-all group">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Home
        </Link>
        <Card className="card-elevated">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>{mode === 'login' ? 'Sign in to access your dashboard' : 'Sign up to start finding your perfect space'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Please wait...</> : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              {mode === 'login' ? (
                <p className="text-muted-foreground text-sm">Don't have an account?{' '}<button onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">Sign up</button></p>
              ) : (
                <p className="text-muted-foreground text-sm">Already have an account?{' '}<button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">Sign in</button></p>
              )}
            </div>
            {mode === 'login' && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Demo accounts:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li><strong>Admin:</strong> admin@staynest.in</li>
                  <li><strong>Owner:</strong> owner@example.com</li>
                  <li><strong>Tenant:</strong> tenant@example.com</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">(Any password works)</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
