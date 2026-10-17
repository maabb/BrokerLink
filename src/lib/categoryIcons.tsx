import {
  Briefcase,
  Building2,
  Calculator,
  Code,
  HardHat,
  Lamp,
  Landmark,
  Megaphone,
  Scale,
  Truck,
  Users,
} from 'lucide-react';

const iconMap: Record<string, typeof Briefcase> = {
  code: Code,
  landmark: Landmark,
  'building-2': Building2,
  megaphone: Megaphone,
  scale: Scale,
  calculator: Calculator,
  'hard-hat': HardHat,
  lamp: Lamp,
  truck: Truck,
  users: Users,
  briefcase: Briefcase,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] ?? Briefcase;
  return <Icon className={className} />;
}
