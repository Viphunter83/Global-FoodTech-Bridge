'use client';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 font-sans">
          <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50">
            <h1 className="text-8xl font-black text-slate-200 italic tracking-tighter">404</h1>
            <h2 className="text-2xl font-bold">Standard 404</h2>
            <p className="text-slate-500">
              The requested resource could not be found. 
              Please check the URL or return to safety.
            </p>
            <a 
              href="/" 
              className="inline-block px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-900/10"
            >
              Go to Home
            </a>
          </div>
      </body>
    </html>
  );
}
