import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MovieDetails from "@/pages/MovieDetails";
import SeriesDetails from "@/pages/SeriesDetails";
import LiveTV from "@/pages/LiveTV";
import TV from "@/pages/TV";
import Search from "@/pages/Search";
import AdminDashboard from "@/pages/AdminDashboard";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Categories from "@/pages/Categories";
import Profile from "@/pages/Profile";
import { Sidebar } from "@/components/Sidebar";
import { AdminBanner } from "@/components/AdminBanner";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function Router() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background overflow-x-hidden">
      <AdminBanner />
      <Sidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0 flex flex-col">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/movie/:id" component={MovieDetails} />
          <Route path="/tv/:id" component={SeriesDetails} />
          <Route path="/live" component={LiveTV} />
          <Route path="/tv" component={TV} />
          <Route path="/search" component={Search} />
          <Route path="/categories" component={Categories} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route path="/login" component={Login} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
        <Footer />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
