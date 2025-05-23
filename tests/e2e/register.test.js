import { Builder, By, until, Key } from 'selenium-webdriver';
import 'chromedriver';
import assert from 'assert';

describe('Register Functionality', function () {
    this.timeout(30000); // Set timeout for all tests in this suite
    let driver;
    const BASE_URL = "http://localhost:3000/";
    // Assuming this XPath correctly targets the button that opens the registration modal
    const OPEN_REGISTER_MODAL_BUTTON_XPATH = "//*[@id='root']/div/div/div/div[2]/button[2]";
    // XPath for the submit button within the registration modal
    const SUBMIT_REGISTER_BUTTON_XPATH = "//div[contains(@class, 'modal-visible')]//button[.//span[contains(text(),'Đăng ký')]]";
    // XPath to identify the visible registration modal
    const VISIBLE_MODAL_XPATH = "//div[contains(@class, 'modal') and contains(@class, 'modal-visible')]";

    // Helper function to fill form fields
    async function fillFormField(fieldName, value) {
        const field = await driver.findElement(By.name(fieldName));
        await field.clear();
        if (value) { // Send keys only if value is not empty, to correctly test empty field scenarios
            await field.sendKeys(value);
        }
    }

    // Helper function to check for error message and modal presence
    async function assertErrorState(expectedErrorMessage, fieldName) {
        if (expectedErrorMessage) {
            // XPath for the error message paragraph associated with the input
            // Assumes error <p> is a sibling or near the input's parent div
            // This specific XPath looks for a p tag that is a sibling of the input's parent div
            const errorElementXPath = `//input[@name='${fieldName}']/ancestor::div[contains(@class, 'form-input')]/following-sibling::p[contains(@class, 'text-red-500')]`;
            try {
                const errorElement = await driver.wait(until.elementLocated(By.xpath(errorElementXPath)), 7000);
                const actualErrorMessage = await errorElement.getText();
                assert.strictEqual(actualErrorMessage, expectedErrorMessage, `Incorrect error message for ${fieldName}. Expected: '${expectedErrorMessage}', Got: '${actualErrorMessage}'`);
                assert(await errorElement.isDisplayed(), `Error message for ${fieldName} not displayed`);
            } catch (e) {
                // If specific XPath fails, try a more generic one (less reliable for specific field)
                const genericErrorElement = await driver.wait(until.elementLocated(By.xpath(`//p[text()="${expectedErrorMessage}"]`)), 7000);
                assert(await genericErrorElement.isDisplayed(), `Generic error message "${expectedErrorMessage}" for ${fieldName} not displayed`);
            }
        }
        const modal = await driver.findElements(By.xpath(VISIBLE_MODAL_XPATH));
        assert.strictEqual(modal.length, 1, 'Registration modal closed prematurely or not found.');
    }

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async function () {
        await driver.get(BASE_URL);
        try {
            const openModalButton = await driver.wait(until.elementLocated(By.xpath(OPEN_REGISTER_MODAL_BUTTON_XPATH)), 7000);
            await openModalButton.click();
            await driver.wait(until.elementLocated(By.xpath(VISIBLE_MODAL_XPATH)), 7000);
            await driver.wait(until.elementIsVisible(driver.findElement(By.name('name'))), 7000);
        } catch (error) {
            console.error("Error in beforeEach: Could not open or verify registration modal.", error);
            throw error; // Rethrow to fail the test
        }
    });

    it('✅ TC-DK-001: Đăng ký thành công với thông tin hợp lệ', async function () {
        const uniqueEmail = `testuser_${Date.now()}@gmail.com`;
        const uniquePhone = `0${String(Date.now()).slice(-9)}`; // Ensure 10 digits, starts with 0

        await fillFormField('name', 'Test User');
        await fillFormField('email', uniqueEmail);
        await fillFormField('phone', uniquePhone);
        await fillFormField('password', 'Password123');
        await fillFormField('confirmPassword', 'Password123');

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();

        // Wait for and verify the success alert
        await driver.wait(until.alertIsPresent(), 7000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        assert.strictEqual(alertText, "Đăng ký thành công!");
        await alert.accept();

        // Verify modal is closed after successful registration
        await driver.wait(until.stalenessOf(submitButton), 7000); // Wait for modal to disappear
        const modalsAfterSuccess = await driver.findElements(By.xpath(VISIBLE_MODAL_XPATH));
        assert.strictEqual(modalsAfterSuccess.length, 0, 'Registration modal still visible after successful registration.');
    });

    const validTestData = {
        name: 'Valid Name',
        email: 'validemail@gmail.com',
        phone: '0123456789',
        password: 'Password123',
        confirmPassword: 'Password123'
    };

    // --- Name Field Tests ---
    it('❌ TC-DK-002: Đăng ký thất bại khi để trống trường "Họ và tên"', async function () {
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);
        // Name field is left empty by not calling fillFormField for it or by sending ''
        await fillFormField('name', '');


        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Vui lòng nhập họ và tên", "name");
    });

    it('❌ TC-DK-003: Đăng ký thất bại khi trường "Họ và tên" ít hơn 2 ký tự', async function () {
        await fillFormField('name', 'A');
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Họ và tên phải có ít nhất 2 ký tự", "name");
    });

    // --- Email Field Tests ---
    it('❌ TC-DK-004: Đăng ký thất bại khi để trống trường "Email"', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', '');
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Vui lòng nhập email", "email");
    });

    it('❌ TC-DK-005: Đăng ký thất bại khi "Email" không đúng định dạng (ví dụ: test@domain)', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', 'test@invalid'); // Invalid TLD
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Email không hợp lệ hoặc không thuộc miền @gmail.com/@edu.vn", "email");
    });
    
    it('❌ TC-DK-006: Đăng ký thất bại khi "Email" không thuộc miền @gmail.com hoặc @edu.vn', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', 'test@yahoo.com');
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Email không hợp lệ hoặc không thuộc miền @gmail.com/@edu.vn", "email");
    });

    // --- Phone Field Tests ---
    it('❌ TC-DK-007: Đăng ký thất bại khi để trống trường "Số điện thoại"', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', '');
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Vui lòng nhập số điện thoại", "phone");
    });

    it('❌ TC-DK-008: Đăng ký thất bại khi "Số điện thoại" không bắt đầu bằng số 0', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', '1234567890');
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số", "phone");
    });

    it('❌ TC-DK-009: Đăng ký thất bại khi "Số điện thoại" không đủ 10 chữ số', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', '012345');
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số", "phone");
    });

    it('❌ TC-DK-010: Đăng ký thất bại khi "Số điện thoại" có ký tự không phải số', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', '012345678a');
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số", "phone");
    });

    // --- Password Field Tests ---
    it('❌ TC-DK-011: Đăng ký thất bại khi để trống trường "Mật khẩu"', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', '');
        await fillFormField('confirmPassword', validTestData.confirmPassword);

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Vui lòng nhập mật khẩu", "password");
    });

    it('❌ TC-DK-012: Đăng ký thất bại khi "Mật khẩu" ít hơn 8 ký tự', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', 'Pass123'); // 7 chars
        await fillFormField('confirmPassword', 'Pass123');

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Mật khẩu phải có ít nhất 8 ký tự", "password");
    });

    // --- Confirm Password Field Tests ---
    it('❌ TC-DK-013: Đăng ký thất bại khi để trống trường "Xác nhận mật khẩu"', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', '');

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Vui lòng xác nhận mật khẩu", "confirmPassword");
    });

    it('❌ TC-DK-014: Đăng ký thất bại khi "Xác nhận mật khẩu" không khớp với "Mật khẩu"', async function () {
        await fillFormField('name', validTestData.name);
        await fillFormField('email', validTestData.email);
        await fillFormField('phone', validTestData.phone);
        await fillFormField('password', validTestData.password);
        await fillFormField('confirmPassword', 'DifferentPassword123');

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();
        await assertErrorState("Mật khẩu và xác nhận mật khẩu phải giống nhau", "confirmPassword");
    });
    
    // --- All Fields Empty ---
    it('❌ TC-DK-015: Đăng ký thất bại khi tất cả các trường đều để trống', async function () {
        // Clear all fields (sendKeys '' or ensure fillFormField handles empty strings to clear)
        await fillFormField('name', '');
        await fillFormField('email', '');
        await fillFormField('phone', '');
        await fillFormField('password', '');
        await fillFormField('confirmPassword', '');

        const submitButton = await driver.findElement(By.xpath(SUBMIT_REGISTER_BUTTON_XPATH));
        await submitButton.click();

        // Check for at least one error message (e.g., for the first field)
        // More robustly, check that all required fields show an error.
        // For simplicity here, checking for the name error and modal presence.
        await assertErrorState("Vui lòng nhập họ và tên", "name");
        // You could add more assertions here for other fields' error messages if needed
        const emailError = await driver.wait(until.elementLocated(By.xpath(`//p[text()="Vui lòng nhập email"]`)), 7000);
        assert(await emailError.isDisplayed(), `Email error message not displayed when all fields empty`);
         const phoneError = await driver.wait(until.elementLocated(By.xpath(`//p[text()="Vui lòng nhập số điện thoại"]`)), 7000);
        assert(await phoneError.isDisplayed(), `Phone error message not displayed when all fields empty`);
         const passwordError = await driver.wait(until.elementLocated(By.xpath(`//p[text()="Vui lòng nhập mật khẩu"]`)), 7000);
        assert(await passwordError.isDisplayed(), `Password error message not displayed when all fields empty`);
         const confirmPasswordError = await driver.wait(until.elementLocated(By.xpath(`//p[text()="Vui lòng xác nhận mật khẩu"]`)), 7000);
        assert(await confirmPasswordError.isDisplayed(), `Confirm password error message not displayed when all fields empty`);
    });
});
