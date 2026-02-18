import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticService } from '../../services/statistic.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface LegendItem {
    label: string;
    value: number;
    percent: string;
    color: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('paymentChartCanvas') paymentChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('usersChartCanvas') usersChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef<HTMLCanvasElement>;

    // ── Global Stats ──────────────────────────────────────────────
    selectedYear: number = new Date().getFullYear();
    availableYears: number[] = [];

    globalStats: any = null;
    globalLoading = false;
    globalError = '';

    // ── Payment Chart ─────────────────────────────────────────────
    paymentChart: Chart | null = null;
    paymentLoading = false;

    // ── Users Stats ───────────────────────────────────────────────
    startDate: string = '';
    endDate: string = '';
    usersChart: Chart | null = null;
    doughnutChart: Chart | null = null;
    usersLoading = false;
    usersError = '';
    doughnutLegend: LegendItem[] = [];

    private readonly DOUGHNUT_COLORS = ['#6366f1', '#f59e0b'];

    constructor(
        private statisticService: StatisticService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Build year list (current year - 4 → current year)
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= currentYear - 4; y--) {
            this.availableYears.push(y);
        }

        // Default date range: last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        this.endDate = this.formatDateInput(today);
        this.startDate = this.formatDateInput(thirtyDaysAgo);
    }

    ngAfterViewInit(): void {
        // Defer to next tick to avoid NG0100 (ExpressionChangedAfterItHasBeenChecked)
        setTimeout(() => {
            this.loadGlobalStats();
            this.loadPaymentStats();
            this.loadUsersStats();
        }, 0);
    }

    ngOnDestroy(): void {
        this.paymentChart?.destroy();
        this.usersChart?.destroy();
        this.doughnutChart?.destroy();
    }

    // ── Helpers ───────────────────────────────────────────────────
    private formatDateInput(d: Date): string {
        return d.toISOString().split('T')[0];
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
    }

    formatNumber(value: number): string {
        return new Intl.NumberFormat('fr-FR').format(value);
    }

    getTrendClass(diff: number): string {
        return diff >= 0 ? 'positive' : 'negative';
    }

    getTrendLabel(diff: number): string {
        return (diff >= 0 ? '+' : '') + diff + '%';
    }

    // ── Global Stats ──────────────────────────────────────────────
    onYearChange(): void {
        this.loadGlobalStats();
        this.loadPaymentStats();
    }

    loadGlobalStats(): void {
        this.globalLoading = true;
        this.globalError = '';
        this.statisticService.getGlobalStats(this.selectedYear).subscribe({
            next: (data) => {
                this.globalStats = data;
                this.globalLoading = false;
            },
            error: (err) => {
                this.globalError = 'Erreur lors du chargement des statistiques globales.';
                this.globalLoading = false;
            }
        });
    }

    // ── Payment Chart ─────────────────────────────────────────────
    loadPaymentStats(): void {
        this.paymentLoading = true;
        this.statisticService.getPaymentStats(this.selectedYear).subscribe({
            next: (data) => {
                this.paymentLoading = false;
                this.renderPaymentChart(data);
            },
            error: () => {
                this.paymentLoading = false;
            }
        });
    }

    private renderPaymentChart(data: any): void {
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const amounts = monthNames.map((_, i) => data[i + 1]?.amount ?? 0);

        if (this.paymentChart) {
            this.paymentChart.destroy();
        }

        const ctx = this.paymentChartCanvas?.nativeElement;
        if (!ctx) return;

        this.paymentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthNames,
                datasets: [{
                    label: 'Revenus (€)',
                    data: amounts,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(ctx.parsed.y ?? 0)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => new Intl.NumberFormat('fr-MG', { notation: 'compact', style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value as number)
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // ── Users Stats ───────────────────────────────────────────────
    onDateChange(): void {
        if (this.startDate && this.endDate) {
            this.loadUsersStats();
        }
    }

    loadUsersStats(): void {
        if (!this.startDate || !this.endDate) return;
        this.usersLoading = true;
        this.usersError = '';
        this.statisticService.getUsersStats(this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.usersLoading = false;
                this.renderUsersChart(data.dailyStats);
                this.renderDoughnutChart(data.distribution);
            },
            error: (err) => {
                this.usersError = err?.error?.message || 'Erreur lors du chargement des statistiques utilisateurs.';
                this.usersLoading = false;
            }
        });
    }

    private renderUsersChart(dailyStats: any): void {
        const labels = Object.keys(dailyStats).sort();
        const values = labels.map(d => dailyStats[d].created);

        if (this.usersChart) {
            this.usersChart.destroy();
        }

        const ctx = this.usersChartCanvas?.nativeElement;
        if (!ctx) return;

        this.usersChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Nouveaux acheteurs',
                    data: values,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#22c55e',
                    pointRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} utilisateur(s)` } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8', stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', maxTicksLimit: 10 }
                    }
                }
            }
        });
    }

    private renderDoughnutChart(distribution: { buyer: number; shop: number }): void {
        const total = (distribution.buyer || 0) + (distribution.shop || 0);

        if (this.doughnutChart) {
            this.doughnutChart.destroy();
        }

        const ctx = this.doughnutChartCanvas?.nativeElement;
        if (!ctx) return;

        const labels = ['Acheteurs', 'Boutiques'];
        const values = [distribution.buyer || 0, distribution.shop || 0];

        this.doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: this.DOUGHNUT_COLORS,
                    borderColor: 'transparent',
                    borderWidth: 0,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const val = ctx.parsed;
                                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                                return ` ${ctx.label}: ${val} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Build custom legend
        this.doughnutLegend = labels.map((label, i) => {
            const val = values[i];
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return { label, value: val, percent: pct, color: this.DOUGHNUT_COLORS[i] };
        });
        this.cdr.detectChanges();
    }
}
