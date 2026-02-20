'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle, Bell, Shield, Bug, Droplets, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ALERTS = [
  { id: 1, type: 'critical', icon: AlertCircle, title: 'Dengue Outbreak Alert — Western Province', date: '2025-02-10', body: 'Increased dengue cases detected in Colombo, Gampaha, and Kalutara districts. Breeding index elevated above threshold. Take precautions: eliminate stagnant water, use mosquito nets, seek medical attention for high fever.', area: 'Western Province' },
  { id: 2, type: 'warning', icon: Bug, title: 'Leptospirosis Risk — Post-Flood Advisory', date: '2025-02-08', body: 'Following recent floods in Ratnapura district, leptospirosis risk is elevated. Avoid contact with flood water, wear protective footwear. Farmers and workers should take extra precautions.', area: 'Sabaragamuwa' },
  { id: 3, type: 'info', icon: Droplets, title: 'Water Quality Advisory — Kelani River Basin', date: '2025-02-05', body: 'Routine testing indicates elevated coliform levels in Kelani River downstream areas. Boil water before consumption if sourced from river or unprotected wells in affected GN divisions.', area: 'Colombo / Gampaha' },
  { id: 4, type: 'info', icon: Shield, title: 'HPV Vaccination Campaign — Schools', date: '2025-01-28', body: 'The National HPV Vaccination Programme for Grade 6 girls is ongoing. Please ensure consent forms are completed. Contact your nearest MOH office for information.', area: 'Nationwide' },
  { id: 5, type: 'warning', icon: AlertCircle, title: 'Food Recall — Contaminated Canned Fish', date: '2025-01-20', body: 'Batch XYZ-2025-001 of "Ocean Fresh" canned mackerel recalled due to suspected histamine contamination. Do not consume. Return to point of purchase.', area: 'Nationwide' },
  { id: 6, type: 'info', icon: Bell, title: 'Seasonal Flu Advisory', date: '2025-01-15', body: 'Seasonal influenza cases are rising. High-risk groups (elderly, children, pregnant women) should get vaccinated. Practice hand hygiene and respiratory etiquette.', area: 'Nationwide' },