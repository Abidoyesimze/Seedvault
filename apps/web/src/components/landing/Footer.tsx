"use client"

export default function Footer() {
  return (
    <footer className="py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/70">
        <div className="flex items-center gap-4">
          <a href="#about">About</a>
          <a href="#docs">Documentation</a>
          <a href="#github">GitHub</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#contact">Contact</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
