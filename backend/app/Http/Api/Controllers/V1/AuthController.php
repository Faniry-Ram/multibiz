<?php

namespace App\Http\Api\Controllers\V1;

use App\Domain\Identity\Models\User;
use App\Http\Api\Requests\V1\LoginRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Issues/revokes the personal access tokens the mobile app authenticates with — see
 * ADR 0001 (session guard for web, Sanctum tokens for the API).
 */
class AuthController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! Auth::validate(['email' => $data['email'], 'password' => $data['password']])) {
            throw ValidationException::withMessages([
                'email' => [__('These credentials do not match our records.')],
            ]);
        }

        /** @var User $user */
        $user = User::where('email', $data['email'])->firstOrFail();

        $token = $user->createToken($data['device_name']);

        return response()->json(['token' => $token->plainTextToken]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(status: 204);
    }
}
