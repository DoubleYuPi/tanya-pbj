<?php

namespace App\Policies;

use App\Models\Regulation;
use App\Models\User;

class RegulationPolicy
{
    // Anyone (including guests, checked at the route level) can view/
    // download a published regulation — this is public government
    // information. Only Super Admin manages the library (spec Part 23).
    public function view(?User $user, Regulation $regulation): bool
    {
        return $regulation->isPublished() || ($user && $user->isSuperAdmin());
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Regulation $regulation): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Regulation $regulation): bool
    {
        return $user->isSuperAdmin();
    }
}
