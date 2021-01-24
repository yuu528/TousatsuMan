# TousatsuMan
TwitterのTweetを定期的に検索し、Discordに送るBot

## インストール
次のようなsettings.jsonをindex.jsと同じディレクトリに入れる。
```json
{
"query": "検索文字列",
"webhookUrl": "DiscordのWebhook URL",
"consumerKey": "TwitterAPIのConsumer Key",
"consumerKeySecret": "TwitterAPIのsecret",
"bearerToken": "TwitterAPIのbearer"
}
```
