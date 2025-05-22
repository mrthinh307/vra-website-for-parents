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
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            h1, h2 {
                color: #2c3e50;
            }
            header {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
                border-left: 5px solid #3498db;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            .summary-item {
                padding: 15px;
                border-radius: 5px;
                text-align: center;
            }
            .total { background-color: #eaf2fd; }
            .passed { background-color: #d4edda; }
            .failed { background-color: #f8d7da; }
            .pending { background-color: #fff3cd; }
            .number {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            th, td {
                padding: 12px;
                border: 1px solid #ddd;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .section {
                margin-bottom: 40px;
            }
            footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #777;
            }
            .passed-title { color: #28a745; }
            .failed-title { color: #dc3545; }
            .pending-title { color: #ffc107; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Báo cáo kiểm thử VRA</h1>
                <p>Thời gian: ${new Date().toLocaleString()}</p>
            </header>
            
            <div class="summary">
                <div class="summary-item total">
                    <div>Tổng số test</div>
                    <div class="number">${this.results.stats.tests}</div>
                </div>
                <div class="summary-item passed">
                    <div>Thành công</div>
                    <div class="number">${this.results.stats.passes}</div>
                </div>
                <div class="summary-item failed">
                    <div>Thất bại</div>
                    <div class="number">${this.results.stats.failures}</div>
                </div>
                <div class="summary-item pending">
                    <div>Bỏ qua</div>
                    <div class="number">${this.results.stats.pending}</div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="passed-title">Các test case thành công</h2>
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
            
            <div class="section">
                <h2 class="failed-title">Các test case thất bại</h2>
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
            
            <div class="section">
                <h2 class="pending-title">Các test case bỏ qua</h2>
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
      <li class="test-item success">
        <div class="test-title">${test.title}</div>
        <div class="test-info">
          <span class="duration">${test.duration}ms</span>
          <span class="file">${test.file || 'Unknown'}</span>
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
            <div class="severity-row ${severityClass}">
              <span class="severity-label">Mức độ:</span>
              <span class="severity-value ${severityClass}">${severity.toUpperCase()}</span>
            </div>
            <div class="severity-row">
              <span class="severity-label">Ưu tiên:</span>
              <span class="severity-value ${priorityClass}">${priority.toUpperCase()}</span>
            </div>
            <div class="severity-row">
              <span class="severity-label">Tác động:</span>
              <span class="severity-value">${impact}</span>
            </div>
            <div class="severity-row">
              <span class="severity-label">Phân tích:</span>
              <span class="severity-value">${reasoning}</span>
            </div>
          </div>
        `;
      }
      
      return `
        <li class="test-item error">
          <div class="test-title">${test.title}</div>
          <div class="test-info">
            <span class="duration">${test.duration}ms</span>
            <span class="file">${test.file || 'Unknown'}</span>
          </div>
          <div class="error-message">${errorMessage.replace(/\n/g, '<br>')}</div>
          ${severityInfo}
          <div class="error-stack">
            <pre>${error.stack?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''}</pre>
          </div>
          ${screenshot}
        </li>
      `;
    }).join('');

    // Tạo nội dung HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VRA Test Report - ${timestamp}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          border-radius: 5px;
        }
        header {
          text-align: center;
          padding: 20px;
          margin-bottom: 30px;
          background: #f0f4f8;
          border-radius: 5px;
        }
        h1 {
          margin: 0;
          color: #2c3e50;
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
          text-align: center;
        }
        .summary-item {
          padding: 15px;
          border-radius: 5px;
          min-width: 150px;
        }
        .summary-item.total { background-color: #eef2f7; }
        .summary-item.passed { background-color: #d4edda; color: #155724; }
        .summary-item.failed { background-color: #f8d7da; color: #721c24; }
        .summary-item.pending { background-color: #fff3cd; color: #856404; }
        .summary-value {
          font-size: 2em;
          font-weight: bold;
        }
        .progress-bar {
          height: 30px;
          width: 100%;
          background-color: #f0f0f0;
          border-radius: 15px;
          margin-bottom: 30px;
          overflow: hidden;
        }
        .progress-value {
          height: 100%;
          background-color: #28a745;
          text-align: center;
          line-height: 30px;
          color: white;
          font-weight: bold;
          transition: width 1s;
        }
        .test-sections {
          margin-bottom: 30px;
        }
        .test-section {
          margin-bottom: 20px;
        }
        h2 {
          color: #2c3e50;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
        .test-list {
          list-style: none;
          padding: 0;
        }
        .test-item {
          margin-bottom: 15px;
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-item.success { background-color: #f3f9f4; border-left: 5px solid #28a745; }
        .test-item.error { background-color: #fdf7f7; border-left: 5px solid #dc3545; }
        .test-title {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 1.1em;
        }
        .test-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.9em;
          color: #666;
          margin-bottom: 8px;
        }
        .duration {
          font-family: monospace;
        }
        .file {
          font-style: italic;
        }
        .error-message {
          background-color: #f8d7da;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          color: #721c24;
        }
        .error-stack {
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          max-height: 200px;
          overflow: auto;
        }
        .error-stack pre {
          margin: 0;
          font-size: 0.85em;
          white-space: pre-wrap;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 0.9em;
        }
        .error-screenshot {
          max-width: 100%;
          margin-top: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        /* Severity styling */
        .severity-info {
          margin: 15px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #6c757d;
        }
        .severity-row {
          display: flex;
          margin-bottom: 5px;
        }
        .severity-label {
          font-weight: bold;
          min-width: 100px;
        }
        .severity-value {
          flex-grow: 1;
        }
        .severity-minor { color: #28a745; }
        .severity-cosmetic { color: #ffc107; }
        .severity-blocker { color: #fd7e14; }
        .severity-critical { color: #dc3545; }
        .priority-high { color: #dc3545; }
        .priority-medium { color: #ffc107; }
        .priority-low { color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>VRA Test Report</h1>
          <p>Generated on: ${new Date(timestamp).toLocaleString()}</p>
        </header>

        <div class="summary">
          <div class="summary-item total">
            <div class="summary-value">${totalTests}</div>
            <div class="summary-label">Total Tests</div>
          </div>
          <div class="summary-item passed">
            <div class="summary-value">${passCount}</div>
            <div class="summary-label">Passed</div>
          </div>
          <div class="summary-item failed">
            <div class="summary-value">${failCount}</div>
            <div class="summary-label">Failed</div>
          </div>
          <div class="summary-item pending">
            <div class="summary-value">${pendingCount}</div>
            <div class="summary-label">Pending</div>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-value" style="width: ${passPercent}%">${passPercent}%</div>
        </div>

        <div class="test-sections">
          ${failCount > 0 ? `
            <div class="test-section">
              <h2>Failed Tests (${failCount})</h2>
              <ul class="test-list">
                ${failedTestList}
              </ul>
            </div>
          ` : ''}
          
          <div class="test-section">
            <h2>Passed Tests (${passCount})</h2>
            <ul class="test-list">
              ${passedTestList}
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>VRA Test Framework Report</p>
          <p>© ${new Date().getFullYear()} VRA Team</p>
        </div>
      </div>
      
      <script>
        // Hiệu ứng hiển thị thanh tiến trình
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(() => {
            const progressValue = document.querySelector('.progress-value');
            progressValue.style.width = '${passPercent}%';
          }, 100);
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