import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Users, 
  Settings,
  Scale,
  Menu,
  LogOut,
  ScanLine,
  History,
  CheckCircle,
  Package,
  UserCircle,
  BarChart3,
  Search,
  Bell,
  Check,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ShinyText } from '../components/ui/ShinyText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { AnimatedContent } from '../components/ui/AnimatedContent';

interface NavMenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  exact?: boolean;
  alias?: string;
}

const mainMenu: NavMenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', exact: true },
  { icon: MessageSquare, label: 'AI Assistant', path: '/dashboard/assistant' },
  { icon: ScanLine, label: 'New Inspection', path: '/new-inspection' },
  { icon: History, label: 'Inspections', path: '/inspections' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

const complianceMenu: NavMenuItem[] = [
  { icon: ShieldAlert, label: 'Rule Management', path: '/rules' },
  { icon: Scale, label: 'Legal Framework', path: '/legal-framework' },
  { icon: CheckCircle, label: 'Evidence Review', path: '/evidence-review' },
];

const systemMenu: NavMenuItem[] = [
  { icon: Settings, label: 'Settings', path: '/settings', alias: '/dashboard/settings' },
  { icon: UserCircle, label: 'Profile', path: '/profile', alias: '/dashboard/profile' },
];

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const userInitials = user.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'LM';


  const isRouteActive = (item: NavMenuItem) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    const matchesPrimary = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const matchesAlias = item.alias && (location.pathname === item.alias || location.pathname.startsWith(item.alias + '/'));
    return Boolean(matchesPrimary || matchesAlias);
  };

  const getPageTitle = () => {
    const allMenuItems = [...mainMenu, ...complianceMenu, ...systemMenu];
    const activeItem = allMenuItems.find(item => isRouteActive(item));
    return activeItem ? activeItem.label : 'Overview';
  };

  const renderNavGroup = (title: string, items: NavMenuItem[]) => (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 px-3">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = isRouteActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden",
                isActive 
                  ? "text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] bg-gradient-to-r from-primary/20 to-transparent border border-primary/20" 
                  : "text-content-muted hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                />
              )}
              <item.icon className={cn(
                "w-[18px] h-[18px] mr-3 z-10 transition-colors duration-300", 
                isActive ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "text-white/40 group-hover:text-white/80"
              )} />
              <span className="z-10 tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-full flex overflow-hidden bg-transparent">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 lg:relative lg:flex-shrink-0 bg-[#0B1020]/95 lg:bg-obsidian/40 backdrop-blur-2xl border-r border-white/10 text-content flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] lg:shadow-[10px_0_30px_rgba(0,0,0,0.2)]"
          >
            
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-20 flex items-center px-6 border-b border-border font-heading font-black text-xl tracking-tight text-white hover:opacity-90 transition-opacity cursor-pointer relative z-10"
              title="LegalMetrix AI - Return to Hero"
              aria-label="LegalMetrix AI - Return to Hero page"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-primary/20 overflow-hidden">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <ShinyText text="LegalMetrix" speed={3} /> <span className="text-primary ml-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">AI</span>
            </Link>
            
            <div className="flex-1 overflow-y-auto py-8 px-4 relative z-10">
              {renderNavGroup('Main Menu', mainMenu)}
              {renderNavGroup('Compliance', complianceMenu)}
              {renderNavGroup('System', systemMenu)}
            </div>

            <div className="p-4 border-t border-white/10 relative z-10 bg-[#0B1020]/80 backdrop-blur-xl flex flex-col gap-2">
              <SpotlightCard className="p-[1px] rounded-xl mb-1" spotlightColor="rgba(99, 102, 241, 0.25)">
                <Link 
                  to="/dashboard/profile"
                  className="flex items-center p-3 rounded-xl bg-obsidian/60 hover:bg-obsidian transition-colors group cursor-pointer"
                  title="View Inspector Profile"
                >
                  <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-primary via-purple-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <div className="w-full h-full rounded-full bg-obsidian flex items-center justify-center text-primary font-bold text-sm overflow-hidden border border-black/50">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{userInitials}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="text-[15px] font-semibold text-white truncate transition-colors tracking-tight">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-primary/70 font-bold truncate uppercase tracking-widest mt-0.5">{user.region || user.designation || 'Pune'}</div>
                  </div>
                </Link>
              </SpotlightCard>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400/90 hover:text-white hover:bg-red-500/90 border border-transparent hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 group"
              >
                <LogOut className="w-[18px] h-[18px] mr-2 group-hover:-translate-x-1 transition-transform" />
                <span>Secure Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full overflow-hidden">
        <header className="h-16 lg:h-20 bg-obsidian/30 backdrop-blur-2xl border-b border-white/10 flex items-center px-4 lg:px-8 justify-between flex-shrink-0 z-20 sticky top-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)] gap-2 lg:gap-6">
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 lg:p-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10"
              title="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Page Title (Desktop) */}
            <div className="hidden md:flex items-center space-x-4 pl-2 border-l border-white/10 h-6 ml-3">
               <span className="text-base font-heading font-semibold text-white tracking-wide ml-2 flex items-center">
                  <AnimatedContent direction="vertical" distance={10} key={location.pathname} className="inline-block">
                    {getPageTitle()}
                  </AnimatedContent>
               </span>
            </div>

            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center font-heading font-black text-lg tracking-tight text-white hover:opacity-90 transition-opacity cursor-pointer md:hidden"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mr-2 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                <ScanLine className="w-4 h-4 text-white" />
              </div>
              <ShinyText text="LegalMetrix" speed={3} /> <span className="text-primary ml-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">AI</span>
            </Link>
          </div>

          {/* Premium Search Bar */}
          <div className="flex-1 max-w-xl mx-auto hidden md:block">
            <SpotlightCard className="rounded-xl bg-white/[0.02] border-white/5 hover:border-primary/30 transition-colors p-[1px]">
              <div className="relative flex items-center w-full h-9 lg:h-10 px-3 bg-[#0B1020]/90 rounded-xl overflow-hidden shadow-inner">
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search inspections..." 
                  className="w-full bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0" 
                />
                <div className="hidden lg:flex items-center space-x-1 ml-2 flex-shrink-0">
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-slate-400 font-mono shadow-sm">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-slate-400 font-mono shadow-sm">K</kbd>
                </div>
              </div>
            </SpotlightCard>
          </div>
          
          <div className="flex items-center justify-end space-x-2 lg:space-x-5 min-w-0">
            {/* Notification Bell */}
            <div className="relative flex-shrink-0" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/10 group"
              >
                <Bell className="w-5 h-5 group-hover:animate-swing" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0B1020]"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 lg:w-96 bg-[#0F172A] border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 ring-1 ring-white/5 flex flex-col"
                  >
                    <div className="p-4 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                      <h3 className="font-bold text-white text-lg font-heading tracking-tight">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider">{unreadCount} New</span>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-obsidian">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-content-muted">No notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} onClick={() => {
                            markAsRead(notif.id);
                          }} className={`group relative p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer overflow-hidden ${notif.read ? 'opacity-60 bg-transparent' : 'bg-primary/[0.02]'}`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            <div className="relative flex gap-4">
                              <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                                notif.type === 'alert' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                notif.type === 'rule' ? 'bg-primary/10 border-primary/20 text-primary' :
                                'bg-slate-500/10 border-slate-500/20 text-slate-400'
                              }`}>
                                {notif.type === 'alert' ? <ShieldAlert className="w-5 h-5" /> :
                                 notif.type === 'rule' ? <FileText className="w-5 h-5" /> :
                                 <Settings className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={`text-sm font-bold flex items-center gap-2 ${notif.read ? 'text-white/80' : 'text-white'}`}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-xs font-medium text-white/40 whitespace-nowrap ml-2">{notif.time}</span>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{notif.desc}</p>
                              </div>
                              {!notif.read && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                      <button 
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-content-muted hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Check className="w-4 h-4" /> Mark all read
                      </button>
                      <button 
                        onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-primary hover:text-primary-light hover:bg-primary/10 transition-all"
                      >
                        View All <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-xs font-semibold text-white/40 tracking-wider hidden sm:block uppercase border-l border-white/10 pl-5">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            <Link
              to="/dashboard/profile"
              className="flex items-center space-x-0 sm:space-x-3 p-1 sm:pl-2 sm:pr-4 sm:py-1.5 rounded-full bg-[#1E293B]/50 hover:bg-[#1E293B] border border-white/10 transition-all shadow-lg hover:shadow-primary/10 min-w-0"
            >
              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center text-[10.5px] sm:text-[10px] font-bold overflow-hidden border border-primary/30 flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <span className="text-sm font-semibold text-white truncate tracking-wide hidden sm:block">{user.name}</span>
            </Link>
          </div>
        </header>
        
        <main className={cn("flex-1 overflow-x-hidden relative flex flex-col min-h-0", location.pathname.includes('/assistant') ? "p-0 overflow-hidden" : "p-4 sm:p-6 lg:p-10 overflow-y-auto")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn("mx-auto flex-1 w-full flex flex-col min-h-0", location.pathname.includes('/assistant') ? "max-w-none h-full" : "max-w-7xl")}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
