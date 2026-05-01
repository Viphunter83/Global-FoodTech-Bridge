'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Mail, Lock, Loader2, Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const getFriendlyError = (code: string) => {
        switch (code) {
            case 'auth/invalid-credential':
                return t('error_invalid_credential');
            case 'auth/user-not-found':
                return t('error_user_not_found');
            case 'auth/wrong-password':
                return t('error_wrong_password');
            case 'auth/too-many-requests':
                return t('error_too_many_requests');
            case 'auth/popup-closed-by-user':
                return t('error_popup_closed');
            default:
                return t('error_unexpected');
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            
            // Call our new secure session API
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            });

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
            const userCredential = await signInWithPopup(auth, provider);
            const idToken = await userCredential.user.getIdToken();
            
            // Call our new secure session API
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            });

            router.push('/dashboard');
        } catch (err: any) {
            console.error("Google Login Error:", err.code);
            setError(getFriendlyError(err.code));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg"
            >
                <div className="flex flex-col items-center mb-12 space-y-6">
                    <motion.div 
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <ShieldCheck className="h-10 w-10 relative z-10" />
                    </motion.div>
                    <div className="text-center space-y-2">
                        <h1 className="text-5xl font-serif font-black italic tracking-tighter text-foreground leading-none">
                            {t('login_title')}
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-1 w-1 rounded-full bg-primary/40" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{t('welcome_back')}</p>
                        </div>
                    </div>
                </div>

                <Card className="glass border-primary/10 shadow-2xl rounded-[3rem] overflow-hidden p-2">
                    <CardHeader className="p-8">
                        <Tabs defaultValue="email" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 rounded-2xl h-14 bg-muted/20 p-1.5 mb-10">
                                <TabsTrigger value="email" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
                                    <Mail className="w-3.5 h-3.5 mr-2" />
                                    Email
                                </TabsTrigger>
                                <TabsTrigger value="google" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
                                    <Globe className="w-3.5 h-3.5 mr-2" />
                                    Google
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="email" className="mt-0">
                                <form onSubmit={handleEmailLogin} className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('email_label')}</Label>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="name@globalfood.trade" 
                                                className="pl-12 h-14 rounded-2xl bg-muted/10 border-primary/5 focus:border-primary/20 focus:ring-0 transition-all text-sm font-bold placeholder:text-muted-foreground/20 placeholder:font-black placeholder:uppercase tracking-tight"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('password_label')}</Label>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <Input 
                                                id="password" 
                                                type="password" 
                                                className="pl-12 h-14 rounded-2xl bg-muted/10 border-primary/5 focus:border-primary/20 focus:ring-0 transition-all text-sm font-bold"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-destructive text-[10px] font-black uppercase tracking-widest bg-destructive/5 border border-destructive/10 p-5 rounded-2xl italic leading-relaxed"
                                        >
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle size={14} />
                                                {error}
                                            </div>
                                        </motion.div>
                                    )}
                                    <Button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : t('sign_in_email')}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="google" className="mt-0 text-center space-y-8">
                                <div className="p-10 bg-primary/[0.03] border border-primary/10 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-2000">
                                        <Globe size={100} />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-relaxed italic relative z-10">
                                        {t('admin_access_only')}
                                    </p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    disabled={loading}
                                    className="w-full h-16 rounded-[1.5rem] border-primary/20 hover:bg-primary/5 gap-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/5 transition-all active:scale-[0.98]"
                                    onClick={handleGoogleLogin}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin h-6 w-6" />
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
                                            {t('sign_in_google')}
                                        </>
                                    )}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardHeader>
                    <CardFooter className="p-10 pt-0">
                        <div className="w-full text-[9px] text-center text-muted-foreground/30 leading-relaxed uppercase font-black tracking-[0.3em] italic">
                            {t('service_agreement')}
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
