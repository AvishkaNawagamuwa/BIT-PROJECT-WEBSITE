// Analytics & Reports System JavaScript

// Chart instances storage
let chartInstances = {};

// Sample data for analytics (in real app, this would come from API)
let analyticsData = {
    revenue: JSON.parse(localStorage.getItem('analytics_revenue')) || generateSampleRevenueData(),
    orders: JSON.parse(localStorage.getItem('analytics_orders')) || generateSampleOrderData(),
    customers: JSON.parse(localStorage.getItem('analytics_customers')) || generateSampleCustomerData(),
    products: JSON.parse(localStorage.getItem('analytics_products')) || generateSampleProductData()
};

// Current date range
let currentDateRange = {
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
};

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize background blur effect
    initializeBlurEffect();

    // Set default date range
    setDefaultDateRange();

    // Initialize analytics dashboard
    initializeAnalytics();

    // Set up event listeners
    setupEventListeners();

    console.log('Analytics & Reports System initialized');
});

// Initialize blur effect for modals
function initializeBlurEffect() {
    const modal = document.getElementById('customReportModal');
    if (modal) {
        modal.addEventListener('show.bs.modal', function () {
            const mainContent = document.querySelector('.main-content-wrapper');
            if (mainContent) {
                mainContent.classList.add('blur-background');
            }
        });

        modal.addEventListener('hide.bs.modal', function () {
            const mainContent = document.querySelector('.main-content-wrapper');
            if (mainContent) {
                mainContent.classList.remove('blur-background');
            }
        });
    }
}

// Set default date range
function setDefaultDateRange() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    if (startDate && endDate) {
        startDate.value = currentDateRange.start.toISOString().split('T')[0];
        endDate.value = currentDateRange.end.toISOString().split('T')[0];
    }
}

// Initialize analytics dashboard
function initializeAnalytics() {
    // Update key metrics
    updateKeyMetrics();

    // Initialize all charts
    initializeCharts();

    // Update detailed reports
    updateDetailedReports();

    // Update performance metrics
    updatePerformanceMetrics();

    // Update inventory alerts
    updateInventoryAlerts();
}

// Set up event listeners
function setupEventListeners() {
    // Quick filter buttons
    document.querySelectorAll('.quick-filter').forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            document.querySelectorAll('.quick-filter').forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Apply the filter
            applyQuickFilter(this.dataset.period);
        });
    });
}

// Apply quick filter
function applyQuickFilter(period) {
    const now = new Date();
    let startDate, endDate = new Date();

    switch (period) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStart, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.setDate(now.getDate() - 30));
    }

    currentDateRange = { start: startDate, end: endDate };

    // Update date inputs
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];

    // Refresh all data
    refreshAnalytics();
}

// Apply custom date filter
function applyDateFilter() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    if (startDate > endDate) {
        showAlert('Error', 'Start date cannot be after end date!', 'error');
        return;
    }

    currentDateRange = { start: startDate, end: endDate };

    // Remove active class from quick filters
    document.querySelectorAll('.quick-filter').forEach(btn => btn.classList.remove('active'));

    // Refresh all data
    refreshAnalytics();
}

// Refresh all analytics data
function refreshAnalytics() {
    updateKeyMetrics();
    updateCharts();
    updateDetailedReports();
    updatePerformanceMetrics();
}

// Update key metrics
function updateKeyMetrics() {
    const filteredData = filterDataByDateRange();

    // Calculate metrics
    const totalRevenue = filteredData.revenue.reduce((sum, item) => sum + item.amount, 0);
    const totalOrders = filteredData.orders.length;
    const newCustomers = filteredData.customers.filter(c => c.isNew).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth percentages (comparing with previous period)
    const previousPeriodData = getPreviousPeriodData();
    const revenueGrowth = calculateGrowth(totalRevenue, previousPeriodData.revenue);
    const ordersGrowth = calculateGrowth(totalOrders, previousPeriodData.orders);
    const customersGrowth = calculateGrowth(newCustomers, previousPeriodData.customers);
    const aovGrowth = calculateGrowth(avgOrderValue, previousPeriodData.avgOrderValue);

    // Update DOM
    updateMetricElement('totalRevenue', `Rs. ${totalRevenue.toLocaleString()}`);
    updateMetricElement('totalOrders', totalOrders.toLocaleString());
    updateMetricElement('newCustomers', newCustomers.toLocaleString());
    updateMetricElement('avgOrderValue', `Rs. ${Math.round(avgOrderValue).toLocaleString()}`);

    updateChangeElement('revenueChange', revenueGrowth);
    updateChangeElement('ordersChange', ordersGrowth);
    updateChangeElement('customersChange', customersGrowth);
    updateChangeElement('aovChange', aovGrowth);
}

// Initialize all charts
function initializeCharts() {
    initializeRevenueChart();
    initializeTopProductsChart();
    initializeOrderStatusChart();
    initializeCustomerChart();
}

// Initialize revenue trend chart
function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const filteredData = filterDataByDateRange();
    const revenueByDay = aggregateRevenueByDay(filteredData.revenue);

    if (chartInstances.revenueChart) {
        chartInstances.revenueChart.destroy();
    }

    chartInstances.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenueByDay.labels,
            datasets: [{
                label: 'Revenue (Rs.)',
                data: revenueByDay.data,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'Rs. ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Initialize top products chart
function initializeTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    const topProducts = getTopProducts();

    if (chartInstances.topProductsChart) {
        chartInstances.topProductsChart.destroy();
    }

    chartInstances.topProductsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: topProducts.labels,
            datasets: [{
                data: topProducts.data,
                backgroundColor: [
                    '#22C55E',
                    '#10B981',
                    '#059669',
                    '#047857',
                    '#065F46'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize order status chart
function initializeOrderStatusChart() {
    const ctx = document.getElementById('orderStatusChart');
    if (!ctx) return;

    const statusData = getOrderStatusData();

    if (chartInstances.orderStatusChart) {
        chartInstances.orderStatusChart.destroy();
    }

    chartInstances.orderStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: statusData.labels,
            datasets: [{
                data: statusData.data,
                backgroundColor: [
                    '#22C55E',
                    '#3B82F6',
                    '#F59E0B',
                    '#EF4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize customer acquisition chart
function initializeCustomerChart() {
    const ctx = document.getElementById('customerChart');
    if (!ctx) return;

    const customerData = getCustomerAcquisitionData();

    if (chartInstances.customerChart) {
        chartInstances.customerChart.destroy();
    }

    chartInstances.customerChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: customerData.labels,
            datasets: [{
                label: 'New Customers',
                data: customerData.data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Update all charts
function updateCharts() {
    initializeRevenueChart();
    initializeTopProductsChart();
    initializeOrderStatusChart();
    initializeCustomerChart();
}

// Update detailed reports
function updateDetailedReports() {
    updateSalesReport();
}

// Update sales report table
function updateSalesReport() {
    const salesReportBody = document.getElementById('salesReportBody');
    if (!salesReportBody) return;

    const salesData = getSalesReportData();

    salesReportBody.innerHTML = salesData.map(item => `
        <tr>
            <td>${item.period}</td>
            <td>Rs. ${item.revenue.toLocaleString()}</td>
            <td>${item.orders}</td>
            <td>
                <span class="badge ${item.growth >= 0 ? 'bg-success' : 'bg-danger'}">
                    ${item.growth >= 0 ? '+' : ''}${item.growth.toFixed(1)}%
                </span>
            </td>
        </tr>
    `).join('');
}

// Update performance metrics
function updatePerformanceMetrics() {
    const metrics = calculatePerformanceMetrics();

    updateMetricElement('conversionRate', `${metrics.conversionRate}%`);
    updateMetricElement('retentionRate', `${metrics.retentionRate}%`);
    updateMetricElement('deliverySuccess', `${metrics.deliverySuccess}%`);
    updateMetricElement('avgFulfillment', `${metrics.avgFulfillment} hours`);
}

// Update inventory alerts
function updateInventoryAlerts() {
    const alertsContainer = document.getElementById('inventoryAlerts');
    if (!alertsContainer) return;

    const alerts = getInventoryAlerts();

    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<p class="text-muted text-center">No inventory alerts</p>';
        return;
    }

    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${alert.icon} me-2"></i>
            <strong>${alert.title}</strong><br>
            ${alert.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `).join('');
}

// Export report functionality
function exportReport(format) {
    showAlert('Info', `Exporting report as ${format.toUpperCase()}...`, 'info');

    // In a real application, this would generate and download the report
    setTimeout(() => {
        showAlert('Success', `Report exported successfully as ${format.toUpperCase()}!`, 'success');
    }, 2000);
}

// Generate custom report
function generateCustomReport() {
    const form = document.getElementById('customReportForm');
    const formData = new FormData(form);

    const reportConfig = {
        name: formData.get('reportName'),
        type: formData.get('reportType'),
        startDate: formData.get('customStartDate'),
        endDate: formData.get('customEndDate'),
        includeRevenue: document.getElementById('includeRevenue').checked,
        includeOrders: document.getElementById('includeOrders').checked,
        includeCustomers: document.getElementById('includeCustomers').checked,
        includeProducts: document.getElementById('includeProducts').checked,
        includeDeliveries: document.getElementById('includeDeliveries').checked,
        includeCharts: document.getElementById('includeCharts').checked,
        description: formData.get('reportDescription')
    };

    if (!reportConfig.name || !reportConfig.type || !reportConfig.startDate || !reportConfig.endDate) {
        showAlert('Error', 'Please fill in all required fields!', 'error');
        return;
    }

    // Save custom report config to localStorage
    const customReports = JSON.parse(localStorage.getItem('customReports')) || [];
    customReports.push({
        ...reportConfig,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('customReports', JSON.stringify(customReports));

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('customReportModal'));
    modal.hide();

    // Reset form
    form.reset();

    showAlert('Success', 'Custom report created successfully!', 'success');
}

// Helper functions for data processing

function filterDataByDateRange() {
    return {
        revenue: analyticsData.revenue.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= currentDateRange.start && itemDate <= currentDateRange.end;
        }),
        orders: analyticsData.orders.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= currentDateRange.start && itemDate <= currentDateRange.end;
        }),
        customers: analyticsData.customers.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= currentDateRange.start && itemDate <= currentDateRange.end;
        })
    };
}

function getPreviousPeriodData() {
    const periodLength = currentDateRange.end - currentDateRange.start;
    const previousStart = new Date(currentDateRange.start - periodLength);
    const previousEnd = new Date(currentDateRange.start);

    const previousRevenue = analyticsData.revenue
        .filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= previousStart && itemDate < previousEnd;
        })
        .reduce((sum, item) => sum + item.amount, 0);

    const previousOrders = analyticsData.orders
        .filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= previousStart && itemDate < previousEnd;
        }).length;

    const previousCustomers = analyticsData.customers
        .filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= previousStart && itemDate < previousEnd && item.isNew;
        }).length;

    return {
        revenue: previousRevenue,
        orders: previousOrders,
        customers: previousCustomers,
        avgOrderValue: previousOrders > 0 ? previousRevenue / previousOrders : 0
    };
}

function calculateGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

function aggregateRevenueByDay(revenueData) {
    const dayMap = new Map();

    revenueData.forEach(item => {
        const day = new Date(item.date).toLocaleDateString();
        dayMap.set(day, (dayMap.get(day) || 0) + item.amount);
    });

    const sortedDays = Array.from(dayMap.keys()).sort((a, b) => new Date(a) - new Date(b));

    return {
        labels: sortedDays,
        data: sortedDays.map(day => dayMap.get(day))
    };
}

function getTopProducts() {
    const productSales = new Map();

    analyticsData.products.forEach(product => {
        productSales.set(product.name, (productSales.get(product.name) || 0) + product.sales);
    });

    const sorted = Array.from(productSales.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
        labels: sorted.map(item => item[0]),
        data: sorted.map(item => item[1])
    };
}

function getOrderStatusData() {
    const statusCounts = {
        'Completed': 0,
        'Processing': 0,
        'Pending': 0,
        'Cancelled': 0
    };

    analyticsData.orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return {
        labels: Object.keys(statusCounts),
        data: Object.values(statusCounts)
    };
}

function getCustomerAcquisitionData() {
    const acquisitionByWeek = new Map();

    analyticsData.customers.forEach(customer => {
        if (customer.isNew) {
            const week = getWeekKey(new Date(customer.date));
            acquisitionByWeek.set(week, (acquisitionByWeek.get(week) || 0) + 1);
        }
    });

    const sortedWeeks = Array.from(acquisitionByWeek.keys()).sort();

    return {
        labels: sortedWeeks,
        data: sortedWeeks.map(week => acquisitionByWeek.get(week) || 0)
    };
}

function getSalesReportData() {
    // Generate weekly sales data
    const weeklyData = [];
    const currentDate = new Date();

    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekRevenue = analyticsData.revenue
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= weekStart && itemDate <= weekEnd;
            })
            .reduce((sum, item) => sum + item.amount, 0);

        const weekOrders = analyticsData.orders
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= weekStart && itemDate <= weekEnd;
            }).length;

        const prevWeekRevenue = i < 3 ? weeklyData[weeklyData.length - 1]?.revenue || 0 : weekRevenue * 0.9;
        const growth = calculateGrowth(weekRevenue, prevWeekRevenue);

        weeklyData.push({
            period: `Week ${4 - i}`,
            revenue: weekRevenue,
            orders: weekOrders,
            growth: growth
        });
    }

    return weeklyData;
}

function calculatePerformanceMetrics() {
    const filteredData = filterDataByDateRange();

    // Calculate conversion rate (orders / visitors)
    const visitors = filteredData.customers.length * 3; // Assume 3x visitors than customers
    const conversionRate = visitors > 0 ? (filteredData.orders.length / visitors * 100) : 0;

    // Calculate retention rate
    const returningCustomers = filteredData.customers.filter(c => !c.isNew).length;
    const totalCustomers = filteredData.customers.length;
    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers * 100) : 0;

    // Calculate delivery success rate
    const deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    const successfulDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const deliverySuccess = deliveries.length > 0 ? (successfulDeliveries / deliveries.length * 100) : 0;

    // Calculate average fulfillment time
    const avgFulfillment = 2.5; // Placeholder value

    return {
        conversionRate: conversionRate.toFixed(1),
        retentionRate: retentionRate.toFixed(1),
        deliverySuccess: deliverySuccess.toFixed(1),
        avgFulfillment: avgFulfillment.toFixed(1)
    };
}

function getInventoryAlerts() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const alerts = [];

    inventory.forEach(item => {
        if (item.stock <= item.reorderLevel) {
            alerts.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                title: 'Low Stock Alert',
                message: `${item.name} is running low (${item.stock} units remaining)`
            });
        }

        if (item.stock === 0) {
            alerts.push({
                type: 'danger',
                icon: 'ban',
                title: 'Out of Stock',
                message: `${item.name} is completely out of stock`
            });
        }
    });

    return alerts.slice(0, 5); // Show only top 5 alerts
}

function getWeekKey(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return `Week ${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
}

function updateMetricElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function updateChangeElement(elementId, growth) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        element.className = `change ${growth >= 0 ? 'positive' : 'negative'}`;
    }
}

// Sample data generators
function generateSampleRevenueData() {
    const data = [];
    const now = new Date();

    for (let i = 60; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const baseAmount = 15000 + Math.random() * 10000;
        const weekdayMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1;

        data.push({
            date: date.toISOString(),
            amount: Math.round(baseAmount * weekdayMultiplier)
        });
    }

    localStorage.setItem('analytics_revenue', JSON.stringify(data));
    return data;
}

function generateSampleOrderData() {
    const data = [];
    const now = new Date();
    const statuses = ['Completed', 'Processing', 'Pending', 'Cancelled'];

    for (let i = 60; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const orderCount = 10 + Math.floor(Math.random() * 20);

        for (let j = 0; j < orderCount; j++) {
            data.push({
                date: date.toISOString(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                amount: 500 + Math.random() * 2000
            });
        }
    }

    localStorage.setItem('analytics_orders', JSON.stringify(data));
    return data;
}

function generateSampleCustomerData() {
    const data = [];
    const now = new Date();

    for (let i = 60; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const newCustomerCount = Math.floor(Math.random() * 5);
        const returningCustomerCount = Math.floor(Math.random() * 15);

        for (let j = 0; j < newCustomerCount; j++) {
            data.push({
                date: date.toISOString(),
                isNew: true
            });
        }

        for (let j = 0; j < returningCustomerCount; j++) {
            data.push({
                date: date.toISOString(),
                isNew: false
            });
        }
    }

    localStorage.setItem('analytics_customers', JSON.stringify(data));
    return data;
}

function generateSampleProductData() {
    const products = ['Rice (1kg)', 'Milk Powder', 'Bread', 'Eggs (1 dozen)', 'Sugar (1kg)', 'Tea Packets', 'Oil (1L)', 'Flour (1kg)'];
    const data = [];

    products.forEach(product => {
        data.push({
            name: product,
            sales: 50 + Math.floor(Math.random() * 200)
        });
    });

    localStorage.setItem('analytics_products', JSON.stringify(data));
    return data;
}

// Show alert using SweetAlert2
function showAlert(title, message, type) {
    Swal.fire({
        title: title,
        text: message,
        icon: type,
        confirmButtonColor: '#22C55E'
    });
}