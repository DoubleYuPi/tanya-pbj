<?php

namespace Database\Seeders;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    // 3 sample Admins with profiles (spec Part 40), so the directory
    // (Phase 4) isn't empty out of the box. Fictional names, matching
    // the example in spec Part 8/40.
    public function run(): void
    {
        $admins = [
            [
                'name' => 'Ahmad Rizky, S.E.',
                'email' => 'ahmad.rizky@tanyapbj.test',
                'position' => 'Procurement Specialist',
                'organization' => 'UKPBJ Kota Pontianak',
                'bio' => 'Berpengalaman menangani konsultasi tender dan e-katalog sejak 2018.',
                'expertise' => ['Tender', 'E-Katalog', 'Kontrak'],
                'status' => 'online',
            ],
            [
                'name' => 'Siti Nurhaliza, S.T., M.T.',
                'email' => 'siti.nurhaliza@tanyapbj.test',
                'position' => 'Pejabat Fungsional PBJ Ahli Muda',
                'organization' => 'UKPBJ Provinsi Kalimantan Barat',
                'bio' => 'Fokus pada swakelola dan penyusunan HPS untuk proyek infrastruktur.',
                'expertise' => ['Swakelola', 'Regulasi'],
                'status' => 'online',
            ],
            [
                'name' => 'Dedi Kurniawan, S.Kom.',
                'email' => 'dedi.kurniawan@tanyapbj.test',
                'position' => 'Procurement Specialist',
                'organization' => 'UKPBJ Kabupaten Kubu Raya',
                'bio' => 'Membantu UMKM memahami proses pendaftaran E-Katalog.',
                'expertise' => ['E-Katalog', 'Lainnya'],
                'status' => 'away',
            ],
        ];

        foreach ($admins as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_ADMIN,
                    'email_verified_at' => now(),
                ]
            );

            AdminProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'position' => $data['position'],
                    'organization' => $data['organization'],
                    'bio' => $data['bio'],
                    'expertise' => $data['expertise'],
                    'status' => $data['status'],
                    'last_active_at' => now(),
                ]
            );
        }
    }
}
