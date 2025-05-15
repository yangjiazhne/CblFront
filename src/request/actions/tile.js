import superagent from 'superagent'
import { BASE_URL } from '@/constants'
import { getToken } from '@/helpers/dthelper'
import { handleError, handleUnauthorized } from '@/helpers/Utils'



//查询数据集
export const searchTile = (slideId,page,pageSize,category,status) => {
    const token = getToken()
    return new Promise((resolve, reject) => {
        superagent
            .get(BASE_URL + '/tile/search')
            .query({slideId,page,pageSize,category,status})
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err){
                    if (res?.status === 401) {
                        handleUnauthorized()
                        return
                    }
                    handleError(res?.body?.code);
                    resolve({
                        err: true,
                        data: res.body.msg,
                    })
                }
                else{
                    resolve({
                        err: false,
                        data: res.body.data,
                    })
                }

            })
    })
}

export const updateTile = data => {
    const token = getToken()

    return new Promise((resolve, reject) => {
        superagent
            .post(BASE_URL + '/tile/update')
            .send(data)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err){
                    if (res?.status === 401) {
                        handleUnauthorized()
                        return
                    }
                    handleError(res?.body?.code);
                    resolve({
                        err: true,
                        data: res.body.msg,
                    })
                }
                else
                    resolve({
                        err: false,
                        data: res.body,
                    })
            })
    })
}
