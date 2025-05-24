#!/usr/bin/env node

import { testRunner } from './utils/index.js';
import minimist from 'minimist';
import path from 'path';
import fs from 'fs';

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
  string: ['file', 'format', 'output'],
  boolean: ['help', 'all', 'e2e', 'screenshot', 'analyze'],
  alias: {
    h: 'help',
    f: 'file',
    o: 'output',
    t: 'format',
    a: 'all',
    e: 'e2e',
    s: 'screenshot',
    z: 'analyze'
  },
  default: {
    format: 'html',
    output: `test-report-${new Date().toISOString().split('T')[0]}`
  }
});

// Display help
if (argv.help) {
  console.log(`
  Công cụ chạy test và tạo báo cáo
  
  Sử dụng:
    node runTests.js [options]
    
  Options:
    -h, --help                 Hiển thị trợ giúp này
    -f, --file <path>          Chạy test từ file hoặc thư mục cụ thể
    -o, --output <filename>    Tên file báo cáo (không cần phần mở rộng)
    -t, --format <format>      Định dạng báo cáo (html, text, json, hoặc all)
    -a, --all                  Chạy tất cả các test
    -e, --e2e                  Chạy các test end-to-end
    -s, --screenshot           Chụp ảnh màn hình trong quá trình test
    -z, --analyze              Phân tích mức độ nghiêm trọng của lỗi bằng AI
    
  Ví dụ:
    node runTests.js --e2e --format html --output e2e-report
    node runTests.js --file ./e2e/display.test.js --screenshot
  `);
  process.exit(0);
}

// Set environment variable for screenshots
if (argv.screenshot) {
  process.env.TAKE_SCREENSHOTS = 'true';
}

// Run tests
async function main() {
  try {
    // Preparation
    const reportFormat = argv.format === 'all' ? null : argv.format;
    let reportFilename = `${argv.output}`;
    
    // Add test file name to report filename if specific file is being tested
    if (argv.file) {
      const testFile = path.resolve(process.cwd(), argv.file);
      if (fs.existsSync(testFile)) {
        // Extract filename without extension and add to report name
        const testFileName = path.basename(testFile, path.extname(testFile));
        reportFilename = `${reportFilename}-${testFileName}`;
        console.log(`Chạy test từ file: ${testFile}`);
        await testRunner.runTests(testFile, { reportFormat, reportFilename, takeScreenshots: argv.screenshot, severityAnalysis: argv.analyze });
      } else {
        console.error(`Không tìm thấy file: ${testFile}`);
        process.exit(1);
      }
    } else if (argv.e2e) {
      // For e2e tests, add e2e identifier
      reportFilename = `${reportFilename}-e2e`;
      console.log('Chạy các test end-to-end...');
      await testRunner.runE2ETests({ reportFormat, reportFilename, takeScreenshots: argv.screenshot, severityAnalysis: argv.analyze });
    } else if (argv.all) {
      console.log('Tính năng chưa hoàn thành');
      process.exit(1);
    } else {
      console.log('Không có test nào được chỉ định. Sử dụng --help để xem hướng dẫn.');
      process.exit(1);
    }
    
    console.log(`Đã hoàn thành việc chạy test và tạo báo cáo: ${reportFilename}`);
    
    // Hiển thị thông báo về tính năng phân tích mức độ nghiêm trọng
    if (argv.analyze) {
      console.log(`
┌──────────────────────────────────────────────────────────┐
│ Phân tích mức độ nghiêm trọng của lỗi đã hoàn thành      │
│                                                          │
│ Các báo cáo phân tích đã được tạo trong thư mục reports  │
│ với định dạng HTML và Text                               │
│                                                          │
│ Báo cáo test cũng đã được cập nhật với thông tin         │
│ phân tích mức độ nghiêm trọng của mỗi lỗi.               │
└──────────────────────────────────────────────────────────┘
      `);
    }
  } catch (error) {
    console.error('Lỗi khi chạy test:', error);
    process.exit(1);
  }
}

main(); 