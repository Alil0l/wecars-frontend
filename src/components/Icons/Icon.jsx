import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Import all the icons we need from react-icons
import {
  // Lucide icons (modern, clean)
  Camera, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronRight, ChevronLeft,
  Menu, X, User, LogOut, Sun, Moon, Star, Car, DollarSign, Search, FileText,
  Home, Plus, Eye, Edit, Trash2, Download, Upload, ArrowRight, ArrowLeft,
  Shield, Zap, Award, Users, TrendingUp, Phone, Mail, MapPin, Calendar, Heart
} from 'lucide-react';
import {
  // Heroicons (outline and solid)
  UserIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  // Material Design icons
  MdPerson as Person, 
  MdEmail as Email, 
  MdLock as Lock, 
  MdVisibility as Visibility, 
  MdVisibilityOff as VisibilityOff
} from 'react-icons/md';

// Icon mapping for easy usage
const iconMap = {
  // Navigation & UI
  'menu': Menu,
  'close': X,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  
  // User & Auth
  'user': User,
  'user-circle': UserIcon,
  'logout': LogOut,
  'login': User,
  
  // Theme
  'sun': Sun,
  'moon': Moon,
  
  // Status & Feedback
  'check': CheckCircle,
  'check-solid': CheckIcon,
  'error': AlertCircle,
  'warning': ExclamationTriangleIcon,
  'star': Star,
  'star-filled': Star,
  
  // Actions
  'camera': Camera,
  'clock': Clock,
  'search': Search,
  'edit': Edit,
  'delete': Trash2,
  'download': Download,
  'upload': Upload,
  'eye': Eye,
  'plus': Plus,
  
  // Business
  'car': Car,
  'dollar': DollarSign,
  'file': FileText,
  'home': Home,
  'shield': Shield,
  'zap': Zap,
  'award': Award,
  'users': Users,
  'trending': TrendingUp,
  
  // Contact
  'phone': Phone,
  'mail': Mail,
  'location': MapPin,
  'calendar': Calendar,
  
  // Form icons
  'person': Person,
  'email': Email,
  'lock': Lock,
  'visibility': Visibility,
  'visibility-off': VisibilityOff,
  'heart': Heart
};

const Icon = ({ 
  name, 
  size = 20, 
  className = '', 
  color = 'currentColor',
  strokeWidth = 1.5,
  ...props 
}) => {
  const { theme } = useTheme();
  const { isRTL } = useLanguage();
  
  // Handle RTL-specific icon direction changes
  const getRTLIconName = () => {
    if (!isRTL) return name;
    
    // Swap directional icons in RTL
    const rtlIconMap = {
      'chevron-right': 'chevron-left',
      'chevron-left': 'chevron-right',
      'arrow-right': 'arrow-left',
      'arrow-left': 'arrow-right'
    };
    
    return rtlIconMap[name] || name;
  };
  
  const IconComponent = iconMap[getRTLIconName()];
  
  if (!IconComponent) {
    return null;
  }
  
  // Determine icon color based on theme
  const getIconColor = () => {
    if (color !== 'currentColor') return color;
    
    // Default colors for different themes
    if (theme === 'dark') {
      return 'text-gray-300';
    }
    return 'text-gray-600';
  };
  
  // Handle RTL-specific icon flipping
  const getRTLClassName = () => {
    if (!isRTL) return '';
    
    // Icons that should be flipped in RTL
    const rtlFlipIcons = [
      'chevron-right', 'chevron-left', 'arrow-right', 'arrow-left'
    ];
    
    if (rtlFlipIcons.includes(name)) {
      return 'transform scale-x-[-1]';
    }
    
    return '';
  };
  
  const iconClassName = `
    ${getIconColor()}
    ${getRTLClassName()}
    ${className}
  `.trim();
  
  return (
    <IconComponent
      size={size}
      className={iconClassName}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export default Icon;