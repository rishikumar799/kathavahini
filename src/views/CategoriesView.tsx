import React from 'react';
import { StoryCategory } from '../types';
import { CategoryCard } from '../components/cards/CategoryCard';

interface CategoriesViewProps {
  categories: { name: StoryCategory; description: string; icon: string; count: number }[];
  onSelectCategory: (categoryName: StoryCategory) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] mb-2">
          కథా విభాగాలు
        </h1>
        <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu">
          మీ మానసిక స్థితికి మరియు అభిరుచికి అనుగుణమైన సాహితీ వర్గాలు
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <CategoryCard
            key={cat.name}
            category={cat}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
};
