import * as React from 'react';
import { GraduationCap, RectangleGoggles, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Sprout } from 'lucide-react';
import WeeklyGoalCard from './weekly-goal';

import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SignedIn, SignInButton, SignedOut, UserButton } from '@clerk/clerk-react';

const learnSubmenu = [
  { title: 'Courses', url: '/learn/courses' },
  { title: 'Quiz', url: '/learn/quiz' },
  { title: 'Materials', url: '/learn/materials' },
];

const communitySubmenu = [
  { title: 'Feeds', url: '/community/feeds' },
  { title: 'Chatrooms', url: '/community/chatrooms' },
  { title: 'Chats', url: '/community/chats' },
];

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'VR Farm',
      url: '/virtual-farm',
      icon: RectangleGoggles,
    },
    {
      title: 'Learn',
      url: '/learn',
      icon: GraduationCap,
      items: learnSubmenu,
    },
    {
      title: 'Community',
      url: '/community',
      icon: Users,
      items: communitySubmenu,
    },
  ],
};



const getActiveTab = (pathname: string): string => {
  if (pathname.startsWith('/learn')) return '/learn';
  if (pathname.startsWith('/community')) return '/community';
  if (pathname.startsWith('/virtual-farm')) return '/virtual-farm';
  return '/';
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getActiveTab(location.pathname);

  const [popupOpen, setPopupOpen] = React.useState<'learn' | 'community' | null>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(null);
      }
    };

    if (popupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popupOpen]);

  const handleSubmenuSelect = (url: string) => {
    navigate(url);
    setPopupOpen(null);
  };

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 bg-background border-b z-50 flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="size-5 text-green-600" />
            <span className="text-base font-medium text-green-600">Farmlingo</span>
          </Link>

          <div className="flex items-center">
            <UserButton />
          </div>
        </header>

        <nav
          className="fixed bottom-0 left-0 right-0 bg-background border-t z-40"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-around h-16 px-2">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center gap-1 text-xs ${
                activeTab === '/' ? 'text-green-600 font-medium' : 'text-muted-foreground'
              }`}
            >
              <Sprout className="size-5 text-green-600" />
              <span>Home</span>
            </Link>

            <Link
              to="/virtual-farm"
              className={`flex flex-col items-center justify-center gap-1 text-xs ${
                activeTab === '/virtual-farm' ? 'text-green-600 font-medium' : 'text-muted-foreground'
              }`}
            >
              <RectangleGoggles className="size-5" />
              <span>VR Farm</span>
            </Link>

            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1 text-xs ${
                activeTab === '/learn' ? 'text-green-600 font-medium' : 'text-muted-foreground'
              }`}
              onClick={() => setPopupOpen(popupOpen === 'learn' ? null : 'learn')}
              aria-haspopup="true"
              aria-expanded={popupOpen === 'learn'}
            >
              <GraduationCap className="size-5" />
              <span>Learn</span>
            </button>

            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1 text-xs ${
                activeTab === '/community' ? 'text-green-600 font-medium' : 'text-muted-foreground'
              }`}
              onClick={() => setPopupOpen(popupOpen === 'community' ? null : 'community')}
              aria-haspopup="true"
              aria-expanded={popupOpen === 'community'}
            >
              <Users className="size-5" />
              <span>Community</span>
            </button>

          </div>
        </nav>

        {popupOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute bottom-16 right-0 left-0 flex justify-center pointer-events-auto">
              <div
                ref={popupRef}
                className="bg-white rounded-lg shadow-lg border w-64 max-w-[85vw] overflow-hidden"
              >
                <div className="p-2">
                  {(popupOpen === 'learn' ? learnSubmenu : communitySubmenu).map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm rounded-md hover:bg-gray-100 transition-colors"
                      onClick={() => handleSubmenuSelect(item.url)}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }


    return (
  <Sidebar collapsible="icon" {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="!size-5 text-green-600" />
            <span className="text-base font-medium text-green-600">Farmlingo</span>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <NavMain items={data.navMain} />

      <div className="px-2 py-3">
        <WeeklyGoalCard completedLessons={3} totalLessons={5} />
      </div>
    </SidebarContent>

    <SidebarFooter>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center gap-2">
          <UserButton />
          <SignInButton />
        </div>
      </SignedOut>
    </SidebarFooter>
    
    <SidebarRail />
  </Sidebar>
);
}