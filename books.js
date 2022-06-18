const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function main() {
  const baseUrl = "http://books.toscrape.com";

  let results = [];

  const browser = await puppeteer.launch({
    // headless: false,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  async function goAndParse(url) {
    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    const content = await page.content();
    const $ = cheerio.load(content);

    $("section ol li article.product_pod").each((index, elem) => {
      if ($(elem).find(".instock.availability").text().includes("In stock")) {
        try {
          results.push({
            title: $(elem).find("h3 a").attr("title"),
            url: `${baseUrl}/catalogue/${$(elem).find("h3 a").attr("href")}`,
            img: `${baseUrl}/${$(elem)
              .find(".image_container img")
              .attr("src")
              .slice(3)}`,
            price: $(elem).find(".product_price .price_color").text(),
          });
        } catch {
          results.push({
            url: "error",
            img: "error",
            price: "error",
          });
        }
      }
    });
  }

  for (let i = 1; i <= 3; i++) {
    await goAndParse(`${baseUrl}/catalogue/page-${i}.html`);
  }

  await browser.close();

  return results;
}

main().then((results) => console.log(results));
