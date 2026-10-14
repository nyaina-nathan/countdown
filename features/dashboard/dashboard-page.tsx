import { DashboardHeader } from './dashboard-header';
import { CountdownsSection } from './countdowns/countdowns-section';
import { WinsSection } from './wins/wins-section';

export function DashboardPage() {
    return (
        <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
            <div className="mx-auto max-w-5xl">
                <DashboardHeader />
                <CountdownsSection />
                <WinsSection />
            </div>
        </main>
    );
}
