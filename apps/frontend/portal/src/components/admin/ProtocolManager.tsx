'use client';

import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Plus, Edit, Trash2, ScrollText, CheckCircle2, ChevronRight, X 
} from 'lucide-react';
import { 
    getTemplates, createAdminTemplate, updateAdminTemplate, deleteAdminTemplate,
    SupplyChainTemplate, TemplateStep as Step
} from '@/lib/api';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export function ProtocolManager() {
    const t = useTranslations('Admin');
    const [templates, setTemplates] = useState<SupplyChainTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<SupplyChainTemplate> | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setIsLoading(true);
        const data = await getTemplates();
        setTemplates(data);
        setIsLoading(false);
    };

    const handleOpenCreate = () => {
        setEditingTemplate({
            name: '',
            description: '',
            is_active: true,
            steps: [{ name: 'Production', icon: 'package', required_cert: '' }]
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (template: SupplyChainTemplate) => {
        setEditingTemplate({ ...template });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingTemplate?.name) return;

        if (editingTemplate.id) {
            await updateAdminTemplate(editingTemplate.id, editingTemplate);
        } else {
            await createAdminTemplate(editingTemplate);
        }
        
        setIsDialogOpen(false);
        loadTemplates();
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('confirm_delete'))) {
            await deleteAdminTemplate(id);
            loadTemplates();
        }
    };

    const addStep = () => {
        if (!editingTemplate) return;
        const newSteps = [...(editingTemplate.steps || []), { name: '', icon: 'package', required_cert: '' }];
        setEditingTemplate({ ...editingTemplate, steps: newSteps as Step[] });
    };

    const removeStep = (index: number) => {
        if (!editingTemplate || !editingTemplate.steps) return;
        const newSteps = editingTemplate.steps.filter((_, i) => i !== index);
        setEditingTemplate({ ...editingTemplate, steps: newSteps });
    };

    const updateStep = (index: number, field: keyof Step, value: string) => {
        if (!editingTemplate || !editingTemplate.steps) return;
        const newSteps = [...editingTemplate.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setEditingTemplate({ ...editingTemplate, steps: newSteps });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-black italic tracking-tight text-slate-900">
                        {t('admin_protocols_title')}
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium tracking-tight">
                        {t('admin_protocols_subtitle')}
                    </p>
                </div>
                <Button 
                    onClick={handleOpenCreate}
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('admin_new_protocol')}
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100 h-16">
                            <TableHead className="px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin_protocol_name')}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin_protocol_steps')}</TableHead>
                            <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {templates.map((template) => (
                                <motion.tr 
                                    key={template.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50/50 transition-colors border-slate-50 group"
                                >
                                    <TableCell className="px-8">
                                        {template.is_active ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-wider">Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 border-slate-200 rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-wider">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-serif font-black text-slate-900 group-hover:text-primary transition-colors">{template.name}</span>
                                            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[300px]">{template.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {template.steps?.map((step, idx) => (
                                                <React.Fragment key={step.id || idx}>
                                                    <div className="h-2 w-2 rounded-full bg-primary/20" title={step.name} />
                                                    {idx < (template.steps?.length || 0) - 1 && (
                                                        <div className="w-2 h-[1px] bg-slate-100" />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            <span className="ml-2 text-[10px] font-black text-slate-300">{template.steps?.length || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleOpenEdit(template)}
                                                className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-none"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => template.id && handleDelete(template.id)}
                                                className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all shadow-none text-slate-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl p-0 bg-slate-50 border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <div className="flex h-[80vh]">
                        {/* Sidebar */}
                        <div className="w-1/3 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
                            
                            <div className="relative z-10">
                                <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full px-4 mb-6 font-black text-[9px] tracking-widest uppercase">
                                    {editingTemplate?.id ? 'System Update' : 'New Blueprint'}
                                </Badge>
                                <h2 className="text-3xl font-serif font-black italic mb-4 leading-tight">
                                    {editingTemplate?.id ? t('admin_edit_protocol') : t('admin_new_protocol')}
                                </h2>
                                <p className="text-white/40 text-sm font-medium leading-relaxed">
                                    Configure granular compliance steps, mandatory certifications and validation rules for this trade protocol.
                                </p>
                            </div>

                            <div className="relative z-10 flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                    <ScrollText className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Status</span>
                                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                                        Polygon Mainnet Ready
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="flex-1 p-12 bg-white flex flex-col">
                            <div className="flex-grow overflow-y-auto pr-4 space-y-8 scrollbar-hide">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('admin_protocol_name')}</Label>
                                    <Input 
                                        value={editingTemplate?.name || ''} 
                                        onChange={(e) => setEditingTemplate(prev => ({ ...prev!, name: e.target.value }))}
                                        placeholder="e.g. Premium Angus Beef Protocol"
                                        className="h-14 border-slate-100 bg-slate-50 rounded-2xl px-6 font-bold text-slate-900 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('admin_protocol_desc')}</Label>
                                    <Textarea 
                                        value={editingTemplate?.description || ''} 
                                        onChange={(e) => setEditingTemplate(prev => ({ ...prev!, description: e.target.value }))}
                                        placeholder="Enter detailed protocol logic..."
                                        className="min-h-[100px] border-slate-100 bg-slate-50 rounded-2xl p-6 font-medium text-slate-600 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('admin_protocol_steps')}</Label>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={addStep}
                                            className="h-8 rounded-lg text-[9px] font-black border-slate-200 hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-wider px-3"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add Step
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {editingTemplate?.steps?.map((step, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group/step"
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <Input 
                                                        placeholder="Step Name"
                                                        value={step.name}
                                                        onChange={(e) => updateStep(idx, 'name', e.target.value)}
                                                        className="h-10 border-none bg-transparent shadow-none font-bold text-slate-900 p-0"
                                                    />
                                                    <Input 
                                                        placeholder="Required Certificate (ID)"
                                                        value={step.required_cert}
                                                        onChange={(e) => updateStep(idx, 'required_cert', e.target.value)}
                                                        className="h-10 border-none bg-transparent shadow-none font-medium text-primary text-[11px] p-0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/step:opacity-100 transition-opacity">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => removeStep(idx)}
                                                        className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                                <Button 
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200"
                                    onClick={handleSave}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                    {t('admin_save_protocol')}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-slate-50 flex items-center justify-center p-0"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    <X className="h-5 w-5 text-slate-400" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
