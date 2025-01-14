document.getElementById('download-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    const url = document.getElementById('url').value;
    const quality = document.getElementById('quality').value;
    
    if (!url) {
        alert('الرجاء إدخال رابط الفيديو');
        return;
    }

    // إظهار حالة التحميل
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';
    this.disabled = true;

    // إنشاء نموذج
    const formData = new FormData();
    formData.append('url', url);
    formData.append('quality', quality);

    // إرسال الطلب
    fetch('/download', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('فشل التحميل');
        }
        // الحصول على اسم الملف من الهيدر
        const filename = response.headers.get('content-disposition')
            ?.split(';')
            ?.find(n => n.includes('filename='))
            ?.replace('filename=', '')
            ?.trim() || 'video.mp4';
            
        return response.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
        // إنشاء رابط التحميل
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = filename;  // استخدام اسم الملف الأصلي
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء التحميل');
    })
    .finally(() => {
        // إخفاء حالة التحميل
        loadingElement.style.display = 'none';
        this.disabled = false;
    });
}); 