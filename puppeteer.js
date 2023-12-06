const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
	});
	const page = await browser.newPage();
	await page.goto('https://movie.douban.com/top250', { waitUntil: 'networkidle0' });

	// 数据的格式
	// {
	//     movie_id: 0,
	//     img: '',
	//     title: '',
	//     director: '',
	//     writer: '',
	//     actor: '',
	//     type: '',
	//     country: '',
	//     language: '',
	//     release_year: '',
	//     time: '',
	//     bename: '',
	//     imdb: '',
	//     rating: '',
	//     rating_number: '',
	// },
	let movieArr = [];

	for (let j = 0; j < 10; j++) {
		// 逐个进入详情页爬取详情信息
		for (let k = 1; k <= 25; k++) {
			try {
				await page.waitForSelector(`#content > div > div.article > ol > li:nth-child(${k}) > div > div.pic > a > img`, { visible: true });
				await page.click(`#content > div > div.article > ol > li:nth-child(${k}) > div > div.pic > a > img`);
				await page.waitForSelector('#mainpic > a > img', { visible: true });
				// 如果有更多演员按钮项，就点击
				const moreActorButton = await page.$('.more-actor');
				if (moreActorButton) await moreActorButton.click();

				const message = await page.evaluate(
					async (j, k) => {
						function extractionStringFromSeriesDOMs(selector) {
							const elements = Array.from(document.querySelectorAll(selector));
							return elements.map((elem) => elem.textContent.trim()).join('/');
						}
						function extractionStringAfterText(text) {
							const spanElements = Array.from(document.querySelectorAll('#info > span'));
							const targetSpan = spanElements.find((span) => span.textContent.includes(text));
							if (!targetSpan) {
								console.error(`未找到包含文本 '${text}' 的元素`);
								return '';
							}
							if (!targetSpan.nextSibling) {
								console.error(`找到的元素没有 nextSibling: '${text}'`);
								return '';
							}
							return targetSpan.nextSibling.textContent
								.trim()
								.split('/')
								.map((s) => s.trim())
								.join('/');
						}

						let movie = {};
						movie.movie_id = j * 25 + k;
						movie.img = document.querySelector('#mainpic > a > img').src;
						movie.title = document.querySelector('#content > h1 > span:nth-child(1)').textContent;
						movie.director = extractionStringFromSeriesDOMs('#info > span:nth-child(1) > span.attrs a');
						movie.writer = extractionStringFromSeriesDOMs('#info > span:nth-child(3) > span.attrs a');
						movie.actor = extractionStringFromSeriesDOMs('#info > span.actor > span.attrs a');
						movie.type = extractionStringFromSeriesDOMs('span[property="v:genre"]');
						movie.country = extractionStringAfterText('制片国家/地区:');
						movie.language = extractionStringAfterText('语言:');
						movie.release_year = extractionStringFromSeriesDOMs('span[property="v:initialReleaseDate"]');

						// 查找具有 property="v:runtime" 的 <span> 元素
						const runtimeSpan = document.querySelector('span[property="v:runtime"]');
						let runtimes = [];
						if (runtimeSpan) {
							// 获取第一个片长
							runtimes.push(runtimeSpan.textContent.trim());

							// 获取第二个片长（如果存在），它可能是紧跟在后面的文本节点
							const nextSibling = runtimeSpan.nextSibling;
							if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
								const secondRuntimeText = nextSibling.textContent.trim();
								const secondRuntime = secondRuntimeText.replace(/^\/\s*/, '');
								if (secondRuntime) runtimes.push(secondRuntime);
							}
						}
						movie.time = runtimes.join('/');

						movie.bename = extractionStringAfterText('又名:');
						movie.imdb = extractionStringAfterText('IMDb:');
						movie.rating = document.querySelector('#interest_sectl > div.rating_wrap.clearbox > div.rating_self.clearfix > strong').textContent;
						movie.rating_number = document.querySelector('#interest_sectl > div.rating_wrap.clearbox > div.rating_self.clearfix > div > div.rating_sum > a > span').textContent;

						return movie;
					},
					j,
					k
				);
				console.log(`第${j + 1}页第${k}部电影信息爬取完成`);
				movieArr.push(message);
				await page.goBack();
			} catch (error) {
				console.error(`爬取的第 ${k} 个元素出错:`, error);
			}
		}
		if (j !== 9) {
			await page.waitForSelector('#content > div > div.article > div.paginator > span.next > a', { visible: true });
			await page.click('#content > div > div.article > div.paginator > span.next > a');
		}
	}
	await browser.close();

	for (let i = 0; i < movieArr.length; i++) {
		movieArr[i].img = await tobase64(movieArr[i].img, i);
	}

	// 将数据转换为 JSON 格式的字符串
	const jsonContent = JSON.stringify(movieArr, null, 4);

	// 将 JSON 写入文件
	fs.writeFile('movies.json', jsonContent, 'utf8', (err) => {
		if (err) {
			console.log('把数据写入文件的时候出错');
			return console.log(err);
		}

		console.log('JSON 文件写入完成');
	});
})();

async function tobase64(imageUrl, i) {
	return new Promise((resolve, reject) => {
		const options = {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
			},
		};

		https
			.get(imageUrl, options, (res) => {
				// 处理重定向
				if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
					return resolve(tobase64(res.headers.location));
				}

				const dataChunks = [];
				res.on('data', (chunk) => {
					dataChunks.push(chunk);
				}).on('end', () => {
					const buffer = Buffer.concat(dataChunks);
					const base64Image = buffer.toString('base64');
					const imgSrc = `data:${res.headers['content-type']};base64,${base64Image}`;

					console.log(`第${i + 1}张图片转换为base64完成`);
					resolve(imgSrc);
				});
			})
			.on('error', (err) => {
				reject(err);
			});
	});
}
