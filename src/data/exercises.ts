import type { Exercise, ExerciseSet } from '../exercises/types.ts';
import { sortByDifficulty } from '../exercises/validate.ts';

/**
 * The two sets this site was built to replace, taken from the cheminfo
 * visualizer views they ran in before. Every structure was re-derived from the
 * original openchemlib idCode and kept only if it survives being written as a
 * SMILES and read back — an exercise whose own answer does not round trip
 * cannot be marked fairly.
 *
 * No level is written down here: `levelOf` reads it off the molecule, so a set
 * a teacher assembles from their own molecules is coloured exactly like these.
 * Neither is the order — `sortByDifficulty` puts the small structures first, so
 * these lists are written in whatever order they arrived in.
 *
 * An id is a letter and a number, not the name of the molecule: a link naming
 * thirty questions carries thirty of them, and `write-3-4-dimethoxyphenethyl-
 * amine` spent thirty characters saying what the page already draws. The letter
 * says which set it came from (`w` write, `d` draw, `s` SMARTS) and the number
 * is where it was added, so a molecule appended later takes the next one and
 * every link handed out before it keeps working.
 */
const MOLECULE_TO_SMILES: Exercise[] = [
  {
    id: 'w1',
    kind: 'write',
    title: '3,4-Dimethoxyphenethylamine',
    smiles: 'COc(ccc(CCN)c1)c1OC',
  },
  {
    id: 'w2',
    kind: 'write',
    title: 'Octopamine',
    smiles: 'NCC(c(cc1)ccc1O)O',
  },
  {
    id: 'w3',
    kind: 'write',
    title: '4-Methylphenylisobutylamine',
    smiles: 'CCC(Cc1ccc(C)cc1)N',
  },
  {
    id: 'w4',
    kind: 'write',
    title: 'Malonic acid',
    smiles: 'OC(CC(O)=O)=O',
  },
  {
    id: 'w5',
    kind: 'write',
    title: 'Bronidox',
    smiles: 'O=N(C1(COCOC1)Br)=O',
  },
  {
    id: 'w6',
    kind: 'write',
    title: 'Cyclododecane',
    smiles: 'C1CCCCCCCCCCC1',
  },
  {
    id: 'w7',
    kind: 'write',
    title: '4-Methylmethamphetamine',
    smiles: 'CC(Cc1ccc(C)cc1)NC',
  },
  {
    id: 'w8',
    kind: 'write',
    title: '1,2-Naphthoquinone',
    smiles: 'O=C(C=Cc1c2cccc1)C2=O',
  },
  {
    id: 'w9',
    kind: 'write',
    title: 'Methylmalonic acid',
    smiles: 'CC(C(O)=O)C(O)=O',
  },
  {
    id: 'w10',
    kind: 'write',
    title: '4-Vinylcyclohexene',
    smiles: 'C=CC1CC=CCC1',
  },
  {
    id: 'w11',
    kind: 'write',
    title: 'O-Phenylenediamine',
    smiles: 'Nc(cccc1)c1N',
  },
  {
    id: 'w12',
    kind: 'write',
    title: 'P-Anisidine',
    smiles: 'COc(cc1)ccc1N',
  },
  {
    id: 'w13',
    kind: 'write',
    title: 'Nifene',
    smiles: 'Fc1ncccc1OCC1NCC=C1',
  },
  {
    id: 'w14',
    kind: 'write',
    title: '2-Furoic acid',
    smiles: 'OC(c1ccc[o]1)=O',
  },
  {
    id: 'w15',
    kind: 'write',
    title: 'Coumarin',
    smiles: 'O=C1Oc(cccc2)c2C=C1',
  },
  {
    id: 'w16',
    kind: 'write',
    title: 'Pinacolone',
    smiles: 'CC(C)(C)C(C)=O',
  },
  {
    id: 'w17',
    kind: 'write',
    title: 'Methylhexanamine',
    smiles: 'CCC(C)CC(C)N',
  },
  {
    id: 'w18',
    kind: 'write',
    title: '8-Aminoquinoline',
    smiles: 'Nc1cccc2c1nccc2',
  },
  {
    id: 'w19',
    kind: 'write',
    title: 'Tetrachloroethylene',
    smiles: 'ClC(Cl)=C(Cl)Cl',
  },
  {
    id: 'w20',
    kind: 'write',
    title: 'Tetramethylammonium chloride',
    smiles: 'C[N+](C)(C)C.[Cl-]',
  },
  {
    id: 'w21',
    kind: 'write',
    title: 'Ginkgotoxin',
    smiles: 'Cc1ncc(CO)c(COC)c1O',
  },
  {
    id: 'w22',
    kind: 'write',
    title: 'Hexane-2,5-dione',
    smiles: 'CC(CCC(C)=O)=O',
  },
  {
    id: 'w23',
    kind: 'write',
    title: '2-Pyridone',
    smiles: 'O=C1NC=CC=C1',
  },
  {
    id: 'w24',
    kind: 'write',
    title: 'Kojic acid',
    smiles: 'OCC(OC=C1O)=CC1=O',
  },
  {
    id: 'w25',
    kind: 'write',
    title: '1,3-Dimethyl-2-imidazolidinone',
    smiles: 'CN(CCN1C)C1=O',
  },
  {
    id: 'w26',
    kind: 'write',
    title: 'Isoamyl acetate',
    smiles: 'CC(C)CCOC(C)=O',
  },
  {
    id: 'w27',
    kind: 'write',
    title: '3,10-Dihydroxydecanoic acid',
    smiles: 'OCCCCCCCC(CC(O)=O)O',
  },
  {
    id: 'w28',
    kind: 'write',
    title: 'Oxamide',
    smiles: 'NC(C(N)=O)=O',
  },
  {
    id: 'w29',
    kind: 'write',
    title: 'Butyl nitrate',
    smiles: 'CCCCON(=O)=O',
  },
  {
    id: 'w30',
    kind: 'write',
    title: 'Tris(2-aminoethyl)amine',
    smiles: 'NCCN(CCN)CCN',
  },
  {
    id: 'w31',
    kind: 'write',
    title: 'Mutagen X',
    smiles: 'OC(C(C(Cl)Cl)=C1Cl)OC1=O',
  },
  {
    id: 'w32',
    kind: 'write',
    title: '1,3,3,3-Tetrafluoropropene',
    smiles: 'FC(C=CF)(F)F',
  },
  {
    id: 'w33',
    kind: 'write',
    title: '4-Methylamphetamine',
    smiles: 'CC(Cc1ccc(C)cc1)N',
  },
  {
    id: 'w34',
    kind: 'write',
    title: 'Morphan',
    smiles: 'C(C1)CC2NCCC1C2',
  },
  {
    id: 'w35',
    kind: 'write',
    title: '2-Aminopyridine',
    smiles: 'Nc1ncccc1',
  },
  {
    id: 'w36',
    kind: 'write',
    title: '3-Aminobenzamide',
    smiles: 'NC(c1cc(N)ccc1)=O',
  },
  {
    id: 'w37',
    kind: 'write',
    title: 'Nonanal',
    smiles: 'CCCCCCCCC=O',
  },
  {
    id: 'w38',
    kind: 'write',
    title: 'Bamethan',
    smiles: 'CCCCNCC(c(cc1)ccc1O)O',
  },
  {
    id: 'w39',
    kind: 'write',
    title: '4-Fluorobenzoic acid',
    smiles: 'OC(c(cc1)ccc1F)=O',
  },
  {
    id: 'w40',
    kind: 'write',
    title: 'Oxotremorine',
    smiles: 'O=C1N(CC#CCN2CCCC2)CCC1',
  },
  {
    id: 'w41',
    kind: 'write',
    title: '3-Methyl-3-pentanol',
    smiles: 'CCC(C)(CC)O',
  },
  {
    id: 'w42',
    kind: 'write',
    title: 'Fructone',
    smiles: 'CCOC(CC1(C)OCCO1)=O',
  },
  {
    id: 'w43',
    kind: 'write',
    title: 'Normetanephrine',
    smiles: 'COc(cc(C(CN)O)cc1)c1O',
  },
  {
    id: 'w44',
    kind: 'write',
    title: 'Streptolidine',
    smiles: 'NCC(C1NC(N)=NC1C(O)=O)O',
  },
  {
    id: 'w45',
    kind: 'write',
    title: 'Salicylamide',
    smiles: 'NC(c(cccc1)c1O)=O',
  },
  {
    id: 'w46',
    kind: 'write',
    title: 'MDAT',
    smiles: 'NC(CCc1c2)Cc1cc1c2OCO1',
  },
  {
    id: 'w47',
    kind: 'write',
    title: 'Dichlorodifluoromethane',
    smiles: 'FC(F)(Cl)Cl',
  },
  {
    id: 'w48',
    kind: 'write',
    title: '2,2,4,4-Tetramethyl-1,3-cyclobutanediol',
    smiles: 'CC(C)(C(C1(C)C)O)C1O',
  },
  {
    id: 'w49',
    kind: 'write',
    title: 'Methyprylon',
    smiles: 'CCC(CC)(C(C(C)CN1)=O)C1=O',
  },
  {
    id: 'w50',
    kind: 'write',
    title: 'Hydralazine',
    smiles: 'NNc1nncc2c1cccc2',
  },
];

const SMILES_TO_MOLECULE: Exercise[] = [
  {
    id: 'd1',
    kind: 'draw',
    title: '5-Methoxysalicylic acid',
    smiles: 'COc(cc1)cc(C(O)=O)c1O',
  },
  {
    id: 'd2',
    kind: 'draw',
    title: 'Malic acid',
    smiles: 'OC(CC(O)=O)C(O)=O',
  },
  {
    id: 'd3',
    kind: 'draw',
    title: 'Bis-tris methane',
    smiles: 'OCCN(CCO)C(CO)(CO)CO',
  },
  {
    id: 'd4',
    kind: 'draw',
    title: '4-Anisaldehyde',
    smiles: 'COc1ccc(C=O)cc1',
  },
  {
    id: 'd5',
    kind: 'draw',
    title: 'Pentyl pentanoate',
    smiles: 'CCCCCOC(CCCC)=O',
  },
  {
    id: 'd6',
    kind: 'draw',
    title: 'Carvone',
    smiles: 'CC(C(CC=C1C)CC1=O)=C',
  },
  {
    id: 'd7',
    kind: 'draw',
    title: 'Mexiletine',
    smiles: 'CC(COc1c(C)cccc1C)N',
  },
  {
    id: 'd8',
    kind: 'draw',
    title: '4-Hydroxy-TEMPO',
    smiles: 'CC(C)(CC(CC1(C)C)O)N1[O]',
  },
  {
    id: 'd9',
    kind: 'draw',
    title: 'Hexafluoroacetone',
    smiles: 'O=C(C(F)(F)F)C(F)(F)F',
  },
  {
    id: 'd10',
    kind: 'draw',
    title: 'Isonicotinamide',
    smiles: 'NC(c1ccncc1)=O',
  },
  {
    id: 'd11',
    kind: 'draw',
    title: 'Guanine',
    smiles: 'NC(NC1=O)=Nc2c1nc[nH]2',
  },
  {
    id: 'd12',
    kind: 'draw',
    title: 'Trans-3-Methyl-2-hexenoic acid',
    smiles: 'CCC/C(C)=C/C(O)=O',
  },
  {
    id: 'd13',
    kind: 'draw',
    title: 'Starlicide',
    smiles: 'Cc(ccc(N)c1)c1Cl',
  },
  {
    id: 'd14',
    kind: 'draw',
    title: 'Ammonium hydroxide',
    smiles: '[NH4+].[OH-]',
  },
  {
    id: 'd15',
    kind: 'draw',
    title: 'Hydroquinone',
    smiles: 'Oc(cc1)ccc1O',
  },
  {
    id: 'd16',
    kind: 'draw',
    title: '3-Methylbutanoic acid',
    smiles: 'CC(C)CC(O)=O',
  },
  {
    id: 'd17',
    kind: 'draw',
    title: 'Cumene',
    smiles: 'CC(C)c1ccccc1',
  },
  {
    id: 'd18',
    kind: 'draw',
    title: 'Phenol',
    smiles: 'Oc1ccccc1',
  },
  {
    id: 'd19',
    kind: 'draw',
    title: 'Metaldehyde',
    smiles: 'CC1OC(C)OC(C)OC(C)O1',
  },
  {
    id: 'd20',
    kind: 'draw',
    title: 'Ammonium fluoride',
    smiles: '[NH4+].[F-]',
  },
  {
    id: 'd21',
    kind: 'draw',
    title: '1-Decyne',
    smiles: 'CCCCCCCCC#C',
  },
  {
    id: 'd22',
    kind: 'draw',
    title: 'Meldonium',
    smiles: 'C[N+](C)(C)NCCC([O-])=O',
  },
  {
    id: 'd23',
    kind: 'draw',
    title: 'Phthalazine',
    smiles: 'c(cc1)cc2c1cnnc2',
  },
  {
    id: 'd24',
    kind: 'draw',
    title: 'Dimethyl acetylenedicarboxylate',
    smiles: 'COC(C#CC(OC)=O)=O',
  },
  {
    id: 'd25',
    kind: 'draw',
    title: 'Sebacoyl chloride',
    smiles: 'O=C(CCCCCCCCC(Cl)=O)Cl',
  },
  {
    id: 'd26',
    kind: 'draw',
    title: 'Tropic acid',
    smiles: 'OCC(C(O)=O)c1ccccc1',
  },
  {
    id: 'd27',
    kind: 'draw',
    title: '6-Methyl-MDA',
    smiles: 'CC(Cc(c(C)c1)cc2c1OCO2)N',
  },
  {
    id: 'd28',
    kind: 'draw',
    title: 'Proline',
    smiles: 'OC(C1NCCC1)=O',
  },
  {
    id: 'd29',
    kind: 'draw',
    title: 'Triethylcholine',
    smiles: 'CC[N+](CC)(CC)CCO',
  },
  {
    id: 'd30',
    kind: 'draw',
    title: 'Sotolon',
    smiles: 'CC(C(C)=C1O)OC1=O',
  },
  {
    id: 'd31',
    kind: 'draw',
    title: 'Dopamine',
    smiles: 'NCCc(cc1)cc(O)c1O',
  },
  {
    id: 'd32',
    kind: 'draw',
    title: 'Isobutyric acid',
    smiles: 'CC(C)C(O)=O',
  },
  {
    id: 'd33',
    kind: 'draw',
    title: 'Kairine',
    smiles: 'CN(CCCc1ccc2)c1c2O',
  },
  {
    id: 'd34',
    kind: 'draw',
    title: 'P-Anisidine',
    smiles: 'COc(cc1)ccc1N',
  },
  {
    id: 'd35',
    kind: 'draw',
    title: 'Cyanuric fluoride',
    smiles: 'Fc1nc(F)nc(F)n1',
  },
  {
    id: 'd36',
    kind: 'draw',
    title: 'Hexazine',
    smiles: 'n1nnnnn1',
  },
  {
    id: 'd37',
    kind: 'draw',
    title: 'Amyl nitrate',
    smiles: 'CCCCCO[N+]([O-])=O',
  },
  {
    id: 'd38',
    kind: 'draw',
    title: 'Norbornene',
    smiles: 'C1CC2CC1C=C2',
  },
  {
    id: 'd39',
    kind: 'draw',
    title: 'Trimethadione',
    smiles: 'CC(C)(C(N1C)=O)OC1=O',
  },
  {
    id: 'd40',
    kind: 'draw',
    title: '3-Methylpyridine',
    smiles: 'Cc1cccnc1',
  },
  {
    id: 'd41',
    kind: 'draw',
    title: 'Camphene',
    smiles: 'CC(C)(C1CC2CC1)C2=C',
  },
  {
    id: 'd42',
    kind: 'draw',
    title: '1-Ethyl-3-methylimidazolium chloride',
    smiles: 'CC[n]1c[n+](C)cc1.[Cl-]',
  },
  {
    id: 'd43',
    kind: 'draw',
    title: 'Peroxyacetyl nitrate',
    smiles: 'CC(OO[N+]([O-])=O)=O',
  },
  {
    id: 'd44',
    kind: 'draw',
    title: 'Methylpyridinium',
    smiles: 'C[n+]1ccccc1',
  },
  {
    id: 'd45',
    kind: 'draw',
    title: 'Gabaculine',
    smiles: 'NC(C1)C=CC=C1C(O)=O',
  },
  {
    id: 'd46',
    kind: 'draw',
    title: 'Cyanuric acid',
    smiles: 'O=C(NC(N1)=O)NC1=O',
  },
  {
    id: 'd47',
    kind: 'draw',
    title: 'HA-966',
    smiles: 'NC(CCN1O)C1=O',
  },
  {
    id: 'd48',
    kind: 'draw',
    title: 'Myristic acid',
    smiles: 'CCCCCCCCCCCCCC(O)=O',
  },
  {
    id: 'd49',
    kind: 'draw',
    title: '1.1.1-Propellane',
    smiles: 'C1C2(C3)C13C2',
  },
  {
    id: 'd50',
    kind: 'draw',
    title: 'Iproheptine',
    smiles: 'CC(C)CCCC(C)NC(C)C',
  },
];

/**
 * Query exercises: a pattern is asked for and marked by running it, not by
 * comparing it to a model answer. There is always more than one right SMARTS,
 * so what a set of molecules on either side of the line does is exactly what a
 * string comparison cannot.
 *
 * Every solution below was checked against openchemlib before it shipped —
 * its SMARTS support is real but partial, and a hint pointing at a primitive
 * it does not implement would be worse than no hint.
 */
const PATTERNS: Exercise[] = [
  {
    id: 's1',
    kind: 'smarts',
    title: 'Find the alcohols',
    description:
      'Write a [[SMARTS]] that matches every alcohol below and none of the others. An ether oxygen carries no hydrogen, and the oxygen of an acid is not an alcohol either.',
    hints: [
      'A [[bracket atom]] in SMARTS may demand a hydrogen count: [OH].',
      'Demand the neighbour too — an acid’s OH hangs off a trigonal carbon, an alcohol’s off a tetrahedral one.',
      'Try [CX4][OX2H].',
    ],
    cases: [
      { smiles: 'CCO', shouldMatch: true, label: 'ethanol' },
      { smiles: 'CC(C)O', shouldMatch: true, label: 'propan-2-ol' },
      { smiles: 'OCCO', shouldMatch: true, label: 'ethylene glycol' },
      { smiles: 'CCOCC', shouldMatch: false, label: 'diethyl ether' },
      { smiles: 'CC(=O)O', shouldMatch: false, label: 'acetic acid' },
      { smiles: 'c1ccccc1O', shouldMatch: false, label: 'phenol' },
    ],
  },
  {
    id: 's2',
    kind: 'smarts',
    title: 'Find the carboxylic acids',
    description:
      'Match the carboxylic acids and leave the esters, the aldehydes and the ketones alone. All four carry a C=O, so the C=O on its own will not do it.',
    hints: [
      'What an acid has and an ester has not is a hydrogen on the second oxygen.',
      'Write the carbonyl and the hydroxyl in one pattern.',
      'Try [CX3](=O)[OX2H1].',
    ],
    cases: [
      { smiles: 'CC(=O)O', shouldMatch: true, label: 'acetic acid' },
      { smiles: 'OC(=O)c1ccccc1', shouldMatch: true, label: 'benzoic acid' },
      { smiles: 'OC(=O)CCC(=O)O', shouldMatch: true, label: 'succinic acid' },
      { smiles: 'CC(=O)OC', shouldMatch: false, label: 'methyl acetate' },
      { smiles: 'CC=O', shouldMatch: false, label: 'acetaldehyde' },
      { smiles: 'CC(=O)C', shouldMatch: false, label: 'acetone' },
    ],
  },
  {
    id: 's3',
    kind: 'smarts',
    title: 'Find the aromatic rings',
    description:
      'Lowercase is not just a spelling in SMARTS — it is a condition. Match everything with an [[aromatic]] ring and nothing else.',
    hints: [
      'A lowercase atom in SMARTS means "aromatic".',
      'You do not need to spell the whole ring out.',
      'Try a, the aromatic wildcard, or c1ccccc1 for a benzene ring specifically.',
    ],
    cases: [
      { smiles: 'c1ccccc1', shouldMatch: true, label: 'benzene' },
      { smiles: 'Cc1ccccc1', shouldMatch: true, label: 'toluene' },
      { smiles: 'c1ccc2ccccc2c1', shouldMatch: true, label: 'naphthalene' },
      { smiles: 'C1CCCCC1', shouldMatch: false, label: 'cyclohexane' },
      { smiles: 'CCCCCC', shouldMatch: false, label: 'hexane' },
      { smiles: 'C1=CCCCC1', shouldMatch: false, label: 'cyclohexene' },
    ],
  },
  {
    id: 's4',
    kind: 'smarts',
    title: 'Find the heteroatoms',
    description:
      'The ! operator negates a primitive. Match every molecule that holds an atom which is not carbon — remembering that SMARTS never sees the implicit hydrogens.',
    hints: [
      '! reads as "not".',
      '#6 is "atomic number 6", which is carbon however it is hybridised.',
      'Try [!#6].',
    ],
    cases: [
      { smiles: 'CCO', shouldMatch: true, label: 'ethanol' },
      { smiles: 'CCN', shouldMatch: true, label: 'ethylamine' },
      { smiles: 'ClCCl', shouldMatch: true, label: 'dichloromethane' },
      { smiles: 'CCCC', shouldMatch: false, label: 'butane' },
      { smiles: 'c1ccccc1', shouldMatch: false, label: 'benzene' },
      { smiles: 'C1CC1', shouldMatch: false, label: 'cyclopropane' },
    ],
  },
  {
    id: 's5',
    kind: 'smarts',
    title: 'Find the halides',
    description:
      'The comma is SMARTS’ "or". Match every molecule carrying a fluorine, a chlorine, a bromine or an iodine, in one pattern.',
    hints: [
      'Inside a bracket, a comma separates alternatives.',
      'You can list element symbols directly.',
      'Try [F,Cl,Br,I].',
    ],
    cases: [
      { smiles: 'CCCl', shouldMatch: true, label: 'chloroethane' },
      { smiles: 'CCBr', shouldMatch: true, label: 'bromoethane' },
      { smiles: 'Fc1ccccc1', shouldMatch: true, label: 'fluorobenzene' },
      { smiles: 'CCO', shouldMatch: false, label: 'ethanol' },
      { smiles: 'CCCC', shouldMatch: false, label: 'butane' },
      { smiles: 'CC(=O)O', shouldMatch: false, label: 'acetic acid' },
    ],
  },
  {
    id: 's6',
    kind: 'smarts',
    title: 'Find the three-membered rings',
    description:
      'Match the strained three-membered rings and nothing bigger. Daylight SMARTS would write [r3] for this, but openchemlib does not implement the ring-size primitive — so draw the ring itself, with the [[wildcard]] * standing for any atom.',
    hints: [
      'The * [[wildcard]] matches any atom at all.',
      'A [[ring closure]] digit works in SMARTS exactly as it does in SMILES.',
      'Try *1**1 — three wildcards closed into a ring.',
    ],
    cases: [
      { smiles: 'C1CC1', shouldMatch: true, label: 'cyclopropane' },
      { smiles: 'C1CO1', shouldMatch: true, label: 'ethylene oxide' },
      {
        smiles: 'CC1(C)CC1',
        shouldMatch: true,
        label: '1,1-dimethylcyclopropane',
      },
      { smiles: 'C1CCC1', shouldMatch: false, label: 'cyclobutane' },
      { smiles: 'C1CCCCC1', shouldMatch: false, label: 'cyclohexane' },
      { smiles: 'CCCC', shouldMatch: false, label: 'butane' },
    ],
  },
  {
    id: 's7',
    kind: 'smarts',
    title: 'Find the ketones',
    description:
      'A ketone is a carbonyl with a carbon on each side. Match the ketones and leave the aldehydes, the acids and the esters out.',
    hints: [
      'Write what sits on both sides of the carbonyl carbon, not just the C=O.',
      'An aldehyde has a hydrogen where a ketone has a carbon.',
      'Try [#6][CX3](=O)[#6].',
    ],
    cases: [
      { smiles: 'CC(=O)C', shouldMatch: true, label: 'acetone' },
      { smiles: 'O=C1CCCCC1', shouldMatch: true, label: 'cyclohexanone' },
      { smiles: 'CCC(=O)CC', shouldMatch: true, label: 'pentan-3-one' },
      { smiles: 'CC=O', shouldMatch: false, label: 'acetaldehyde' },
      { smiles: 'CC(=O)O', shouldMatch: false, label: 'acetic acid' },
      { smiles: 'CC(=O)OC', shouldMatch: false, label: 'methyl acetate' },
    ],
  },
  {
    id: 's8',
    kind: 'smarts',
    title: 'Find the primary amines',
    description:
      'A primary amine nitrogen carries two hydrogens and one carbon. Match those and leave the secondary and tertiary amines, and the amide, alone.',
    hints: [
      'Say how many hydrogens the nitrogen carries.',
      'An amide nitrogen sits next to a carbonyl, not next to a saturated carbon.',
      'Try [NX3H2][CX4].',
    ],
    cases: [
      { smiles: 'CCN', shouldMatch: true, label: 'ethylamine' },
      { smiles: 'NCCCN', shouldMatch: true, label: 'propane-1,3-diamine' },
      { smiles: 'NCc1ccccc1', shouldMatch: true, label: 'benzylamine' },
      { smiles: 'CCNCC', shouldMatch: false, label: 'diethylamine' },
      { smiles: 'CCN(CC)CC', shouldMatch: false, label: 'triethylamine' },
      { smiles: 'CC(=O)N', shouldMatch: false, label: 'acetamide' },
    ],
  },
  {
    id: 's9',
    kind: 'smarts',
    title: 'Find the esters',
    description:
      'An ester oxygen carries no hydrogen and does carry a second carbon. Match the esters without catching the acids they came from.',
    hints: [
      'H0 says "no hydrogen at all", which is exactly what an acid’s OH is not.',
      'Put a carbon on the far side of the single-bonded oxygen.',
      'Try [CX3](=O)[OX2H0][#6].',
    ],
    cases: [
      { smiles: 'CC(=O)OC', shouldMatch: true, label: 'methyl acetate' },
      { smiles: 'CCOC(=O)C', shouldMatch: true, label: 'ethyl acetate' },
      {
        smiles: 'O=C(OC)c1ccccc1',
        shouldMatch: true,
        label: 'methyl benzoate',
      },
      { smiles: 'CC(=O)O', shouldMatch: false, label: 'acetic acid' },
      { smiles: 'CCO', shouldMatch: false, label: 'ethanol' },
      { smiles: 'CC(=O)C', shouldMatch: false, label: 'acetone' },
    ],
  },
  {
    id: 's10',
    kind: 'smarts',
    title: 'Find the nitro groups',
    description:
      'A nitro group is a charged nitrogen with two oxygens. Match the nitro compounds and leave the amines and the nitriles alone.',
    hints: [
      'A nitro nitrogen carries a positive formal charge and one of its oxygens a negative one.',
      'Write the charges inside the brackets.',
      'Try [N+](=O)[O-].',
    ],
    cases: [
      {
        smiles: '[O-][N+](=O)c1ccccc1',
        shouldMatch: true,
        label: 'nitrobenzene',
      },
      { smiles: 'C[N+](=O)[O-]', shouldMatch: true, label: 'nitromethane' },
      { smiles: 'CC[N+](=O)[O-]', shouldMatch: true, label: 'nitroethane' },
      { smiles: 'CCN', shouldMatch: false, label: 'ethylamine' },
      { smiles: 'CC#N', shouldMatch: false, label: 'acetonitrile' },
      { smiles: 'c1ccccc1N', shouldMatch: false, label: 'aniline' },
    ],
  },
];

/** Every set the site ships with, in the order the picker offers them. */
export const EXERCISE_SETS: ExerciseSet[] = [
  {
    id: 'molecule-to-smiles',
    title: 'Molecule → SMILES',
    description:
      'A structure is drawn for you; write the SMILES. Any correct SMILES is accepted — what is compared is the molecule, never the string.',
    exercises: sortByDifficulty(MOLECULE_TO_SMILES),
  },
  {
    id: 'smiles-to-molecule',
    title: 'SMILES → Molecule',
    description:
      'A SMILES is given; draw the structure it describes, then hand it in. Any drawing of the right molecule is accepted, however it is laid out.',
    exercises: sortByDifficulty(SMILES_TO_MOLECULE),
  },
  {
    id: 'patterns',
    title: 'Write a SMARTS',
    description:
      'Write a pattern that matches the molecules on one side and leaves out the ones on the other. Hand it in and every test case is run against it.',
    exercises: sortByDifficulty(PATTERNS),
  },
];

/** Every exercise the site ships with, keyed by id. */
export const EXERCISES_BY_ID: ReadonlyMap<string, Exercise> = new Map(
  EXERCISE_SETS.flatMap((set) =>
    set.exercises.map((exercise) => [exercise.id, exercise] as const),
  ),
);

/**
 * The set a bare address opens on.
 */
export const DEFAULT_SET_ID = 'molecule-to-smiles';
