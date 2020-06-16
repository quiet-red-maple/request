
// 新请求处理
import { timeout, codeMessage, errorTips, customCodeMessage, requestHeader } from './config';

const checkStatus = (response: Response, reject: any) => {
  console.log(response)
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  let errortext = codeMessage[response.status] || response.statusText;
  errorTips(response)
  const error = {
    status: response.status,
    msg: errortext,
  }
  reject(error)
  const errors: any = new Error(errortext);
  throw errors;
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

// fetch 请求处理
let fetchPromise = (url: RequestInfo, options: RequestInit) => {
  return new Promise((resolve, reject) => {
    return fetch(url, options)
    .then(response => checkStatus(response, reject))
    .then(response => {
      response.json()
      .then((res: any) => {
        customCodeMessage(resolve, reject, res)
      })
    }).catch(error => reject(error));
  })
};

export default function request(url: RequestInfo, option: RequestInit | any) {

  let body: any = option.body ? JSON.stringify(option.body) : undefined;
  let headers = {};

  if (option.body && option.body.file) {
    // 文件上传接口
    const formdata = new FormData();
    
    for( var key in option.body ){
      formdata.append(key, option.body[key]);
    }
    body = formdata
  } else {
    headers = {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }

  // 设置请求 参数
  const options: RequestInit = {
    method: option.method ? option.method : 'GET',
    body: body,
    headers: {
      ...headers,
      ...requestHeader(),
    },
  };

  let controller: AbortController = new AbortController();
  let signal: AbortSignal = controller.signal;

  return Promise.race([
    timeoutPromise(timeout, controller),
    fetchPromise(url, {
      ...options,
      signal: signal,
    }),
  ])
    .catch(error => {
      // console.log(error);
      errorTips(error)
    });
}
