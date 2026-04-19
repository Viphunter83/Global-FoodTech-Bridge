'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from './button';
import { FileDown, Printer, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ComplianceReportProps {
    batch: any;
    telemetry: any[];
    alerts: any[];
    blockchain: any;
}

export function ComplianceReportButton({ batch, telemetry, alerts, blockchain }: ComplianceReportProps) {
    const t = useTranslations('Common');
    const tTracking = useTranslations('Tracking');
    const tBatch = useTranslations('Batch');

    const generatePDF = () => {
        const doc = new jsPDF();

        // --- HEADER ---
        doc.setFillColor(15, 23, 42); // Navy Dark Header
        doc.rect(0, 0, 210, 50, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text("GLOBAL FOODTECH BRIDGE", 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("BEYOND TRANSPARENCY: BLOCKCHAIN & IOT AUDIT PROTOCOL", 105, 35, { align: 'center' });

        // --- BATCH INFO ---
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("1. BATCH PASSPORT DATA", 14, 65);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const details = [
            [`ID:`, batch.id.toUpperCase()],
            [`Product:`, batch.product_type.replace(/_/g, ' ')],
            [`Initialization Date:`, new Date(batch.created_at).toLocaleString()],
            [`Protocol Magnitude:`, `${batch.batch_size} ${batch.unit_of_measure}`],
            [`Distributed Ledger:`, `Polygon Mainnet (Public)`]
        ];

        autoTable(doc, {
            startY: 70,
            body: details,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 100, 100] } }
        });

        // --- BLOCKCHAIN STATUS ---
        const startY = (doc as any).lastAutoTable.finalY + 15;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("2. CRYPTOGRAPHIC PROOF", 14, startY);

        const isSecured = blockchain.verified && !blockchain.violation;

        // Status Badge logic
        doc.setFillColor(isSecured ? 236 : 254, isSecured ? 253 : 242, isSecured ? 245 : 242); // Subtle Gradient
        doc.setDrawColor(isSecured ? 16 : 239, isSecured ? 185 : 68, isSecured ? 129 : 68);
        doc.rect(14, startY + 5, 182, 30, 'FD');

        doc.setFontSize(12);
        doc.setTextColor(isSecured ? 6 : 153, isSecured ? 95 : 27, isSecured ? 70 : 27);
        doc.text(isSecured ? "STATUS: AUTHENTICITY SECURED" : "STATUS: COMPLIANCE BREACH RECORDED", 20, startY + 18);

        doc.setFontSize(8);
        doc.setFont('courier', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Transaction Hash: ${blockchain.txHash || 'Pending Verification'}`, 20, startY + 28);

        // --- TELEMETRY / ALERTS ---
        const alertsY = startY + 45;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("3. ENVIRONMENTAL TELEMETRY AUDIT", 14, alertsY);

        if (alerts.length > 0) {
            const alertData = alerts.map(a => [
                new Date(a.created_at).toLocaleString(),
                a.type.toUpperCase(),
                a.message
            ]);

            autoTable(doc, {
                startY: alertsY + 5,
                head: [['TIMESTAMP', 'PROTOCOL SEVERITY', 'DISCRIPTION']],
                body: alertData,
                headStyles: { fillColor: [239, 68, 68], fontSize: 9, fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 3 },
                alternateRowStyles: { fillColor: [250, 250, 250] }
            });
        } else {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text("No environmental deviations recorded. Cold chain remained within optimal protocol ranges.", 14, alertsY + 10);
        }

        // --- FOOTER / SIGNATURES ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 50, 90, pageHeight - 50);
        doc.line(120, pageHeight - 50, 196, pageHeight - 50);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text("LOGISTICS AUDITOR", 14, pageHeight - 44);
        doc.text("RECEIVING OFFICER", 120, pageHeight - 44);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text("Authorized Digital Signature Signature Required", 14, pageHeight - 40);
        doc.text("Verification of Custody & Document Review", 120, pageHeight - 40);

        doc.setFontSize(7);
        doc.text(`DOCUMENT ID: ${batch.id.substring(0, 12).toUpperCase()} | GENERATED: ${new Date().toISOString()}`, 105, pageHeight - 10, { align: 'center' });

        doc.save(`GFTB_Compliance_${batch.id.substring(0, 8)}.pdf`);
    };

    return (
        <Button onClick={generatePDF} className="h-16 px-8 bg-foreground hover:bg-black text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] gap-3">
            <FileDown className="h-5 w-5" />
            {t('btn_download_report')}
        </Button>
    );
}
