/**
 * What a spreadsheet exports: a header row, an identifier, a name, the SMILES
 * in the third column rather than the first, and four columns that have
 * nothing to do with chemistry.
 *
 * It is the sample that shows the two things the page never asks about — the
 * comma is found, and the structure column is found by parsing the cells — and
 * the one that shows what happens to the rest: `CHM-006` keeps its quoted name
 * holding a comma, every other column rides along as a field, and the CSV and
 * the SDF the page writes carry all of them back out.
 */
export const INVENTORY_SAMPLE = `ID,Name,SMILES,CAS,Batch,Supplier,Purity (%)
CHM-001,Aspirin,CC(=O)Oc1ccccc1C(=O)O,50-78-2,B-1042,Acme Fine Chemicals,99.4
CHM-002,Caffeine,CN1C=NC2=C1C(=O)N(C)C(=O)N2C,58-08-2,B-1043,Acme Fine Chemicals,98.1
CHM-003,Paracetamol,CC(=O)Nc1ccc(O)cc1,103-90-2,B-1044,Northern Reagents,99.9
CHM-004,Ibuprofen,CC(C)Cc1ccc(cc1)C(C)C(=O)O,15687-27-1,B-1045,Northern Reagents,97.6
CHM-005,Vanillin,COc1cc(C=O)ccc1O,121-33-5,B-1046,Northern Reagents,99.2
CHM-006,"Nicotine, (S)-",CN1CCC[C@H]1c1cccnc1,54-11-5,B-1047,Bertrand et Fils,95.0
CHM-007,Serotonin,NCCc1c[nH]c2ccc(O)cc12,50-67-9,B-1048,Bertrand et Fils,98.7
CHM-008,Quercetin,O=c1c(O)c(-c2ccc(O)c(O)c2)oc2cc(O)cc(O)c12,117-39-5,B-1049,Acme Fine Chemicals,96.3
CHM-009,Penicillin G,CC1(C)S[C@@H]2[C@H](NC(=O)Cc3ccccc3)C(=O)N2[C@H]1C(=O)O,61-33-6,B-1050,Acme Fine Chemicals,92.8
CHM-010,L-tryptophan,N[C@@H](Cc1c[nH]c2ccccc12)C(=O)O,73-22-3,B-1051,Bertrand et Fils,99.5
`;
