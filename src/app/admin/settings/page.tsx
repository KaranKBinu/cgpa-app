import { getSettings, updateSettings } from "@/app/actions";
import { Settings, Save, Smartphone, Globe, RefreshCcw } from "lucide-react";

export default async function SettingsPage() {
  const config = await getSettings();

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">Platform <span className="text-emerald-500">Settings</span></h1>
        <p className="text-muted-foreground font-medium">Global configurations for the PolyGrade system.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card/50 border border-border/50 p-10 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <Settings className="h-40 w-40" />
          </div>

          <form action={async (formData) => {
            "use server";
            await updateSettings(formData);
          }} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Branding & Identity
               </h3>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-4">Application Name</label>
                 <input 
                   name="appName"
                   defaultValue={config.appName}
                   className="w-full bg-background border border-border/50 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
                   required
                 />
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] mb-4 flex items-center gap-2">
                  <RefreshCcw className="h-3 w-3" /> Data Standards
               </h3>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-4">Default Revision / Scheme</label>
                 <input 
                   name="revision"
                   defaultValue={config.revision}
                   className="w-full bg-background border border-border/50 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
                   required
                 />
                 <p className="text-[10px] text-muted-foreground ml-4 font-medium uppercase tracking-tight italic mt-2">This value will be displayed as the primary data source tag in the header.</p>
               </div>
            </div>

            <button type="submit" className="h-16 px-10 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
              <Save className="h-5 w-5" />
              Update Configuration
            </button>
          </form>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-card/30 border border-border/50 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-card/80 flex items-center justify-center text-muted-foreground">
                 <Smartphone className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-foreground font-black text-lg">Mobile Optimization</p>
                 <p className="text-muted-foreground text-sm font-medium">Responsive scaling is currently handled by the adaptive grid engine.</p>
              </div>
           </div>
           <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
      </div>
    </div>
  );
}
