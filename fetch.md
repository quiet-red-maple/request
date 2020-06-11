fetch 请求封装配合 antd 提示
添加了请求超时并断开连接
```js
import { notification } from 'antd';

const openNotification = (response: any) => {
  // 错误提示
  notification.error({
    top: 100,
    duration: 2,
    key: 'error',
    message: `请求错误 ${response.status}`,
    description: response.msg,
  });
};

// 设置请求超时
let timeoutPromise = (timeout: number, controller: AbortController) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let error = {
        status: '500',
        msg: '请求超时 😂'
      }
      reject(error);
      controller.abort();
    }, timeout);
  });
};

export default function request(url: RequestInfo, option: RequestInit) {
  // if (option.body instanceof FormData) {
  // }

  // 设置请求 参数
  const options: RequestInit = {
    method: option.method ? option.method : 'GET',
    body: option.body ? JSON.stringify(option.body) : undefined,
    headers: {
      Accept: 'application/json',
      // 'Content-Type': 'application/json; charset=utf-8',
    },
  };

  let fetchPromise = (url: RequestInfo, options: RequestInit) => {
    return fetch(url, options).then(response => {
      response.json()
      .then((res: any) => {
        console.log(res);
        if (res.status.code === '000000') {
          Promise.resolve(res);
        } else {
          Promise.reject(res.status.msg);
        }
      })
      return response;
    });
  };

  let controller: AbortController = new AbortController();
  let signal: AbortSignal = controller.signal;

  return Promise.race([
    timeoutPromise(2000, controller),
    fetchPromise(url, {
      ...options,
      signal: signal,
    }),
  ])
    .then(resp => {
      console.log(resp);
    })
    .catch(error => {
      console.log(error);
      openNotification(error)
    });
}
```
