export type ArchiveRecord = {
    id: string;
    date: string | null;
    phase: string;
    title: string;
    reflection: string;
    label: string;
    source: string;
};
export const archive: ArchiveRecord[] = [
    { id: 'A-01', date: null, phase: 'EARLY NOTES', title: 'THE PROJECT WAS STILL THREE SEPARATE SUBJECTS', reflection: 'Love, sex, and death began as three subjects often absent from formal education. Reading and collecting literary references offered a first way into them.', label: 'RESEARCH', source: 'Portfolio pp. 2–6' },
    { id: 'A-02', date: null, phase: 'CONCEPTUAL REVISION', title: 'SILENCE BECAME THE STRUCTURE', reflection: 'The themes began to meet through instability: emotional, bodily and social, existential. Silence became the connection between them, rather than simply the absence of speech.', label: 'REFLECTION', source: 'Portfolio pp. 7, 9, 11' },
    { id: 'A-03', date: null, phase: 'WRITING EXPERIMENTS', title: 'THEORY WAS NOT ENOUGH', reflection: 'Weekly goals shifted toward an opening draft, fragments, and a literary voice. Abstract research began to enter sentences through interruption, distance, and the limits of language.', label: 'WEEKLY GOALS', source: 'Portfolio pp. 8–10' },
    { id: 'A-04', date: null, phase: 'COLLECTION STUDIES', title: 'THE MUSEUM STRUCTURE EMERGED', reflection: 'Objects became entrances to the writing. A bookmark could hold an unrealised future; a sealed dictionary could make an inherited silence visible. Each piece acquired a place in a collection.', label: 'MILESTONE', source: 'Portfolio pp. 14–41' },
    { id: 'A-05', date: null, phase: 'FIELD OBSERVATION', title: 'THE OBSTRUCTION DID NOT ERASE THE FIGURE', reflection: 'A field-trip work covered people with translucent geometric blocks. Their outlines remained visible. The concealed parts became more present precisely because they could not be seen in full.', label: 'FIELD NOTES', source: 'Portfolio p. 42' },
    { id: 'A-06', date: null, phase: 'EDITORIAL RETURN', title: 'NAMES, ORDER, A WAY IN', reflection: 'Feedback called for completed naming, a clearer sequence, explanatory notes and sources of inspiration, and attention to type size and page composition. The object needed a readable label.', label: 'FEEDBACK / REVISION', source: 'Portfolio p. 42' },
    { id: 'A-07', date: null, phase: 'EARLIER APPROACH', title: 'THREE SEPARATE SUBJECTS, SET ASIDE', reflection: 'The early separation of love, sex, and death gave way to a shared inquiry into vulnerability. The subjects remained; their isolation did not.', label: 'SUPERSEDED APPROACH', source: 'Portfolio pp. 2, 7' },
    { id: 'A-08', date: null, phase: 'SECOND ROOM', title: 'FROM OBJECTS TO BODIES', reflection: 'The Body Afterward extended the death collection beyond relics. Burial practices became literary entrances to belonging, form, integrity, boundaries, transformation, and suspension.', label: 'COLLECTION EXPANSION', source: 'Portfolio pp. 43–53' },
];
