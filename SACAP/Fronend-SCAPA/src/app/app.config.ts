import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import {
  LucideAngularModule,
  Leaf, Mail, Lock, Eye, EyeOff, Loader, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle,
  Package, Activity, Truck, User, Users, UserPlus, UserCheck, ChevronRight, ChevronDown, ShieldAlert,
  Clock, Search, Filter, Shield, ShieldOff, RotateCw, Edit3, Key, Trash2, LayoutDashboard,
  AlertTriangle, AlertCircle, Info, Settings, LogOut, HelpCircle, Save, X, Check, Bell,
  UserX, Calendar, Sprout, Gift, Grid, Layers, PieChart, Plus, PlusCircle, Database, Camera, Image, Upload,
  Play, PlayCircle, StopCircle, Award, Sparkles, Sliders, CheckSquare, Tag, Percent, DollarSign,
  Download, Globe, FileText, HardDrive, Cpu, Terminal, Power, Folder, RotateCcw, CheckCheck, Send,
  List, Briefcase, UploadCloud, FileCheck, Link, MapPin, Zap, Ban, RefreshCw, MoreVertical,
  ListChecks, TrendingUp, BarChart2, Boxes, ChevronLeft, ChevronUp, ArrowUp, ArrowDown,
  Printer, Copy, ExternalLink, Eye as EyeIcon, EyeOff as EyeOffIcon,
  FilePlus, PackagePlus, Receipt, Warehouse, ShoppingCart,
  ArrowRightCircle, CalendarClock, CheckCircle2, ClipboardCheck, ClipboardList, ClipboardX,
  Edit2, Flame, Inbox, ListOrdered, PackageCheck, XCircle,
  Network, ArrowRightLeft, QrCode
} from 'lucide-angular';

const pickedIcons = {
  Leaf, Mail, Lock, Eye, EyeOff, Loader, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle,
  Package, Activity, Truck, User, Users, UserPlus, UserCheck, ChevronRight, ChevronDown, ShieldAlert,
  Clock, Search, Filter, Shield, ShieldOff, RotateCw, Edit3, Key, Trash2, LayoutDashboard,
  AlertTriangle, AlertCircle, Info, Settings, LogOut, HelpCircle, Save, X, Check, Bell,
  UserX, Calendar, Sprout, Gift, Grid, Layers, PieChart, Plus, PlusCircle, Database, Camera, Image, Upload,
  Play, PlayCircle, StopCircle, Award, Sparkles, Sliders, CheckSquare, Tag, Percent, DollarSign,
  Download, Globe, FileText, HardDrive, Cpu, Terminal, Power, Folder, RotateCcw, CheckCheck, Send,
  List, Briefcase, UploadCloud, FileCheck, Link, MapPin, Zap, Ban, RefreshCw, MoreVertical,
  ListChecks, TrendingUp, BarChart2, Boxes, ChevronLeft, ChevronUp, ArrowUp, ArrowDown,
  Printer, Copy, ExternalLink,
  EyeIcon, EyeOffIcon,
  FilePlus, PackagePlus, Receipt, Warehouse, ShoppingCart,
  ArrowRightCircle, CalendarClock, CheckCircle2, ClipboardCheck, ClipboardList, ClipboardX,
  Edit2, Flame, Inbox, ListOrdered, PackageCheck, XCircle,
  Network, ArrowRightLeft, QrCode
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick(pickedIcons)
    )
  ]
};
