import Activity01Icon from '@hugeicons/core-free-icons/Activity01Icon';
import AlertCircleIcon from '@hugeicons/core-free-icons/AlertCircleIcon';
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowLeft02Icon from '@hugeicons/core-free-icons/ArrowLeft02Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import BloodIcon from '@hugeicons/core-free-icons/BloodIcon';
import BookOpen01Icon from '@hugeicons/core-free-icons/BookOpen01Icon';
import Bookmark01Icon from '@hugeicons/core-free-icons/Bookmark01Icon';
import BulbIcon from '@hugeicons/core-free-icons/BulbIcon';
import Calendar03Icon from '@hugeicons/core-free-icons/Calendar03Icon';
import CalendarCheckIn01Icon from '@hugeicons/core-free-icons/CalendarCheckIn01Icon';
import CallIcon from '@hugeicons/core-free-icons/CallIcon';
import Camera01Icon from '@hugeicons/core-free-icons/Camera01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import CircleIcon from '@hugeicons/core-free-icons/CircleIcon';
import Clock01Icon from '@hugeicons/core-free-icons/Clock01Icon';
import Copy01Icon from '@hugeicons/core-free-icons/Copy01Icon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import DentalToothIcon from '@hugeicons/core-free-icons/DentalToothIcon';
import FavouriteIcon from '@hugeicons/core-free-icons/FavouriteIcon';
import Flag02Icon from '@hugeicons/core-free-icons/Flag02Icon';
import Globe02Icon from '@hugeicons/core-free-icons/Globe02Icon';
import HappyIcon from '@hugeicons/core-free-icons/HappyIcon';
import Home01Icon from '@hugeicons/core-free-icons/Home01Icon';
import Hospital01Icon from '@hugeicons/core-free-icons/Hospital01Icon';
import Image01Icon from '@hugeicons/core-free-icons/Image01Icon';
import InformationCircleIcon from '@hugeicons/core-free-icons/InformationCircleIcon';
import LifebuoyIcon from '@hugeicons/core-free-icons/LifebuoyIcon';
import LiverIcon from '@hugeicons/core-free-icons/LiverIcon';
import LinkSquare02Icon from '@hugeicons/core-free-icons/LinkSquare02Icon';
import Location01Icon from '@hugeicons/core-free-icons/Location01Icon';
import Logout01Icon from '@hugeicons/core-free-icons/Logout01Icon';
import LungsIcon from '@hugeicons/core-free-icons/LungsIcon';
import Mail01Icon from '@hugeicons/core-free-icons/Mail01Icon';
import Medicine02Icon from '@hugeicons/core-free-icons/Medicine02Icon';
import Message01Icon from '@hugeicons/core-free-icons/Message01Icon';
import Mic01Icon from '@hugeicons/core-free-icons/Mic01Icon';
import MinusSignIcon from '@hugeicons/core-free-icons/MinusSignIcon';
import Moon02Icon from '@hugeicons/core-free-icons/Moon02Icon';
import MoreHorizontalIcon from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import NeutralIcon from '@hugeicons/core-free-icons/NeutralIcon';
import Notification01Icon from '@hugeicons/core-free-icons/Notification01Icon';
import PlusSignIcon from '@hugeicons/core-free-icons/PlusSignIcon';
import RibbonIcon from '@hugeicons/core-free-icons/RibbonIcon';
import Sad01Icon from '@hugeicons/core-free-icons/Sad01Icon';
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import SecurityCheckIcon from '@hugeicons/core-free-icons/SecurityCheckIcon';
import Share08Icon from '@hugeicons/core-free-icons/Share08Icon';
import SlidersHorizontalIcon from '@hugeicons/core-free-icons/SlidersHorizontalIcon';
import SmileIcon from '@hugeicons/core-free-icons/SmileIcon';
import StethoscopeIcon from '@hugeicons/core-free-icons/StethoscopeIcon';
import Sun03Icon from '@hugeicons/core-free-icons/Sun03Icon';
import ThumbsUpIcon from '@hugeicons/core-free-icons/ThumbsUpIcon';
import Tick02Icon from '@hugeicons/core-free-icons/Tick02Icon';
import UnhappyIcon from '@hugeicons/core-free-icons/UnhappyIcon';
import UserGroupIcon from '@hugeicons/core-free-icons/UserGroupIcon';
import UserIcon from '@hugeicons/core-free-icons/UserIcon';
import ViewIcon from '@hugeicons/core-free-icons/ViewIcon';
import ViewOffSlashIcon from '@hugeicons/core-free-icons/ViewOffSlashIcon';
import VolumeHighIcon from '@hugeicons/core-free-icons/VolumeHighIcon';
import { HugeiconsIcon } from '@hugeicons/react-native';

import type { Palette } from '@/theme/palette';
import { useDesign } from '@/theme/useTheme';

import {
  BloodCellsIcon,
  BreastIcon,
  CervixIcon,
  ColonIcon,
  OvariesIcon,
  ProstateIcon,
  SkinCheckIcon,
  StomachIcon,
} from './OrganIcons';
import { decorative } from './a11y';

// Hugeicons stroke-rounded icons (docs/design-refresh). Each is imported from its own path
// so the bundle only carries these. Add a name here before using it.

const ICONS = {
  activity: Activity01Icon,
  back: ArrowLeft02Icon,
  bell: Notification01Icon,
  blood: BloodIcon,
  book: BookOpen01Icon,
  bookmark: Bookmark01Icon,
  calendar: Calendar03Icon,
  'calendar-check': CalendarCheckIn01Icon,
  camera: Camera01Icon,
  check: Tick02Icon,
  'chevron-left': ArrowLeft01Icon,
  'chevron-right': ArrowRight01Icon,
  circle: CircleIcon,
  'circle-alert': AlertCircleIcon,
  'circle-check': CheckmarkCircle02Icon,
  clock: Clock01Icon,
  close: Cancel01Icon,
  copy: Copy01Icon,
  'external-link': LinkSquare02Icon,
  eye: ViewIcon,
  'eye-off': ViewOffSlashIcon,
  flag: Flag02Icon,
  globe: Globe02Icon,
  heart: FavouriteIcon,
  home: Home01Icon,
  hospital: Hospital01Icon,
  image: Image01Icon,
  info: InformationCircleIcon,
  lightbulb: BulbIcon,
  'life-buoy': LifebuoyIcon,
  liver: LiverIcon,
  'log-out': Logout01Icon,
  lungs: LungsIcon,
  mail: Mail01Icon,
  'map-pin': Location01Icon,
  message: Message01Icon,
  mic: Mic01Icon,
  minus: MinusSignIcon,
  'mood-rough': UnhappyIcon,
  'mood-low': Sad01Icon,
  'mood-okay': NeutralIcon,
  'mood-good': SmileIcon,
  'mood-great': HappyIcon,
  moon: Moon02Icon,
  more: MoreHorizontalIcon,
  phone: CallIcon,
  pill: Medicine02Icon,
  plus: PlusSignIcon,
  ribbon: RibbonIcon,
  search: Search01Icon,
  share: Share08Icon,
  shield: SecurityCheckIcon,
  sliders: SlidersHorizontalIcon,
  stethoscope: StethoscopeIcon,
  sun: Sun03Icon,
  tooth: DentalToothIcon,
  'thumbs-up': ThumbsUpIcon,
  trash: Delete02Icon,
  user: UserIcon,
  users: UserGroupIcon,
  volume: VolumeHighIcon,
} as const;

const ORGAN_ICONS = {
  breast: BreastIcon,
  cervix: CervixIcon,
  colon: ColonIcon,
  'blood-cells': BloodCellsIcon,
  ovaries: OvariesIcon,
  prostate: ProstateIcon,
  'skin-check': SkinCheckIcon,
  stomach: StomachIcon,
} as const;

export type OrganIconName = keyof typeof ORGAN_ICONS;
export type IconName = keyof typeof ICONS | OrganIconName;

export const ICON_NAMES = [
  ...Object.keys(ICONS),
  ...Object.keys(ORGAN_ICONS),
] as IconName[];

type IconProps = {
  name: IconName;
  size?: number;
  /** A palette token or a color. Defaults to `ink`. */
  tone?: keyof Palette;
  color?: string;
  strokeWidth?: number;
};

/** A decorative icon (hidden from screen readers; label the control that holds it). */
export function Icon({ name, size = 22, tone = 'ink', color, strokeWidth = 1.8 }: IconProps) {
  const { palette } = useDesign();
  const iconColor = color ?? palette[tone];

  if (name in ORGAN_ICONS) {
    const OrganComponent = ORGAN_ICONS[name as OrganIconName];
    return <OrganComponent size={size} color={iconColor} />;
  }

  return (
    <HugeiconsIcon
      icon={ICONS[name as keyof typeof ICONS]}
      size={size}
      color={iconColor}
      strokeWidth={strokeWidth}
      // On iOS an SVG catches touches, so a tap on the icon wouldn't reach its button.
      pointerEvents="none"
      {...decorative}
    />
  );
}
