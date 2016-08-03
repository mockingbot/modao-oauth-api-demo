# Web 应用流程

1. 将用户重定向到墨刀授权页面

	```
	GET https://modao.cc/oauth2/v1/authorize
	参数：
	redirect_uri   -  在授权成功后用户会被重定向到此 uri。注意：这里的 uri 必须与该应用在墨刀开发
	                  者平台所填写的 redirect_uri 一致。
	client_id      -  在墨刀开发者平台上获得的 client_id
	response_type  -  "code"
	state          -  随机字符串，用来防止 CSRF 攻击
	```

2. 墨刀重定向至你的网站d

	当用户成功授权你的网站后，会被重定向至 `redirect_uri`，并带有 `state` 和 `code` 参数，如果 `state` 与上一步的 `state` 不相同，那么这个请求则来自于第三方的网站，请立即终止 `OAuth` 流程，否则将会带来安全隐患。

3. 使用 `code` 交换 `access_token`

	```
	POST https://modao.cc/oauth2/v1/token

	参数：
	redirect_uri   -  在授权成功后用户会被重定向到此 uri。注意：这里的 uri 必须与该应用在墨刀开发
	                  者平台所填写的 redirect_uri 一致。
	client_id      -  在墨刀开发者平台上获得的 client_id
	code           -  上一步中墨刀返回的 code
	client_secret  -  在墨刀开发者平台上获得的 client_secret
	grant_type     -  "authorization_code"
	```

	返回示例：

	```
	{
access_token:"77d5656ff6e8701072b788d8ba98dfaa6ffe8004d6302cafd59ed6929d604022"
	  created_at:1464001132
	  expires_in:7200
	  scope:"user_info"
	  token_type:"bearer"
	}
	```

4. 使用 `access_token` 请求 API

	使用 `access_token` 请求 `API` 时，需要设置如下的 `HTTP hearder`：
	```Authorization: Bearer ACCESS_TOKEN```
	其中，`ACCESS_TOKEN` 是上一步交换回的 `access_token`


# API:

1. 用户基本信息

	### 获得用户基本信息（昵称，头像）
	```GET https://modao.cc/api/v1/user_info```

	返回示例：

	```
	{  
	  "name": "44",
	  "avatar": "https://localhost/images/avatar.png"
	}
	```

2. 用户的应用列表

	```GET https://modao.cc/api/v1/user_projects.json```

	返回示例：

	```
	{  
	  "created_apps":[  
	    {  
	      "name":"123",
	      "logo":null,
	      "splash":null,
	      "embed":"<iframe src='https://localhost:3000/app/zIJh4xWiKn004BQXtFXRul3CJoMisof/embed' width='422' height='839' allowTransparency='true' frameborder='0'",
	      "width":382,
	      "height":799,
	      "url":"https://localhost:3000/app/zIJh4xWiKn004BQXtFXRul3CJoMisof",
	      "device":"iphone",
	      "model":"iphone_5"
	    }
	  ],
	  "collaborated_apps":[],
	  "team_apps":[]
	}
	```

3. 用户所属的团队

	```GET https://modao.cc/api/v1/user_teams.json```

	返回示例：

	```
	{  
	  "created_teams":[  
	    {  
	      "cid":"te9164A9A27A1470194071498",
	      "owner_id":11,
	      "owner_name":"44",
	      "owner_avatar":"/images/avatar.png",
	      "expired":false,
	      "limitation":1,
	      "icon":"music",
	      "color":"RGB(255,255,247)",
	      "name":"测试团队"
	    }
	  ],
	  "joined_teams":[]
	}
		```


Demo App:
https://github.com/mockingbot/modao-oauth-api-demo
