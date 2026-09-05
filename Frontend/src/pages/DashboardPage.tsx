import StatCard from "../components/ui/StatCard";

export function DashboardPage() {
    return (
        <main>
            {/* TODO: Add message block if an accountant or manager has reports to process */}

            {/* Statistics about expense reports of a user */}
            <section className="grid grid-cols-2 gap-4 md:flex md:gap-8 md:justify-center">
                <StatCard label="Total reports" value={"N/A"} />
                <StatCard label="Pending reports" value={"N/A"} />
                <StatCard label="Accepted reports" value={"N/A"} />
                <StatCard label="Processed reports" value={"N/A"} />
            </section>

            {/* TODO: Add table with the user's expense reports */}
        </main>
    )
}