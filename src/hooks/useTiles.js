import useSWR, { mutate } from 'swr';
import { searchTile, updateTile } from '@/request/actions/tile';

export const useTiles = (slideId) => {
    const { data , error, isLoading } = useSWR(
        slideId ? `/tiles/${slideId}` : null,
        () => searchTile(slideId)
    );

    const tiles = data?.data.content || [];

    const updateTiles = async (updateQueue) => {
        try {
            const response = await updateTile(updateQueue);
            if (response.err) {
                throw new Error(response.data || '更新失败');
            }
            mutate(`/tiles/${slideId}`);
        } catch (error) {
            // 回滚缓存
            mutate(`/tiles/${slideId}`);
            throw error;
        }
    };

    return {
        tiles,
        error,
        isLoading,
        updateTiles,
    };
};
