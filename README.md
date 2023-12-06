# doubanTop250_puppeteer

使用 puppeteer 爬虫爬取豆瓣 top250 榜单电影资料

### 免责声明

数据仅供学习交流。代码遵循GPL许可，见LICENSE

### 运行方法

##### 安装依赖

```bash
pnpm install
```

##### 运行

```bash
pnpm run test
```

### 爬好的数据已经在 movies.json 中

格式：

```json
[
	{
		"movie_id": 1,
		"img": "base64",
		"title": "肖申克的救赎 The Shawshank Redemption",
		"director": "弗兰克·德拉邦特",
		"writer": "弗兰克·德拉邦特/斯蒂芬·金",
		"actor": "蒂姆·罗宾斯/摩根·弗里曼/鲍勃·冈顿/威廉姆·赛德勒/克兰西·布朗/吉尔·贝罗斯/马克·罗斯顿/詹姆斯·惠特摩/杰弗里·德曼/拉里·布兰登伯格/尼尔·吉恩托利/布赖恩·利比/大卫·普罗瓦尔/约瑟夫·劳格诺/祖德·塞克利拉/保罗·麦克兰尼/芮妮·布莱恩/阿方索·弗里曼/V·J·福斯特/弗兰克·梅德拉诺/马克·迈尔斯/尼尔·萨默斯/耐德·巴拉米/布赖恩·戴拉特/唐·麦克马纳斯",
		"type": "剧情/犯罪",
		"country": "美国",
		"language": "英语",
		"release_year": "1994-09-10(多伦多电影节)/1994-10-14(美国)",
		"time": "142分钟",
		"bename": "月黑高飞(港)/刺激1995(台)/地狱诺言/铁窗岁月/消香克的救赎",
		"imdb": "tt0111161",
		"rating": "9.7",
		"rating_number": "2952944"
	},
	{
		"movie_id": 2,
		"img": "base64",
		"title": "霸王别姬",
		"director": "陈凯歌",
		"writer": "芦苇/李碧华",
		"actor": "张国荣/张丰毅/巩俐/葛优/英达/蒋雯丽/吴大维/吕齐/雷汉/尹治/马明威/费振翔/智一桐/李春/赵海龙/李丹/童弟/沈慧芬/黄斐/徐杰",
		"type": "剧情/爱情/同性",
		"country": "中国大陆/中国香港",
		"language": "汉语普通话",
		"release_year": "1993-07-26(中国大陆)/1993-01-01(中国香港)",
		"time": "171分钟/155分钟(美国剧场版)",
		"bename": "再见，我的妾/Farewell My Concubine/Adieu Ma Concubine",
		"imdb": "tt0106332",
		"rating": "9.6",
		"rating_number": "2181518"
	}
]
```
