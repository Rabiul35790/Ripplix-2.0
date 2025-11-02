<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
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
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'captcha_answer' => 'nullable|integer', // For simple math captcha
            'g-recaptcha-response' => 'nullable', // For future reCAPTCHA implementation
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Simple rate limiting - max 5 submissions per IP per hour
            $recentSubmissions = \App\Models\Contact::where('ip_address', request()->ip())
                ->where('created_at', '>', now()->subHour())
                ->count();

            if ($recentSubmissions >= 5) {
                $validator->errors()->add('email', 'Too many submissions. Please try again later.');
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
            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'subject.required' => 'Please enter a subject.',
            'message.required' => 'Please enter your message.',
            'message.max' => 'Message cannot exceed 5000 characters.',
        ];
    }
}
