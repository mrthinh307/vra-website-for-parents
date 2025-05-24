import { Builder, By, until, Key } from 'selenium-webdriver';
import 'chromedriver';
import assert from 'assert';

describe('Lesson Evaluation Functionality', function () {
    this.timeout(60000);
    let driver;
    const BASE_URL = "http://localhost:3000/";

    // Login form selectors
    const LOGIN_EMAIL_INPUT_XPATH = "//div[@id='login-form']//input[@placeholder='Email*']";
    const LOGIN_PASSWORD_INPUT_XPATH = "//div[@id='login-form']//input[@placeholder='Mật khẩu*']";
    const LOGIN_SUBMIT_BUTTON_XPATH = "//div[@id='login-form']//button[.//span[text()='Đăng nhập']]";
    const USER_INFO_HEADER_XPATH = "//div[contains(@class, 'header')]//div[contains(@class, 'bg-primary-color/10')]";

    // Lesson list selectors
    const LESSON_LIST_BUTTON_XPATH = '//*[@id="root"]/div/div/div/div[1]/div/a[2]';
    const FIRST_LESSON_ROW_XPATH = '//*[@id="root"]/div/main/div/div/main/div/div[2]/table/tbody/tr[1]';
    const LESSON_LIST_TABLE_XPATH = '//*[@id="root"]/div/main/div/div/main/div/div[2]/table';

    // Task list and evaluation selectors
    const ADD_AI_FEEDBACK_BUTTON_XPATH = "//span[contains(.,'THÊM NHẬN XÉT TỪ VRA AI')]";
    const FEEDBACK_HEADER_XPATH = "//th//div[contains(@class, 'bg-blue-100')]//span[text()='Nhận xét']";
    const REQUEST_EVALUATION_BUTTON_XPATH = '//*[@id="root"]/div/main/div/div/main/div[3]/div[2]/div/div[2]/div/div[1]/div/button';
    const EVALUATION_SECTION_XPATH = "//p[contains(text(),'Đánh giá tổng thể buổi học')]";
    const CHAT_WITH_AI_XPATH = '//*[@id="chat-messages"]';

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize(); // Maximize browser window
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async function () {
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.xpath("//body")), 7000);
    });

    async function waitAndClick(xpath, timeout = 7000, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                // Wait for element to be present and visible
                const element = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
                await driver.wait(until.elementIsVisible(element), timeout);

                // Scroll element into view
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
                await driver.sleep(500); // Wait for scroll to complete

                // Try different click methods
                try {
                    await driver.actions().click(element).perform();
                } catch (e) {
                    try {
                        await element.click();
                    } catch (e2) {
                        await driver.executeScript("arguments[0].click();", element);
                    }
                }

                return element;
            } catch (error) {
                if (i === retries - 1) throw error;
                await driver.sleep(1000); // Wait before retry
            }
        }
    }

    async function scrollChatToBottom() {
        const chatContainer = await driver.findElement(By.xpath(CHAT_WITH_AI_XPATH));
        await driver.executeScript("arguments[0].scrollTop = arguments[0].scrollHeight", chatContainer);
        await driver.sleep(500);
    }

    it('✅ TC-DG-001: Đánh giá buổi học thành công', async function () {
        // 1. Login
        await driver.wait(until.elementLocated(By.xpath(LOGIN_EMAIL_INPUT_XPATH)), 7000);
        await driver.findElement(By.xpath(LOGIN_EMAIL_INPUT_XPATH)).sendKeys('metvcl@gmail.com');
        await driver.findElement(By.xpath(LOGIN_PASSWORD_INPUT_XPATH)).sendKeys('thinhksbk55');
        await driver.findElement(By.xpath(LOGIN_SUBMIT_BUTTON_XPATH)).click();

        // Verify login success
        const userInfoHeaderEl = await driver.wait(until.elementLocated(By.xpath(USER_INFO_HEADER_XPATH)), 7000);
        assert.strictEqual(await userInfoHeaderEl.isDisplayed(), true, '❌ Đăng nhập không thành công.');

        // 2. Navigate to lesson list
        await driver.sleep(2000); // Wait for page to stabilize after login
        await waitAndClick(LESSON_LIST_BUTTON_XPATH);

        // 3. Wait for lesson list page to load completely
        await driver.wait(until.urlContains('lesson-list'), 7000);
        await driver.wait(until.elementLocated(By.xpath(LESSON_LIST_TABLE_XPATH)), 7000);

        // Wait for table to be fully loaded
        await driver.sleep(2000);

        // Find and verify first lesson row exists
        const firstLessonRow = await driver.wait(until.elementLocated(By.xpath(FIRST_LESSON_ROW_XPATH)), 7000);
        await driver.wait(until.elementIsVisible(firstLessonRow), 7000);
        assert.strictEqual(await firstLessonRow.isDisplayed(), true, '❌ Không tìm thấy bài học nào trong danh sách.');

        // Click on first lesson using the new waitAndClick function
        await waitAndClick(FIRST_LESSON_ROW_XPATH);
        await driver.sleep(2000); // Wait for navigation to complete

        // 4. Add AI feedback if not already present
        const addFeedbackButton = await driver.wait(until.elementLocated(By.xpath(ADD_AI_FEEDBACK_BUTTON_XPATH)), 7000);
        if (await addFeedbackButton.isDisplayed()) {
            await waitAndClick(ADD_AI_FEEDBACK_BUTTON_XPATH);
        }

        // 5. Scroll to bottom of the page
        const detail = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/main/div/div/main/div[1]/div[2]/table/tbody/tr[1]/td[5]/div/button')), 40000);
        if (await detail.isDisplayed()) {
            const evaluationSection = await driver.wait(until.elementLocated(By.xpath(EVALUATION_SECTION_XPATH)), 7000);
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", evaluationSection);
            await driver.sleep(2000);
        }

        // Wait for the evaluation section and scroll to it with offset

        // Try clicking the evaluation button
        await waitAndClick(REQUEST_EVALUATION_BUTTON_XPATH, 7000);

        // Wait for evaluation to complete (score element appears)
        const communicateWithAI = await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div/main/div/div/main/div[3]/div[2]/div/div[2]/div/button')), 15000);
        assert.strictEqual(await communicateWithAI.isDisplayed(), true, '❌ Không hiển thị điểm số sau khi đánh giá.');
        await driver.sleep(2000);
        
        // Use JavaScript click instead of waitAndClick
        await driver.executeScript("arguments[0].click();", communicateWithAI);
        await driver.sleep(1000);
        
        // Fix: Ensure the input value is a proper string
        const chatInput = await driver.findElement(By.xpath('//*[@id="root"]/div/main/div/div[2]/div/div[4]/div[1]/input'));
        await chatInput.sendKeys('Bé có bị đao không?');
        
        const sendButton = await driver.findElement(By.xpath('//*[@id="root"]/div/main/div/div[2]/div/div[4]/div[1]/button'));
        await sendButton.click();
        await scrollChatToBottom();

        await driver.sleep(5000);
        const messages = await driver.findElement(By.xpath('//*[@id="chat-messages"]/div[4]/div/p'));
        assert.strictEqual(await messages.isDisplayed(), true, '❌ Không hiển thị tin nhắn từ AI.');
        await driver.findElement(By.xpath('//*[@id="root"]/div/main/div/div[2]/div/div[1]/button')).click();
    });
});


