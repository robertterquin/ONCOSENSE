import {
  Activity,
  ArrowLeft,
  Bell,
  BookOpen,
  Bookmark,
  Calendar,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  Globe,
  Heart,
  House,
  Info,
  Lightbulb,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Minus,
  Moon,
  Phone,
  Pill,
  Plus,
  Search,
  Share,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  ThumbsUp,
  Trash2,
  User,
  Users,
  Volume2,
  X,
} from 'lucide-react-native';

import type { Palette } from '@/theme/palette';
import { useDesign } from '@/theme/useTheme';

import { decorative } from './a11y';

// Lucide stroke icons (the approved design's style). Add a name here before using it.

const ICONS = {
  activity: Activity,
  back: ArrowLeft,
  bell: Bell,
  book: BookOpen,
  bookmark: Bookmark,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  check: Check,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  clock: Clock,
  close: X,
  copy: Copy,
  'external-link': ExternalLink,
  eye: Eye,
  'eye-off': EyeOff,
  flag: Flag,
  globe: Globe,
  heart: Heart,
  home: House,
  info: Info,
  lightbulb: Lightbulb,
  'life-buoy': LifeBuoy,
  'log-out': LogOut,
  mail: Mail,
  'map-pin': MapPin,
  message: MessageCircle,
  mic: Mic,
  minus: Minus,
  moon: Moon,
  more: Ellipsis,
  phone: Phone,
  pill: Pill,
  plus: Plus,
  search: Search,
  share: Share,
  shield: ShieldCheck,
  sliders: SlidersHorizontal,
  sun: Sun,
  'thumbs-up': ThumbsUp,
  trash: Trash2,
  user: User,
  users: Users,
  volume: Volume2,
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

type IconProps = {
  name: IconName;
  size?: number;
  /** A palette token or a color. Defaults to `ink`. */
  tone?: keyof Palette;
  color?: string;
  strokeWidth?: number;
};

/** A decorative icon (hidden from screen readers; label the control that holds it). */
export function Icon({ name, size = 22, tone = 'ink', color, strokeWidth = 2 }: IconProps) {
  const { palette } = useDesign();
  const Glyph = ICONS[name];
  return (
    <Glyph size={size} color={color ?? palette[tone]} strokeWidth={strokeWidth} {...decorative} />
  );
}
