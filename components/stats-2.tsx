export default function StatsSection() {
    return (
        <section className="py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-6">
                <p className="text-muted-foreground max-w-4xl text-balance text-4xl font-medium tracking-tight lg:text-5xl">
                    <span className="text-foreground">Real momentum.</span> Powering authentic storytelling across North &amp; South Goa.
                </p>

                <div className="mt-20 grid gap-12 md:grid-cols-3 xl:mt-32">
                    <div className="space-y-3 border-t pt-6">
                        <div className="text-5xl font-semibold tracking-tight">850+</div>
                        <p className="text-muted-foreground">Verified Goa Creators</p>
                    </div>
                    <div className="space-y-3 border-t pt-6">
                        <div className="text-5xl font-semibold tracking-tight">₹3.8 Cr+</div>
                        <p className="text-muted-foreground">Collab Earnings Paid Out</p>
                    </div>
                    <div className="space-y-3 border-t pt-6">
                        <div className="text-5xl font-semibold tracking-tight">180+</div>
                        <p className="text-muted-foreground">Partner Stays &amp; Venues</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
