export default function Section({
    title,
    description,
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
                {   title && (
                        <h2 className="m-0 text-[17px] font-bold tracking-[-0.02em]">
                            {title}
                        </h2>
                    )
                }
                {description && (
                    <p className="m-0 text-[13.5px] text-muted">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}