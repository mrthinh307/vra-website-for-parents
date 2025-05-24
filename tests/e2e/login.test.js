import { Builder, By, until, Key } from 'selenium-webdriver';
import 'chromedriver';
import assert from 'assert';

describe('Login Functionality', function () {
    this.timeout(30000);
    let driver;
    const BASE_URL = "http://localhost:3000/";

    const LOGIN_EMAIL_INPUT_XPATH = "//div[@id='login-form']//input[@placeholder='Email*']";
    const LOGIN_PASSWORD_INPUT_XPATH = "//div[@id='login-form']//input[@placeholder='Mật khẩu*']";
    const LOGIN_SUBMIT_BUTTON_XPATH = "//div[@id='login-form']//button[.//span[text()='Đăng nhập']]";
    const LOGIN_FORM_CONTAINER_XPATH = "//div[@id='login-form']";
    const HEADER_LOGIN_BUTTON_XPATH = "//div[contains(@class, 'header') and not(contains(@class, 'mobile-menu'))]//button[normalize-space()='Đăng nhập']";
    const PASSWORD_TOGGLE_BUTTON_XPATH = "//input[@placeholder='Mật khẩu*']/following-sibling::button";
    const FEATURES_SECTION_ID = "features";

    const USER_INFO_HEADER_XPATH = "//div[contains(@class, 'header')]//div[contains(@class, 'bg-primary-color/10')]";
    const LOGOUT_BUTTON_XPATH = "//button[contains(.,'Đăng xuất')]";

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async function() {
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.xpath("//body")), 7000);
    });

    afterEach(async function() {
        try {
            // Check if user is logged in by looking for user info in header
            const userInfo = await driver.findElements(By.xpath(USER_INFO_HEADER_XPATH));
            if (userInfo.length > 0 && await userInfo[0].isDisplayed()) {
                // Click on user info to show logout button
                await userInfo[0].click();
                await driver.sleep(500);
                
                // Find and click logout button
                const logoutButton = await driver.findElement(By.xpath(LOGOUT_BUTTON_XPATH));
                await logoutButton.click();
                
                // Wait for logout to complete and login form to appear
                await driver.wait(until.elementLocated(By.xpath(LOGIN_FORM_CONTAINER_XPATH)), 7000);
            }
        } catch (error) {
            console.log('No need to logout - user was not logged in');
        }
        
        // Clear cookies and local storage
        await driver.manage().deleteAllCookies();
        await driver.executeScript('window.localStorage.clear();');
        await driver.executeScript('window.sessionStorage.clear();');
    });

    it('✅ TC-DN-001: Đăng nhập thành công với thông tin hợp lệ', async function () {
        await driver.wait(until.elementLocated(By.xpath(LOGIN_EMAIL_INPUT_XPATH)), 7000);
        await driver.findElement(By.xpath(LOGIN_EMAIL_INPUT_XPATH)).sendKeys('0000000001@gmail.com');
        await driver.findElement(By.xpath(LOGIN_PASSWORD_INPUT_XPATH)).sendKeys('Password123');
        await driver.findElement(By.xpath(LOGIN_SUBMIT_BUTTON_XPATH)).click();
        
        const userInfoHeaderEl = await driver.wait(until.elementLocated(By.xpath(USER_INFO_HEADER_XPATH)), 7000);
        assert.strictEqual(await userInfoHeaderEl.isDisplayed(), true, '❌ Thông tin user (trong header) chưa được hiển thị sau khi đăng nhập.');

        try {
            const loginFormStillPresent = await driver.findElement(By.xpath(LOGIN_FORM_CONTAINER_XPATH)).isDisplayed();
            assert.strictEqual(loginFormStillPresent, false, '❌ Box login vẫn còn hiển thị sau khi đăng nhập thành công.');
        } catch (e) {
            if (e.name === 'NoSuchElementError') {
                assert.ok(true, 'Login form is correctly removed/hidden after login.');
            } else {
                throw e;
            }
        }
    });

    it('❌ TC-DN-002: Đăng nhập thất bại với thông tin (email hoặc mật khẩu) không hợp lệ', async function () {
        await driver.wait(until.elementLocated(By.xpath(LOGIN_EMAIL_INPUT_XPATH)), 7000);
        await driver.findElement(By.xpath(LOGIN_EMAIL_INPUT_XPATH)).sendKeys('invalidemail@gmail.com');
        await driver.findElement(By.xpath(LOGIN_PASSWORD_INPUT_XPATH)).sendKeys('WrongPassword123');
        await driver.findElement(By.xpath(LOGIN_SUBMIT_BUTTON_XPATH)).click();

        await driver.wait(until.alertIsPresent(), 7000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        console.log(alertText);
        assert.strictEqual(alertText, "Invalid login credentials", "Alert message mismatch for invalid credentials.");
        await alert.accept();

        const loginForm = await driver.wait(until.elementLocated(By.xpath(LOGIN_FORM_CONTAINER_XPATH)), 7000);
        assert.strictEqual(await loginForm.isDisplayed(), true, '❌ Trang đăng nhập không còn hiển thị sau khi đăng nhập thất bại.');
    });

    it('❌ TC-DN-003: Đăng nhập thất bại khi để trống cả email và mật khẩu', async function () {
        await driver.wait(until.elementLocated(By.xpath(LOGIN_SUBMIT_BUTTON_XPATH)), 7000);
        await driver.findElement(By.xpath(LOGIN_SUBMIT_BUTTON_XPATH)).click();

        await driver.wait(until.alertIsPresent(), 7000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        assert.strictEqual(alertText, "Vui lòng nhập đầy đủ thông tin đăng nhập!", "Alert message mismatch for empty credentials.");
        await alert.accept();

        const loginForm = await driver.wait(until.elementLocated(By.xpath(LOGIN_FORM_CONTAINER_XPATH)), 7000);
        assert.strictEqual(await loginForm.isDisplayed(), true, '❌ Trang đăng nhập không còn hiển thị sau khi đăng nhập thất bại (trống thông tin).');
    });

    it('✅ TC-DN-004: Nhấn nút "Đăng nhập" trên header khi đã scroll xuống sẽ scroll tới login form', async function () {
        await driver.wait(until.elementLocated(By.xpath(LOGIN_FORM_CONTAINER_XPATH)), 7000);
        const loginFormElement = driver.findElement(By.xpath(LOGIN_FORM_CONTAINER_XPATH));
        
        const featuresSectionElement = await driver.wait(until.elementLocated(By.id(FEATURES_SECTION_ID)), 7000);
        await driver.executeScript("arguments[0].scrollIntoView(true);", featuresSectionElement);
        await driver.sleep(500);

        const isLoginFormInitiallyInView = await driver.executeScript(
            "var elem = arguments[0];" +
            "var rect = elem.getBoundingClientRect();" +
            "return (" +
            "    rect.top < window.innerHeight && rect.bottom >= 0 &&" +
            "    rect.left < window.innerWidth && rect.right >= 0" +
            ");", loginFormElement);
        assert.strictEqual(isLoginFormInitiallyInView, false, "❌ Login form was still in view after scrolling features section into view.");

        const headerLoginButton = await driver.wait(until.elementLocated(By.xpath(HEADER_LOGIN_BUTTON_XPATH)), 7000);
        await driver.actions().move({origin: headerLoginButton}).click().perform();

        await driver.sleep(1500);

        const isLoginFormNowInView = await driver.executeScript(
            "var elem = arguments[0];" +
            "var rect = elem.getBoundingClientRect();" +
            "return (" +
            "    rect.top < window.innerHeight && rect.bottom >= 0 &&" +
            "    rect.left < window.innerWidth && rect.right >= 0" +
            ");", loginFormElement);
        assert.strictEqual(isLoginFormNowInView, true, "❌ Login form is not in view after clicking header login button.");
    });

    it('✅ TC-DN-005: Kiểm tra chức năng ẩn/hiện mật khẩu', async function () {
        await driver.wait(until.elementLocated(By.xpath(LOGIN_PASSWORD_INPUT_XPATH)), 7000);
        const passwordInput = driver.findElement(By.xpath(LOGIN_PASSWORD_INPUT_XPATH));
        const toggleButton = driver.findElement(By.xpath(PASSWORD_TOGGLE_BUTTON_XPATH));

        await passwordInput.sendKeys('testPassword123');

        assert.strictEqual(await passwordInput.getAttribute('type'), 'password', '❌ Mật khẩu không bị ẩn ban đầu.');

        await toggleButton.click();
        await driver.wait(async () => (await passwordInput.getAttribute('type')) === 'text', 3000, 'Mật khẩu không hiển thị sau khi click lần 1.');
        assert.strictEqual(await passwordInput.getAttribute('type'), 'text', '❌ Mật khẩu không hiển thị sau khi click lần 1.');

        await toggleButton.click();
        await driver.wait(async () => (await passwordInput.getAttribute('type')) === 'password', 3000, 'Mật khẩu không bị ẩn sau khi click lần 2.');
        assert.strictEqual(await passwordInput.getAttribute('type'), 'password', '❌ Mật khẩu không bị ẩn sau khi click lần 2.');
    });
});
