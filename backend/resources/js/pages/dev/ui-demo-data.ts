/**
 * Demo data for the /_dev/ui component showcase only — never imported by a
 * real page. Figures are the ones from docs/maquette/README.md §6 (poulets
 * de chair / œufs / revente en ligne) so the showcase stays visually
 * consistent with the maquette screens.
 */

export const PROJECT_COLORS = {
    poulets: 'var(--b1)',
    oeufs: 'var(--b2)',
    revente: 'var(--b3)',
} as const;

export const sparklinePoints: [number, number][] = [
    [1, -650],
    [30, -900],
    [55, -477],
    [91, -777],
    [111, -178],
    [152, -468],
    [174, 196],
    [213, -54],
    [223, -174],
];

export const trajectoryDomain = { x0: 0, x1: 250, y0: -1000, y1: 900 };

export const trajectoryReal: [number, number][] = sparklinePoints;

export const trajectoryProjection: [number, number][] = [
    [223, -174],
    [247, -304],
    [249, 774],
];

export const trajectoryYTicks = [-800, -400, 0, 400, 800].map((value) => ({
    value,
    label: value === 0 ? '0' : `${value > 0 ? '+' : '−'}${Math.abs(value)} k`,
}));

export const trajectoryXTicks = [
    { x: 0, label: 'mars' },
    { x: 31, label: 'avr.' },
    { x: 61, label: 'mai' },
    { x: 92, label: 'juin' },
    { x: 122, label: 'juil.' },
    { x: 153, label: 'août' },
    { x: 184, label: 'sept.' },
    { x: 214, label: 'oct.' },
    { x: 245, label: 'nov.' },
];

export const trajectorySaleTags = [
    { x: 55, y: -477, label: 'B1 vendue' },
    { x: 111, y: -178, label: 'B2 vendue' },
    { x: 174, y: 196, label: 'B3 vendue' },
];

export const trajectoryMilestones = [
    {
        id: '1',
        x: 1,
        y: -650,
        label: '1',
        date: '2 mars',
        title: 'Lancement du projet',
    },
    {
        id: '2',
        x: 48,
        y: -595,
        label: '2',
        date: '18 avr.',
        title: 'Vaccin Newcastle ajouté',
    },
    {
        id: '3',
        x: 127,
        y: -291,
        label: '3',
        date: '6 juil.',
        title: "Changement de fournisseur d'aliment",
    },
    {
        id: '4',
        x: 203,
        y: 10,
        label: '4',
        date: '20 sept.',
        title: 'Bande de 80 au lieu de 60',
    },
];

export const multiLineSeries = [
    {
        name: 'Poulets de chair',
        color: PROJECT_COLORS.poulets,
        points: [-250, 173, -127, 472, 182, 846, 596, 476],
    },
    {
        name: 'Revente en ligne',
        color: PROJECT_COLORS.revente,
        points: [null, null, null, 120, 240, 300, 330, 335],
    },
    {
        name: 'Œufs',
        color: PROJECT_COLORS.oeufs,
        points: [null, null, null, null, null, -60, -120, -120],
    },
];

export const multiLineMonths = [
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre (10 j)',
];

export const weightSeries = [
    {
        name: 'Bande 1',
        color: 'var(--c3)',
        emphasized: false,
        values: [0.15, 0.35, 0.68, 1.45, 1.9],
    },
    {
        name: 'Bande 2',
        color: 'var(--c3)',
        emphasized: false,
        values: [0.16, 0.38, 0.74, 1.58, 2.0],
    },
    {
        name: 'Bande 3',
        color: 'var(--c3)',
        emphasized: false,
        values: [0.17, 0.4, 0.78, 1.64, 2.1],
    },
    {
        name: 'Bande 4',
        color: 'var(--chart)',
        emphasized: true,
        values: [0.16, 0.37, 0.74],
    },
];
export const weightDays = [7, 14, 21, 35, 45];

export const pocketEvents: { x: number; y: number }[] = [
    { x: 1, y: 650 },
    { x: 4, y: 850 },
    { x: 92, y: 1250 },
    { x: 131, y: 1100 },
    { x: 167, y: 1800 },
    { x: 177, y: 1650 },
    { x: 188, y: 1830 },
    { x: 213, y: 1680 },
];
export const pocketTags = [
    { x: 4, y: 850, label: 'Poulets', color: PROJECT_COLORS.poulets },
    { x: 92, y: 1250, label: 'Revente', color: PROJECT_COLORS.revente },
    { x: 167, y: 1800, label: 'Œufs', color: PROJECT_COLORS.oeufs },
    { x: 131, y: 1100, label: '− retrait', color: 'var(--pos)' },
];

export const headcountStart = 80;
export const headcountEvents: {
    day: number;
    qty: number;
    kind: 'death' | 'sale';
}[] = [
    { day: 2, qty: 1, kind: 'death' },
    { day: 11, qty: 1, kind: 'death' },
    { day: 21, qty: 1, kind: 'death' },
];

export const pairedBarsDays = [
    { label: '28', a: 3, b: 0 },
    { label: '29', a: 4, b: 0 },
    { label: '30', a: 6, b: 0 },
    { label: '1', a: 7, b: 6 },
    { label: '2', a: 9, b: 0 },
    { label: '3', a: 10, b: 12 },
    { label: '4', a: 12, b: 0 },
    { label: '5', a: 13, b: 6 },
    { label: '6', a: 14, b: 10 },
    { label: '7', a: 15, b: 0 },
    { label: '8', a: 17, b: 12 },
    { label: '9', a: 18, b: 6 },
    { label: '10', a: 19, b: 36 },
];

export const monthlyBarsMonths = [
    { label: 'juin', in: 180, out: 60, result: '+ 120 000' },
    { label: 'juil.', in: 260, out: 140, result: '+ 120 000' },
    { label: 'août', in: 210, out: 150, result: '+ 60 000' },
    { label: 'sept.', in: 190, out: 160, result: '+ 30 000' },
    { label: 'oct. (10 j)', in: 50, out: 45, result: '+ 5 000' },
];

export const divergingRows = [
    {
        name: 'Poulets de chair',
        color: PROJECT_COLORS.poulets,
        value: 3840,
        displayValue: '3 840 Ar',
    },
    {
        name: 'Revente en ligne',
        color: PROJECT_COLORS.revente,
        value: 3720,
        displayValue: '3 720 Ar',
    },
    {
        name: 'Œufs (pondeuses)',
        color: PROJECT_COLORS.oeufs,
        value: -5000,
        displayValue: '− 5 000 Ar',
    },
];

export const costSegments = [
    { label: 'Animaux', value: 200000, color: 'var(--c1)' },
    { label: 'Aliment', value: 140000, color: 'var(--chart)' },
    { label: 'Soins', value: 20000, color: 'var(--c2)' },
    { label: 'Litière', value: 10000, color: 'var(--c3)' },
];

export const eggCostWeeks = [
    { label: '28–30 sept.', value: 1030, displayValue: '1 030 Ar' },
    { label: '1–3 oct.', value: 516, displayValue: '516 Ar' },
    { label: '4–6 oct.', value: 344, displayValue: '344 Ar' },
    { label: '7–10 oct.', value: 259, displayValue: '259 Ar' },
];

export const weekStripDays = [
    {
        weekday: 'auj.',
        dayNumber: '10',
        isToday: true,
        dots: [
            PROJECT_COLORS.poulets,
            PROJECT_COLORS.oeufs,
            PROJECT_COLORS.revente,
        ],
        count: '4 tâches',
    },
    {
        weekday: 'dim.',
        dayNumber: '11',
        isToday: false,
        dots: [PROJECT_COLORS.oeufs, 'var(--c1)'],
        count: '2 tâches',
    },
    {
        weekday: 'lun.',
        dayNumber: '12',
        isToday: false,
        dots: [PROJECT_COLORS.poulets, PROJECT_COLORS.oeufs],
        count: '2 tâches',
    },
    {
        weekday: 'mar.',
        dayNumber: '13',
        isToday: false,
        dots: [PROJECT_COLORS.oeufs, PROJECT_COLORS.revente],
        count: '2 tâches',
    },
    {
        weekday: 'mer.',
        dayNumber: '14',
        isToday: false,
        dots: [PROJECT_COLORS.oeufs],
        count: '1 tâche',
    },
    {
        weekday: 'jeu.',
        dayNumber: '15',
        isToday: false,
        dots: [PROJECT_COLORS.oeufs],
        count: '1 tâche',
    },
    {
        weekday: 'ven.',
        dayNumber: '16',
        isToday: false,
        dots: [PROJECT_COLORS.poulets, PROJECT_COLORS.oeufs],
        count: '2 tâches',
    },
];

export const timelineSteps = [
    {
        day: 'J1',
        text: 'Vitamines et sucre dans l’eau',
        date: '20 sept.',
        status: 'past' as const,
    },
    {
        day: 'J7',
        text: 'Vaccin Newcastle',
        date: '26 sept.',
        status: 'past' as const,
    },
    {
        day: 'J14',
        text: 'Passage en provende croissance',
        date: '3 oct.',
        status: 'past' as const,
    },
    {
        day: 'J21',
        text: 'Vaccin Gumboro',
        date: "aujourd'hui",
        status: 'now' as const,
    },
    {
        day: 'J27',
        text: 'Pesée de contrôle',
        date: '16 oct.',
        status: 'next' as const,
    },
    {
        day: 'J35',
        text: 'Passage en provende finition',
        date: '24 oct.',
        status: 'next' as const,
    },
    { day: 'J45', text: 'Vente', date: '3 nov.', status: 'next' as const },
];

export const demoProjects = [
    {
        name: 'Poulets de chair',
        href: '#',
        color: PROJECT_COLORS.poulets,
        current: true,
        recoveredLabel: '73 %',
        recoveredColor: 'var(--pos)',
    },
    {
        name: 'Revente en ligne',
        href: '#',
        color: PROJECT_COLORS.revente,
        current: false,
        recoveredLabel: '84 %',
        recoveredColor: 'var(--warn)',
    },
    {
        name: 'Œufs (pondeuses)',
        href: '#',
        color: PROJECT_COLORS.oeufs,
        current: false,
        recoveredLabel: '0 %',
        recoveredColor: 'var(--primary-text)',
    },
];
