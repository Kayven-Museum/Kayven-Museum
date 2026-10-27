export type MuseumId = string;
export type Museum = {id:string;numeral:string;title:string;titleZh:string;theme:string;instability:string;note:string;image:string;imageAlt?:string;imageCaption?:string;imagePosition?:string};
export type Room = {id:string;museum:string;number:string;title:string;titleZh:string;note:string;preface?:string;image?:string;imageAlt?:string;imageCaption?:string;imagePosition?:string};
export const museums: Museum[] = [
    { id: 'traces', numeral: 'I', title: 'THE MUSEUM OF TRACES', titleZh: '痕迹展馆', theme: 'LOVE', instability: 'Emotional instability', note: 'An unfinished future. A door still listened for. Love survives in the ordinary things that outlast a moment.', image: '/portfolio/p1-0.png' },
    { id: 'evidence', numeral: 'II', title: 'THE MUSEUM OF EVIDENCE', titleZh: '证据展馆', theme: 'SEX / BODY / DESIRE', instability: 'Bodily / social instability', note: 'Who decides what may be seen? Objects bear witness to the ways desire is hidden, permitted, judged, and refused.', image: '/portfolio/p2-1.png' },
    { id: 'remains', numeral: 'III', title: 'THE MUSEUM OF REMAINS', titleZh: '遗物展馆', theme: 'DEATH', instability: 'Existential instability', note: 'The things a person leaves. The forms a body loses. Two rooms for what continues after an ending.', image: '/portfolio/p2-0.png' },
];
export const rooms: Room[] = [
    { id: 'relics', museum: 'remains', number: '01', title: 'RELICS', titleZh: '遗物', note: 'Objects remain where a life no longer does. Five encounters with absence.' },
    { id: 'body-afterward', museum: 'remains', number: '02', title: 'THE BODY AFTERWARD', titleZh: '身体之后', note: 'A prose collection on what humans do with the body after life ends — and what those gestures reveal about the living.' },
];
