import { Input } from "@/components/ui/input"
import { PenBox } from "lucide-react"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-4">
      {/* Logo */}
      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
        <PenBox className="w-12 h-12 text-white" />
      </div>

      {/* Brand Name */}
      <h1 className="text-5xl font-bold text-white mb-8">Artico</h1>

      {/* Search Input */}
      <div className="w-full max-w-xl">
        <Input
          type="search"
          placeholder="Write your topic..."
          className="h-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400 rounded-xl shadow-lg focus-visible:ring-primary"
        />
      </div>

      {/* Tagline */}
      <p className="text-zinc-400 text-lg mt-4">Transform your ideas into engaging articles</p>
    </div>
  )
}

