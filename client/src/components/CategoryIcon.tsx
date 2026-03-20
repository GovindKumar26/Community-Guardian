import { 
  ShieldAlert, 
  AlertTriangle, 
  GlobeLock, 
  Construction, 
  CloudRain, 
  Stethoscope,
  type LucideProps
} from 'lucide-react';

interface Props extends LucideProps {
  name: string;
}

export default function CategoryIcon({ name, ...props }: Props) {
  switch (name) {
    case 'ShieldAlert':
      return <ShieldAlert {...props} />;
    case 'AlertTriangle':
      return <AlertTriangle {...props} />;
    case 'GlobeLock':
      return <GlobeLock {...props} />;
    case 'Construction':
      return <Construction {...props} />;
    case 'CloudRain':
      return <CloudRain {...props} />;
    case 'Stethoscope':
      return <Stethoscope {...props} />;
    default:
      return <ShieldAlert {...props} />;
  }
}
