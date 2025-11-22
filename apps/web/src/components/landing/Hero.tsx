"use client"

import ProfileMenu from "@/components/ProfileMenu"

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-12">
      <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-12">
        {/* Left: Copy */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-5xl font-extrabold mb-4 text-foreground">Smarter DeFi Starts Here.</h1>
          <p className="text-lg text-foreground/80 mb-6 max-w-xl">
            SeedVault uses AI-driven optimization to help you grow, protect, and managae your wealth with ease.
          </p>
          <div className="flex items-center gap-3">
            <a className="inline-flex items-center gap-2 bg-primary hover:brightness-105 text-primary-foreground font-semibold px-6 py-3 rounded shadow-md" href="/dashboard">Earn Now</a>
            <a className="inline-flex items-center gap-2 border border-input px-4 py-2 rounded text-foreground/90" href="#learn">Learn how it works</a>
          </div>
        </div>

        {/* Right: Visual */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="relative w-full max-w-md h-64 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-input backdrop-blur-md p-4 shadow-lg">
            <div className="absolute -inset-1 rounded-2xl blur-lg opacity-30 bg-[conic-gradient(at_top_left,var(--tw-gradient-stops))] from-primary to-accent"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-gradient-to-r from-primary to-accent rounded-full" />
                <div className="h-3 w-16 bg-background/50 rounded-full" />
              </div>
              <div className="flex-1 bg-gradient-to-b from-white/10 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
