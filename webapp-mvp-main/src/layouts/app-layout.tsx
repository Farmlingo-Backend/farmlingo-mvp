import { Outlet } from 'react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

function AppLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant='inset' />
      <SidebarInset>
        <div className='flex flex-1 flex-col'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
