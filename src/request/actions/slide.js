import superagent from 'superagent'
import { BASE_URL } from '@/constants'
import { getToken } from '@/helpers/dthelper'
import { handleError, handleUnauthorized } from '@/helpers/Utils'


export const getSlideInfo = (pathoId) => {
    const token = getToken();
    return new Promise((resolve) => {  // 移除未使用的reject
        superagent
            .get(BASE_URL + '/slide/getInfo')
            .query({ pathoId })
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                // 增强错误处理
                if (err || !res?.body || res.body.code !== 200) {
                    resolve({
                        err: true,
                        data: res?.body?.msg || '获取信息失败'
                    });
                    return;
                }

                resolve({
                    err: false,
                    data: res.body.data
                });
            });
    });
};

//查询数据集
export const searchSlide = (pathoId,predictProgress,status,category,uploadStart,uploadEnd,uploadTime,receiveStart,receiveEnd,receiveTime,reportStart,reportEnd,reportTime,page,pageSize,organ) => {
    const token = getToken()
    return new Promise((resolve, reject) => {
        superagent
            .post(BASE_URL + '/slide/search')
            .query({pathoId,predictProgress,uploadStart,uploadEnd,uploadTime,receiveStart,receiveEnd,receiveTime,reportStart,reportEnd,reportTime,page,pageSize,organ})
            .send({ status, category })
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

//查询数据集
export const initSearchSlide = (searchTime,page,pageSize,organ) => {
    const token = getToken()
    return new Promise((resolve, reject) => {
        superagent
            .get(BASE_URL + '/slide/initSearch')
            .query({searchTime,page,pageSize,organ})
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

// 查询上一张/下一张
export const searchNearSlide = (pathoId,order,organ) => {
    const token = getToken()
    return new Promise((resolve, reject) => {
        superagent
            .get(BASE_URL + '/slide/getNear')
            .query({pathoId,order,organ})
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



// 审核
export const examSlide = (slideId,category,status) => {
    const token = getToken()
    return new Promise((resolve, reject) => {
        superagent
            .post(BASE_URL + '/slide/examine')
            .query({slideId,category,status})
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
                        data: res.body,
                    })
                }
                else{
                    resolve({
                        err: false,
                        data: res.body,
                    })
                }

            })
    })
}


export const updateSlide = data => {
    const token = getToken()

    return new Promise((resolve, reject) => {
        superagent
            .post(BASE_URL + '/slide/update')
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

export const predictSlide = data => {
    const token = getToken()

    return new Promise((resolve, reject) => {
        superagent
            .post(BASE_URL + '/slide/predict')
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


