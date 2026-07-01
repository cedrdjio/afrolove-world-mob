-- The bucket is already public (public: true), so getPublicUrl() works
-- without any SELECT policy on storage.objects. Dropping the broad SELECT
-- policy removes the ability to list all files via the storage API while
-- keeping direct object access via known public URLs intact.
drop policy "Profile photos are publicly readable" on storage.objects;
