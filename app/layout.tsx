import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
    authors: [{name: 'Kayven'}],
    creator: 'Kayven',
    icons: { icon: '/favicon.svg' },
    title: 'Kayven | What Remains Unsaid — 文学博物馆',
    description: 'Kayven 的文学作品与创作档案。What Remains Unsaid（未说出口，仍然存在）：关于爱、身体与死亡的文学博物馆。',
    metadataBase: new URL('https://what-remains-unsaid.prime-oak-8928.chatgpt.site'),
    openGraph: {
        title: 'Kayven | What Remains Unsaid — 文学博物馆',
        description: 'Kayven 的文学作品与创作档案。What Remains Unsaid（未说出口，仍然存在）：关于爱、身体与死亡的文学博物馆。',
        images: ['/og.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Kayven | What Remains Unsaid — 文学博物馆',
        description: 'Kayven 的文学作品与创作档案。What Remains Unsaid（未说出口，仍然存在）：关于爱、身体与死亡的文学博物馆。',
        images: ['/og.png'],
    },
};
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="en">
      <body>{children}</body>
    </html>);
}
