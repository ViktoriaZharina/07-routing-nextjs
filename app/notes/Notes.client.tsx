'use client';

import { fetchNotes } from '@/lib/api';
import NoteList from '@/components/NoteList/NoteList';
import NoteModal from '@/components/NoteModal/NoteModal';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';
import css from './NotesPage.module.css';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import type { Note } from '@/types/note';

interface NotesClientProps {
  initialQuery: string;
  initialPage: number;
  initialNotes: {
    notes: Note[];
    totalPages: number;
  };
}

export default function NotesClient({
  initialQuery,
  initialPage,
  initialNotes,
}: NotesClientProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [query, setQuery] = useState<string>(initialQuery);
  const [debouncedQuery] = useDebounce<string>(query, 1000);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const loadNotes = useQuery({
    queryKey: ['Notes', debouncedQuery, currentPage],
    queryFn: () => fetchNotes(debouncedQuery, currentPage),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    initialData:
      debouncedQuery === initialQuery && currentPage === initialPage
        ? initialNotes
        : undefined,
  });

  const modalOpenFn = () => setModalOpen(true);
  const modalCloseFn = () => setModalOpen(false);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  if (loadNotes.isError) {
    throw new Error('Error while loading notes');
  }

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={onChangeQuery} value={query} />
        {loadNotes.isSuccess && loadNotes.data.totalPages > 1 && (
          <Pagination
            pageCount={loadNotes.data.totalPages}
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
        )}
        <button className={css.button} onClick={modalOpenFn}>
          Create note +
        </button>
      </header>

      {loadNotes.isSuccess && <NoteList notes={loadNotes.data.notes} />}
      {modalOpen && <NoteModal onClose={modalCloseFn} />}
    </div>
  );
}
