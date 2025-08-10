"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10vw] top-[-10vw] w-[40vw] h-[40vw] bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-60 animate-blob1" />
        <div className="absolute right-[-10vw] bottom-[-10vw] w-[50vw] h-[50vw] bg-blue-400 dark:bg-blue-800 rounded-full blur-3xl opacity-50 animate-blob2" />
        <div className="absolute left-[30vw] top-[60vh] w-[30vw] h-[30vw] bg-blue-300 dark:bg-blue-700 rounded-full blur-2xl opacity-40 animate-blob3" />
      </div>

      {/* Logo and title */}
      <div className="flex flex-col items-center gap-6 mt-[-4rem]">
        <div className="w-32 h-32 flex items-center justify-center animate-float rounded-full overflow-hidden">
          <img src="/toolbench.png" alt="Toolbench Logo" className="w-full h-full object-cover drop-shadow-xl" />
        </div>
        <h1>
          <span
            style={{
              fontSize: 50,
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.04)',
              letterSpacing: 1,
              lineHeight: 1,
              display: 'inline-block',
              position: 'relative',
            }}
          >
            Tool
            <span style={{ color: 'steelblue' }}>Bench</span>
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl text-center mt-2">
          Visualize, debug, and chat with your AI chains. <br />
          <span className="text-blue-500 dark:text-blue-200 font-semibold">Trace. Chat. Analyze.</span>
        </p>
      </div>

      {/* Login and navigation */}
      <div className="flex flex-col items-center gap-4 mt-10">
        <SignedIn>
          <UserButton />
          <Link
            href="/trace"
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all text-lg font-semibold"
          >
            Go to Trace View
          </Link>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all text-lg font-semibold">
              Sign In to Continue
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(40px) scale(1.05); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.08); }
        }
        .animate-blob1 { animation: blob1 12s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 14s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 16s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </main>
  );
}