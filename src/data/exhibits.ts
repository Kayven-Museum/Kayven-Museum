import { articles } from './articles';
import type { MuseumId } from './museums';
export type Exhibit = {
    id: string;
    code: string;
    museum: MuseumId;
    room: string | null;
    titleZh: string;
    titleEn: string;
    object: string;
    keywords: string[];
    curatorialNote: string;
    excerpt: string;
    fullText: string;
    status: 'incomplete' | 'coming-soon' | 'published';
    order: number;
    legacySlug: string;
    sourcePage?: number;
    image?: string;
    imageAlt?: string;
    imageCaption?: string;
    imagePosition?: string;
};
type Seed = [
    string,
    string,
    string,
    string,
    string,
    string
];
const love: Seed[] = [
    ['签', 'BOOKMARK', 'unrealized future', 'A bookmark marks where reading stopped. This one marks a future that never began.', 'bookmark', '如果有一天——'],
    ['铃', 'DOORBELL', 'waiting / response / possibility', 'A hand reaches for a bell without knowing who will answer. Possibility begins on the other side of a door.', 'doorbell', ''],
    ['票', 'MOVIE TICKETS', 'shared time', 'Two tickets preserve the same hours. What happened on the screen is no longer the only thing remembered.', 'tickets', ''],
    ['伞', 'UMBRELLA', 'temporary companionship', 'For the duration of the rain, two people inhabit the same small shelter. The weather passes; the distance returns.', 'umbrella', ''],
    ['钥 / 解', 'KEY', 'searching / matching / belonging', 'A key survives without its door. To keep it is to keep believing there is somewhere it belongs.', 'key', ''],
];
const evidence: Seed[] = [
    ['阙页', 'SEALED DICTIONARY', 'inaccessible knowledge / censorship', 'The words are present, but the pages will not open. Silence is learned before the body can be named.', 'sealed-dictionary', ''],
    ['防窥膜', 'PRIVACY SCREEN', 'visibility / self-surveillance', 'A slight change of angle turns a visible surface black. Eventually the watcher is carried inside.', 'privacy-film', ''],
    ['有效期', 'EXPIRED HOTEL KEY CARD', 'delayed desire / permission / expiration', 'Permission has an expiry date. Desire does not always arrive in time.', 'expiry', ''],
    ['反步', 'REVERSE STEP', 'gender scripts', 'The body is given its steps before it chooses a direction. One reversed movement interrupts the script.', 'counterstep', ''],
];
const relics: Seed[] = [
    ['镜', 'MIRROR', 'reflection / absence', 'The mirror keeps receiving the room. The person who once stood before it is no longer among its reflections.', 'mirror', ''],
    ['眼镜', 'GLASSES', 'vision / memory', 'The lenses survive the eyes that needed them. A way of seeing remains, without anyone to look through it.', 'glasses', ''],
    ['抽屉', 'DRAWER', 'ordinary life / containment', 'Unremarkable things gather in a drawer. After a death, their accidental arrangement begins to resemble a life.', 'drawer', ''],
    ['名牌', 'NAME TAG', 'relationships / gathering', 'At a funeral, separate versions of one life meet in the same room. A name tag preserves that brief gathering.', 'name-tag', ''],
    ['名字', 'NAME', 'recognition / loss', 'Death is a distant word until it acquires a familiar name. A few characters become heavier than a definition.', 'name', ''],
];
const bodies: Seed[] = [
    ['向下', 'EARTH BURIAL', 'belonging', 'The body descends into earth. What once belonged to a person enters an older material world.', 'earth-burial', ''],
    ['失形', 'CREMATION', 'form', 'Fire removes the outline by which a person was recognised. What remains cannot return a familiar face.', 'cremation', ''],
    ['散形', 'SKY BURIAL', 'bodily integrity', 'The body leaves its enclosed form and enters other lives. Must dignity depend on remaining whole?', 'sky-burial', ''],
    ['漫界', 'SEA BURIAL', 'boundary', 'The water accepts the ashes and gives no fixed place in return. A boundary becomes a current.', 'sea-burial', ''],
    ['续生', 'TREE BURIAL', 'transformation', 'Matter enters roots, soil, and growth. The tree does not preserve a separate place for a name.', 'tree-burial', ''],
    ['悬置', 'HANGING COFFIN BURIAL', 'suspension', 'Between earth and sky, the coffin postpones a direction. An ending remains visibly unsettled.', 'hanging-coffin', ''],
    ['花期', 'FLOWER BURIAL', 'surface / decay / duration', 'Flowers cover the disturbed earth and begin their own disappearance. Two durations of decay occupy the same place.', 'flower-burial', ''],
    ['下游', 'RIVER BURIAL', 'flow / migration', 'The river carries the remains beyond the place of farewell. Departure continues after life has stopped.', 'river-burial', ''],
    ['洞葬', 'CAVE BURIAL', 'interior', 'A forthcoming study of the body returned to an enclosed, inward space.', 'cave-burial', ''],
    ['冰葬', 'ICE / PRESERVATION', 'preservation', 'A forthcoming study of the wish to hold a body against time.', 'ice-burial', ''],
    ['太空葬', 'SPACE BURIAL', 'distance / belonging', 'A forthcoming study of remains beyond the ground to which we imagine returning.', 'space-burial', ''],
];
function collection(rows: Seed[], prefix: string, museum: MuseumId, room: string | null, offset: number): Exhibit[] { return rows.map(([titleZh, titleEn, keywords, curatorialNote, legacySlug, excerpt], i) => ({ id: `${prefix.toLowerCase()}-${String(i + 1).padStart(2, '0')}`, code: `${prefix}-${String(i + 1).padStart(2, '0')}`, museum, room, titleZh, titleEn, object: titleEn, keywords: keywords.split(' / '), curatorialNote, excerpt, fullText: '', status: prefix === 'D' && i > 7 ? 'coming-soon' : 'incomplete', order: offset + i, legacySlug })); }
export const exhibits: Exhibit[] = [...collection(love, 'L', 'traces', null, 0), ...collection(evidence, 'E', 'evidence', null, 5), ...collection(relics, 'R', 'remains', 'relics', 9), ...collection(bodies, 'D', 'remains', 'body-afterward', 14)];
for (const exhibit of exhibits) {
    const article = articles[exhibit.id];
    if (article) {
        exhibit.fullText = article.fullText;
        exhibit.sourcePage = article.sourcePage;
        exhibit.status = 'published';
        if (article.curatorialNote) exhibit.curatorialNote = article.curatorialNote;
    }
}
export const findExhibit = (id: string) => exhibits.find(e => e.id === id || e.legacySlug === id);
