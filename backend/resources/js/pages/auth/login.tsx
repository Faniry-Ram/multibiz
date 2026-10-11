import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InfoNote } from '@/components/ui/info-note';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { request } from '@/routes/password';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Connexion" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                className="h-[46px] rounded-[11px] text-[15px]"
                                autoComplete="email"
                                placeholder="email@exemple.mg"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-baseline justify-between gap-2.5">
                                <Label htmlFor="password">Mot de passe</Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-[13px] font-medium text-primary-text no-underline hover:underline"
                                    >
                                        Mot de passe oublié ?
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                className="h-[46px] rounded-[11px] text-[15px]"
                                autoComplete="current-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <label className="flex items-center gap-2.5 text-[13.5px] text-text2">
                            <Checkbox
                                id="remember"
                                name="remember"
                                defaultChecked
                            />
                            Rester connecté sur cet appareil
                        </label>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full gap-2"
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            Se connecter
                        </Button>

                        <InfoNote>
                            Connexion chiffrée. Sur un appareil partagé,
                            décochez « Rester connecté ».
                        </InfoNote>
                    </>
                )}
            </Form>

            {status && (
                <p className="m-0 text-center text-sm font-medium text-pos">
                    {status}
                </p>
            )}
        </>
    );
}

Login.layout = {
    title: 'Bon retour',
    description:
        'Reprenez là où vous vous êtes arrêté. Ce que vous avez noté hors ligne sur le téléphone sera synchronisé à la connexion.',
};
