import { Head } from "@inertiajs/react";

export default function Dashboard() {
    return (
        <>
            <Head title="Tableau de bord" />
            <div className="flex flex-col gap-4">
                <h1 className="text-[22px] font-semibold text-text1">Tableau de bord</h1>
                <p className="text-[15px] text-text2">
                    Bienvenue sur votre tableau de bord. Vous pouvez gérer vos informations et vos paramètres ici.
                </p>
            </div>
        </>
    );
}