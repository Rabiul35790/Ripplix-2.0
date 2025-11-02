<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SponsorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:1000',
            'budget_range_min' => 'nullable|numeric|min:0|max:9999999999',
            'budget_range_max' => 'nullable|numeric|min:0|max:9999999999|gte:budget_range_min',
            'message' => 'required|string|max:5000',
            'sponsorship_goals' => 'nullable|string|max:2000',
            'captcha_answer' => 'nullable|integer',
            'g-recaptcha-response' => 'nullable',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Simple rate limiting - max 3 submissions per IP per hour for sponsors
            $recentSubmissions = \App\Models\Sponsor::where('ip_address', request()->ip())
                ->where('created_at', '>', now()->subHour())
                ->count();

            if ($recentSubmissions >= 3) {
                $validator->errors()->add('email', 'Too many sponsorship requests. Please try again later.');
            }
        });
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'company_name.required' => 'Please enter your company or brand name.',
            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'phone.required' => 'Please enter your contact number.',
            'address.required' => 'Please enter your address.',
            'message.required' => 'Please enter your sponsorship message.',
            'message.max' => 'Message cannot exceed 5000 characters.',
            'sponsorship_goals.max' => 'Sponsorship goals cannot exceed 2000 characters.',
            'budget_range_min.numeric' => 'Budget minimum must be a valid number.',
            'budget_range_max.numeric' => 'Budget maximum must be a valid number.',
            'budget_range_max.gte' => 'Budget maximum must be greater than or equal to minimum.',
        ];
    }
}
