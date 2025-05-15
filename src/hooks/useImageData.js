import useSWR, {mutate} from 'swr';
import { searchImage } from '@/request/actions/image';


const fetchImageData = async () => {
    const result = await searchImage(1, 3, null, null, null, null, null);
    return result.data?.content || [];
};

export const useImageData = () => {
    const { data: imageDataCache, error, isValidating } = useSWR(
        'imageData',
        fetchImageData,
        {
            suspense: false,
            // revalidateOnFocus: true,
            revalidateIfStale: true,
            // revalidateOnReconnect: true,
        }
    );

    const mutateImageData = (newImageData) => {
        if (newImageData) {
            mutate('imageData', newImageData, false);
        } else {
            mutate('imageData');
        }
    };

    return { imageDataCache: imageDataCache || [], loading: !error && !imageDataCache, error };
};
