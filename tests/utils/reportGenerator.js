import fs from 'fs';
import path from 'path';

/**
 * Lớp ReportGenerator dùng để tạo báo cáo kiểm thử
 * Có thể tạo báo cáo dạng Text, JSON và HTML
 */
class ReportGenerator {
  constructor() {
    this.results = {
      passes: [],
      failures: [],
      pending: [],
      stats: {
        suites: 0,
        tests: 0,
        passes: 0,
        failures: 0,
        pending: 0,
        start: new Date(),
        end: null,
        duration: 0
      }
    };
    
    this.outputDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Thiết lập Mocha reporter để ghi lại kết quả test
   * @returns {Object} reporter object cho Mocha
   */
  getMochaReporter() {
    const self = this;
    return {
      // Sự kiện start: khi bắt đầu toàn bộ test suite
      start: function() {
        self.results.stats.start = new Date();
      },
      
      // Sự kiện pass: khi một test case thành công
      pass: function(test) {
        self.results.passes.push({
          title: test.title,
          fullTitle: test.fullTitle(),
          duration: test.duration,
          file: test.file
        });
        self.results.stats.passes += 1;
      },
      
      // Sự kiện fail: khi một test case thất bại
      fail: function(test, err) {
        self.results.failures.push({
          title: test.title,
          fullTitle: test.fullTitle(),
          duration: test.duration,
          error: err.message,
          stack: err.stack,
          file: test.file
        });
        self.results.stats.failures += 1;
      },
      
      // Sự kiện pending: khi một test case bị bỏ qua
      pending: function(test) {
        self.results.pending.push({
          title: test.title,
          fullTitle: test.fullTitle(),
          file: test.file
        });
        self.results.stats.pending += 1;
      },
      
      // Sự kiện end: khi kết thúc toàn bộ test suite
      end: function() {
        self.results.stats.end = new Date();
        self.results.stats.duration = 
          self.results.stats.end - self.results.stats.start;
        self.results.stats.tests = 
          self.results.stats.passes + 
          self.results.stats.failures + 
          self.results.stats.pending;
      }
    };
  }

  /**
   * Tạo báo cáo dạng text
   * @param {String} filename Tên file báo cáo
   */
  generateTextReport(filename = 'test-report.txt') {
    const filePath = path.join(this.outputDir, filename);
    const data = [];
    
    // Header
    data.push('======================================================');
    data.push('               BÁO CÁO KIỂM THỬ');
    data.push('======================================================');
    data.push(`Thời gian: ${new Date().toLocaleString()}`);
    data.push(`Tổng số test: ${this.results.stats.tests}`);
    data.push(`Thành công: ${this.results.stats.passes}`);
    data.push(`Thất bại: ${this.results.stats.failures}`);
    data.push(`Bỏ qua: ${this.results.stats.pending}`);
    data.push(`Thời gian thực thi: ${this.results.stats.duration / 1000} giây`);
    data.push('======================================================\n');
    
    // Test cases passed
    data.push('CÁC TEST CASE THÀNH CÔNG:');
    data.push('------------------------------------------------------');
    if (this.results.passes.length > 0) {
      this.results.passes.forEach((test, i) => {
        data.push(`${i + 1}. ${test.fullTitle}`);
        data.push(`   - Thời gian thực thi: ${test.duration / 1000} giây`);
        data.push(`   - File: ${test.file || 'N/A'}`);
        data.push('');
      });
    } else {
      data.push('Không có test case thành công.');
      data.push('');
    }
    
    // Test cases failed
    data.push('CÁC TEST CASE THẤT BẠI:');
    data.push('------------------------------------------------------');
    if (this.results.failures.length > 0) {
      this.results.failures.forEach((test, i) => {
        data.push(`${i + 1}. ${test.fullTitle}`);
        data.push(`   - Lỗi: ${test.error}`);
        data.push(`   - File: ${test.file || 'N/A'}`);
        data.push('');
      });
    } else {
      data.push('Không có test case thất bại.');
      data.push('');
    }
    
    // Test cases pending
    if (this.results.pending.length > 0) {
      data.push('CÁC TEST CASE BỎ QUA:');
      data.push('------------------------------------------------------');
      this.results.pending.forEach((test, i) => {
        data.push(`${i + 1}. ${test.fullTitle}`);
        data.push(`   - File: ${test.file || 'N/A'}`);
        data.push('');
      });
    }
    
    // Footer
    data.push('======================================================');
    data.push(`BÁO CÁO ĐƯỢC TẠO TỰ ĐỘNG BỞI VRA TEST FRAMEWORK`);
    data.push('======================================================');
    
    fs.writeFileSync(filePath, data.join('\n'));
    console.log(`\nBáo cáo kiểm thử đã được lưu tại: ${filePath}`);
    return filePath;
  }

  /**
   * Tạo báo cáo dạng HTML
   * @param {String} filename Tên file báo cáo
   */
  generateHTMLReport(filename = 'test-report.html') {
    const filePath = path.join(this.outputDir, filename);
    
    // Create HTML content
    const passedTests = this.results.passes.map((test, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${test.fullTitle}</td>
        <td>${test.duration}ms</td>
        <td>${test.file || 'N/A'}</td>
      </tr>
    `).join('');
    
    const failedTests = this.results.failures.map((test, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${test.fullTitle}</td>
        <td>${test.duration}ms</td>
        <td>${test.file || 'N/A'}</td>
        <td>${test.error}</td>
      </tr>
    `).join('');
    
    const pendingTests = this.results.pending.map((test, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${test.fullTitle}</td>
        <td>N/A</td>
        <td>${test.file || 'N/A'}</td>
      </tr>
    `).join('');
    
    // Generate full HTML report
    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Báo cáo kiểm thử VRA</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-color: #3498db;
                --success-color: #2ecc71;
                --warning-color: #f1c40f;
                --danger-color: #e74c3c;
                --info-color: #3498db;
                --dark-color: #2c3e50;
                --light-color: #ecf0f1;
                --border-radius: 12px;
                --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
                --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
                --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: var(--dark-color);
                background-color: #f8fafc;
            }

            .container {
                max-width: 1200px;
                margin: 2rem auto;
                padding: 0 1.5rem;
            }

            header {
                background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
                border-radius: var(--border-radius);
                padding: 2rem;
                margin-bottom: 2rem;
                box-shadow: var(--shadow-md);
                border: 1px solid rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }

            header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: linear-gradient(90deg, var(--primary-color), var(--info-color));
            }

            h1 {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: var(--dark-color);
            }

            .timestamp {
                color: #64748b;
                font-size: 0.875rem;
            }

            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .summary-card {
                background: white;
                padding: 1.5rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-sm);
                border: 1px solid rgba(0,0,0,0.1);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .summary-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            .summary-card .label {
                font-size: 0.875rem;
                color: #64748b;
                margin-bottom: 0.5rem;
            }

            .summary-card .value {
                font-size: 2rem;
                font-weight: 700;
                color: var(--dark-color);
            }

            .card-total { border-top: 4px solid var(--primary-color); }
            .card-passed { border-top: 4px solid var(--success-color); }
            .card-failed { border-top: 4px solid var(--danger-color); }
            .card-pending { border-top: 4px solid var(--warning-color); }

            .progress-container {
                background: white;
                padding: 2rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-sm);
                margin-bottom: 2rem;
                border: 1px solid rgba(0,0,0,0.1);
            }

            .progress-bar {
                height: 1.5rem;
                background: #e2e8f0;
                border-radius: 9999px;
                overflow: hidden;
                margin: 1rem 0;
            }

            .progress-value {
                height: 100%;
                background: linear-gradient(90deg, var(--success-color), #27ae60);
                border-radius: 9999px;
                transition: width 1s ease-in-out;
            }

            .test-section {
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-sm);
                margin-bottom: 2rem;
                border: 1px solid rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .section-header {
                padding: 1.5rem;
                background: #f8fafc;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            }

            .section-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--dark-color);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .test-list {
                list-style: none;
                padding: 0;
            }

            .test-item {
                padding: 1.5rem;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                transition: background-color 0.2s ease;
            }

            .test-item:last-child {
                border-bottom: none;
            }

            .test-item:hover {
                background-color: #f8fafc;
            }

            .test-title {
                font-weight: 600;
                color: var(--dark-color);
                margin-bottom: 0.5rem;
            }

            .test-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.875rem;
                color: #64748b;
                margin-bottom: 0.5rem;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .error-message {
                background: #fef2f2;
                border-left: 4px solid var(--danger-color);
                padding: 1rem;
                margin-top: 1rem;
                border-radius: 0.375rem;
                font-family: monospace;
                font-size: 0.875rem;
                color: #991b1b;
                white-space: pre-wrap;
            }

            .error-stack {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 0.375rem;
                margin-top: 1rem;
                max-height: 200px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 0.75rem;
                color: #475569;
            }

            footer {
                text-align: center;
                padding: 2rem;
                color: #64748b;
                font-size: 0.875rem;
            }

            .badge {
                display: inline-flex;
                align-items: center;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 500;
            }

            .badge-success { 
                background-color: #dcfce7;
                color: #166534;
            }

            .badge-danger { 
                background-color: #fee2e2;
                color: #991b1b;
            }

            .badge-warning { 
                background-color: #fef3c7;
                color: #92400e;
            }

            /* Severity Levels Styling */
            .severity-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.35rem 0.75rem;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-right: 0.5rem;
            }

            .severity-blocker {
                background-color: #fee2e2;
                color: #991b1b;
                border: 1px solid #f87171;
            }

            .severity-critical {
                background-color: #fef2f2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }

            .severity-major {
                background-color: #fff7ed;
                color: #c2410c;
                border: 1px solid #fdba74;
            }

            .severity-minor {
                background-color: #ecfdf5;
                color: #047857;
                border: 1px solid #6ee7b7;
            }

            .severity-cosmetic {
                background-color: #f0f9ff;
                color: #0369a1;
                border: 1px solid #7dd3fc;
            }

            /* Priority Levels Styling */
            .priority-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.25rem 0.65rem;
                border-radius: 4px;
                font-weight: 500;
                font-size: 0.75rem;
                text-transform: uppercase;
                margin-left: 0.5rem;
            }

            .priority-high {
                background-color: #fef2f2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }

            .priority-medium {
                background-color: #fffbeb;
                color: #b45309;
                border: 1px solid #fcd34d;
            }

            .priority-low {
                background-color: #f0fdf4;
                color: #15803d;
                border: 1px solid #86efac;
            }

            /* Test Status Styling */
            .test-item {
                position: relative;
                transition: all 0.3s ease;
            }

            .test-item.passed {
                background-color: #f0fdf4;
                border-left: 4px solid #22c55e;
            }

            .test-item.failed {
                border-left: 4px solid #dc2626;
            }

            .test-item.failed.severity-blocker {
                background-color: #fef2f2;
                border-left: 4px solid #dc2626;
            }

            .test-item.failed.severity-critical {
                background-color: #fff1f2;
                border-left: 4px solid #e11d48;
            }

            .severity-info {
                display: flex;
                align-items: center;
                margin: 1rem 0;
                padding: 1rem;
                background-color: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .severity-info-item {
                display: flex;
                align-items: center;
                margin-right: 2rem;
            }

            .severity-info-label {
                font-weight: 500;
                color: #64748b;
                margin-right: 0.5rem;
            }

            /* Icons for severity and priority */
            .severity-icon, .priority-icon {
                margin-right: 0.25rem;
                width: 16px;
                height: 16px;
            }

            .severity-blocker .severity-icon {
                color: #dc2626;
            }

            .severity-critical .severity-icon {
                color: #e11d48;
            }

            .priority-high .priority-icon {
                color: #dc2626;
            }

            /* Hover effects */
            .test-item:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .test-item.passed:hover {
                background-color: #ecfdf5;
            }

            .test-item.failed:hover {
                background-color: #fef2f2;
            }

            /* Animation for status changes */
            @keyframes highlightFailure {
                0% { background-color: transparent; }
                50% { background-color: #fee2e2; }
                100% { background-color: transparent; }
            }

            @keyframes highlightSuccess {
                0% { background-color: transparent; }
                50% { background-color: #dcfce7; }
                100% { background-color: transparent; }
            }

            .test-item.animate-failure {
                animation: highlightFailure 1s ease-in-out;
            }

            .test-item.animate-success {
                animation: highlightSuccess 1s ease-in-out;
            }

            @media (max-width: 768px) {
                .container {
                    padding: 1rem;
                }

                .summary {
                    grid-template-columns: 1fr;
                }

                .test-meta {
                    flex-direction: column;
                    gap: 0.5rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Báo cáo kiểm thử VRA</h1>
                <p class="timestamp">Thời gian: ${new Date().toLocaleString()}</p>
            </header>
            
            <div class="summary">
                <div class="summary-card card-total">
                    <div class="label">Tổng số test</div>
                    <div class="value">${this.results.stats.tests}</div>
                </div>
                <div class="summary-card card-passed">
                    <div class="label">Thành công</div>
                    <div class="value">${this.results.stats.passes}</div>
                </div>
                <div class="summary-card card-failed">
                    <div class="label">Thất bại</div>
                    <div class="value">${this.results.stats.failures}</div>
                </div>
                <div class="summary-card card-pending">
                    <div class="label">Bỏ qua</div>
                    <div class="value">${this.results.stats.pending}</div>
                </div>
            </div>
            
            <div class="progress-container">
                <div class="section-title">Test Progress</div>
                <div class="progress-bar">
                    <div class="progress-value" style="width: ${this.results.stats.passes / this.results.stats.tests * 100}%"></div>
                </div>
                <div style="text-align: center; color: #64748b;">
                    Pass Rate: ${(this.results.stats.passes / this.results.stats.tests * 100).toFixed(2)}%
                </div>
            </div>
            
            <div class="test-section">
                <div class="section-header">
                    <div class="section-title">
                        <span class="badge badge-success">Các test case thành công</span>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên test case</th>
                            <th>Thời gian (ms)</th>
                            <th>File</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${passedTests || '<tr><td colspan="4">Không có test case thành công.</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <div class="test-section">
                <div class="section-header">
                    <div class="section-title">
                        <span class="badge badge-danger">Các test case thất bại</span>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên test case</th>
                            <th>Thời gian (ms)</th>
                            <th>File</th>
                            <th>Lỗi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${failedTests || '<tr><td colspan="5">Không có test case thất bại.</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <div class="test-section">
                <div class="section-header">
                    <div class="section-title">
                        <span class="badge badge-warning">Các test case bỏ qua</span>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên test case</th>
                            <th>Thời gian (ms)</th>
                            <th>File</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingTests || '<tr><td colspan="4">Không có test case bỏ qua.</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <footer>
                <p>Báo cáo được tạo tự động bởi VRA Test Framework</p>
                <p>Thời gian thực thi: ${this.results.stats.duration / 1000} giây</p>
            </footer>
        </div>
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Animate progress bar
                setTimeout(() => {
                    const progressValue = document.querySelector('.progress-value');
                    progressValue.style.width = '${this.results.stats.passes / this.results.stats.tests * 100}%';
                }, 300);

                // Add smooth scroll to error stack traces
                document.querySelectorAll('.error-stack').forEach(stack => {
                    stack.addEventListener('scroll', function() {
                        this.classList.toggle('scrolled', this.scrollTop > 0);
                    });
                });
            });
        </script>
    </body>
    </html>
    `;
    
    fs.writeFileSync(filePath, html);
    console.log(`\nBáo cáo HTML đã được lưu tại: ${filePath}`);
    return filePath;
  }

  /**
   * Tạo báo cáo dạng JSON
   * @param {String} filename Tên file báo cáo
   */
  generateJSONReport(filename = 'test-report.json') {
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(this.results, null, 2));
    console.log(`\nBáo cáo JSON đã được lưu tại: ${filePath}`);
    return filePath;
  }

  /**
   * Tạo báo cáo HTML từ kết quả test
   * @param {Object} results Kết quả test từ mocha
   * @param {string} outputFile Đường dẫn file báo cáo
   * @param {Object} options Tùy chọn cho báo cáo
   */
  generateHtmlReport(results, outputFile, options = {}) {
    const timestamp = new Date().toISOString();
    const { stats, failures, passes } = results;
    
    // Lấy thông tin hiển thị
    const passCount = stats.passes || 0;
    const failCount = stats.failures || 0;
    const pendingCount = stats.pending || 0;
    const totalTests = passCount + failCount + pendingCount;
    const passPercent = (passCount / (passCount + failCount) * 100).toFixed(2);
    
    // Tạo danh sách test đã đạt
    const passedTestList = passes.map(test => `
      <li class="test-item passed">
        <div class="test-title">${test.title}</div>
        <div class="test-meta">
          <span class="meta-item">
            <svg class="severity-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${test.duration}ms
          </span>
          <span class="meta-item">
            <svg class="severity-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            ${test.file || 'N/A'}
          </span>
        </div>
      </li>
    `).join('');

    // Tạo danh sách test thất bại
    const failedTestList = failures.map(test => {
      const error = test.err || {};
      const errorMessage = error.message || 'Unknown error';
      const screenshot = test.screenshot ? `<img src="${test.screenshot}" alt="Screenshot" class="error-screenshot" />` : '';

      // Thêm thông tin về mức độ nghiêm trọng nếu có
      let severityInfo = '';
      if (test.severityAnalysis) {
        const { severity, impact, priority, reasoning } = test.severityAnalysis;
        const severityClass = `severity-${severity}`;
        const priorityClass = `priority-${priority}`;
        
        severityInfo = `
          <div class="severity-info">
            <div class="severity-info-item">
              <span class="severity-info-label">Mức độ:</span>
              <span class="severity-badge severity-${severityClass}">
                <svg class="severity-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                ${severity.toUpperCase()}
              </span>
            </div>
            <div class="severity-info-item">
              <span class="severity-info-label">Ưu tiên:</span>
              <span class="priority-badge priority-${priorityClass}">
                <svg class="priority-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                ${priority.toUpperCase()}
              </span>
            </div>
          </div>
        `;
      }
      
      return `
        <li class="test-item failed ${test.severityAnalysis ? `severity-${test.severityAnalysis.severity.toLowerCase()}` : ''}">
          <div class="test-title">${test.title}</div>
          <div class="test-meta">
            <span class="meta-item">
              <svg class="severity-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              ${test.duration}ms
            </span>
            <span class="meta-item">
              <svg class="severity-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              ${test.file || 'N/A'}
            </span>
          </div>
          ${severityInfo}
          <div class="error-message">${errorMessage.replace(/\n/g, '<br>')}</div>
          ${test.stack ? `<div class="error-stack"><pre>${error.stack?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''}</pre></div>` : ''}
          ${screenshot}
        </li>
      `;
    }).join('');

    // Tạo nội dung HTML
    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VRA Test Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-color: #3498db;
                --success-color: #2ecc71;
                --warning-color: #f1c40f;
                --danger-color: #e74c3c;
                --info-color: #3498db;
                --dark-color: #2c3e50;
                --light-color: #ecf0f1;
                --border-radius: 12px;
                --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
                --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
                --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: var(--dark-color);
                background-color: #f8fafc;
            }

            .container {
                max-width: 1200px;
                margin: 2rem auto;
                padding: 0 1.5rem;
            }

            header {
                background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
                border-radius: var(--border-radius);
                padding: 2rem;
                margin-bottom: 2rem;
                box-shadow: var(--shadow-md);
                border: 1px solid rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }

            header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: linear-gradient(90deg, var(--primary-color), var(--info-color));
            }

            h1 {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: var(--dark-color);
            }

            .timestamp {
                color: #64748b;
                font-size: 0.875rem;
            }

            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .summary-card {
                background: white;
                padding: 1.5rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-sm);
                border: 1px solid rgba(0,0,0,0.1);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .summary-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            .summary-card .label {
                font-size: 0.875rem;
                color: #64748b;
                margin-bottom: 0.5rem;
            }

            .summary-card .value {
                font-size: 2rem;
                font-weight: 700;
                color: var(--dark-color);
            }

            .card-total { border-top: 4px solid var(--primary-color); }
            .card-passed { border-top: 4px solid var(--success-color); }
            .card-failed { border-top: 4px solid var(--danger-color); }
            .card-pending { border-top: 4px solid var(--warning-color); }

            .progress-container {
                background: white;
                padding: 2rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-sm);
                margin-bottom: 2rem;
                border: 1px solid rgba(0,0,0,0.1);
            }

            .progress-bar {
                height: 1.5rem;
                background: #e2e8f0;
                border-radius: 9999px;
                overflow: hidden;
                margin: 1rem 0;
            }

            .progress-value {
                height: 100%;
                background: linear-gradient(90deg, var(--success-color), #27ae60);
                border-radius: 9999px;
                transition: width 1s ease-in-out;
            }

            .test-section {
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-sm);
                margin-bottom: 2rem;
                border: 1px solid rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .section-header {
                padding: 1.5rem;
                background: #f8fafc;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            }

            .section-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--dark-color);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .test-list {
                list-style: none;
                padding: 0;
            }

            .test-item {
                padding: 1.5rem;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                transition: background-color 0.2s ease;
            }

            .test-item:last-child {
                border-bottom: none;
            }

            .test-item:hover {
                background-color: #f8fafc;
            }

            .test-title {
                font-weight: 600;
                color: var(--dark-color);
                margin-bottom: 0.5rem;
            }

            .test-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.875rem;
                color: #64748b;
                margin-bottom: 0.5rem;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .error-message {
                background: #fef2f2;
                border-left: 4px solid var(--danger-color);
                padding: 1rem;
                margin-top: 1rem;
                border-radius: 0.375rem;
                font-family: monospace;
                font-size: 0.875rem;
                color: #991b1b;
                white-space: pre-wrap;
            }

            .error-stack {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 0.375rem;
                margin-top: 1rem;
                max-height: 200px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 0.75rem;
                color: #475569;
            }

            footer {
                text-align: center;
                padding: 2rem;
                color: #64748b;
                font-size: 0.875rem;
            }

            .badge {
                display: inline-flex;
                align-items: center;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 500;
            }

            .badge-success { 
                background-color: #dcfce7;
                color: #166534;
            }

            .badge-danger { 
                background-color: #fee2e2;
                color: #991b1b;
            }

            .badge-warning { 
                background-color: #fef3c7;
                color: #92400e;
            }

            /* Severity Levels Styling */
            .severity-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.35rem 0.75rem;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-right: 0.5rem;
            }

            .severity-blocker {
                background-color: #fee2e2;
                color: #991b1b;
                border: 1px solid #f87171;
            }

            .severity-critical {
                background-color: #fef2f2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }

            .severity-major {
                background-color: #fff7ed;
                color: #c2410c;
                border: 1px solid #fdba74;
            }

            .severity-minor {
                background-color: #ecfdf5;
                color: #047857;
                border: 1px solid #6ee7b7;
            }

            .severity-cosmetic {
                background-color: #f0f9ff;
                color: #0369a1;
                border: 1px solid #7dd3fc;
            }

            /* Priority Levels Styling */
            .priority-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.25rem 0.65rem;
                border-radius: 4px;
                font-weight: 500;
                font-size: 0.75rem;
                text-transform: uppercase;
                margin-left: 0.5rem;
            }

            .priority-high {
                background-color: #fef2f2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }

            .priority-medium {
                background-color: #fffbeb;
                color: #b45309;
                border: 1px solid #fcd34d;
            }

            .priority-low {
                background-color: #f0fdf4;
                color: #15803d;
                border: 1px solid #86efac;
            }

            /* Test Status Styling */
            .test-item {
                position: relative;
                transition: all 0.3s ease;
            }

            .test-item.passed {
                background-color: #f0fdf4;
                border-left: 4px solid #22c55e;
            }

            .test-item.failed {
                border-left: 4px solid #dc2626;
            }

            .test-item.failed.severity-blocker {
                background-color: #fef2f2;
                border-left: 4px solid #dc2626;
            }

            .test-item.failed.severity-critical {
                background-color: #fff1f2;
                border-left: 4px solid #e11d48;
            }

            .severity-info {
                display: flex;
                align-items: center;
                margin: 1rem 0;
                padding: 1rem;
                background-color: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .severity-info-item {
                display: flex;
                align-items: center;
                margin-right: 2rem;
            }

            .severity-info-label {
                font-weight: 500;
                color: #64748b;
                margin-right: 0.5rem;
            }

            /* Icons for severity and priority */
            .severity-icon, .priority-icon {
                margin-right: 0.25rem;
                width: 16px;
                height: 16px;
            }

            .severity-blocker .severity-icon {
                color: #dc2626;
            }

            .severity-critical .severity-icon {
                color: #e11d48;
            }

            .priority-high .priority-icon {
                color: #dc2626;
            }

            /* Hover effects */
            .test-item:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .test-item.passed:hover {
                background-color: #ecfdf5;
            }

            .test-item.failed:hover {
                background-color: #fef2f2;
            }

            /* Animation for status changes */
            @keyframes highlightFailure {
                0% { background-color: transparent; }
                50% { background-color: #fee2e2; }
                100% { background-color: transparent; }
            }

            @keyframes highlightSuccess {
                0% { background-color: transparent; }
                50% { background-color: #dcfce7; }
                100% { background-color: transparent; }
            }

            .test-item.animate-failure {
                animation: highlightFailure 1s ease-in-out;
            }

            .test-item.animate-success {
                animation: highlightSuccess 1s ease-in-out;
            }

            @media (max-width: 768px) {
                .container {
                    padding: 1rem;
                }

                .summary {
                    grid-template-columns: 1fr;
                }

                .test-meta {
                    flex-direction: column;
                    gap: 0.5rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>VRA Test Report</h1>
                <p class="timestamp">Generated on: ${new Date(timestamp).toLocaleString()}</p>
            </header>

            <div class="summary">
                <div class="summary-card card-total">
                    <div class="label">Total Tests</div>
                    <div class="value">${totalTests}</div>
                </div>
                <div class="summary-card card-passed">
                    <div class="label">Passed</div>
                    <div class="value">${passCount}</div>
                </div>
                <div class="summary-card card-failed">
                    <div class="label">Failed</div>
                    <div class="value">${failCount}</div>
                </div>
                <div class="summary-card card-pending">
                    <div class="label">Pending</div>
                    <div class="value">${pendingCount}</div>
                </div>
            </div>

            <div class="progress-container">
                <div class="section-title">Test Progress</div>
                <div class="progress-bar">
                    <div class="progress-value" style="width: ${passPercent}%"></div>
                </div>
                <div style="text-align: center; color: #64748b;">
                    Pass Rate: ${passPercent}%
                </div>
            </div>

            ${failCount > 0 ? `
                <div class="test-section">
                    <div class="section-header">
                        <div class="section-title">
                            <span class="badge badge-danger">Failed Tests (${failCount})</span>
                        </div>
                    </div>
                    <ul class="test-list">
                        ${failedTestList}
                    </ul>
                </div>
            ` : ''}

            <div class="test-section">
                <div class="section-header">
                    <div class="section-title">
                        <span class="badge badge-success">Passed Tests (${passCount})</span>
                    </div>
                </div>
                <ul class="test-list">
                    ${passedTestList}
                </ul>
            </div>

            <footer>
                <p>Generated by VRA Test Framework</p>
                <p>© ${new Date().getFullYear()} VRA Team</p>
            </footer>
        </div>
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Animate progress bar
                setTimeout(() => {
                    const progressValue = document.querySelector('.progress-value');
                    progressValue.style.width = '${passPercent}%';
                }, 300);

                // Add smooth scroll to error stack traces
                document.querySelectorAll('.error-stack').forEach(stack => {
                    stack.addEventListener('scroll', function() {
                        this.classList.toggle('scrolled', this.scrollTop > 0);
                    });
                });
            });
        </script>
    </body>
    </html>
    `;

    // Tạo thư mục báo cáo nếu chưa tồn tại
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Ghi file báo cáo
    fs.writeFileSync(outputFile, html);
    console.log(`HTML report generated: ${outputFile}`);
  }

  /**
   * Tạo báo cáo text từ kết quả test
   * @param {Object} results Kết quả test từ mocha
   * @param {string} outputFile Đường dẫn file báo cáo
   */
  generateTextReport(results, outputFile) {
    const { stats, failures, passes } = results;
    
    const passCount = stats.passes || 0;
    const failCount = stats.failures || 0;
    const pendingCount = stats.pending || 0;
    const totalTests = passCount + failCount + pendingCount;
    const passPercent = (passCount / (passCount + failCount) * 100).toFixed(2);
    
    const lines = [
      '=============================================================',
      '                     VRA TEST REPORT                         ',
      '=============================================================',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total Tests: ${totalTests}`,
      `Passed: ${passCount}`,
      `Failed: ${failCount}`,
      `Pending: ${pendingCount}`,
      `Pass rate: ${passPercent}%`,
      '',
      '=============================================================',
      '',
    ];

    if (failCount > 0) {
      lines.push('FAILED TESTS:');
      lines.push('-------------------------------------------------------------');
      
      failures.forEach((test, index) => {
        lines.push(`${index + 1}. ${test.fullTitle}`);
        lines.push(`   File: ${test.file || 'Unknown'}`);
        lines.push(`   Duration: ${test.duration}ms`);
        
        // Thêm thông tin về mức độ nghiêm trọng nếu có
        if (test.severityAnalysis) {
          const { severity, impact, priority, reasoning, suggestedAction } = test.severityAnalysis;
          lines.push(`   Severity: ${severity.toUpperCase()}`);
          lines.push(`   Priority: ${priority.toUpperCase()}`);
          lines.push(`   Impact: ${impact}`);
          lines.push(`   Analysis: ${reasoning}`);
          lines.push(`   Suggested Action: ${suggestedAction}`);
        }
        
        lines.push(`   Error: ${test.err?.message || 'Unknown error'}`);
        
        if (test.err?.stack) {
          const stackLines = test.err.stack.split('\n').slice(0, 5);
          lines.push('   Stack trace (first 5 lines):');
          stackLines.forEach(line => {
            lines.push(`     ${line.trim()}`);
          });
        }
        lines.push('');
      });
      lines.push('');
    }

    lines.push('PASSED TESTS:');
    lines.push('-------------------------------------------------------------');
    
    passes.forEach((test, index) => {
      lines.push(`${index + 1}. ${test.fullTitle}`);
      lines.push(`   Duration: ${test.duration}ms`);
      lines.push(`   File: ${test.file || 'Unknown'}`);
      lines.push('');
    });

    lines.push('=============================================================');
    lines.push('                        END REPORT                           ');
    lines.push('=============================================================');

    // Tạo thư mục báo cáo nếu chưa tồn tại
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, lines.join('\n'));
    console.log(`Text report generated: ${outputFile}`);
  }

  /**
   * Tạo báo cáo JSON từ kết quả test
   * @param {Object} results Kết quả test từ mocha
   * @param {string} outputFile Đường dẫn file báo cáo
   */
  generateJsonReport(results, outputFile) {
    const reportData = {
      timestamp: new Date().toISOString(),
      ...results,
    };
    
    // Tạo thư mục báo cáo nếu chưa tồn tại
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(reportData, null, 2));
    console.log(`JSON report generated: ${outputFile}`);
  }
  
  /**
   * Tạo các loại báo cáo dựa trên tùy chọn
   * @param {Object} results Kết quả test từ mocha
   * @param {Object} options Tùy chọn báo cáo
   */
  generateReport(results, options = {}) {
    const {
      reportDir = 'reports',
      reportFilename = `test-report-${new Date().toISOString().split('T')[0]}`,
      reportFormats = ['html'],
      severityAnalysis = false,
      severityAnalysisResults = null
    } = options;
    
    // Áp dụng kết quả phân tích mức độ nghiêm trọng nếu có
    if (severityAnalysis && severityAnalysisResults && results.failures) {
      severityAnalysisResults.forEach(analysisResult => {
        // Tìm test case tương ứng trong failures và thêm thông tin phân tích
        const matchingFailure = results.failures.find(
          failure => failure.title === analysisResult.testCase.title
        );
        
        if (matchingFailure) {
          matchingFailure.severityAnalysis = analysisResult.analysis;
        }
      });
    }
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    if (reportFormats.includes('html') || reportFormats.includes('all')) {
      const htmlFile = path.join(reportDir, `${reportFilename}.html`);
      this.generateHtmlReport(results, htmlFile, options);
    }

    if (reportFormats.includes('text') || reportFormats.includes('all')) {
      const textFile = path.join(reportDir, `${reportFilename}.txt`);
      this.generateTextReport(results, textFile);
    }

    if (reportFormats.includes('json') || reportFormats.includes('all')) {
      const jsonFile = path.join(reportDir, `${reportFilename}.json`);
      this.generateJsonReport(results, jsonFile);
    }
  }
}

export default new ReportGenerator(); 