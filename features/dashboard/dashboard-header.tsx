'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DashboardHeader() {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const fetchMe = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const user = await res.json();
                    if (active) setUsername(user.username);
                }
            } catch {
                // ignore
            }
        };
        fetchMe();
        return () => {
            active = false;
        };
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // ignore
        }
        router.push('/');
    };

    return (
        <header className="mb-8 flex items-center justify-between gap-4 md:mb-12">
            <p className="font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                {username ? <>Signed in as {username}</> : <>Dashboard</>}
            </p>
            <button
                type="button"
                onClick={handleLogout}
                className="btn-sega bg-secondary text-ink"
            >
                Log out
            </button>
        </header>
    );
}
