<?php

namespace Database\Factories;

use App\Models\Ad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ad>
 */
class AdFactory extends Factory
{
    protected $model = Ad::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'image' => 'ads/sample-ad.jpg', // You'll need to put sample images in storage/app/public/ads/
            'target_url' => fake()->url(),
            'start_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'end_date' => fake()->dateTimeBetween('now', '+60 days'),
            'status' => fake()->randomElement(['active', 'inactive']),
            'position' => fake()->randomElement(['sidebar', 'modal']),
            'clicks' => fake()->numberBetween(0, 1000),
        ];
    }

    /**
     * Indicate that the ad is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(30),
        ]);
    }

    /**
     * Indicate that the ad is for sidebar.
     */
    public function sidebar(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => 'sidebar',
        ]);
    }

    /**
     * Indicate that the ad is for modal.
     */
    public function modal(): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => 'modal',
        ]);
    }
}
