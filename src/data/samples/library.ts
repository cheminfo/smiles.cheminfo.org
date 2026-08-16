/**
 * A hundred molecules, written the way a `.smi` file writes them: the SMILES,
 * a blank, and the name — which may hold blanks of its own, so the line is not
 * counted in columns.
 *
 * It is here because five structures do not show what the page is for. A
 * hundred fill the table, make the row filter worth typing in, and give a
 * substructure query something to narrow: there are amides, esters, aromatic
 * nitrogens, halogens and sugars in it, so most patterns from the cheatsheet
 * hit something and none of them hits everything.
 */
export const LIBRARY_SAMPLE = String.raw`CCO ethanol
CC(C)O propan-2-ol
CCCCO butan-1-ol
OCCO ethylene glycol
OCC(O)CO glycerol
CC(=O)O acetic acid
OC(=O)C(O)C(O)C(=O)O tartaric acid
OC(=O)CC(O)(CC(=O)O)C(=O)O citric acid
CC(=O)C acetone
CCOCC diethyl ether
CCOC(C)=O ethyl acetate
ClC(Cl)Cl chloroform
ClCCl dichloromethane
CS(C)=O dimethyl sulfoxide
CC#N acetonitrile
CN(C)C=O dimethylformamide
C1CCOC1 tetrahydrofuran
C1CCCCC1 cyclohexane
CCCCCC hexane
c1ccccc1 benzene
Cc1ccccc1 toluene
Oc1ccccc1 phenol
Nc1ccccc1 aniline
c1ccc2ccccc2c1 naphthalene
c1ccc2cc3ccccc3cc2c1 anthracene
c1ccc2c(c1)ccc1ccccc12 phenanthrene
OC(=O)c1ccccc1 benzoic acid
CC(=O)Oc1ccccc1C(=O)O aspirin
CC(=O)Nc1ccc(O)cc1 paracetamol
CC(C)Cc1ccc(cc1)C(C)C(=O)O ibuprofen
CN1C=NC2=C1C(=O)N(C)C(=O)N2C caffeine
CN1CCC[C@H]1c1cccnc1 nicotine
CN1CC[C@]23c4c5ccc(O)c4O[C@H]2[C@@H](O)C=C[C@H]3[C@H]1C5 morphine
CC(N)Cc1ccccc1 amphetamine
NCCc1ccc(O)c(O)c1 dopamine
NCCc1c[nH]c2ccccc12 tryptamine
NCCc1c[nH]c2ccc(O)cc12 serotonin
N[C@@H](Cc1ccc(O)cc1)C(=O)O L-tyrosine
N[C@@H](Cc1ccccc1)C(=O)O L-phenylalanine
N[C@@H](Cc1c[nH]c2ccccc12)C(=O)O L-tryptophan
NCC(=O)O glycine
C[C@H](N)C(=O)O L-alanine
CC(C)[C@H](N)C(=O)O L-valine
CC(C)C[C@H](N)C(=O)O L-leucine
OC[C@H](N)C(=O)O L-serine
SC[C@H](N)C(=O)O L-cysteine
OC(=O)CC[C@H](N)C(=O)O L-glutamic acid
NC(=O)CC[C@H](N)C(=O)O L-glutamine
NCCCC[C@H](N)C(=O)O L-lysine
OC[C@H]1O[C@@H](O)[C@H](O)[C@@H](O)[C@@H]1O beta-D-glucopyranose
OC[C@H]1O[C@](O)(CO)[C@@H](O)[C@@H]1O beta-D-fructofuranose
OC[C@H]1O[C@H](O[C@]2(CO)O[C@H](CO)[C@@H](O)[C@@H]2O)[C@H](O)[C@@H](O)[C@@H]1O sucrose
O=C1C=CC(=O)C=C1 1,4-benzoquinone
CC1=CC(=O)C=CC1=O 2-methyl-1,4-benzoquinone
CCCCCCCCCCCCCCCC(=O)O palmitic acid
CCCCCCCCCCCCCCCCCC(=O)O stearic acid
CCCCCCCC/C=C\CCCCCCCC(=O)O oleic acid
CCCCCCCCCCCC(=O)OCC ethyl laurate
CC(C)=CCC/C(C)=C/CO geraniol
CC1=CC[C@H](CC1)C(C)=C limonene
COc1cc(C=O)ccc1O vanillin
O=Cc1ccccc1 benzaldehyde
COc1ccc(CC=C)cc1 estragole
Oc1ccc(cc1)/C=C/c1cc(O)cc(O)c1 resveratrol
O=c1c(O)c(-c2ccc(O)c(O)c2)oc2cc(O)cc(O)c12 quercetin
CC(=O)Nc1ccccc1 acetanilide
NC(=O)c1ccccc1 benzamide
CC(=O)N(C)C dimethylacetamide
CCN(CC)CC triethylamine
c1ccncc1 pyridine
c1cc[nH]c1 pyrrole
c1ccoc1 furan
c1ccsc1 thiophene
c1cnc[nH]1 imidazole
c1ccc2[nH]cnc2c1 benzimidazole
c1ccc2[nH]ccc2c1 indole
c1ccc2ncccc2c1 quinoline
Nc1ncnc2[nH]cnc12 adenine
Cc1c[nH]c(=O)[nH]c1=O thymine
Nc1cc[nH]c(=O)n1 cytosine
O=c1cc[nH]c(=O)[nH]1 uracil
CC(C)(C)c1ccc(O)cc1 4-tert-butylphenol
CC(C)(c1ccc(O)cc1)c1ccc(O)cc1 bisphenol A
O=[N+]([O-])c1ccccc1 nitrobenzene
[O-][N+](=O)c1ccc(cc1)[N+]([O-])=O 1,4-dinitrobenzene
Nc1ccc(cc1)S(N)(=O)=O sulfanilamide
CC1(C)S[C@@H]2[C@H](NC(=O)Cc3ccccc3)C(=O)N2[C@H]1C(=O)O penicillin G
CN1C(=O)CN=C(c2ccccc2)c2cc(Cl)ccc12 diazepam
CCOC(=O)c1ccccc1N ethyl anthranilate
CC(=O)c1ccccc1 acetophenone
CCOc1ccc(cc1)C(C)=O 4-ethoxyacetophenone
OCc1ccccc1 benzyl alcohol
ClCc1ccccc1 benzyl chloride
N#Cc1ccccc1 benzonitrile
FC(F)(F)c1ccccc1 trifluoromethylbenzene
Brc1ccccc1 bromobenzene
Ic1ccccc1 iodobenzene
CC(=O)[O-].[Na+] sodium acetate
[NH3+]CC(=O)[O-] glycine zwitterion
O water
`;
