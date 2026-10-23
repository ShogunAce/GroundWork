import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Groundwork — Notice more. Start small.',description:'Turn a ramble into a field dataset, a kinder day plan, and an actionable citizen-science workbook.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
