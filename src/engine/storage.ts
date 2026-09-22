/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LabelProject } from '../types/zpl';

const STORAGE_KEY = 'zpl_studio_projects_v1';
const AUTOSAVE_KEY = 'zpl_studio_current_session';

export const BUILT_IN_TEMPLATES: { name: string; description: string; category: string; zpl: string }[] = [
  {
    name: 'Logistique Transport (4x6")',
    category: 'Logistique',
    description: 'Bordereau expédition standard 100x150mm avec Code 128 et QR Code de suivi',
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
^FDDESTINATAIRE :^FS
^FO80,260
^A0N,36,36
^FDPIERRE PICARD^FS
^FO80,310
^A0N,28,28
^FD12 RUE DE LA PAIX\\&75002 PARIS - FRANCE^FS
^FO80,390
^GB652,4,4,B,0^FS
^FO80,420
^A0N,26,26
^FDNUMERO DE SUIVI INTERNATIONAL :^FS
^FO80,460
^BY3,3,110
^BCN,110,Y,N,N
^FDEXP-789456123-FR^FS
^FO80,630
^GB652,4,4,B,0^FS
^FO80,660
^BQN,2,6,M
^FDQA,https://zplstudio.app/track/EXP-789456123-FR^FS
^FO270,680
^A0N,32,32
^FDSIGNATURE ELECTRONIQUE^FS
^FO270,725
^A0N,24,24
^FDScannez le QR Code pour valider\\&la reception conforme du colis.^FS
^FO80,910
^GB652,4,4,B,0^FS
^FO80,940
^A0N,24,24
^FDPoids: 4.25 KG  |  Service: EXPRESS J+1  |  Tri: HUB-01^FS
^XZ`,
  },
  {
    name: 'Inventaire Matériel & Asset Tag (2x1")',
    category: 'Industrie',
    description: 'Étiquette compacte 50x25mm avec QR Code haute densité et Code 39',
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
^FDPARCS IT - ASSET TAG^FS
^FO150,68
^A0N,20,20
^FDDell Latitude 7440^FS
^FO150,96
^A0N,18,18
^FDS/N: 8F29X14-FR^FS
^FO150,130
^BY2,2,40
^B3N,N,35,N,N
^FD90442^FS
^XZ`,
  },
  {
    name: 'Prix Commerce & Rayonnage',
    category: 'Retail',
    description: 'Étiquette gondole magasin avec prix en gros caractères et EAN-13',
    zpl: `^XA
^CI28
^PW600
^LL300
^FO30,30
^GB540,240,4,B,2^FS
^FO50,50
^A0N,30,30
^FDCAFE PUR ARABICA BIO 250G^FS
^FO50,85
^A0N,20,20
^FDOrigine Colombie - Torrefaction Artisanale^FS
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
^FD4.95€^FS
^FO380,225
^A0N,16,16
^FR
^FD19.80 €/kg^FS
^XZ`,
  },
  {
    name: 'Échantillon Médical / Laboratoire',
    category: 'Santé',
    description: 'Identification tube à essai avec QR Code Datamatrix et alertes',
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
^FDBIO-ANALYSES LAB^FS
^FO130,60
^A0N,22,22
^FDID: #8841-B9^FS
^FO130,90
^A0N,20,20
^FDDate: 22/09/2026 08:30^FS
^FO30,130
^GB340,2,2,B,0^FS
^FO30,145
^A0N,20,20
^FDTUBE EDTA - SANG TOTAL^FS
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
    const list = getSavedProjects();
    const existingIndex = list.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      list[existingIndex] = project;
    } else {
      list.unshift(project);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save project:', err);
  }
}

export function deleteProject(id: string): void {
  try {
    const list = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to delete project:', err);
  }
}

export function saveCurrentSession(zpl: string): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, zpl);
  } catch {}
}

export function getSavedSession(): string | null {
  try {
    return localStorage.getItem(AUTOSAVE_KEY);
  } catch {
    return null;
  }
}
