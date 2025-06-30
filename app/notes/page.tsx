import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import NotesClient from './Notes.client';

export default async function Notes() {
  const queryClient = new QueryClient();
  const initialQuery = '';
  const initialPage = 1;

  const initialNotes = await fetchNotes(initialQuery, initialPage);

  await queryClient.prefetchQuery({
    queryKey: ['Notes', initialQuery, initialPage],
    queryFn: () => Promise.resolve(initialNotes),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient
        initialQuery={initialQuery}
        initialPage={initialPage}
        initialNotes={initialNotes}
      />
    </HydrationBoundary>
  );
}
