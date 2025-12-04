<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Country;
use App\Models\Category;
use App\Models\Law;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================
        // CREATE ADMIN USER
        // ============================================
        User::create([
            'name' => 'Admin',
            'email' => 'admin@labourlaw.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'reputation' => 1000,
            'level' => 'expert',
        ]);

        // Create demo user
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'reputation' => 50,
            'level' => 'beginner',
        ]);

        // ============================================
        // CREATE COUNTRIES
        // ============================================
        $countries = [
            ['name' => 'United Arab Emirates', 'name_ar' => 'الإمارات العربية المتحدة', 'code' => 'AE', 'flag' => '🇦🇪'],
            ['name' => 'Saudi Arabia', 'name_ar' => 'المملكة العربية السعودية', 'code' => 'SA', 'flag' => '🇸🇦'],
            ['name' => 'Kuwait', 'name_ar' => 'الكويت', 'code' => 'KW', 'flag' => '🇰🇼'],
            ['name' => 'Qatar', 'name_ar' => 'قطر', 'code' => 'QA', 'flag' => '🇶🇦'],
            ['name' => 'Bahrain', 'name_ar' => 'البحرين', 'code' => 'BH', 'flag' => '🇧🇭'],
            ['name' => 'Oman', 'name_ar' => 'عُمان', 'code' => 'OM', 'flag' => '🇴🇲'],
        ];

        foreach ($countries as $country) {
            Country::create($country);
        }

        // ============================================
        // CREATE CATEGORIES
        // ============================================
        $categories = [
            ['name' => 'Employment Contracts', 'name_ar' => 'عقود العمل', 'icon' => 'FileText'],
            ['name' => 'Working Hours', 'name_ar' => 'ساعات العمل', 'icon' => 'Clock'],
            ['name' => 'Wages & Benefits', 'name_ar' => 'الأجور والمزايا', 'icon' => 'DollarSign'],
            ['name' => 'Leave Entitlements', 'name_ar' => 'استحقاقات الإجازات', 'icon' => 'Calendar'],
            ['name' => 'End of Service', 'name_ar' => 'نهاية الخدمة', 'icon' => 'Award'],
            ['name' => 'Termination', 'name_ar' => 'إنهاء العمل', 'icon' => 'UserMinus'],
            ['name' => 'Health & Safety', 'name_ar' => 'الصحة والسلامة', 'icon' => 'Shield'],
            ['name' => 'Disputes', 'name_ar' => 'النزاعات', 'icon' => 'Scale'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // ============================================
        // CREATE SAMPLE LAWS
        // ============================================
        $laws = [
            [
                'country_id' => 1, // UAE
                'category_id' => 1, // Employment Contracts
                'title' => 'Employment Contract Requirements',
                'title_ar' => 'متطلبات عقد العمل',
                'content' => 'According to UAE Labour Law, every employment contract must be in writing and in Arabic. It should specify the nature of work, remuneration, and contract duration.',
                'content_ar' => 'وفقًا لقانون العمل الإماراتي، يجب أن يكون كل عقد عمل مكتوبًا وباللغة العربية. ويجب أن يحدد طبيعة العمل والأجر ومدة العقد.',
                'article_number' => 'Article 8',
            ],
            [
                'country_id' => 1, // UAE
                'category_id' => 3, // Wages
                'title' => 'Minimum Wage Regulations',
                'title_ar' => 'لوائح الحد الأدنى للأجور',
                'content' => 'While UAE does not have a general minimum wage, employers must ensure wages are sufficient to meet basic needs. Wages must be paid in UAE Dirhams.',
                'content_ar' => 'على الرغم من عدم وجود حد أدنى عام للأجور في الإمارات، يجب على أصحاب العمل ضمان أن الأجور كافية لتلبية الاحتياجات الأساسية.',
                'article_number' => 'Article 55',
            ],
            [
                'country_id' => 1, // UAE
                'category_id' => 5, // End of Service
                'title' => 'End of Service Gratuity',
                'title_ar' => 'مكافأة نهاية الخدمة',
                'content' => 'Employees who complete one year of service are entitled to end of service gratuity. For unlimited contracts: 21 days salary for each of the first 5 years, and 30 days for each subsequent year.',
                'content_ar' => 'يحق للموظفين الذين أكملوا سنة واحدة من الخدمة الحصول على مكافأة نهاية الخدمة. للعقود غير المحددة: 21 يومًا عن كل سنة من السنوات الخمس الأولى، و30 يومًا عن كل سنة تالية.',
                'article_number' => 'Article 132',
            ],
            [
                'country_id' => 2, // Saudi Arabia
                'category_id' => 2, // Working Hours
                'title' => 'Maximum Working Hours',
                'title_ar' => 'الحد الأقصى لساعات العمل',
                'content' => 'Regular working hours shall not exceed 8 hours per day or 48 hours per week. During Ramadan, working hours for Muslims shall be reduced to 6 hours per day or 36 hours per week.',
                'content_ar' => 'لا يجوز أن تتجاوز ساعات العمل العادية 8 ساعات في اليوم أو 48 ساعة في الأسبوع. خلال شهر رمضان، تُخفض ساعات العمل للمسلمين إلى 6 ساعات يوميًا أو 36 ساعة أسبوعيًا.',
                'article_number' => 'Article 98',
            ],
            [
                'country_id' => 2, // Saudi Arabia
                'category_id' => 4, // Leave
                'title' => 'Annual Leave Entitlement',
                'title_ar' => 'استحقاق الإجازة السنوية',
                'content' => 'Every worker is entitled to annual leave of not less than 21 days for each year of service. This increases to 30 days after completing 5 years of continuous service.',
                'content_ar' => 'يحق لكل عامل إجازة سنوية لا تقل عن 21 يومًا عن كل سنة خدمة. تزداد إلى 30 يومًا بعد إكمال 5 سنوات من الخدمة المستمرة.',
                'article_number' => 'Article 109',
            ],
            [
                'country_id' => 3, // Kuwait
                'category_id' => 5, // End of Service
                'title' => 'Indemnity Calculation',
                'title_ar' => 'حساب التعويض',
                'content' => 'Workers are entitled to end of service indemnity calculated as 15 days pay for each of the first 5 years and one month pay for each subsequent year.',
                'content_ar' => 'يحق للعمال تعويض نهاية الخدمة محسوبًا على أساس 15 يوم أجر عن كل سنة من السنوات الخمس الأولى وشهر أجر عن كل سنة تالية.',
                'article_number' => 'Article 51',
            ],
        ];

        foreach ($laws as $law) {
            Law::create($law);
        }

        // ============================================
        // CREATE SETTINGS
        // ============================================
        \App\Models\Setting::insert([
            ['key' => 'app_name', 'value' => 'Labour Laws Platform', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'app_name_ar', 'value' => 'مركز قوانين العمل', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'primary_color', 'value' => '#6366f1', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'secondary_color', 'value' => '#8b5cf6', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('');
        $this->command->info('Admin Login:');
        $this->command->info('  Email: admin@labourlaw.com');
        $this->command->info('  Password: admin123');
    }
}

