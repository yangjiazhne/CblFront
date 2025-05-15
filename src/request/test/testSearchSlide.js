import { searchSlide } from 'src/request/actions/slide';

const testSearchSlide = async () => {
    try {
        const imageGroupId = 1; // 测试用的参数
        const imageTypeId = 3; // 测试用的参数
        const response = await searchSlide(imageGroupId, imageTypeId);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error during searchSlide request:', error.message);
    }
};

// 调用测试函数
testSearchSlide();
