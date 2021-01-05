const Twitter = require('twitter');
const request = require('requestretry');
const cron = require('node-cron');
const fs = require('fs');
require('date-utils');

const settings = JSON.parse(fs.readFileSync(__dirname + '/settings.json', 'utf-8'));

const SEARCH_QUERY = settings.query;
const POST_URL = settings.webhookUrl;

const client = new Twitter({
	consumer_key: settings.consumerKey,
	consumer_key_secret: settings.consumerKeySecret,
	bearer_token: settings.bearerToken
});

cron.schedule('0 */5 * * * *', () => {
	fs.readFile('./last_id', 'utf-8', (err, data) => {
		if(err) throw err;
		client.get('search/tweets', {q: SEARCH_QUERY, count: 50, include_entities: true, since_id: data}, async (err, data, res) => {
			if(err) throw err;
			var last_id = 0n;
			for(key in data.statuses) {
				const tweet = data.statuses[key];
				var tweetDate = new Date(tweet.created_at);
				if(last_id < BigInt(tweet.id_str)) {
					last_id = BigInt(tweet.id_str);
				}
				var sendData = {
					'embeds': [
						{
							'description': tweet.text + '\n─────────────────────────\n' + tweetDate.toFormat('YYYY/MM/DD HH24:MI:SS') + '　　　[Open in Twitter](https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + ')',
							'color': 1942002,
							'author': {
								'name': tweet.user.name + '(@' + tweet.user.screen_name + ')',
								'url': 'https://twitter.com/' + tweet.user.screen_name,
								'icon_url': tweet.user.profile_image_url_https,
							},
							'footer': {
								'text': 'Twitter',
								'url': 'https://twitter.com',
								'icon_url': 'https://d3pf42s8nj9ff1.cloudfront.net/assets/images/logos/twitter/twitter-32.png'
							}
						}
					],
					'username': '盗撮マンLv.3',
					'avatar_url': 'https://4.bp.blogspot.com/-u0hwgN2cRPA/WR_KvCHNqXI/AAAAAAABEZU/17tzTQMDDHssX-HELr_2XGy72YnOUqeZgCLcB/s400/ihan_tousatsu_camera.png'
				};
				if('media' in tweet.entities) {
					sendData.embeds[0].image = {
						'url': tweet.entities.media[0].media_url_https
					}
				}
				const opt = {
					url: POST_URL,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					json: sendData,
					maxAttempts: 5,
					retryDelay: 5000
				};
				request(opt, (err, res, body) => {
					if(err) throw err;
				});
			}
			if(last_id >= BigInt(data.search_metadata.max_id_str)) {
				fs.writeFile('last_id', last_id, (err) => {
					if(err) throw err;
				});
			}
		});
	})
});
