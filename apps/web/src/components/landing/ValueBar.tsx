"use client"

export default function ValueBar() {
  const features = [
    { title: "AI-Powered Insights", desc: "Your vault learns your behavior and the market.", icon: "🤖" },
    { title: "Secure DeFi Engine", desc: "Self-custody. Zero middlemen. Maximum control.", icon: "🔒" },
    { title: "Portfolio Automation", desc: "Set smart rules and let SeedVault handle the rest.", icon: "⚙️" },
  ]

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-4 rounded-lg bg-card/60 backdrop-blur-md border border-input flex flex-col items-start gap-2">
              <div className="text-2xl p-2 rounded bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-foreground/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
