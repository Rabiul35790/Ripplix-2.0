interface SeoAnalysis {
    score: number;
    grade: string;
    recommendations: Array<{
        type: 'error' | 'warning' | 'info';
        message: string;
        priority: 'high' | 'medium' | 'low';
    }>;
}

interface SeoSuggestions {
    seo_title?: string;
    meta_description?: string;
    structured_data?: object;
}

class SeoWidget {
    private libraryId: number;
    private apiUrl: string;
    private updateInterval: number = 30000; // 30 seconds

    constructor(libraryId: number, apiUrl: string = '/api/seo') {
        this.libraryId = libraryId;
        this.apiUrl = apiUrl;
        this.init();
    }

    private init(): void {
        this.setupEventListeners();
        this.startRealTimeAnalysis();
    }

    private setupEventListeners(): void {
        // Listen for form changes
        const form = document.querySelector('form[data-seo-form]') as HTMLFormElement;
        if (form) {
            // Fixed: Use proper event handler type instead of debounced function
            const debouncedHandler = this.debounce(this.handleFormChange.bind(this), 1000) as EventListener;
            form.addEventListener('input', debouncedHandler);
        }

        // Setup suggestion buttons
        document.querySelectorAll('[data-seo-suggest]').forEach(button => {
            button.addEventListener('click', this.handleSuggestionClick.bind(this));
        });
    }

    private handleFormChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const seoFields = ['title', 'description', 'seo_title', 'meta_description', 'focus_keyword'];

        if (seoFields.some(field => target.name.includes(field))) {
            this.analyzeSeo();
        }
    }

    private async analyzeSeo(): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/analyze/${this.libraryId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCsrfToken()
                }
            });

            if (response.ok) {
                const analysis: SeoAnalysis = await response.json();
                this.updateSeoDisplay(analysis);
            }
        } catch (error) {
            console.error('SEO analysis failed:', error);
        }
    }

    private async getSuggestions(): Promise<SeoSuggestions> {
        try {
            const response = await fetch(`${this.apiUrl}/suggestions/${this.libraryId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCsrfToken()
                }
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Getting suggestions failed:', error);
        }
        return {};
    }

    private updateSeoDisplay(analysis: SeoAnalysis): void {
        // Update score display
        const scoreElement = document.querySelector('[data-seo-score]');
        if (scoreElement) {
            scoreElement.textContent = `${analysis.score}/100`;
            scoreElement.className = `seo-score ${this.getScoreClass(analysis.score)}`;
        }

        // Update grade display
        const gradeElement = document.querySelector('[data-seo-grade]');
        if (gradeElement) {
            gradeElement.textContent = analysis.grade;
        }

        // Update recommendations
        const recommendationsElement = document.querySelector('[data-seo-recommendations]');
        if (recommendationsElement) {
            recommendationsElement.innerHTML = this.generateRecommendationsHtml(analysis.recommendations);
        }

        // Update progress bar
        const progressBar = document.querySelector('[data-seo-progress]') as HTMLElement;
        if (progressBar) {
            progressBar.style.width = `${analysis.score}%`;
            progressBar.className = `seo-progress ${this.getScoreClass(analysis.score)}`;
        }
    }

    private generateRecommendationsHtml(recommendations: SeoAnalysis['recommendations']): string {
        if (recommendations.length === 0) {
            return '<div class="seo-recommendation success">✅ No issues found!</div>';
        }

        return recommendations.map(rec => `
            <div class="seo-recommendation ${rec.type} priority-${rec.priority}">
                <span class="recommendation-icon">${this.getRecommendationIcon(rec.type)}</span>
                <span class="recommendation-text">${rec.message}</span>
            </div>
        `).join('');
    }

    private getRecommendationIcon(type: string): string {
        const icons: Record<string, string> = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    private getScoreClass(score: number): string {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    private async handleSuggestionClick(event: Event): Promise<void> {
        const button = event.target as HTMLButtonElement;
        const field = button.dataset.seoSuggest;

        if (!field) return;

        button.disabled = true;
        button.textContent = 'Generating...';

        try {
            const suggestions = await this.getSuggestions();
            const suggestion = suggestions[field as keyof SeoSuggestions];

            if (suggestion) {
                const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement;
                if (input) {
                    input.value = typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion, null, 2);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        } finally {
            button.disabled = false;
            button.textContent = 'Generate';
        }
    }

    private startRealTimeAnalysis(): void {
        // Initial analysis
        this.analyzeSeo();

        // Set up periodic updates
        setInterval(() => {
            this.analyzeSeo();
        }, this.updateInterval);
    }

    // Fixed: Updated debounce function with proper typing
    private debounce<T extends (...args: any[]) => void>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout | number;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    private getCsrfToken(): string {
        const token = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
        return token ? token.content : '';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const seoWidget = document.querySelector('[data-seo-widget]');
    if (seoWidget) {
        const libraryId = parseInt(seoWidget.getAttribute('data-library-id') || '0');
        if (libraryId > 0) {
            new SeoWidget(libraryId);
        }
    }
});

export default SeoWidget;
