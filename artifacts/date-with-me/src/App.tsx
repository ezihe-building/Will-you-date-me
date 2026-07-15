import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AppProvider } from '@/context/AppContext';
import { MusicPlayer } from '@/components/MusicPlayer';
import { AmbientEffects } from '@/components/AmbientEffects';

// Pages
import Home from '@/pages/Home';
import ProposalPage from '@/pages/ProposalPage';
import Gallery from '@/pages/Gallery';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import ZenithLabs from '@/pages/ZenithLabs';
import Dashboard from '@/pages/admin/Dashboard';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/to/:slug" component={ProposalPage} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/zenith-labs" component={ZenithLabs} />

      {/* Admin route — hidden behind the 7-tap footer trigger */}
      <Route path="/dashboard" component={Dashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AmbientEffects />
            <MusicPlayer />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
