'use client';

import { useState, useEffect } from 'react';
import { createCompany, getCompanies, approveCompany, Company } from '@/lib/api';
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
import { Label } from '@/components/ui/label';
import { Plus, Building2, Truck, ShoppingCart, Loader2, CheckCircle2, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth, UserRole } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const { setCompanyId, setRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setIsLoading(true);
        const data = await getCompanies();
        setCompanies(data);
        setIsLoading(false);
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCreating(true);
        const formData = new FormData(e.currentTarget);

        await createCompany({
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            production_location: formData.get('production_location') as string || '',
        });

        setIsCreating(false);
        setOpen(false);
        loadCompanies();
    };



    const handleApprove = async (company: Company) => {
        setApprovingId(company.id);
        const success = await approveCompany(company.id);
        if (success) {
            setCompanies(companies.map(c => c.id === company.id ? { ...c, is_active: true } : c));
        }
        setApprovingId(null);
    };

    const handleLoginAs = (company: Company) => {
        setCompanyId(company.id);
        setRole(company.type as UserRole);
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
                    <h1 className="text-2xl font-bold tracking-tight">Companies & Onboarding</h1>
                    <p className="text-muted-foreground">Manage authorized ecosystem participants.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Company
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Company</DialogTitle>
                            <DialogDescription>
                                Create a profile and generate a custodial wallet.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" name="name" className="col-span-3" required placeholder="Organization Name" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <select
                                        id="type"
                                        name="type"
                                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        required
                                    >
                                        <option value="MANUFACTURER">Manufacturer</option>
                                        <option value="LOGISTICS">Logistics Provider</option>
                                        <option value="RETAILER">Retailer</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="location" className="text-right">Location</Label>
                                    <Input id="location" name="production_location" className="col-span-3" placeholder="City, Country" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Register
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Participants</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Wallet Address (Custodial)</TableHead>
                                    <TableHead>Actions</TableHead>
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
                                            No companies registered yet.
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
                                                            Approved
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
                                                            Approve
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="default" onClick={() => handleLoginAs(company)}>
                                                        <LogIn className="mr-1 h-3 w-3" />
                                                        Login As
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
