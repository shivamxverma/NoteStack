import './globals.css';
import Navbar from '../components/Navbar.js';

export const metadata = {
  title: 'NoteStack',
  description: 'A simple app for managing notes and bookmarks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <Navbar />    
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}