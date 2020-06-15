import { notification } from 'antd';
import router from 'umi/router';

// 请求超时时间设置
export const timeout = 6000;

// http层 错误编码对应提示
export const codeMessage: any = {
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

interface ResponseType extends Response {
  msg?: string;
}

// 根据不同的ui框架使用不同的提示样式（这里使用antd）
export const errorTips = (response: ResponseType) => {
  notification.error({
    top: 100,
    // duration: 2,
    key: 'error',
    message: `请求错误 ${response.status}`,
    description: response.msg || codeMessage[response.status] || response.statusText,
  });
};

// 得到token
const token = sessionStorage.getItem('token')
  ? sessionStorage.getItem('token')
  : localStorage.getItem('token')
  ? localStorage.getItem('token')
  : undefined;

// 请求前对请求头处理
export const requestHeader: any = {
  token: token,
  Accept: 'application/json',
};

// 封装层自定义对应请求状态码（返回值的封装处理）
export const customCodeMessage = (
  resolve: (value?: unknown) => void,
  reject: (value?: unknown) => void,
  res: any,
) => {
  switch (res.status.code) {
    case '000000':
      resolve(res);
      break;
    case '100001':
      resolve(res);
      // 这里对登录失效的处理
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login');
      break;
    default:
      const error = {
        status: res.status.code,
        msg: res.status.msg,
      };
      reject(error);
      break;
  }
};
