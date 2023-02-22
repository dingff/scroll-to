import { IApi } from 'umi';
import open from 'open';

export default (api: IApi) => {
  if (process.env.NODE_ENV === 'production') {
    api.modifyConfig((memo)=>{
      memo.publicPath = './'
      return memo;
    });
  }
};