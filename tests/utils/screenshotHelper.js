import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

/**
 * Lớp hỗ trợ chụp ảnh màn hình trong quá trình test
 */
class ScreenshotHelper {
  constructor() {
    this.screenshotDir = path.resolve(process.cwd(), 'reports/screenshots');
    this.browser = null;
    this.page = null;
    this.initialized = false;
  }

  /**
   * Khởi tạo Puppeteer để chụp ảnh màn hình
   */
  async setup() {
    try {
      // Tạo thư mục lưu ảnh chụp màn hình nếu chưa tồn tại
      if (!fs.existsSync(this.screenshotDir)) {
        fs.mkdirSync(this.screenshotDir, { recursive: true });
      }

      // Khởi tạo trình duyệt headless
      this.browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Tạo tab mới
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 800 });
      
      this.initialized = true;
      console.log('Đã khởi tạo trình chụp ảnh màn hình');
    } catch (error) {
      console.error('Lỗi khi khởi tạo trình chụp ảnh màn hình:', error);
      throw error;
    }
  }

  /**
   * Chụp ảnh màn hình và lưu với tên được cung cấp
   * @param {string} testName Tên của test case
   * @param {string} url URL để tải trước khi chụp (tùy chọn)
   * @returns {string|null} Đường dẫn đến ảnh chụp màn hình hoặc null nếu thất bại
   */
  async takeScreenshot(testName, url = null) {
    if (!this.initialized) {
      console.warn('Trình chụp ảnh màn hình chưa được khởi tạo. Hãy gọi setup() trước.');
      return null;
    }

    try {
      // Nếu có URL, tải trang đó trước khi chụp
      if (url) {
        await this.page.goto(url, { waitUntil: 'networkidle2' });
      }

      // Chuẩn hóa tên file từ tên test
      const fileName = testName
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
      
      // Tạo đường dẫn đầy đủ với timestamp để tránh ghi đè
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const screenshotPath = path.join(
        this.screenshotDir, 
        `${fileName}-${timestamp}.png`
      );
      
      // Chụp và lưu ảnh màn hình
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Đã chụp ảnh màn hình: ${screenshotPath}`);
      
      // Trả về đường dẫn tương đối để dễ dàng tham chiếu trong báo cáo
      return `screenshots/${path.basename(screenshotPath)}`;
    } catch (error) {
      console.error('Lỗi khi chụp ảnh màn hình:', error);
      return null;
    }
  }

  /**
   * Dọn dẹp tài nguyên (đóng trình duyệt)
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.initialized = false;
      console.log('Đã đóng trình chụp ảnh màn hình');
    }
  }
}

export default new ScreenshotHelper(); 