<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureFactoryDiscovery();
    }

    /**
     * Models live under app/Domain/*\/Models (not app/Models), so Laravel's default
     * "App\Models\X" -> "Database\Factories\XFactory" guess never matches. Every
     * factory still lives in the conventional flat database/factories/ directory, so
     * guessing by the model's class basename alone is enough.
     */
    protected function configureFactoryDiscovery(): void
    {
        Factory::guessFactoryNamesUsing(self::guessFactoryName(...));
    }

    /**
     * @param  class-string<Model>  $modelName
     * @return class-string<Factory<Model>>
     */
    private static function guessFactoryName(string $modelName): string
    {
        $factory = 'Database\\Factories\\'.class_basename($modelName).'Factory';

        if (! is_a($factory, Factory::class, true)) {
            throw new RuntimeException("No factory found for model [{$modelName}]. Expected [{$factory}].");
        }

        return $factory;
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
