import useSWR, {mutate} from 'swr';
import {getSlideInfo, searchSlide} from '@/request/actions/slide';
import {useLocation} from "react-router-dom";

const fetchSlideList = async (organ) => {
    const result = await searchSlide(
        undefined, undefined, undefined,
        undefined, undefined, undefined,
        undefined, organ
    )
    return result.err ? [] : result.data?.content || []
}

const fetchSlideInfo = async (pathoId) => {
    try {
        const result = await getSlideInfo(pathoId)
        return result.err ? null : result.data
    } catch (error) {
        console.error('获取详情失败:', error)
        return null
    }
}

const fetchCombinedData = async (organ) => {
    // 获取基础列表
    const slides = await fetchSlideList(organ)
    if (!slides.length) return []

    const infoPromises = slides.map(slide =>
        Promise.race([
            fetchSlideInfo(slide.pathoId),
            new Promise(resolve =>
                setTimeout(() => resolve(null), 5000)
            )
        ])
    )

    const details = await Promise.all(infoPromises)

    // 合并数据
    return slides.map((slide, index) => ({
        ...slide,
        ...(details[index] || {})
    }))
}


export const useCombinedSlides = (organ) => {
    const { data, error, isValidating } = useSWR(
        ['combinedSlides', organ],
        () => fetchCombinedData(organ),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    )

    return {
        slides: data || [],
        loading: !error && !data,
        error
    }
}

// 独立详情Hook
export const useSlideInfo = (pathoId) => {
    const { data, error } = useSWR(
        pathoId ? ['slideInfo', pathoId] : null,
        () => fetchSlideInfo(pathoId),
        {
            revalidateIfStale: true,
            shouldRetryOnError: false
        }
    )

    return {
        detail: data || null,
        loading: !error && !data,
        error
    }
}