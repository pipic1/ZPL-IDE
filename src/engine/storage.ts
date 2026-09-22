/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LabelProject } from '../types/zpl';

const STORAGE_KEY = 'zpl_studio_projects_v1';
const AUTOSAVE_KEY = 'zpl_studio_current_session';

export const BUILT_IN_TEMPLATES: { name: string; description: string; category: string; zpl: string }[] = [
  {
    name: 'Logistics Shipping Label (4x6")',
    category: 'Logistics',
    description: 'Standard 100x150mm shipping label with Code 128 barcode and tracking QR code',
    zpl: `^XA
^CI28
^PW812
^LL1218
^FO50,50
^GB712,1118,6,B,0^FS
^FO80,80
^GB652,100,100,B,0^FS
^FO100,110
^A0N,44,44
^FR
^FDEXPRESS LOGISTICS^FS
^FO80,220
^A0N,28,28
^FDSHIP TO:^FS
^FO80,260
^A0N,36,36
^FDJOHN DOE^FS
^FO80,310
^A0N,28,28
^FD100 MAIN STREET\\&SPRINGFIELD, IL 62701 - USA^FS
^FO80,390
^GB652,4,4,B,0^FS
^FO80,420
^A0N,26,26
^FDINTERNATIONAL TRACKING NUMBER:^FS
^FO80,460
^BY3,3,110
^BCN,110,Y,N,N
^FDEXP-789456123-US^FS
^FO80,630
^GB652,4,4,B,0^FS
^FO80,660
^BQN,2,6,M
^FDQA,https://zplstudio.app/track/EXP-789456123-US^FS
^FO270,680
^A0N,32,32
^FDELECTRONIC SIGNATURE^FS
^FO270,725
^A0N,24,24
^FDScan QR code to confirm delivery\\&and inspect parcel receipt.^FS
^FO80,910
^GB652,4,4,B,0^FS
^FO80,940
^A0N,24,24
^FDWeight: 4.25 KG  |  Service: PRIORITY NEXT DAY  |  Hub: ORD-01^FS
^XZ`,
  },
  {
    name: 'Hardware Asset Tag (2x1")',
    category: 'Manufacturing',
    description: 'Compact 50x25mm equipment label with high-density QR Code and Code 39',
    zpl: `^XA
^CI28
^PW406
^LL203
^FO20,20
^GB366,163,3,B,1^FS
^FO40,35
^BQN,2,3,M
^FDQA,ASSET-90442-DELL^FS
^FO150,35
^A0N,24,24
^FDIT ASSET MANAGEMENT^FS
^FO150,68
^A0N,20,20
^FDDell Latitude 7440^FS
^FO150,96
^A0N,18,18
^FDS/N: 8F29X14-US^FS
^FO150,130
^BY2,2,40
^B3N,N,35,N,N
^FD90442^FS
^XZ`,
  },
  {
    name: 'Retail Shelf & Price Tag',
    category: 'Retail',
    description: 'Shelf pricing tag with bold price callout and EAN/UPC barcode',
    zpl: `^XA
^CI28
^PW600
^LL300
^FO30,30
^GB540,240,4,B,2^FS
^FO50,50
^A0N,30,30
^FDORGANIC ARABICA COFFEE 250G^FS
^FO50,85
^A0N,20,20
^FDColumbian Origin - Artisan Roast^FS
^FO50,120
^GB500,2,2,B,0^FS
^FO50,140
^BY2,3,75
^BCN,75,Y,N,N
^FD3760123456789^FS
^FO360,130
^GB170,110,110,B,0^FS
^FO375,155
^A0N,64,64
^FR
^FD$4.95^FS
^FO380,225
^A0N,16,16
^FR
^FD$19.80 /kg^FS
^XZ`,
  },
  {
    name: 'Medical / Laboratory Specimen',
    category: 'Healthcare',
    description: 'Vial and specimen identification with QR code and patient ID alerts',
    zpl: `^XA
^CI28
^PW400
^LL240
^FO15,15
^GB370,210,3,B,1^FS
^FO30,30
^BQN,2,3,H
^FDQA,LAB-SERUM-2026-X89^FS
^FO130,30
^A0N,24,24
^FDBIO-ANALYSIS LAB^FS
^FO130,60
^A0N,22,22
^FDID: #8841-B9^FS
^FO130,90
^A0N,20,20
^FDDate: 09/22/2026 08:30^FS
^FO30,130
^GB340,2,2,B,0^FS
^FO30,145
^A0N,20,20
^FDEDTA TUBE - WHOLE BLOOD^FS
^FO30,175
^BY2,3,40
^BCN,35,Y,N,N
^FD8841B9^FS
^XZ`,
  },
];

export function getSavedProjects(): LabelProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProject(project: LabelProject): void {
  try {
    const projects = getSavedProjects();
    const existingIdx = projects.findIndex((p) => p.id === project.id);
    if (existingIdx >= 0) {
      projects[existingIdx] = { ...project, updatedAt: Date.now() };
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save project:', err);
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to delete project:', err);
  }
}

export function saveCurrentSession(zplCode: string): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, zplCode);
  } catch (err) {
    console.error('Failed to auto-save session:', err);
  }
}

export function getSavedSession(): string | null {
  try {
    return localStorage.getItem(AUTOSAVE_KEY);
  } catch {
    return null;
  }
}
