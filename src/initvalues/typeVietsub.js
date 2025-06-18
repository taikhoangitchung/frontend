export const typeVietSub = (type)=> {
    switch (type) {
        case 'single':
            return '1 đáp án đúng'
        case 'multiple':
            return 'Nhiều đáp án đúng'
        case 'boolean':
            return 'Đúng hoặc sai'
    }
}