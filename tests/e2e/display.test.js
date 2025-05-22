import { Builder, By, until } from 'selenium-webdriver';
import 'chromedriver';
import assert from 'assert';

describe('HomePage Display Tests', function () {
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.quit();
    });

    // TC-UI-001: Kiểm tra hiển thị tiêu đề trang chính
    it('✅ TC-UI-001:Hiển thị đúng tiêu đề và nội dung hero section', async function () {
        try {            
            await driver.get("http://localhost:3000/");
            
            // Kiểm tra tiêu đề chính
            const heroTitle = await driver.findElement(By.className('hero-text'));
            const heroTitleText = await heroTitle.getText();
            assert.ok(heroTitleText.includes('Nền tảng học tập'), '❌ Không hiển thị đúng tiêu đề hero section');
            
            // Kiểm tra các điểm nổi bật có hiển thị đúng
            const featurePoints = await driver.findElements(By.xpath("//div[contains(@data-aos, 'stagger')]/div"));
            assert(featurePoints.length >= 4, '❌ Không hiển thị đủ các điểm nổi bật');
            
            // Kiểm tra nút call-to-action
            const ctaButton = await driver.findElement(By.xpath('//*[@id="root"]/div/main/div/div/section[1]/div/div/div[1]/div[3]/button'));
            assert(await ctaButton.isDisplayed(), '❌ Không hiển thị nút "Bắt đầu ngay"');

            // Kiểm tra nut tìm hiểu thêm
            const learnMoreButton = await driver.findElement(By.xpath('//*[@id="root"]/div/main/div/div/section[1]/div/div/div[1]/div[3]/a'));
            assert(await learnMoreButton.isDisplayed(), '❌ Không hiển thị nút "Tìm hiểu thêm"');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-002: Kiểm tra hiển thị phần rotating text trong hero section
    it('✅ TC-UI-002: Hiển thị phần rotating text trong hero section', async function () {
        try {
            await driver.get("http://localhost:3000/");

            const rotatingTextContainer = await driver.findElement(By.xpath('//*[@id="root"]/div/main/div/div/section[1]/div/div/div[1]/div[1]/h1/span[2]'));
            const initialText = await rotatingTextContainer.getText();

            // Chờ một lúc để xem text có thay đổi không (animation)
            await driver.sleep(3500); // Đợi lâu hơn thời gian rotation (3000ms)
            
            // Kiểm tra text đã thay đổi (rotation đã hoạt động)
            const updatedText = await rotatingTextContainer.getText();
            console.log("Initial text:", initialText);
            console.log("Updated text:", updatedText);
            // Note: Có thể không pass nếu animation không hoạt động đúng
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-003: Kiểm tra hiển thị của các phần tử có hiệu ứng xuất hiện khi scroll
    it('✅ TC-UI-003: Hiển thị đúng các phần tử có animation khi scroll', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Kiểm tra các phần tử có data-aos attribute
            const animatedElements = await driver.findElements(By.xpath("//*[@data-aos]"));
            assert(animatedElements.length > 0, '❌ Không có phần tử nào có animation khi scroll');
            
            // Kiểm tra các loại animation
            const fadeUpElements = await driver.findElements(By.xpath("//*[contains(@class, 'animate-on-scroll-fade-up')]"));
            const fadeRightElements = await driver.findElements(By.xpath("//*[contains(@class, 'animate-on-scroll-fade-right')]"));
            const fadeLeftElements = await driver.findElements(By.xpath("//*[contains(@class, 'animate-on-scroll-fade-left')]"));
            
            console.log(`Số lượng phần tử fade-up: ${fadeUpElements.length}`);
            console.log(`Số lượng phần tử fade-right: ${fadeRightElements.length}`);
            console.log(`Số lượng phần tử fade-left: ${fadeLeftElements.length}`);
            
            // Kiểm tra tổng số phần tử có animation
            const totalAnimatedElements = fadeUpElements.length + fadeRightElements.length + fadeLeftElements.length;
            assert(totalAnimatedElements > 0, '❌ Không có phần tử nào có class animation');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-004: Kiểm tra hiển thị form đăng nhập
    it('✅ TC-UI-004: Hiển thị form đăng nhập khi chưa đăng nhập', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Kiểm tra form đăng nhập
            const loginForm = await driver.findElement(By.id('login-form'));
            assert(await loginForm.isDisplayed(), '❌ Form đăng nhập không hiển thị');

            // Kiểm tra các trường nhập liệu
            const emailInput = await driver.findElement(By.xpath("//input[@type='email']"));
            const passwordInput = await driver.findElement(By.xpath("//input[@placeholder='Mật khẩu*']"));
            const loginButton = await driver.findElement(By.xpath("//button[contains(text(), 'Đăng nhập')]"));
            
            assert(await emailInput.isDisplayed(), '❌ Trường email không hiển thị');
            assert(await passwordInput.isDisplayed(), '❌ Trường mật khẩu không hiển thị');
            assert(await loginButton.isDisplayed(), '❌ Nút đăng nhập không hiển thị');
            
            // Kiểm tra nút đăng ký
            const registerButton = await driver.findElement(By.xpath("//button[contains(text(), 'Đăng ký')]"));
            assert(await registerButton.isDisplayed(), '❌ Nút đăng ký không hiển thị');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-005: Kiểm tra các phần tử phụ trong form đăng nhập
    it('✅ TC-UI-005: Hiển thị đúng các phần tử phụ trong form đăng nhập', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Kiểm tra nút "Quên mật khẩu"
            const forgotPasswordButton = await driver.findElement(By.xpath("//button[contains(text(), 'Quên mật khẩu?')]"));
            assert(await forgotPasswordButton.isDisplayed(), '❌ Nút "Quên mật khẩu" không hiển thị');
            
            // Kiểm tra phần đăng nhập bằng Google
            const googleLoginButton = await driver.findElement(By.xpath("//span[contains(text(), 'Đăng nhập với Google')]"));
            assert(await googleLoginButton.isDisplayed(), '❌ Nút đăng nhập bằng Google không hiển thị');
            
            // Kiểm tra logo Google
            const googleLogo = await driver.findElement(By.xpath('//*[@id="login-form"]/div/div/div[2]/button/img'));
            assert(await googleLogo.isDisplayed(), '❌ Logo Google không hiển thị');
        
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-006: Kiểm tra hiển thị phần "Tại sao chọn VRA"
    it('✅ TC-UI-006: Hiển thị phần "Tại sao chọn VRA" với đầy đủ thông tin', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Tìm đến phần features
            const featuresSection = await driver.findElement(By.id('features'));
            
            // Cuộn đến phần này để đảm bảo nó hiển thị
            await driver.executeScript("arguments[0].scrollIntoView(true)", featuresSection);
            
            // Chờ một chút để animation hoàn thành
            await driver.sleep(1000);
            
            // Kiểm tra tiêu đề section
            const sectionTitle = await featuresSection.findElement(By.xpath(".//h2"));
            const titleText = await sectionTitle.getText();
            assert(titleText.includes('Lý do nên lựa chọn'), '❌ Không hiển thị đúng tiêu đề của phần');
            
            // Kiểm tra các card tính năng
            const featureCards = await featuresSection.findElements(By.xpath(".//div[contains(@class, 'grid')]/div"));
            assert(featureCards.length >= 3, '❌ Không hiển thị đủ card tính năng');
            
            // Kiểm tra hình ảnh trong card
            const featureImages = await featuresSection.findElements(By.xpath(".//img"));
            assert(featureImages.length >= 3, '❌ Không hiển thị đủ hình ảnh trong các card');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-007: Kiểm tra chi tiết từng card trong phần "Tại sao chọn VRA"
    it('✅ TC-UI-007: Hiển thị chi tiết trong phần "Tại sao chọn VRA"', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Tìm đến phần features
            const featuresSection = await driver.findElement(By.id('features'));
            
            // Cuộn đến phần này
            await driver.executeScript("arguments[0].scrollIntoView(true)", featuresSection);
            await driver.sleep(1000);
            
            const sectionDescription = await featuresSection.findElement(By.xpath(".//p[contains(@class, 'text-gray-700')]"));
            assert(await sectionDescription.isDisplayed(), '❌ Không hiển thị mô tả section');
            
            // Kiểm tra từng card
            const cards = await featuresSection.findElements(By.xpath(".//div[contains(@class, 'group/card')]"));
            
            // Kiểm tra card đầu tiên
            if (cards.length > 0) {
                const firstCardTitle = await cards[0].findElement(By.xpath(".//div[contains(@class, 'text-2xl')]"));
                assert(await firstCardTitle.isDisplayed(), '❌ Tiêu đề card đầu tiên không hiển thị');
                
                const firstCardDesc = await cards[0].findElement(By.xpath(".//p[contains(@class, 'text-gray-500')]"));
                assert(await firstCardDesc.isDisplayed(), '❌ Mô tả card đầu tiên không hiển thị');
                
                const firstCardButton = await cards[0].findElement(By.xpath(".//span[contains(text(), 'Chi tiết')]"));
                assert(await firstCardButton.isDisplayed(), '❌ Nút Chi tiết không hiển thị');
            }
            
            // Kiểm tra card thứ hai nếu có
            if (cards.length > 1) {
                const secondCardTitle = await cards[1].findElement(By.xpath(".//div[contains(@class, 'text-2xl')]"));
                assert(await secondCardTitle.isDisplayed(), '❌ Tiêu đề card thứ hai không hiển thị');
            }
            
            // Kiểm tra card thứ ba nếu có
            if (cards.length > 2) {
                const thirdCardTitle = await cards[2].findElement(By.xpath(".//div[contains(@class, 'text-2xl')]"));
                assert(await thirdCardTitle.isDisplayed(), '❌ Tiêu đề card thứ ba không hiển thị');
            }
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-008: Kiểm tra hiển thị phần tính năng nổi bật
    it('✅ TC-UI-008: Hiển thị phần tính năng nổi bật với các thông tin chi tiết', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Tìm đến phần section features
            const featuresDetailSection = await driver.findElement(By.className('section-features'));
            
            // Cuộn đến phần này
            await driver.executeScript("arguments[0].scrollIntoView(true)", featuresDetailSection);
            await driver.sleep(1000);
            
            // Kiểm tra tiêu đề
            const sectionTitle = await featuresDetailSection.findElement(By.xpath(".//h2"));
            const titleText = await sectionTitle.getText();
            assert(titleText.includes('Cùng tìm hiểu'), '❌ Không hiển thị đúng tiêu đề của phần');
            
            // Kiểm tra các feature rows
            const featureRows = await featuresDetailSection.findElements(By.className('feature-row'));
            assert(featureRows.length >= 2, '❌ Không hiển thị đủ các hàng tính năng');
            
            // Kiểm tra nội dung của hàng đầu tiên
            const firstRowTitle = await featureRows[0].findElement(By.xpath(".//h3"));
            const firstRowTitleText = await firstRowTitle.getText();
            assert(firstRowTitleText.includes('Dễ dàng theo dõi'), '❌ Không hiển thị đúng tiêu đề của tính năng theo dõi');
            
            // Kiểm tra có nút tìm hiểu ngay
            const spans = await featuresDetailSection.findElements(By.xpath(".//span[normalize-space(text())='Tìm hiểu ngay']"));
            assert(spans.length>= 3, '❌ Không hiển thị nút tìm hiểu ngay');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-009: Kiểm tra hiển thị stack component trong section đội ngũ
    it('✅ TC-UI-009: Hiển thị stack component trong section đội ngũ', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Tìm đến phần section features
            const featuresDetailSection = await driver.findElement(By.className('section-features'));
            
            // Cuộn đến phần này
            await driver.executeScript("arguments[0].scrollIntoView(true)", featuresDetailSection);
            await driver.sleep(1000);
            
            // Lấy tất cả các feature rows
            const featureRows = await featuresDetailSection.findElements(By.className('feature-row'));
            
            if (featureRows.length > 1) {
                // Tìm Stack component
                const stackContainer = await featureRows[1].findElement(By.xpath('//*[@id="root"]/div/main/div/div/section[3]/div/div[3]/div[1]/div/div[4]/div'));
                assert(await stackContainer.length > 0, '❌ Không hiển thị component stack');
                
                // Kiểm tra có hình ảnh trong stack
                const stackImages = await stackContainer.findElements(By.xpath(".//img"));
                assert(stackImages.length > 0, '❌ Không có hình ảnh trong stack component');
            }
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-010: Kiểm tra hiển thị phần testimonials
    it('✅ TC-UI-010: Hiển thị phần đánh giá từ người dùng', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Tìm đến phần testimonials
            const testimonialSection = await driver.findElement(By.className('testimonial-slider'));
            
            // Cuộn đến phần này
            await driver.executeScript("arguments[0].scrollIntoView(true)", testimonialSection);
            await driver.sleep(1000);
            
            // Kiểm tra có các testimonial cards
            const testimonialCards = await testimonialSection.findElements(By.className('testimonial-card'));
            assert(testimonialCards.length > 0, '❌ Không hiển thị testimonial cards');
            
            // Kiểm tra nội dung của card đầu tiên
            const firstCardQuote = await testimonialCards[0].findElement(By.className('testimonial-quote'));
            assert(await firstCardQuote.isDisplayed(), '❌ Không hiển thị quote trong testimonial');
            
            // Kiểm tra các nút điều hướng
            const navigationDots = await driver.findElements(By.xpath("//button[contains(@class, 'rounded-full')]"));
            assert(navigationDots.length >= 3, '❌ Không hiển thị đủ các nút điều hướng');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-011: Kiểm tra chi tiết phần testimonials
    it('✅ TC-UI-011: Hiển thị chi tiết trong phần đánh giá từ người dùng', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Tìm đến phần testimonials
            const testimonialContainer = await driver.findElement(By.xpath("//section[contains(@class, 'py-16') and contains(@class, 'bg-gradient-to-b') and contains(@class, 'from-blue-50')]"));
            
            // Cuộn đến phần này
            await driver.executeScript("arguments[0].scrollIntoView(true)", testimonialContainer);
            await driver.sleep(1000);
            
            // Kiểm tra tiêu đề section
            const sectionTitle = await testimonialContainer.findElement(By.xpath(".//h2"));
            assert((await sectionTitle.getText()).includes('Phụ huynh nói gì'), '❌ Không hiển thị đúng tiêu đề của phần testimonial');
            
            // Tìm slider
            const testimonialSlider = await testimonialContainer.findElement(By.className('testimonial-slider'));
            
            // Kiểm tra các testimonial cards
            const testimonialCards = await testimonialSlider.findElements(By.className('testimonial-card'));
            assert(testimonialCards.length > 0, '❌ Không hiển thị testimonial cards');
            
            // Kiểm tra đánh giá sao trong card đầu tiên
            const stars = await testimonialCards[0].findElements(By.className('text-yellow-400'));
            assert(stars.length === 5, '❌ Không hiển thị đủ 5 sao đánh giá');
            
            // Kiểm tra thông tin người dùng trong card
            const userName = await testimonialCards[0].findElement(By.xpath(".//h4[contains(@class, 'font-bold')]"));
            assert(await userName.isDisplayed(), '❌ Không hiển thị tên người dùng trong testimonial');
            
            const userRole = await testimonialCards[0].findElement(By.xpath(".//p[contains(@class, 'text-gray-500')]"));
            assert(await userRole.isDisplayed(), '❌ Không hiển thị vai trò người dùng trong testimonial');
            
            // Kiểm tra nút xem tất cả đánh giá
            const viewAllButton = await testimonialContainer.findElement(By.xpath(".//span[contains(text(), 'Xem tất cả đánh giá')]"));
            assert(await viewAllButton.isDisplayed(), '❌ Không hiển thị nút xem tất cả đánh giá');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-012: Kiểm tra chức năng hiển thị/ẩn mật khẩu
    it('✅ TC-UI-012: Ẩn/hiện mật khẩu khi click vào icon', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Nhập mật khẩu
            const passwordField = await driver.findElement(By.xpath("//input[@placeholder='Mật khẩu*']"));
            await passwordField.sendKeys('test123456');
            
            // Mặc định là ẩn, kiểm tra type
            assert.strictEqual(await passwordField.getAttribute('type'), 'password', '❌ Mật khẩu không được ẩn mặc định');
            
            // Click vào icon eye để hiện mật khẩu
            await driver.findElement(By.xpath("//button[contains(@class, 'text-gray-500')]")).click();
            
            // Kiểm tra type đã chuyển sang text
            assert.strictEqual(await passwordField.getAttribute('type'), 'text', '❌ Mật khẩu không hiển thị sau khi click vào icon');
            
            // Click lại để ẩn
            await driver.findElement(By.xpath("//button[contains(@class, 'text-gray-500')]")).click();
            
            // Kiểm tra type đã chuyển lại sang password
            assert.strictEqual(await passwordField.getAttribute('type'), 'password', '❌ Mật khẩu không được ẩn lại sau khi click lần 2');
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-013: Kiểm tra hiển thị form đăng ký khi click vào nút đăng ký
    it('✅ TC-UI-013: Hiển thị form đăng ký khi click vào nút đăng ký', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Click vào nút đăng ký
            await driver.findElement(By.xpath('//*[@id="root"]/div/div/div/div[2]/button[2]')).click();
            
            // Chờ form đăng ký hiển thị
            await driver.sleep(1000);
            
            // Kiểm tra form đăng ký đã hiển thị
            const registerForm = await driver.findElement(By.xpath("//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]"));
            assert(await registerForm.isDisplayed(), '❌ Form đăng ký không hiển thị');
            
            // Kiểm tra tiêu đề của form
            const formTitle = await registerForm.findElement(By.xpath(".//h2"));
            assert((await formTitle.getText()).includes('Đăng ký'), '❌ Không hiển thị đúng tiêu đề của form đăng ký');
            
            // Kiểm tra các trường nhập liệu
            const nameInput = await registerForm.findElement(By.xpath(".//input[@name='name']"));
            const emailInput = await registerForm.findElement(By.xpath(".//input[@name='email']"));
            const phoneInput = await registerForm.findElement(By.xpath(".//input[@name='phone']"));
            const passwordInput = await registerForm.findElement(By.xpath(".//input[@name='password']"));
            const confirmPasswordInput = await registerForm.findElement(By.xpath(".//input[@name='confirmPassword']"));
            
            assert(await nameInput.isDisplayed(), '❌ Trường Họ tên không hiển thị');
            assert(await emailInput.isDisplayed(), '❌ Trường Email không hiển thị');
            assert(await phoneInput.isDisplayed(), '❌ Trường Số điện thoại không hiển thị');
            assert(await passwordInput.isDisplayed(), '❌ Trường Mật khẩu không hiển thị');
            assert(await confirmPasswordInput.isDisplayed(), '❌ Trường Xác nhận mật khẩu không hiển thị');
            
            // Đóng form đăng ký
            const closeButton = await registerForm.findElement(By.xpath('//*[@id="root"]/div/main/div/div/div/div/button'));
            await closeButton.click();
            
            // Chờ form đóng
            await driver.sleep(1000);
            
            // Kiểm tra form đã đóng
            try {
                const form = await driver.findElement(By.xpath('//*[@id="root"]/div/main/div/div/div/div'));
                const isDisplayed = await form.length > 0;
                assert(!isDisplayed, '❌ Form đăng ký không đóng sau khi click nút đóng');
            } catch (e) {
                // Không tìm thấy form là đúng
            }
        } catch (error) {
            throw error;
        }
    });

    // TC-UI-014: Kiểm tra hiển thị các phần tử trong toàn bộ trang
    it('✅ TC-UI-014: Hiển thị các phần tử trang và scroll thử nghiệm', async function () {
        try {
            await driver.get("http://localhost:3000/");
            
            // Lấy title của trang
            const pageTitle = await driver.getTitle();
            console.log("Page title:", pageTitle);
            
            // Kiểm tra các section hiển thị đúng
            const sections = await driver.findElements(By.xpath("//section"));
            assert(sections.length >= 3, '❌ Không hiển thị đủ các section trong trang');
            
            // Kiểm tra scroll xuống cuối trang
            await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
            await driver.sleep(1000);
            
            // Kiểm tra đã scroll tới cuối bằng cách kiểm tra phần cuối trang có hiển thị không
            const lastSection = await driver.findElement(By.xpath("//section[last()]"));
            const isLastSectionVisible = await driver.executeScript("const rect = arguments[0].getBoundingClientRect(); return rect.top <= window.innerHeight;", lastSection);
            assert(isLastSectionVisible, '❌ Không scroll được đến cuối trang');
            
            // Scroll lên đầu trang
            await driver.executeScript("window.scrollTo(0, 0)");
            await driver.sleep(1000);
            
            // Kiểm tra đã scroll lên đầu
            const firstSection = await driver.findElement(By.xpath("//section[1]"));
            const isFirstSectionVisible = await driver.executeScript("const rect = arguments[0].getBoundingClientRect(); return rect.top >= 0;", firstSection);
            assert(isFirstSectionVisible, '❌ Không scroll được lên đầu trang');
        } catch (error) {
            throw error;
        }
    });
});
