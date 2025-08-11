import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function FloatingTelegramButton() {
  return (
    <Link href="https://t.me/FDXSUP_bot" target="_blank" rel="noopener noreferrer">
      <button className="fixed bottom-4 right-2 sm:bottom-6 sm:right-6 bg-[#0088cc] hover:bg-[#0077b3] text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0088cc]/50 z-50 group">
        <Icon icon="mingcute:telegram-fill" className="text-xl sm:text-2xl" />
        <span className="sr-only">Contato via Telegram</span>
        
        {/* Tooltip opcional */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Fale conosco no Telegram
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </button>
    </Link>
  );
}