import AboutSection from '@/components/AboutSection';
import HeroSection from './../components/HeroSection';
import ServiceSection from '@/components/ServiceSection';
import Navbar from '@/components/Navbar';
import { SmoothCursor } from '@/components/ui/smooth-cursor';
import ChannelsSection from '@/components/ChannelsSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServiceSection />
      <SmoothCursor />
      <ChannelsSection />
      <FooterSection />
    </div>
  );
}
