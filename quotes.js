const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function main() {
  const baseUrl = "http://quotes.toscrape.com";

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

    $(".quote").each((index, elem) => {
      try {
        results.push({
          text: $(elem).find(".text").text().replace("“", "").replace("”", ""),
          author: {
            name: $(elem).find(".author").text(),
            url: baseUrl + $(elem).find(".author + a").attr("href"),
          },
          tags: $(elem)
            .find(".tags .tag")
            .map((_, e) => {
              return { name: $(e).text(), url: baseUrl + $(e).attr("href") };
            })
            .get(),
        });
      } catch {
        results.push({
          text: "error",
          author: {
            name: "error",
            url: "error",
          },
          tags: "error",
        });
      }
    });
  }

  for (let i = 1; i <= 3; i++) {
    await goAndParse(`${baseUrl}/page/${i}`);
  }

  await browser.close();

  return results;
}

main().then((results) => console.log(results[0]));
