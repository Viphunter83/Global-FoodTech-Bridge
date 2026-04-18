'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const getFriendlyError = (code: string) => {
        switch (code) {
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please try again.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/too-many-requests':
                return 'Account temporarily locked due to many failed attempts. Try later.';
            case 'auth/popup-closed-by-user':
                return 'Login cancelled.';
            default:
                return 'An unexpected authentication error occurred.';
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Login Error:", err.code);
            setError(getFriendlyError(err.code));
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, provider);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Google Login Error:", err.code);
            setError(getFriendlyError(err.code));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-8 space-y-4">
                    <div className="p-4 rounded-3xl premium-gradient text-white">
                        <ShieldCheck className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-center">{t('auth_login_title')}</h1>
                    <p className="text-muted-foreground text-center">{t('auth_welcome_back')}</p>
                </div>

                <Card className="glass border-primary/10 shadow-2xl overflow-hidden">
                    <CardHeader className="pb-0">
                        <Tabs defaultValue="email" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 bg-primary/5 p-1">
                                <TabsTrigger value="email" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Email
                                </TabsTrigger>
                                <TabsTrigger value="google" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Google
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="email" className="mt-6">
                                <form onSubmit={handleEmailLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('auth_email_label')}</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="name@company.com" 
                                                className="pl-10 h-12 rounded-xl"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">{t('auth_password_label')}</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="password" 
                                                type="password" 
                                                className="pl-10 h-12 rounded-xl"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    {error && <p className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg">{error}</p>}
                                    <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl premium-gradient font-bold">
                                        {loading ? <Loader2 className="animate-spin" /> : t('auth_sign_in_email')}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="google" className="mt-6 text-center space-y-6">
                                <p className="text-sm text-muted-foreground py-4">
                                    {t('auth_admin_access_only')}
                                </p>
                                <Button 
                                    variant="outline" 
                                    disabled={loading}
                                    className="w-full h-14 rounded-xl border-primary/20 hover:bg-primary/5 gap-3 font-bold"
                                    onClick={handleGoogleLogin}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="currentColor"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            {t('auth_sign_in_google')}
                                        </>
                                    )}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardHeader>
                    <CardFooter className="flex flex-col space-y-4 pt-8">
                        <div className="text-xs text-center text-muted-foreground/60 leading-relaxed italic">
                            By continuing, you agree to our professional service agreement and data protection protocols.
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
