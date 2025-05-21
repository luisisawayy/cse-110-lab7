describe('Basic user flow for Website', () => {
  beforeAll(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
  });

  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });
    expect(numProducts).toBe(20);
  });

  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');
    let allArePopulated = true;

    const prodItemsData = await page.$$eval('product-item', (prodItems) => {
      return prodItems.map((item) => item.data);
    });

    for (let i = 0; i < prodItemsData.length; i++) {
      const item = prodItemsData[i];
      console.log(`Checking product item ${i + 1}/${prodItemsData.length}`);
      if (!item.title || item.title.length === 0) allArePopulated = false;
      if (!item.price || item.price.length === 0) allArePopulated = false;
      if (!item.image || item.image.length === 0) allArePopulated = false;
    }

    expect(allArePopulated).toBe(true);
  }, 1000000);

  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');
    const prodItem = await page.$('product-item');
    const shadowRoot = await prodItem.getProperty('shadowRoot');
    const button = await shadowRoot.$('button');

    await button.click();
    const innerText = await button.getProperty('innerText');
    const textValue = await innerText.jsonValue();

    expect(textValue).toBe('Remove from Cart');

    // Clean up: reset to Add to Cart
    await button.click();
  }, 2500);

  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen...');
    const prodItems = await page.$$('product-item');

    for (const item of prodItems) {
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const innerText = await button.getProperty('innerText');
      const value = await innerText.jsonValue();
      if (value === 'Add to Cart') {
        await button.click();
      }
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);
    expect(cartCount).toBe('20');
  }, 1000000);

  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    await page.reload();
    const prodItems = await page.$$('product-item');
    let allRemoved = true;

    for (const item of prodItems) {
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const innerText = await button.getProperty('innerText');
      const value = await innerText.jsonValue();
      if (value !== 'Remove from Cart') allRemoved = false;
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);
    expect(allRemoved).toBe(true);
    expect(cartCount).toBe('20');
  }, 1000000);

  it('Checking the localStorage to make sure cart is correct', async () => {
    const cart = await page.evaluate(() => {
      return localStorage.getItem('cart');
    });
    expect(cart).toBe('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]');
  });

  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');
    const prodItems = await page.$$('product-item');

    for (const item of prodItems) {
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const innerText = await button.getProperty('innerText');
      const value = await innerText.jsonValue();
      if (value === 'Remove from Cart') {
        await button.click();
      }
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);
    expect(cartCount).toBe('0');
  }, 1000000);

  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
    await page.reload();
    const prodItems = await page.$$('product-item');
    let allReset = true;

    for (const item of prodItems) {
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const innerText = await button.getProperty('innerText');
      const value = await innerText.jsonValue();
      if (value !== 'Add to Cart') allReset = false;
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);
    expect(allReset).toBe(true);
    expect(cartCount).toBe('0');
  }, 1000000);

  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');
    const cart = await page.evaluate(() => {
      return localStorage.getItem('cart');
    });
    expect(cart).toBe('[]');
  });
});
