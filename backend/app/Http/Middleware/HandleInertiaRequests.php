<?php

namespace App\Http\Middleware;

use App\Domain\Analytics\Enums\Verdict;
use App\Domain\Analytics\Services\ProjectResult;
use App\Domain\Analytics\Services\ProjectVerdict;
use App\Domain\Finance\Models\Category;
use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Models\Project;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    private const VERDICT_TONES = [
        Verdict::Profitable->value => 'pos',
        Verdict::Watch->value => 'warn',
        Verdict::Starting->value => 'primary',
        Verdict::Loss->value => 'neg',
    ];

    public function __construct(
        private ProjectResult $projectResult,
        private ProjectVerdict $projectVerdict,
    ) {}

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'appearance' => $request->cookie('appearance', 'system'),
            'sidebarProjects' => $this->sidebarProjects($request),
            'syncStatus' => ['state' => 'synced'],
            // Mobile-only feature (a project timer kept running on the phone); the
            // web app has nothing to report yet — see docs/maquette/README.md §3.
            'activeTimer' => null,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function sidebarProjects(Request $request): array
    {
        $organization = $request->user()?->organizations()->first();

        if ($organization === null) {
            return [];
        }

        return Project::query()
            ->where('organization_id', $organization->id)
            ->where('status', ProjectStatus::Active)
            ->orderBy('name')
            ->get()
            ->map(function (Project $project) {
                $verdict = $this->projectVerdict->determine($project);

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'color' => $project->color,
                    'href' => route('projects.show', $project),
                    'model' => $project->model->value,
                    'capital_recovered_percent' => round($this->projectResult->capitalRecoveredPercent($project)),
                    'verdict' => $verdict->value,
                    'verdict_tone' => self::VERDICT_TONES[$verdict->value],
                    'categories' => $project->categories()
                        ->whereNull('archived_at')
                        ->orderBy('kind')
                        ->orderBy('name')
                        ->get()
                        ->map(fn (Category $category) => [
                            'id' => $category->id,
                            'name' => $category->name,
                            'kind' => $category->kind->value,
                        ]),
                ];
            })
            ->values()
            ->all();
    }
}
