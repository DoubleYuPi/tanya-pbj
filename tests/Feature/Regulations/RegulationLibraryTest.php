<?php

namespace Tests\Feature\Regulations;

use App\Models\Regulation;
use App\Models\RegulationCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegulationLibraryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('regulations');
    }

    public function test_guests_can_browse_the_public_regulation_library(): void
    {
        Regulation::factory()->create(['status' => Regulation::STATUS_PUBLISHED]);

        $this->get(route('regulations.index'))->assertOk();
    }

    public function test_guests_can_view_and_download_a_published_regulation(): void
    {
        $regulation = Regulation::factory()->create(['status' => Regulation::STATUS_PUBLISHED]);

        $this->get(route('regulations.show', $regulation))->assertOk();
        $this->get(route('regulations.download', $regulation))->assertOk();
    }

    public function test_draft_regulations_are_not_publicly_visible(): void
    {
        $regulation = Regulation::factory()->create(['status' => Regulation::STATUS_DRAFT]);

        $this->get(route('regulations.show', $regulation))->assertForbidden();
    }

    public function test_super_admin_can_view_a_draft_regulation(): void
    {
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
        $regulation = Regulation::factory()->create(['status' => Regulation::STATUS_DRAFT]);

        $this->actingAs($superAdmin)->get(route('regulations.show', $regulation))->assertOk();
    }

    public function test_only_super_admin_can_reach_the_regulation_cms(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($user)->get(route('admin.regulations.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.regulations.index'))->assertForbidden();
        $this->actingAs($superAdmin)->get(route('admin.regulations.index'))->assertOk();
    }

    public function test_super_admin_can_upload_a_regulation_with_a_pdf(): void
    {
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
        $category = RegulationCategory::factory()->create();

        $response = $this->actingAs($superAdmin)->post(route('admin.regulations.store'), [
            'regulation_category_id' => $category->id,
            'title' => 'Peraturan Uji Coba',
            'year' => 2026,
            'status' => 'published',
            'file' => UploadedFile::fake()->create('peraturan.pdf', 500, 'application/pdf'),
        ]);

        $response->assertRedirect(route('admin.regulations.index'));
        $this->assertDatabaseHas('regulations', ['title' => 'Peraturan Uji Coba']);
    }

    public function test_regulation_upload_rejects_non_pdf_files(): void
    {
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
        $category = RegulationCategory::factory()->create();

        $response = $this->actingAs($superAdmin)->post(route('admin.regulations.store'), [
            'regulation_category_id' => $category->id,
            'title' => 'Peraturan Uji Coba',
            'year' => 2026,
            'status' => 'published',
            'file' => UploadedFile::fake()->create('peraturan.exe', 500, 'application/x-msdownload'),
        ]);

        $response->assertSessionHasErrors('file');
        $this->assertDatabaseMissing('regulations', ['title' => 'Peraturan Uji Coba']);
    }

    public function test_regular_user_cannot_upload_a_regulation(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $category = RegulationCategory::factory()->create();

        $this->actingAs($user)->post(route('admin.regulations.store'), [
            'regulation_category_id' => $category->id,
            'title' => 'Peraturan Uji Coba',
            'year' => 2026,
            'status' => 'published',
            'file' => UploadedFile::fake()->create('peraturan.pdf', 500, 'application/pdf'),
        ])->assertForbidden();

        $this->assertDatabaseMissing('regulations', ['title' => 'Peraturan Uji Coba']);
    }
}
