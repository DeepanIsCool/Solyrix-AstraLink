import { WebcamPixelGrid } from "@/components/ui/webcam-pixel-grid";
import { EncryptedText } from "@/components/ui/encrypted-text";
import Link from "next/link";
import Image from "next/image";

export default function WebcamPixelGridDemo() {
    return (
        <div className="relative h-screen w-screen bg-black overflow-hidden">


            {/* Webcam pixel grid background */}
            <div className="absolute inset-0">
                <WebcamPixelGrid
                    gridCols={60}
                    gridRows={40}
                    maxElevation={50}
                    motionSensitivity={0.25}
                    elevationSmoothing={0.2}
                    colorMode="webcam"
                    backgroundColor="#030303"
                    mirror={true}
                    gapRatio={0.05}
                    invertColors={false}
                    darken={0.6}
                    borderColor="#ffffff"
                    borderOpacity={0.06}
                    className="w-full h-full"
                    onWebcamError={(err) => console.error("Webcam error:", err)}
                />
            </div>

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

            {/* Hero content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
                <div className="max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 backdrop-blur-sm shadow-premium-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live on Stellar Testnet
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl font-heading">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
                            The Infrastructure for
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500">
                            Real World Assets
                        </span>
                    </h1>

                    {/* Description */}
                    <div className="mx-auto mb-4 max-w-4xl text-base text-zinc-400 sm:text-lg font-light leading-relaxed flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3">
                        <span className="text-center sm:text-left">
                            <span className="text-xl font-bold bg-gradient-to-r from-black via-[#c89116] to-[#c89116] bg-clip-text text-transparent" style={{ fontFamily: 'Barbra, sans-serif' }}>AstraLink</span>{' '}
                            <EncryptedText
                                text="enables institutions to issue, manage, and trade regulated digital assets."
                                encryptedClassName="text-neutral-500"
                                revealedClassName="text-zinc-400"
                                revealDelayMs={30}
                            />
                        </span>
                    </div>
                    <p className="mx-auto mb-8 max-w-2xl text-base text-zinc-400 sm:text-lg font-light leading-relaxed -mt-4">
                        <EncryptedText
                            text="Featuring automated compliance, zero-knowledge identity, and instant settlement on Stellar."
                            encryptedClassName="text-neutral-600"
                            revealedClassName="text-zinc-400"
                            revealDelayMs={25}
                        />
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/dashboard">
                            <button className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-white to-zinc-200 px-8 text-base font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Launch Platform
                                <svg
                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                    />
                                </svg>
                            </button>
                        </Link>
                        <a href="https://github.com/shinjinihehe/Solyrix-AstraLink" target="_blank" rel="noopener noreferrer">
                            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                                Documentation
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
