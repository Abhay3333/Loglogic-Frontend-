import { LuKey, LuUsers, LuShieldAlert, LuCreditCard, LuBuilding2, LuHistory, LuShieldCheck } from 'react-icons/lu';
import { visibleSettingsSections } from '../lib/settingsAccess';

const icons = { 'api-keys': LuKey, team: LuUsers, requests: LuShieldAlert, billing: LuCreditCard,
  general: LuBuilding2, activity: LuHistory, audit: LuShieldCheck, redaction: LuShieldCheck, privacy: LuShieldCheck, sso: LuShieldCheck };

export default function SettingsSidebar({ access, activeTab, onNavigate, pendingRequestsCount = 0 }) {
  return <nav aria-label="Workspace settings" className="w-full md:w-64 flex-shrink-0 space-y-6">
    {visibleSettingsSections(access).map((section) => <section key={section.id} aria-labelledby={`settings-${section.id}`}>
      <h2 id={`settings-${section.id}`} className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7f8594]">{section.label}</h2>
      <div className="space-y-1">
        {section.items.map((item) => {
          const Icon = icons[item.id];
          return <button key={item.id} type="button" onClick={() => onNavigate(item.id)} aria-current={activeTab === item.id ? 'page' : undefined}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8ff5ff] ${activeTab === item.id
              ? 'bg-[#00eefc]/10 text-[#8ff5ff] border-[#00eefc]/30 shadow-[0_0_15px_rgba(0,238,252,0.15)]'
              : 'border-transparent text-[#a8abb3] hover:text-[#f1f3fc] hover:bg-[#11161d]'}`}>
            <span className="flex items-center gap-3"><Icon aria-hidden="true" className="w-4 h-4 shrink-0" />{item.label}</span>
            {item.id === 'requests' && pendingRequestsCount > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-[#0a0e14]">{pendingRequestsCount}</span>}
          </button>;
        })}
      </div>
    </section>)}
  </nav>;
}
