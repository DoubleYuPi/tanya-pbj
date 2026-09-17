<?php

namespace Tests\Feature;

use App\Models\AdminProfile;
use App\Models\Regulation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('regulations');
    }

    public function test_search_page_is_publicly_accessible(): void
    {
        $this->get(route('search'))->assertOk();
    }

    public function test_search_finds_published_regulations_by_title(): void
    {
        Regulation::factory()->create([
            'title' => 'Peraturan tentang Swakelola Tipe I',
            'status' => Regulation::STATUS_PUBLISHED,
        ]);

        $this->get(route('search', ['q' => 'Swakelola']))
            ->assertOk()
            ->assertSee('Swakelola');
    }

    public function test_search_does_not_return_draft_regulations(): void
    {
        Regulation::factory()->create([
            'title' => 'Draft Rahasia Belum Terbit',
            'status' => Regulation::STATUS_DRAFT,
        ]);

        $this->get(route('search', ['q' => 'Rahasia']))
            ->assertOk()
            ->assertDontSee('Draft Rahasia Belum Terbit');
    }

    public function test_search_results_never_expose_admin_email(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'name' => 'Admin Pencarian',
            'email' => 'rahasia@tanyapbj.test',
        ]);
        AdminProfile::factory()->create(['user_id' => $admin->id]);

        $this->get(route('search', ['q' => 'Admin Pencarian']))
            ->assertOk()
            ->assertSee('Admin Pencarian')
            ->assertDontSee('rahasia@tanyapbj.test');
    }
}
