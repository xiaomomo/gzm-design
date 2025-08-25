import axios from 'axios';

/**
 * 获取认证token
 * 尝试从多种可能的存储位置获取token
 */
const getAuthToken = (): string | null => {
    // 尝试从localStorage的各种可能的key获取token
    const possibleKeys = [
        'access_token',
        'token', 
        'authToken',
        'auth_token',
        'accessToken',
        'jwt',
        'jwtToken',
        'bearer_token',
        'Authorization'
    ];
    
    // 先从localStorage尝试
    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) {
            console.log(`找到token，存储key: ${key}`);
            return token;
        }
    }
    
    // 再从sessionStorage尝试
    for (const key of possibleKeys) {
        const token = sessionStorage.getItem(key);
        if (token) {
            console.log(`找到token，存储key: ${key} (sessionStorage)`);
            return token;
        }
    }
    
    // 打印当前localStorage中的所有key，方便调试
    console.log('localStorage中的所有key:', Object.keys(localStorage));
    console.log('sessionStorage中的所有key:', Object.keys(sessionStorage));
    
    return null;
};

/**
 * AI图像分割接口
 * @param file 图片文件
 */
export async function segmentImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 获取认证token
    const token = getAuthToken();
    if (!token) {
        throw new Error('未找到认证token，请先登录');
    }
    
    const response = await axios.post('/api/cos/segment', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return { data: response.data };
}
