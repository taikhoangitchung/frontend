export const typeVietSub = (type)=> {
    switch (type) {
        case 'single':
            return 'Một đáp án đúng'
        case 'multiple':
            return 'Nhiều đáp án đúng'
        case 'boolean':
            return 'Đúng hoặc sai'
    }
}