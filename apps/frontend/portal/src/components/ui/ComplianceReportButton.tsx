'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from './Button';
import { FileDown, Printer } from 'lucide-react';
import { useLanguage } from '../providers/LanguageProvider';

interface ComplianceReportProps {
    batch: any;
    telemetry: any[];
    alerts: any[];
    blockchain: any;
}

export function ComplianceReportButton({ batch, telemetry, alerts, blockchain }: ComplianceReportProps) {
    const { t } = useLanguage();

    const generatePDF = () => {
        const doc = new jsPDF();

        // --- HEADER ---
        doc.setFillColor(34, 197, 94); // Green Header
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("QUALITY & COMPLIANCE REPORT", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text("Global FoodTech Bridge • Blockchain Verified", 105, 30, { align: 'center' });

        // --- BATCH INFO ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Batch Identification", 14, 55);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const details = [
            [`Product:`, batch.product_type],
            [`Batch ID:`, batch.id],
            [`Manufactured:`, new Date(batch.created_at).toLocaleDateString()],
            [`Origin:`, `Lyon, France (Factory 001)`],
            [`Destination:`, `Dubai, UAE (Distribution Center)`]
        ];

        autoTable(doc, {
            startY: 60,
            body: details,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
        });

        // --- BLOCKCHAIN STATUS ---
        const startY = (doc as any).lastAutoTable.finalY + 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Blockchain Verification Status", 14, startY);

        const isSecured = blockchain.verified && !blockchain.violation;

        // Status Badge logic
        doc.setFillColor(isSecured ? 220 : 255, isSecured ? 252 : 230, isSecured ? 231 : 230); // Green or Red tint
        doc.rect(14, startY + 5, 180, 25, 'F');

        doc.setFontSize(14);
        doc.setTextColor(isSecured ? 21 : 185, isSecured ? 128 : 28, isSecured ? 61 : 28); // Text Color
        doc.text(isSecured ? "VERIFIED & SECURED" : "ATTENTION: COMPLIANCE FAILED", 20, startY + 18);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Transaction Hash: ${blockchain.txHash || 'Pending'}`, 20, startY + 26);

        // --- ALERTS TABLE ---
        const alertsY = startY + 40;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Temperature Violations & Alerts", 14, alertsY);

        if (alerts.length > 0) {
            const alertData = alerts.map(a => [
                new Date(a.created_at).toLocaleString(),
                a.type,
                a.message
            ]);

            autoTable(doc, {
                startY: alertsY + 5,
                head: [['Timestamp', 'Severity', 'Description']],
                body: alertData,
                headStyles: { fillColor: [220, 38, 38] },
                styles: { fontSize: 9 }
            });
        } else {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.text("No violations recorded. Transport conditions optimal.", 14, alertsY + 10);
        }

        // --- SIGNATURE AREA ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(150, 150, 150);
        doc.line(14, pageHeight - 40, 90, pageHeight - 40);
        doc.line(110, pageHeight - 40, 190, pageHeight - 40);

        doc.setFontSize(8);
        doc.text("Logistics Provider Signature", 14, pageHeight - 35);
        doc.text("Retailer Acceptance Signature", 110, pageHeight - 35);

        doc.text(`Generated on ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: 'center' });

        doc.save(`Compliance_Report_${batch.id.substring(0, 8)}.pdf`);
    };

    return (
        <Button onClick={generatePDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            {t('btn_download_report') || "Download Report"}
        </Button>
    );
}
