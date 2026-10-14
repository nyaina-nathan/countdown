import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { verifyAndGetUserId } from '@/libs/jwt';

export const metadata: Metadata = {
  title: 'Countdown: count your dreams',
  description:
    'Create countdowns for the moments you are waiting for and watch the time remaining, down to the minute.',
};

const steps = [
  {
    number: '01',
    title: 'Create an account',
    body: 'Sign up in seconds with an email and a password. Your countdowns are private to you.',
  },
  {
    number: '02',
    title: 'Add a countdown',
    body: 'Give it a title, an optional description, and the exact date and time you are waiting for.',
  },
  {
    number: '03',
    title: 'Watch the clock',
    body: 'See the days, hours and minutes remaining, then edit or delete anything as plans change.',
  },
];

const winFeatures = [
  {
    number: '01',
    title: 'Log a win',
    body: 'Capture the things you accomplished, big or small, with a title and an optional description.',
  },
  {
    number: '02',
    title: 'Revisit your progress',
    body: 'Browse your wins newest first, page by page, and update or remove any entry at any time.',
  },
];

const HomePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_jwt')?.value;
  const userId = token ? await verifyAndGetUserId(token) : null;
  const isLoggedIn = Boolean(userId);

  return (
    <>
      <header className="border-b-2 border-ink bg-surface">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Countdown home"
          >
            <Image
              src="/icon.png"
              alt="Countdown"
              width={40}
              height={40}
              className="h-10 w-10 border-2 border-ink"
              priority
            />
            <span className="font-sans text-2xl leading-none">Countdown</span>
          </Link>
          <Link href="/dashboard" className="btn-sega btn-sega--sm bg-primary text-white">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl">
          <section
            className="max-w-3xl"
            style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)' }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-[#6B7280]">
              Count your dreams
            </p>
            <h1 className="mt-4 font-sans text-[2.75rem] leading-none md:text-[4rem]">
              Never lose track of what you are waiting for.
            </h1>
            <p className="mt-6 font-sans text-[1.25rem] leading-snug text-[#4B5563]">
              Countdown keeps all of your important dates in one place. Create
              a countdown for a trip, a launch, an exam or a birthday, and watch
              the time remaining tick down to the minute.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-sega bg-primary text-white">
                  Go to dashboard
                </Link>
              ) : (
                <Link href="/login" className="btn-sega bg-primary text-white">
                  Start now
                </Link>
              )}
            </div>
          </section>

          <section className="mt-16 md:mt-24">
            <h2 className="font-sans text-[2.1875rem] leading-none">
              How it works
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className="card-sega"
                  style={{
                    animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)',
                    animationDelay: `${i * 80}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <span className="badge-sega bg-secondary text-ink">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-sans text-[1.6875rem] leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-sans text-[1.0625rem] leading-snug text-[#4B5563]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 md:mt-24">
            <h2 className="font-sans text-[2.1875rem] leading-none">
              Celebrate your wins
            </h2>
            <p className="mt-4 max-w-3xl font-sans text-[1.25rem] leading-snug text-[#4B5563]">
              Countdowns look ahead, wins look back. Keep a running list of
              what you have achieved along the way, so every milestone is
              written down and easy to find.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {winFeatures.map((feature, i) => (
                <div
                  key={feature.number}
                  className="card-sega"
                  style={{
                    animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)',
                    animationDelay: `${i * 80}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <span className="badge-sega bg-secondary text-ink">
                    {feature.number}
                  </span>
                  <h3 className="mt-4 font-sans text-[1.6875rem] leading-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-sans text-[1.0625rem] leading-snug text-[#4B5563]">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="card-sega mt-16 flex flex-col items-start gap-6 md:mt-24 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-sans text-[1.6875rem] leading-none">
                Ready to start counting?
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                Create your first countdown in under a minute.
              </p>
            </div>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn-sega shrink-0 bg-primary text-white"
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-sega shrink-0 bg-primary text-white"
              >
                Get started
              </Link>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t-2 border-ink px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl font-mono text-xs uppercase tracking-widest text-[#6B7280]">
          Countdown &mdash; count your dreams
        </div>
      </footer>
    </>
  );
};

export default HomePage;
