import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function FloatingButton() {
  return (
    <Link href="https://creativemakes.com.br" target="_blank" rel="noopener noreferrer">
      <button className="fixed bottom-4 right-2 sm:bottom-6 sm:right-6 bg-primary hover:bg-primary/90 text-primary-foreground p-3 sm:p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 z-50">
        <Icon icon="mdi:web" className="text-xl sm:text-2xl" />
        <span className="sr-only">Visite Creative Makes</span>
      </button>
    </Link>
  );
}