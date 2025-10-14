import LoginForm from "./LoginForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <span className="text-sm font-bold">EX</span>
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-900">
                EduXora
              </p>
              <p className="text-[11px] leading-none text-slate-500">
                Financial Workflow Suite
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a className="text-sm text-slate-600 hover:text-slate-900" href="#">
              Product
            </a>
            <a className="text-sm text-slate-600 hover:text-slate-900" href="#">
              Pricing
            </a>
            <a className="text-sm text-slate-600 hover:text-slate-900" href="#">
              Docs
            </a>
            <a
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              href="#login"
            >
              Sign in
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          {/* Subtle background pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(1200px 600px at 10% -10%, rgba(79,70,229,0.09) 0, transparent 60%), radial-gradient(1000px 500px at 100% 10%, rgba(37,99,235,0.08) 0, transparent 55%)",
            }}
          />

          <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              {/* Copy */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  Enterprise Finance Workflows
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Orchestrate approvals. Control spend.{" "}
                  <span className="text-indigo-600">Close faster.</span>
                </h1>

                <p className="mt-4 max-w-xl text-slate-600 sm:text-lg">
                  Centralize purchase requests, automate approvals, enforce GL
                  rules, and keep auditors happy—without slowing down the
                  business.
                </p>

                {/* Stats / trust row */}
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                    <p className="text-2xl font-semibold text-slate-900">
                      99.9%
                    </p>
                    <p className="text-xs text-slate-500">Uptime SLA</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                    <p className="text-2xl font-semibold text-slate-900">SOX</p>
                    <p className="text-xs text-slate-500">Audit-ready trails</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                    <p className="text-2xl font-semibold text-slate-900">2×</p>
                    <p className="text-xs text-slate-500">Faster month-end</p>
                  </div>
                </div>
              </div>

              {/* Login Card */}
              <div className="">
                <LoginForm />
                <p className="mt-4 text-center text-xs text-slate-500">
                  SSO supported • SOC2 Type II • Role-based access
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 sm:pb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              badge="Automation"
              iconBg="bg-emerald-100"
              iconColor="text-emerald-700"
              title="Automated Approval Chains"
              desc="Route by department, amount, or vendor. Escalate automatically and track SLAs."
              icon="ri-flow-chart"
            />
            <Feature
              badge="Finance"
              iconBg="bg-indigo-100"
              iconColor="text-indigo-700"
              title="GL Mapping & Controls"
              desc="Validate coding against your chart of accounts and enforce policies before spend."
              icon="ri-bill-line"
            />
            <Feature
              badge="Operations"
              iconBg="bg-orange-100"
              iconColor="text-orange-700"
              title="Dynamic Forms"
              desc="Configurable request forms with conditional logic, attachments, and templates."
              icon="ri-file-list-3-line"
            />
            <Feature
              badge="Collaboration"
              iconBg="bg-sky-100"
              iconColor="text-sky-700"
              title="Comments & Mentions"
              desc="Keep context close to the transaction with threaded conversations and mentions."
              icon="ri-chat-3-line"
            />
            <Feature
              badge="Compliance"
              iconBg="bg-rose-100"
              iconColor="text-rose-700"
              title="Audit-Ready Trails"
              desc="Immutable logs, approver evidence, and exportable packets for auditors."
              icon="ri-shield-check-line"
            />
            <Feature
              badge="Insights"
              iconBg="bg-purple-100"
              iconColor="text-purple-700"
              title="Real-time Reporting"
              desc="Spend by cost center, bottlenecks by stage, cycle times, and policy breaches."
              icon="ri-bar-chart-2-line"
            />
          </div>
        </section>

        {/* Compliance banner */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Built for Finance. Loved by Auditors.
                </h2>
                <p className="mt-3 text-slate-600 sm:text-lg">
                  Enforce separation of duties, ensure approver evidence, and
                  export everything auditors need in a single click.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      ✓
                    </span>
                    SOX-friendly approval trails
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      ✓
                    </span>
                    Role-based access & maker-checker controls
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      ✓
                    </span>
                    Exports for audit packages
                  </li>
                </ul>
              </div>
              <div
                className="min-h-[260px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://readdy.ai/api/search-image?query=modern%20finance%20audit%20review%20with%20checklist%20and%20laptop%2C%20professional%20workspace%20aesthetic&width=1000&height=750&seq=fw-compliance&orientation=landscape')",
                }}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600">
            <div className="grid grid-cols-1 items-center gap-0 lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Ready to transform approvals and month-end close?
                </h3>
                <p className="mt-3 max-w-xl text-indigo-100">
                  Start with the essentials and scale to enterprise controls as
                  you grow.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#login"
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-indigo-50"
                  >
                    Sign in
                  </a>
                  <a
                    href="#"
                    className="rounded-lg border border-white/40 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Talk to Sales
                  </a>
                </div>
              </div>
              <div className="hidden h-full lg:block">
                <img
                  alt="Workflow dashboard preview"
                  className="h-full w-full object-cover opacity-95"
                  src="https://readdy.ai/api/search-image?query=financial%20workflow%20dashboard%20with%20approvals%2C%20charts%2C%20and%20tables%20on%20a%20clean%20UI%20screen&width=1200&height=900&seq=fw-cta&orientation=landscape"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EduXora • Financial Workflow Suite
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a className="text-slate-500 hover:text-slate-800" href="#">
              Security
            </a>
            <a className="text-slate-500 hover:text-slate-800" href="#">
              Privacy
            </a>
            <a className="text-slate-500 hover:text-slate-800" href="#">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --- Small feature card helper --- */
function Feature({
  badge,
  icon,
  iconBg,
  iconColor,
  title,
  desc,
}: {
  badge: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
          {badge}
        </span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          <i className={`${icon} ${iconColor} text-lg`} />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}
