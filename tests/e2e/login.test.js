import { Builder, By, until } from 'selenium-webdriver';
import 'chromedriver';
import assert from 'assert';

describe('Register Functionality', function () {
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.quit();
    });

    // TC-001: Đăng nhập thành công với thông tin hợp lệ
    it('✅ Đăng nhập thành công với thông tin hợp lệ', async function () {
        try {            
            await driver.get("http://localhost:3000/");
            await driver.findElement(By.xpath('/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div/div/div/div[1]/div[1]/input')).sendKeys('0000000001@gmail.com');
            await driver.findElement(By.xpath('/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div/div/div/div[1]/div[2]/div[1]/input')).sendKeys('Password123');
            await driver.findElement(By.xpath("/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div/div/div/div[1]/button")).click();
            
            const [userInfoHeaderEl, userInfoBoxEl] = await Promise.all([
                driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/div/div/div[2]/div')), 3000),
                driver.findElements(By.xpath('/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div')) 
            ]);
            
            assert.strictEqual(await userInfoHeaderEl.isDisplayed(), true, '❌ Thông tin user chưa được hiển thị');
            assert.strictEqual(userInfoBoxEl.length, 1, '❌ Box login vẫn còn hiển thị');
        } catch (error) {
            throw error;
        }
    });

    // TC-002: Đăng nhập thất bại với thông tin không hợp lệ
    it('❌ Đăng nhập thất bại với thông tin không hợp lệ', async function () {
        try {            
            await driver.get("http://localhost:3000/");
            await driver.findElement(By.xpath('/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div/div/div/div[1]/div[1]/input')).sendKeys('tesfsdi1@gmail.com');
            await driver.findElement(By.xpath('/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div/div/div/div[1]/div[2]/div[1]/input')).sendKeys('123456');
            await driver.findElement(By.xpath("/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div/div/div/div[1]/button")).click();

            await driver.wait(until.alertIsPresent(), 5000);

            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            assert.strictEqual(alertText, "Invalid login credentials");

            await alert.accept();

            const loginForm = await driver.findElements(By.xpath('/html/body/div[1]/div/main/div/div/section[1]/div/div/div[2]/div'));
            assert.strictEqual(loginForm.length, 1, '❌ Trang đăng nhập bị xóa');
        } catch (error) {
            throw error;
        }
    });
});
