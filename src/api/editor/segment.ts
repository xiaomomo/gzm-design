/**
 * AI图像分割接口
 * @param file 图片文件
 */
export async function segmentImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:8080/api/cos/segment', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0b2tlblZlcnNpb24iOjQsInR5cGUiOiJhY2Nlc3MiLCJ1c2VySWQiOjI1MiwidXNlcm5hbWUiOiJtYXgiLCJzdWIiOiJtYXgiLCJpYXQiOjE3NTYxMTkxODAsImV4cCI6MTc1NjU1MTE4MH0.7phn0300yf3UF6vUGrcQuYXoCbCY8HwMQNC9is2NRgU'
        },
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data };
}
