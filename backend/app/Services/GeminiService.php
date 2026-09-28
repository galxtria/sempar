<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    private ?string $apiKey;
    private string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key') ?: null;
    }

    /**
     * true = relevan, false = tidak relevan, null = AI tidak dapat memastikan (perlu review manual)
     */
    public function validateSummary(string $summary, string $seminarTitle): ?bool
    {
        if (!$this->apiKey) {
            return str_word_count($summary) >= 10 && strlen($summary) > 30;
        }
        $prompt = "Judul: '{$seminarTitle}' Ringkasan: \"{$summary}\" Relevan? Jawab valid/invalid saja. Pendek <10 kata = invalid.";
        try {
            $response = Http::timeout(15)->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);
            if ($response->successful()) {
                $text = strtolower($response->json('candidates.0.content.parts.0.text', ''));
                if ($text === '') {
                    return null;
                }
                return str_contains($text, 'valid') && !str_contains($text, 'invalid');
            }
        } catch (\Exception $e) {
            logger()->error('Gemini ' . $e->getMessage());
        }
        return null;
    }
}
