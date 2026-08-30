import React from 'react';
import { Author } from '../types';
import { AuthorCard } from '../components/cards/AuthorCard';

interface AuthorsViewProps {
  authors: Author[];
  onSelectAuthor: (author: Author) => void;
  onFollowToggle: (authorId: string, e: React.MouseEvent) => void;
}

export const AuthorsView: React.FC<AuthorsViewProps> = ({
  authors,
  onSelectAuthor,
  onFollowToggle,
}) => {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-2">
          ప్రముఖ తెలుగు రచయితలు
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          మీకు ఇష్టమైన రచయితలను అనుసరించండి మరియు వారి కొత్త రచనలను నిరంతరం చదవండి
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map(author => (
          <AuthorCard
            key={author.id}
            author={author}
            onSelect={onSelectAuthor}
            onFollowToggle={onFollowToggle}
          />
        ))}
      </div>
    </div>
  );
};
