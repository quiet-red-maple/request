fetch 请求封装配合 antd 提示
添加了请求超时并断开连接
```js
const codeMessage: any = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

// 新请求处理
import { notification } from 'antd';
import router from 'umi/router';

const openNotification = (response: any) => {
  // 错误提示
  notification.error({
    top: 100,
    // duration: 2,
    key: 'error',
    message: `请求错误 ${response.status}`,
    description: response.msg,
  });
};

const checkStatus = (response: any, reject: any) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  let errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    top: 100,
    key: 'error',
    message: `请求错误 ${response.status}`,
    description: errortext,
  });
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
        if (res.status.code === '000000') {
          // 请求成功
          resolve(res);
        } else if (res.status.code === '100001') {
          // 登录失效
          resolve(res);
          // 设置登录失效后删除用户token
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          router.push('/login')
        } else {
          const error = {
            status: res.status.code,
            msg: res.status.msg,
          }
         reject(error);
        }
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
    formdata.append('file', option.body.file);
    formdata.append('applyNo', option.body.applyNo);
    body = formdata
  } else {
    headers = {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }

  // 设置请求添加token
  const token: any = sessionStorage.getItem('token')
    ? sessionStorage.getItem('token')
    : localStorage.getItem('token')
    ? localStorage.getItem('token')
    : null;

  // 设置请求 参数
  const options: RequestInit = {
    method: option.method ? option.method : 'GET',
    body: body,
    headers: {
      token,
      Accept: 'application/json',
      ...headers
    },
  };

  let controller: AbortController = new AbortController();
  let signal: AbortSignal = controller.signal;

  return Promise.race([
    timeoutPromise(6000, controller),
    fetchPromise(url, {
      ...options,
      signal: signal,
    }),
  ])
    .catch(error => {
      // console.log(error);
      openNotification(error)
    });
}
```
