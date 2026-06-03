import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PlantsList from "./pages/PlantsList";
import PlantForm from "./pages/PlantForm";
import PlantProfile from "./pages/PlantProfile";
import WateringLog from "./pages/WateringLog";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/plants" component={PlantsList} />
        <Route path="/plants/new" component={PlantForm} />
        <Route path="/plants/:id" component={PlantProfile} />
        <Route path="/plants/:id/edit" component={PlantForm} />
        <Route path="/log" component={WateringLog} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;