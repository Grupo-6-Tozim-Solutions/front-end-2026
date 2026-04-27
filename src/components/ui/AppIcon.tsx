import React, { memo } from 'react';
import { IconProps, IconWeight } from 'phosphor-react-native';
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Bell,
  Brain,
  CalendarBlank,
  ChartLine,
  ChatCircleDots,
  Check,
  CheckCircle,
  Circle,
  Clock,
  CloudArrowUp,
  Eye,
  Flame,
  Gear,
  Hourglass,
  Info,
  ListBullets,
  MapPin,
  Microphone,
  Moon,
  MoonStars,
  Pause,
  PencilSimpleLine,
  ShieldCheck,
  SignOut,
  Star,
  Sun,
  TrendDown,
  TrendUp,
  User,
  WarningCircle,
  X,
  XCircle,
} from 'phosphor-react-native';

const iconMap = {
  activity: Activity,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  bell: Bell,
  brain: Brain,
  calendar: CalendarBlank,
  chart: ChartLine,
  chat: ChatCircleDots,
  check: Check,
  checkCircle: CheckCircle,
  circle: Circle,
  clock: Clock,
  cloudSync: CloudArrowUp,
  eye: Eye,
  flame: Flame,
  gear: Gear,
  hourglass: Hourglass,
  info: Info,
  list: ListBullets,
  location: MapPin,
  microphone: Microphone,
  moon: Moon,
  moonStars: MoonStars,
  pause: Pause,
  note: PencilSimpleLine,
  profile: User,
  shield: ShieldCheck,
  signOut: SignOut,
  spark: Star,
  star: Star,
  sun: Sun,
  trendDown: TrendDown,
  trendUp: TrendUp,
  user: User,
  warning: WarningCircle,
  waveform: Activity,
  close: X,
  closeCircle: XCircle,
} as const;

export type AppIconName = keyof typeof iconMap;

interface AppIconProps extends Omit<IconProps, 'weight'> {
  name: AppIconName;
  weight?: IconWeight;
}

export const AppIcon: React.FC<AppIconProps> = memo(
  ({ name, color = '#F3F4F6', size = 20, weight = 'regular', ...rest }) => {
    const Component = iconMap[name];
    return <Component color={color} size={size} weight={weight} {...rest} />;
  },
);

AppIcon.displayName = 'AppIcon';
