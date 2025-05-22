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

    // TC-001: Đăng ký thành công với thông tin hợp lệ
    it('✅ Đăng ký thành công với thông tin hợp lệ', async function () {
        try {            
            await driver.get("http://localhost:3000/");
            await driver.findElement(By.xpath("//*[@id='root']/div/div/div/div[2]/button[2]")).click();
            await driver.findElement(By.name('name')).sendKeys('Thinhh Nguyen');
            await driver.findElement(By.name('email')).sendKeys('0000000010@gmail.com');
            await driver.findElement(By.name('phone')).sendKeys('0000000010');
            await driver.findElement(By.name('password')).sendKeys('Password123');
            await driver.findElement(By.name('confirmPassword')).sendKeys('Password123');
            await driver.findElement(By.xpath("/html/body/div[1]/div/main/div/div/div/div/div[2]/button")).click();

            await driver.wait(until.alertIsPresent(), 5000);

            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            assert.strictEqual(alertText, "Đăng ký thành công!");

            await alert.accept();

            const target = await driver.findElements(By.xpath('/html/body/div[1]/div/main/div/div/div'));
            assert.strictEqual(target.length, 0, '❌ Trang đăng vẫn còn hiển thị');
        } catch (error) {
            throw error;
        }
    });

    // TC-002: Đăng ký thất bại với thông tin không hợp lệ
    it('❌ Đăng ký thất bại với thông tin không hợp lệ', async function () {
        try {            
            await driver.get("http://localhost:3000/");
            await driver.findElement(By.xpath("//*[@id='root']/div/div/div/div[2]/button[2]")).click();
            await driver.findElement(By.name('name')).sendKeys('Thinhh Nguyen');
            await driver.findElement(By.name('email')).sendKeys('test001@gmail.com');
            await driver.findElement(By.name('phone')).sendKeys('0000000003');
            await driver.findElement(By.name('password')).sendKeys('Password123');
            await driver.findElement(By.name('confirmPassword')).sendKeys('Password123');
            await driver.findElement(By.xpath("/html/body/div[1]/div/main/div/div/div/div/div[2]/button")).click();

            await driver.wait(until.alertIsPresent(), 5000);

            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            console.log(alertText);
            assert.strictEqual(alertText, "Đăng ký thất bại!");

            await alert.accept();

            const target = await driver.findElements(By.xpath('/html/body/div[1]/div/main/div/div/div'));
            assert.strictEqual(target.length, 1, '❌ Trang đăng ký bị xóa');
        } catch (error) {
            throw error;
        }
    });
});
