import React, { useState } from 'react';
import { Download, Box, Layers, Star, MapPin, CircuitBoard, Thermometer, Battery } from 'lucide-react';
import { Card, SectionTitle, Badge, ProgressBar, StatCard } from './ui';
import { CAD_FILES, BOM, SUPPLIERS, IMAGES } from '@/data/atlasData';

export function EngineeringView() {
  const [material, setMaterial] = useState('Tritan Renew');
  const materials = [
    { name: 'Tritan Renew', cost: '$2.85', durability: 88, sustainability: 92, thermal: 81 },
    { name: 'Virgin Tritan', cost: '$2.97', durability: 90, sustainability: 40, thermal: 83 },
    { name: 'Borosilicate Glass', cost: '$3.60', durability: 62, sustainability: 78, thermal: 95 },
    { name: 'PP Copolymer', cost: '$1.95', durability: 74, sustainability: 55, thermal: 68 },
  ];
  const sel = materials.find((m) => m.name === material)!;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Thermal Sim" value="Pass" sub="Core module @ 45°C ambient" icon={<Thermometer size={16} className="text-emerald-500" />} />
        <StatCard label="Battery Cycle Life" value="+22%" sub="280mAh LiPo swap, zero cost delta" icon={<Battery size={16} className="text-blue-500" />} />
        <StatCard label="PCBA Rev" value="Rev C" sub="4-layer, EMI shield added" icon={<CircuitBoard size={16} className="text-violet-500" />} />
      </div>

      <Card className="p-5">
        <SectionTitle title="Material Selection Wizard" sub="Materials Engineering compares cost, durability, sustainability and thermal performance" />
        <div className="flex flex-wrap gap-2">
          {materials.map((m) => (
            <button key={m.name} onClick={() => setMaterial(m.name)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${material === m.name
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>
              {m.name}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/60">
            <div className="text-xs uppercase tracking-wide text-slate-400">Unit Cost</div>
            <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white">{sel.cost}</div>
          </div>
          {(['durability', 'sustainability', 'thermal'] as const).map((k) => (
            <div key={k} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex justify-between text-xs">
                <span className="uppercase tracking-wide text-slate-400">{k}</span>
                <span className="font-mono text-slate-500">{sel[k]}/100</span>
              </div>
              <div className="mt-2"><ProgressBar value={sel[k]} color={sel[k] >= 80 ? 'bg-emerald-500' : 'bg-amber-500'} /></div>
            </div>
          ))}
        </div>
        {material === 'Tritan Renew' && (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            Atlas recommendation: Tritan Renew — passes all specs at 4% lower cost with 50% recycled content, matching customer sustainability preference (61%).
          </p>
        )}
      </Card>

      <Card className="p-5">
        <SectionTitle title="Engineering Analysis Queue" />
        <div className="space-y-3">
          {[
            { t: 'Drop test simulation (1.5m, 6 orientations)', s: 'Complete', c: 'green' },
            { t: 'Cap thread tolerance optimization', s: 'Running', c: 'blue' },
            { t: 'UV dosage verification model (99.99% kill rate)', s: 'Complete', c: 'green' },
            { t: 'Ingress protection target IP67 validation', s: 'Queued', c: 'slate' },
            { t: 'Mold flow analysis for 2.4mm walls', s: 'Running', c: 'blue' },
          ].map((a) => (
            <div key={a.t} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <span className="text-sm text-slate-700 dark:text-slate-300">{a.t}</span>
              <Badge color={a.c}>{a.s}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function CADView({ credits, spend }: { credits: number; spend: (n: number, msg: string) => void }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = (type: string, cost: number) => {
    if (credits < cost) return;
    spend(cost, `${type} generation started`);
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2200);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <img src={IMAGES.cadA} alt="Current CAD model" className="h-64 w-full object-cover" />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Housing Model — v4</div>
                <div className="text-xs text-slate-400">Rebuild 68% complete • wall thickness 2.4mm</div>
              </div>
              <Badge color="blue">In progress</Badge>
            </div>
            <div className="mt-3"><ProgressBar value={68} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Generate CAD Assets" sub="Enterprise plan — credits apply per operation" />
          <div className="space-y-2.5">
            {[
              { t: 'CAD Concept Model', c: 25, icon: <Box size={15} /> },
              { t: 'STEP File Export', c: 40, icon: <Layers size={15} /> },
              { t: 'STL File (print-ready)', c: 40, icon: <Layers size={15} /> },
              { t: 'Full Manufacturing Blueprint', c: 50, icon: <Download size={15} /> },
            ].map((g) => (
              <button key={g.t} onClick={() => generate(g.t, g.c)} disabled={generating || credits < g.c}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/5">
                <span className="flex items-center gap-2.5">{g.icon}{g.t}</span>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{g.c} cr</span>
              </button>
            ))}
          </div>
          {generating && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              CAD Design + STEP Generator departments are processing your request...
            </div>
          )}
          {generated && !generating && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Generation complete — new file added to version history below.
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title="File Version History" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CAD_FILES.map((f) => (
            <div key={f.name} className="group overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800">
              <img src={f.image} alt={f.name} className="h-28 w-full object-cover transition group-hover:scale-105" />
              <div className="p-3">
                <div className="truncate font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{f.name}</div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{f.type} • {f.version}</span><span>{f.size}</span>
                </div>
                <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-100 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Bill of Materials — v3" sub="Estimated unit cost at 5,000 MOQ: $17.14" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="py-2 pr-4">Part</th><th className="py-2 pr-4">Qty</th><th className="py-2 pr-4">Material</th><th className="py-2 text-right">Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {BOM.map((b) => (
                <tr key={b.part} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="py-2.5 pr-4 font-medium text-slate-800 dark:text-slate-200">{b.part}</td>
                  <td className="py-2.5 pr-4 font-mono text-slate-500">{b.qty}</td>
                  <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">{b.material}</td>
                  <td className="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">{b.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function ManufacturingView() {
  const [sort, setSort] = useState<'rating' | 'cost'>('rating');
  const suppliers = [...SUPPLIERS].sort((a, b) =>
    sort === 'rating' ? b.rating - a.rating : parseFloat(a.unitCost.slice(1)) - parseFloat(b.unitCost.slice(1))
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Unit Cost" value="$17.14" sub="@ 5,000 MOQ (target $16.50)" />
        <StatCard label="Target Retail" value="$95" sub="5.5x landed multiple" />
        <StatCard label="Suppliers Vetted" value="52" sub="6 shortlisted below" />
        <StatCard label="Proto Budget" value="$8,400" sub="P1 functional build (3 units)" />
      </div>

      <Card className="p-5">
        <SectionTitle title="Vetted Supplier Shortlist" sub="Researched and scored by the Supplier Research department"
          action={
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(['rating', 'cost'] as const).map((s) => (
                <button key={s} onClick={() => setSort(s)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${sort === s ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                  {s === 'rating' ? 'By Rating' : 'By Cost'}
                </button>
              ))}
            </div>
          } />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((s) => (
            <div key={s.name} className="rounded-lg border border-slate-100 p-4 transition hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900">
              <div className="flex items-start justify-between">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-500"><Star size={12} fill="currentColor" />{s.rating}</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} />{s.location}</div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Component</span><span className="font-medium text-slate-700 dark:text-slate-300">{s.part}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">MOQ</span><span className="font-mono text-slate-700 dark:text-slate-300">{s.moq}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Unit cost</span><span className="font-mono text-slate-700 dark:text-slate-300">{s.unitCost}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Certification</span><Badge color="blue">{s.cert}</Badge></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Prototype Plan — P1 Functional Build" sub="Sequenced by Prototype Planning AI" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { p: 'Phase 1', t: 'SLA-printed housing + off-shelf UV module', d: '2 weeks • $1,200', s: 'Ready to start' },
            { p: 'Phase 2', t: 'Custom PCBA Rev C integration', d: '3 weeks • $2,800', s: 'Blocked by CAD v4' },
            { p: 'Phase 3', t: 'Sealed assembly + dosage validation', d: '2 weeks • $1,900', s: 'Scheduled' },
            { p: 'Phase 4', t: 'Drop / battery / IP67 test battery', d: '2 weeks • $2,500', s: 'Scheduled' },
          ].map((ph) => (
            <div key={ph.p} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="font-mono text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400">{ph.p}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{ph.t}</div>
              <div className="mt-1 text-xs text-slate-400">{ph.d}</div>
              <Badge color={ph.s === 'Ready to start' ? 'green' : ph.s.startsWith('Blocked') ? 'amber' : 'slate'}>{ph.s}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
