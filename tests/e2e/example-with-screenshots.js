import { Builder, By, until } from 'selenium-webdriver';
import 'chromedriver';
import assert from 'assert';
import { screenshotHelper } from '../utils/index.js';

/**
 * Test mẫu để minh họa cách sử dụng chức năng chụp ảnh màn hình
 */
describe('Ví dụ kiểm thử với chụp ảnh màn hình', function () {
  let driver;
  let screenshots = [];

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    await driver.quit();
    
    // Hiển thị danh sách ảnh chụp (để debug)
    if (screenshots.length > 0) {
      console.log('\nDanh sách ảnh chụp màn hình:');
      screenshots.forEach(path => console.log(`- ${path}`));
    }
  });

  // TC-001: Chụp ảnh màn hình trang chính
  it('✅ Chụp ảnh màn hình trang chính', async function () {
    try {            
      // Truy cập trang chủ
      await driver.get("http://localhost:3000/");
      
      // Chụp ảnh màn hình trang chủ
      const screenshotPath = await screenshotHelper.takeScreenshot(
        driver, 
        this.test.fullTitle(),
        'home-page'
      );
      
      // Thêm vào danh sách nếu đã chụp
      if (screenshotPath) screenshots.push(screenshotPath);
      
      // Kiểm tra hero section hiển thị
      const heroTitle = await driver.findElement(By.className('hero-text'));
      assert(await heroTitle.isDisplayed(), '❌ Hero title không hiển thị');
    } catch (error) {
      // Chụp ảnh màn hình khi gặp lỗi (ngoài việc chụp tự động)
      await screenshotHelper.takeScreenshotOnFailure(driver, this.test.fullTitle());
      throw error;
    }
  });

  // TC-002: Cuộn xuống phần features và chụp ảnh
  it('✅ Cuộn xuống phần features và chụp ảnh', async function () {
    try {            
      await driver.get("http://localhost:3000/");
      
      // Tìm phần features
      const featuresSection = await driver.findElement(By.id('features'));
      
      // Cuộn đến phần này để đảm bảo nó hiển thị
      await driver.executeScript("arguments[0].scrollIntoView(true)", featuresSection);
      
      // Chờ một chút để animation hoàn thành
      await driver.sleep(1000);
      
      // Chụp ảnh màn hình phần features
      const screenshotPath = await screenshotHelper.takeScreenshot(
        driver, 
        this.test.fullTitle(),
        'features-section'
      );
      
      // Thêm vào danh sách nếu đã chụp
      if (screenshotPath) screenshots.push(screenshotPath);
      
      // Kiểm tra tiêu đề section
      const sectionTitle = await featuresSection.findElement(By.xpath(".//h2"));
      const titleText = await sectionTitle.getText();
      assert(titleText.includes('Lý do nên lựa chọn'), '❌ Không hiển thị đúng tiêu đề của phần features');
    } catch (error) {
      throw error;
    }
  });

  // TC-003: Chụp ảnh màn hình phần testimonials
  it('✅ Chụp ảnh màn hình phần testimonials', async function () {
    try {            
      await driver.get("http://localhost:3000/");
      
      // Tìm phần testimonials
      const testimonialSection = await driver.findElement(By.className('testimonial-slider'));
      
      // Cuộn đến phần này
      await driver.executeScript("arguments[0].scrollIntoView(true)", testimonialSection);
      await driver.sleep(1000);
      
      // Chụp ảnh màn hình phần testimonials
      const screenshotPath = await screenshotHelper.takeScreenshot(
        driver, 
        this.test.fullTitle(),
        'testimonials-section'
      );
      
      // Thêm vào danh sách nếu đã chụp
      if (screenshotPath) screenshots.push(screenshotPath);
      
      // Kiểm tra có các testimonial cards
      const testimonialCards = await testimonialSection.findElements(By.className('testimonial-card'));
      assert(testimonialCards.length > 0, '❌ Không hiển thị testimonial cards');
    } catch (error) {
      throw error;
    }
  });

  // TC-004: Kiểm tra hình ảnh với chụp màn hình có chủ đích thất bại
  it('❌ Test thất bại để minh họa chụp màn hình tự động', async function () {
    try {            
      await driver.get("http://localhost:3000/");
      
      // Chụp ảnh màn hình trước khi test
      const screenshotPath = await screenshotHelper.takeScreenshot(
        driver, 
        this.test.fullTitle(),
        'before-fail'
      );
      
      // Thêm vào danh sách nếu đã chụp
      if (screenshotPath) screenshots.push(screenshotPath);
      
      // Cố tình tạo lỗi bằng cách tìm một phần tử không tồn tại
      const nonExistentElement = await driver.findElement(By.id('element-not-exist'));
      await nonExistentElement.click();
      
      // Code dưới đây sẽ không được thực thi do lỗi ở trên
      assert(false, 'Test này không bao giờ pass');
    } catch (error) {
      // Ảnh màn hình lúc thất bại sẽ được tự động chụp trong afterEach hook
      throw error;
    }
  });
}); 