'use client';

import { useState, useEffect } from 'react';
import { createCompany, getCompanies, approveCompany, Company } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Plus, Building2, Truck, ShoppingCart, Loader2, CheckCircle2, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth, UserRole } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function AdminCompaniesClient() {
    const t = useTranslations('Admin');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'MANUFACTURER', production_location: '' });
    const { setCompanyId, setRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setIsLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const data = await getCompanies(token);
            setCompanies(data);
        } catch (error) {
            console.error('Failed to load companies:', error);
            toast.error('Failed to load companies list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCreating(true);
        const token = await auth.currentUser?.getIdToken();

        try {
            const newCompany = await createCompany({
                name: formData.name,
                type: formData.type as 'MANUFACTURER' | 'LOGISTICS' | 'RETAILER',
                production_location: formData.production_location,
            }, token);

            if (newCompany) {
                toast.success(`Company ${newCompany.name} registered successfully`);
                setFormData({ name: '', type: 'MANUFACTURER', production_location: '' });
                setOpen(false);
                loadCompanies();
            } else {
                toast.error('Failed to register company. Please check your inputs.');
            }
        } catch (err) {
            console.error('Error creating company:', err);
            toast.error('An unexpected error occurred during registration.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleApprove = async (company: Company) => {
        setApprovingId(company.id);
        const token = await auth.currentUser?.getIdToken();
        try {
            const success = await approveCompany(company.id, token);
            if (success) {
                setCompanies(companies.map(c => c.id === company.id ? { ...c, is_active: true } : c));
                toast.success(`${company.name} has been approved.`);
            } else {
                toast.error(`Failed to approve ${company.name}.`);
            }
        } catch (err) {
            console.error('Error approving company:', err);
            toast.error('An error occurred during approval.');
        } finally {
            setApprovingId(null);
        }
    };

    const handleLoginAs = (company: Company) => {
        setCompanyId(company.id);
        setRole(company.type as UserRole);
        toast.info(t('btn_login_as') + ": " + company.name);
        router.push('/dashboard');
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'MANUFACTURER': return <Building2 className="h-4 w-4" />;
            case 'LOGISTICS': return <Truck className="h-4 w-4" />;
            case 'RETAILER': return <ShoppingCart className="h-4 w-4" />;
            default: return <Building2 className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('companies_title')}</h1>
                    <p className="text-muted-foreground">{t('companies_subtitle')}</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('add_company')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('register_new_company')}</DialogTitle>
                            <DialogDescription>
                                {t('register_description')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">{t('field_name')}</Label>
                                    <Input 
                                        id="name" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                        className="col-span-3" 
                                        required 
                                        placeholder={t('placeholder_org_name')} 
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">{t('field_type')}</Label>
                                    <div className="col-span-3">
                                        <Select 
                                            value={formData.type} 
                                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MANUFACTURER">{t('type_manufacturer')}</SelectItem>
                                                <SelectItem value="LOGISTICS">{t('type_logistics')}</SelectItem>
                                                <SelectItem value="RETAILER">{t('type_retailer')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="location" className="text-right">{t('field_location')}</Label>
                                    <Input 
                                        id="location" 
                                        value={formData.production_location} 
                                        onChange={(e) => setFormData({ ...formData, production_location: e.target.value })} 
                                        className="col-span-3" 
                                        placeholder={t('placeholder_location')} 
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('btn_register')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('registered_participants')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table_org')}</TableHead>
                                    <TableHead>{t('table_type')}</TableHead>
                                    <TableHead>{t('table_wallet')}</TableHead>
                                    <TableHead>{t('table_actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : companies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                            {t('no_companies')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    companies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell className="font-medium">
                                                <div>{company.name}</div>
                                                {company.production_location && (
                                                    <div className="text-xs text-muted-foreground">{company.production_location}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="flex w-fit gap-1">
                                                    {getTypeIcon(company.type)}
                                                    {company.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-gray-500">
                                                {company.wallet_address}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {company.is_active ? (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 h-9 px-3">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            {t('status_approved')}
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleApprove(company)}
                                                            disabled={approvingId === company.id}
                                                        >
                                                            {approvingId === company.id ? (
                                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                                                            )}
                                                            {t('btn_approve')}
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="default" onClick={() => handleLoginAs(company)}>
                                                        <LogIn className="mr-1 h-3 w-3" />
                                                        {t('btn_login_as')}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
