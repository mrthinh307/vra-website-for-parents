import fs from 'fs';
import path from 'path';
import { analyzeSeverity } from './geminiAi.js';

/**
 * Service phân tích mức độ nghiêm trọng của test cases thất bại
 */
class SeverityAnalyzer {
  constructor() {
    this.severityColors = {
      'minor': '#28a745', // Xanh lá
      'cosmetic': '#ffc107', // Vàng
      'blocker': '#fd7e14', // Cam
      'critical': '#dc3545', // Đỏ
      'unknown': '#6c757d' // Xám
    };
    
    this.severityIcons = {
      'minor': '⚪',
      'cosmetic': '🟡',
      'blocker': '🟠',
      'critical': '🔴',
      'unknown': '❓'
    };
    
    this.priorityColors = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#dc3545',
      'unknown': '#6c757d'
    };
  }
  
  /**
   * Phân tích mức độ nghiêm trọng của các test thất bại
   * @param {Array} failures Các test case thất bại
   * @returns {Promise<Array>} Kết quả phân tích
   */
  async analyzeSeverities(failures) {
    if (!failures || failures.length === 0) {
      return [];
    }
    
    console.log(`\nĐang phân tích mức độ nghiêm trọng cho ${failures.length} test case thất bại...`);
    
    const analysisResults = [];
    for (const failure of failures) {
      console.log(`Đang phân tích: ${failure.title}`);
      const analysis = await analyzeSeverity(failure);
      analysisResults.push({
        testCase: failure,
        analysis
      });
    }
    
    return analysisResults;
  }
  
  /**
   * Tạo báo cáo HTML về mức độ nghiêm trọng
   * @param {Array} analysisResults Kết quả phân tích
   * @param {String} outputPath Đường dẫn lưu báo cáo
   */
  generateSeverityHtmlReport(analysisResults, outputPath) {
    if (!analysisResults || analysisResults.length === 0) {
      console.log('Không có test case thất bại để phân tích.');
      return;
    }
    
    const rows = analysisResults.map(item => {
      const { testCase, analysis } = item;
      const severityColor = this.severityColors[analysis.severity] || this.severityColors.unknown;
      const severityIcon = this.severityIcons[analysis.severity] || this.severityIcons.unknown;
      const priorityColor = this.priorityColors[analysis.priority] || this.priorityColors.unknown;
      
      return `
        <tr>
          <td>${testCase.title}</td>
          <td>${testCase.fullTitle}</td>
          <td>${testCase.file || 'N/A'}</td>
          <td style="color: ${severityColor}; font-weight: bold;">${severityIcon} ${analysis.severity.toUpperCase()}</td>
          <td style="color: ${priorityColor};">${analysis.priority.toUpperCase()}</td>
          <td>${analysis.reasoning}</td>
          <td>${analysis.impact}</td>
          <td>${analysis.suggestedAction}</td>
        </tr>
      `;
    });
    
    const summaryBySeverity = {
      minor: 0,
      cosmetic: 0,
      blocker: 0,
      critical: 0,
      unknown: 0
    };
    
    analysisResults.forEach(item => {
      const severity = item.analysis.severity;
      if (summaryBySeverity[severity] !== undefined) {
        summaryBySeverity[severity]++;
      } else {
        summaryBySeverity.unknown++;
      }
    });
    
    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Báo cáo phân tích mức độ nghiêm trọng - VRA Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 1400px;
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
            .minor { background-color: #d4edda; }
            .cosmetic { background-color: #fff3cd; }
            .blocker { background-color: #fff0e6; }
            .critical { background-color: #f8d7da; }
            .unknown { background-color: #e2e3e5; }
            .number {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 14px;
            }
            th, td {
                padding: 10px;
                border: 1px solid #ddd;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
                position: sticky;
                top: 0;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .section {
                margin-bottom: 40px;
                overflow-x: auto;
            }
            footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #777;
            }
            .highlight-critical { background-color: rgba(220, 53, 69, 0.1); }
            .highlight-blocker { background-color: rgba(253, 126, 20, 0.1); }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Báo cáo phân tích mức độ nghiêm trọng</h1>
                <p>Thời gian: ${new Date().toLocaleString()}</p>
            </header>
            
            <div class="summary">
                <div class="summary-item critical">
                    <div>Critical</div>
                    <div class="number">${summaryBySeverity.critical}</div>
                </div>
                <div class="summary-item blocker">
                    <div>Blocker</div>
                    <div class="number">${summaryBySeverity.blocker}</div>
                </div>
                <div class="summary-item cosmetic">
                    <div>Cosmetic</div>
                    <div class="number">${summaryBySeverity.cosmetic}</div>
                </div>
                <div class="summary-item minor">
                    <div>Minor</div>
                    <div class="number">${summaryBySeverity.minor}</div>
                </div>
                <div class="summary-item unknown">
                    <div>Unknown</div>
                    <div class="number">${summaryBySeverity.unknown}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Chi tiết kết quả phân tích</h2>
                <table id="severity-table">
                    <thead>
                        <tr>
                            <th>Test Case</th>
                            <th>Mô tả đầy đủ</th>
                            <th>File</th>
                            <th>Mức độ nghiêm trọng</th>
                            <th>Mức ưu tiên</th>
                            <th>Lý do</th>
                            <th>Tác động</th>
                            <th>Đề xuất</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>Khuyến nghị</h2>
                <p>Dựa trên phân tích, những lỗi sau đây cần được ưu tiên xử lý:</p>
                <ul>
                    ${analysisResults
                      .filter(item => ['critical', 'blocker'].includes(item.analysis.severity))
                      .map(item => `<li><strong>${item.testCase.title}</strong>: ${item.analysis.suggestedAction}</li>`)
                      .join('') || '<li>Không có lỗi nghiêm trọng cần ưu tiên xử lý.</li>'}
                </ul>
            </div>
            
            <footer>
                <p>Báo cáo được tạo tự động bởi VRA Test Framework với Gemini AI</p>
                <p>Thời gian tạo báo cáo: ${new Date().toString()}</p>
            </footer>
        </div>
        
        <script>
            // Highlight critical and blocker issues
            document.addEventListener('DOMContentLoaded', function() {
                const table = document.getElementById('severity-table');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const severityCell = rows[i].cells[3];
                    if (severityCell.textContent.includes('CRITICAL')) {
                        rows[i].classList.add('highlight-critical');
                    } else if (severityCell.textContent.includes('BLOCKER')) {
                        rows[i].classList.add('highlight-blocker');
                    }
                }
            });
        </script>
    </body>
    </html>
    `;
    
    fs.writeFileSync(outputPath, html);
    console.log(`\nBáo cáo phân tích mức độ nghiêm trọng đã được lưu tại: ${outputPath}`);
  }
  
  /**
   * Tạo báo cáo text về mức độ nghiêm trọng
   * @param {Array} analysisResults Kết quả phân tích
   * @param {String} outputPath Đường dẫn lưu báo cáo
   */
  generateSeverityTextReport(analysisResults, outputPath) {
    if (!analysisResults || analysisResults.length === 0) {
      console.log('Không có test case thất bại để phân tích.');
      return;
    }
    
    const data = [];
    
    // Header
    data.push('======================================================');
    data.push('     BÁO CÁO PHÂN TÍCH MỨC ĐỘ NGHIÊM TRỌNG');
    data.push('======================================================');
    data.push(`Thời gian: ${new Date().toLocaleString()}`);
    
    // Tổng hợp theo mức độ
    const summaryBySeverity = {
      minor: 0,
      cosmetic: 0,
      blocker: 0,
      critical: 0,
      unknown: 0
    };
    
    analysisResults.forEach(item => {
      const severity = item.analysis.severity;
      if (summaryBySeverity[severity] !== undefined) {
        summaryBySeverity[severity]++;
      } else {
        summaryBySeverity.unknown++;
      }
    });
    
    data.push(`Critical: ${summaryBySeverity.critical}`);
    data.push(`Blocker: ${summaryBySeverity.blocker}`);
    data.push(`Cosmetic: ${summaryBySeverity.cosmetic}`);
    data.push(`Minor: ${summaryBySeverity.minor}`);
    data.push(`Unknown: ${summaryBySeverity.unknown}`);
    data.push('======================================================\n');
    
    // Chi tiết từng test case
    data.push('CHI TIẾT PHÂN TÍCH:');
    data.push('------------------------------------------------------');
    
    analysisResults.forEach((item, index) => {
      const { testCase, analysis } = item;
      const severityIcon = this.severityIcons[analysis.severity] || this.severityIcons.unknown;
      
      data.push(`${index + 1}. ${testCase.title}`);
      data.push(`   - File: ${testCase.file || 'N/A'}`);
      data.push(`   - Mức độ nghiêm trọng: ${severityIcon} ${analysis.severity.toUpperCase()}`);
      data.push(`   - Mức ưu tiên: ${analysis.priority.toUpperCase()}`);
      data.push(`   - Lý do: ${analysis.reasoning}`);
      data.push(`   - Tác động: ${analysis.impact}`);
      data.push(`   - Đề xuất: ${analysis.suggestedAction}`);
      data.push('');
    });
    
    // Khuyến nghị
    data.push('KHUYẾN NGHỊ:');
    data.push('------------------------------------------------------');
    const criticalAndBlocker = analysisResults.filter(
      item => ['critical', 'blocker'].includes(item.analysis.severity)
    );
    
    if (criticalAndBlocker.length > 0) {
      data.push('Dựa trên phân tích, những lỗi sau đây cần được ưu tiên xử lý:');
      criticalAndBlocker.forEach((item, index) => {
        data.push(`${index + 1}. ${item.testCase.title}: ${item.analysis.suggestedAction}`);
      });
    } else {
      data.push('Không có lỗi nghiêm trọng cần ưu tiên xử lý.');
    }
    
    data.push('\n======================================================');
    data.push('Báo cáo được tạo tự động bởi VRA Test Framework với Gemini AI');
    data.push('======================================================');
    
    fs.writeFileSync(outputPath, data.join('\n'));
    console.log(`\nBáo cáo phân tích text đã được lưu tại: ${outputPath}`);
  }
  
  /**
   * Phân tích và tạo báo cáo mức độ nghiêm trọng
   * @param {Array} failures Các test case thất bại
   * @param {String} reportsDir Thư mục lưu báo cáo
   * @param {String} baseName Tên cơ sở của file báo cáo
   */
  async analyzeAndGenerateReports(failures, reportsDir = 'reports', baseName = 'severity-report') {
    try {
      const results = await this.analyzeSeverities(failures);
      
      if (results && results.length > 0) {
        const htmlPath = path.join(reportsDir, `${baseName}.html`);
        const textPath = path.join(reportsDir, `${baseName}.txt`);
        
        this.generateSeverityHtmlReport(results, htmlPath);
        this.generateSeverityTextReport(results, textPath);
        
        return {
          results,
          htmlPath,
          textPath
        };
      } else {
        console.log('Không có test case thất bại để phân tích.');
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi phân tích và tạo báo cáo:', error);
      return null;
    }
  }
}

export default new SeverityAnalyzer(); 