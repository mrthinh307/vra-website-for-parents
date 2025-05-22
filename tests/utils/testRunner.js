import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { reportGenerator, screenshotHelper, severityAnalyzer } from './index.js';

// Lấy đường dẫn thư mục gốc
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Quản lý việc chạy tests
 */
class TestRunner {
  /**
   * Chạy các tests từ file hoặc thư mục
   * @param {string|string[]} testFiles Đường dẫn file hoặc mảng đường dẫn file
   * @param {Object} options Các tùy chọn khi chạy test
   */
  async runTests(testFiles, options = {}) {
    try {
      const Mocha = (await import('mocha')).default;
      
      const {
        reportFormat = 'html',
        reportFilename = `test-report-${new Date().toISOString().split('T')[0]}`,
        reportDir = 'reports',
        takeScreenshots = process.env.TAKE_SCREENSHOTS === 'true',
        severityAnalysis = false
      } = options;
      
      const mocha = new Mocha({
        reporter: 'json',
        timeout: 30000 // 30 giây timeout
      });

      // Khởi tạo thư viện chụp ảnh nếu cần
      if (takeScreenshots) {
        await screenshotHelper.setup();
      }

      // Thêm các files cần test
      const files = Array.isArray(testFiles) ? testFiles : [testFiles];
      files.forEach(file => {
        if (fs.existsSync(file)) {
          if (fs.lstatSync(file).isDirectory()) {
            const testFiles = glob.sync(`${file}/**/*.test.js`);
            testFiles.forEach(f => mocha.addFile(f));
          } else {
            mocha.addFile(file);
          }
        }
      });

      // Chạy tests và lấy kết quả
      console.log('Đang chạy tests...');
      const results = await this._runMochaTests(mocha);

      // Phân tích mức độ nghiêm trọng nếu có lỗi và người dùng yêu cầu
      let severityAnalysisResults = null;
      if (severityAnalysis && results.failures && results.failures.length > 0) {
        console.log('Đang phân tích mức độ nghiêm trọng của lỗi...');
        const analysisResults = await severityAnalyzer.analyzeAndGenerateReports(
          results.failures,
          reportDir,
          `${reportFilename}-severity`
        );
        
        if (analysisResults) {
          severityAnalysisResults = analysisResults.results;
        }
      }
      
      // Tạo báo cáo
      reportGenerator.generateReport(results, {
        reportDir,
        reportFilename,
        reportFormats: reportFormat ? [reportFormat] : ['html'],
        severityAnalysis,
        severityAnalysisResults
      });
      
      // Dọn dẹp
      if (takeScreenshots) {
        await screenshotHelper.cleanup();
      }
      
      console.log('\nKết quả tests:');
      console.log(`- Tổng số: ${results.stats.tests}`);
      console.log(`- Thành công: ${results.stats.passes} (${(results.stats.passes / results.stats.tests * 100).toFixed(2)}%)`);
      console.log(`- Thất bại: ${results.stats.failures}`);
      console.log(`- Đang chờ: ${results.stats.pending}`);
      
      return results;
    } catch (error) {
      console.error('Lỗi khi chạy tests:', error);
      throw error;
    }
  }
  
  /**
   * Chạy Mocha tests và trả về kết quả
   * @param {Object} mocha Instance của Mocha
   * @returns {Promise<Object>} Kết quả tests
   */
  _runMochaTests(mocha) {
    return new Promise((resolve) => {
      const results = {
        stats: {
          tests: 0,
          passes: 0,
          failures: 0,
          pending: 0
        },
        passes: [],
        failures: [],
        pending: []
      };
      
      // Chạy tests
      const runner = mocha.run();
      
      // Xử lý các events khi test chạy
      
      runner.on('test', function(test) {
        console.log(`  Đang chạy: ${test.title}`);
      });
      
      runner.on('pass', function(test) {
        console.log(`  ✓ Thành công: ${test.title}`);
        results.passes.push(test);
        results.stats.passes++;
      });
      
      runner.on('fail', async function(test, err) {
        console.log(`  ✗ Thất bại: ${test.title}`);
        
        // Kiểm tra xem có chụp ảnh khi test thất bại không
        if (process.env.TAKE_SCREENSHOTS === 'true') {
          try {
            const screenshotPath = await screenshotHelper.takeScreenshot(test.title);
            if (screenshotPath) {
              test.screenshot = screenshotPath;
            }
          } catch (screenshotErr) {
            console.error('Lỗi khi chụp màn hình:', screenshotErr.message);
          }
        }
        
        results.failures.push(test);
        results.stats.failures++;
      });
      
      runner.on('pending', function(test) {
        console.log(`  - Đang chờ: ${test.title}`);
        results.pending.push(test);
        results.stats.pending++;
      });
      
      runner.on('end', function() {
        results.stats.tests = results.stats.passes + results.stats.failures + results.stats.pending;
        resolve(results);
      });
    });
  }
  
  /**
   * Chạy các end-to-end tests
   * @param {Object} options Tùy chọn khi chạy test
   */
  async runE2ETests(options = {}) {
    const e2eDir = path.join(rootDir, 'e2e');
    if (!fs.existsSync(e2eDir)) {
      console.error('Không tìm thấy thư mục e2e.');
      return;
    }
    
    options = {
      ...options,
      takeScreenshots: true, // Luôn chụp ảnh cho e2e tests
    };
    
    console.log('Chạy end-to-end tests từ thư mục:', e2eDir);
    return await this.runTests(e2eDir, options);
  }
  
  /**
   * Lấy danh sách các test files
   * @param {string} dir Thư mục
   * @returns {string[]} Danh sách file paths
   */
  getTestFiles(dir = '.') {
    const testDir = path.isAbsolute(dir) ? dir : path.join(rootDir, dir);
    const files = glob.sync(`${testDir}/**/*.test.js`);
    return files;
  }
}

export default new TestRunner(); 