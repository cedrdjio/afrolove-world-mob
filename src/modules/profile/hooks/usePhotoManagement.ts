import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { photoService } from '@/modules/profile/services/photoService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PROFILE_QUERY_KEY } from '@/modules/profile/hooks/useProfileQuery';
import type { ProfilePhoto } from '@/modules/profile/types/profile';

/** Bundles the add/replace/delete/reorder photo mutations with a shared
 *  upload-progress percentage, so the Photos screen can drive one progress
 *  bar no matter which action triggered it. */
export function usePhotoManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, user?.id] });

  const addPhoto = useMutation({
    mutationFn: ({ localUri, position }: { localUri: string; position: number }) => {
      setUploadProgress(0);
      return photoService.addPhoto(localUri, position, setUploadProgress);
    },
    onSettled: () => setUploadProgress(null),
    onSuccess: invalidate,
  });

  const replacePhoto = useMutation({
    mutationFn: ({ photoId, localUri }: { photoId: string; localUri: string }) => {
      setUploadProgress(0);
      return photoService.replacePhoto(photoId, localUri, setUploadProgress);
    },
    onSettled: () => setUploadProgress(null),
    onSuccess: invalidate,
  });

  const deletePhoto = useMutation({
    mutationFn: (photoId: string) => photoService.deletePhoto(photoId),
    onSuccess: invalidate,
  });

  const reorderPhotos = useMutation({
    mutationFn: (photos: ProfilePhoto[]) => photoService.reorderPhotos(photos),
    onSuccess: invalidate,
  });

  return { addPhoto, replacePhoto, deletePhoto, reorderPhotos, uploadProgress };
}
